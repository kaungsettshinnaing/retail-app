import { prisma as db } from "./db";
import type { OrderChannel, PaymentMethod, Prisma } from "@prisma/client";

class OrderActionError extends Error {}

export type CreateOrderItemInput = {
  productId: string;
  variantId?: string;
  qty: number;
  unitPriceOverride?: number; // required for CONTACT_PRICE products
};

export type CreateOrderInput = {
  channel?: OrderChannel; // defaults to POS
  cashierId?: string; // staff-placed (POS) orders
  customerId?: string; // logged-in customer (online orders)
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: PaymentMethod;
  discount?: number;
  notes?: string;
  items: CreateOrderItemInput[];
};

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

/**
 * Depletes stock for a variant across whatever locations currently hold it,
 * largest balance first, locking each StockEntry row with FOR UPDATE before
 * decrementing so concurrent sales can't oversell.
 */
async function deductVariantStock(
  tx: Prisma.TransactionClient,
  variantId: string,
  qtyNeeded: number,
  actorId: string,
  orderItemId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const locked = await tx.$queryRaw<{ id: string; qty: number }[]>`
    SELECT id, qty FROM "StockEntry"
    WHERE "variantId" = ${variantId} AND qty > 0
    ORDER BY qty DESC
    FOR UPDATE
  `;

  let remaining = qtyNeeded;
  for (const entry of locked) {
    if (remaining <= 0) break;
    const take = Math.min(entry.qty, remaining);
    await tx.stockEntry.update({ where: { id: entry.id }, data: { qty: entry.qty - take } });
    await tx.stockMovement.create({
      data: {
        variantId,
        stockEntryId: entry.id,
        type: "SALE_OUT",
        qty: -take,
        previousQty: entry.qty,
        orderItemId,
        actorId,
      },
    });
    remaining -= take;
  }

  if (remaining > 0) return { ok: false, error: "Insufficient stock" };
  return { ok: true };
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (input.items.length === 0) return { ok: false, error: "Add at least one item to the order" };

  try {
    const orderId = await db.$transaction(async (tx) => {
      let subtotal = 0;
      const prepared: {
        productId: string;
        variantId: string | null;
        productType: "REGULAR" | "PASS_THROUGH" | "CONTACT_PRICE";
        productName: string;
        variantSku: string | null;
        variantOptions: Prisma.InputJsonValue | undefined;
        unitPrice: number;
        qty: number;
      }[] = [];

      for (const line of input.items) {
        if (line.qty <= 0) throw new OrderActionError("Quantity must be greater than 0");

        const product = await tx.product.findUnique({
          where: { id: line.productId },
          include: { variants: true },
        });
        if (!product) throw new OrderActionError("Product not found");

        const variant = line.variantId ? product.variants.find((v) => v.id === line.variantId) ?? null : null;
        if (product.type !== "CONTACT_PRICE" && !variant) {
          throw new OrderActionError(`Select a variant for ${product.name}`);
        }

        let unitPrice: number;
        if (product.type === "CONTACT_PRICE") {
          if (line.unitPriceOverride == null) throw new OrderActionError(`Enter a price for ${product.name}`);
          unitPrice = line.unitPriceOverride;
        } else {
          if (variant!.price == null) throw new OrderActionError(`${product.name} has no price set`);
          unitPrice = variant!.price;
        }

        subtotal += unitPrice * line.qty;
        prepared.push({
          productId: product.id,
          variantId: variant?.id ?? null,
          productType: product.type,
          productName: product.name,
          variantSku: variant?.sku ?? null,
          variantOptions: (variant?.optionValues as Prisma.InputJsonValue) ?? undefined,
          unitPrice,
          qty: line.qty,
        });
      }

      const discount = input.discount ?? 0;
      const total = Math.max(0, subtotal - discount);
      const channel = input.channel ?? "POS";

      let actorId = input.cashierId;
      if (!actorId) {
        const systemUser = await tx.user.findFirst({ where: { isSystemAccount: true }, select: { id: true } });
        if (!systemUser) throw new OrderActionError("System account not configured");
        actorId = systemUser.id;
      }

      // POS sales are paid at the counter immediately; online orders are paid
      // on delivery (COD) or once staff confirms the transfer proof.
      const paidAt = channel === "POS" && input.paymentMethod ? new Date() : null;

      const order = await tx.order.create({
        data: {
          channel,
          status: "PENDING",
          cashierId: input.cashierId,
          customerId: input.customerId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          subtotal,
          discount,
          total,
          paymentMethod: input.paymentMethod,
          paidAt,
          notes: input.notes,
        },
      });

      for (const item of prepared) {
        let unitCost: number | null = null;
        if (item.variantId) {
          const lastPurchase = await tx.supplierInvoiceItem.findFirst({
            where: { variantId: item.variantId, unitCost: { not: null } },
            orderBy: { placedAt: "desc" },
            select: { unitCost: true },
          });
          unitCost = lastPurchase?.unitCost ?? null;
        }

        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            productType: item.productType,
            productName: item.productName,
            variantSku: item.variantSku,
            variantOptions: item.variantOptions,
            unitPrice: item.unitPrice,
            unitCost,
            qty: item.qty,
          },
        });

        if (item.productType === "REGULAR" && item.variantId) {
          const res = await deductVariantStock(tx, item.variantId, item.qty, actorId, orderItem.id);
          if (!res.ok) throw new OrderActionError(`${item.productName}: ${res.error}`);
        }
      }

      await tx.orderLog.create({
        data: {
          orderId: order.id,
          actorId: input.cashierId ?? null,
          status: "PENDING",
          note: channel === "POS" ? "Order created at POS" : "Order placed online",
        },
      });

      if (channel === "POS" && input.paymentMethod && input.paymentMethod !== "COD") {
        await tx.cashEntry.create({
          data: {
            type: "IN",
            amount: total,
            description: `POS sale ${order.id}`,
            source: "SALE",
            referenceId: order.id,
            date: new Date(),
            recordedById: input.cashierId!,
          },
        });
      }

      return order.id;
    });

    return { ok: true, orderId };
  } catch (e) {
    if (e instanceof OrderActionError) return { ok: false, error: e.message };
    throw e;
  }
}
