"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import { adjustStock } from "@/lib/inventory";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  return requireAnyRole(["STOREMAN", "MANAGER", "ADMIN"]);
}

async function fulfilmentGuard() {
  return requireAnyRole(["STOREMAN", "CASHIER", "MANAGER", "ADMIN"]);
}

export async function confirmItemPicked(orderItemId: string): Promise<ActionResult> {
  const session = await guard();

  const item = await db.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: { select: { id: true, status: true } } },
  });
  if (!item) return { ok: false, error: "errOrderItemNotFound" };
  if (item.status !== "PENDING") return { ok: false, error: "errItemAlreadyProcessed" };
  if (!["PENDING", "PICKING"].includes(item.order.status)) {
    return { ok: false, error: "errOrderNotOpenForPicking" };
  }

  await db.$transaction(async (tx) => {
    if (item.order.status === "PENDING") {
      await tx.order.update({ where: { id: item.order.id }, data: { status: "PICKING", pickedAt: new Date() } });
      await tx.orderLog.create({ data: { orderId: item.order.id, actorId: session.id, status: "PICKING" } });
    }

    if (item.variantId) {
      const movements = await tx.stockMovement.findMany({
        where: { orderItemId: item.id, type: "SALE_OUT" },
        include: { stockEntry: { select: { locationId: true } } },
      });
      for (const mv of movements) {
        if (!mv.stockEntry) continue;
        await tx.stockPick.create({
          data: {
            orderId: item.order.id,
            orderItemId: item.id,
            locationId: mv.stockEntry.locationId,
            qtyPicked: -mv.qty,
            pickedById: session.id,
          },
        });
      }
    }

    await tx.orderItem.update({ where: { id: item.id }, data: { status: "PICKED" } });
  });

  revalidatePath(`/warehouse/orders/${item.order.id}`);
  revalidatePath("/warehouse/orders");
  return { ok: true };
}

export async function markItemUnavailable(orderItemId: string): Promise<ActionResult> {
  const session = await guard();

  const item = await db.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: { select: { id: true, status: true, paidAt: true, discount: true, total: true } } },
  });
  if (!item) return { ok: false, error: "errOrderItemNotFound" };
  if (item.status !== "PENDING") return { ok: false, error: "errItemAlreadyProcessed" };

  await db.$transaction(async (tx) => {
    const effectiveStatus = item.order.status === "PENDING" ? "PICKING" : item.order.status;
    if (item.order.status === "PENDING") {
      await tx.order.update({ where: { id: item.order.id }, data: { status: "PICKING", pickedAt: new Date() } });
      await tx.orderLog.create({ data: { orderId: item.order.id, actorId: session.id, status: "PICKING" } });
    }

    if (item.variantId) {
      const movements = await tx.stockMovement.findMany({
        where: { orderItemId: item.id, type: "SALE_OUT" },
        include: { stockEntry: { select: { locationId: true } } },
      });
      for (const mv of movements) {
        if (!mv.stockEntry) continue;
        await adjustStock(tx, {
          variantId: item.variantId,
          locationId: mv.stockEntry.locationId,
          qtyDelta: -mv.qty,
          type: "RETURN_IN",
          actorId: session.id,
          orderItemId: item.id,
        });
      }
    }

    await tx.orderItem.update({ where: { id: item.id }, data: { status: "UNAVAILABLE" } });

    // The customer must not be charged for an item that was never delivered
    // — recompute subtotal/total from the remaining (non-UNAVAILABLE) items.
    // Discount is kept as-is (it was a flat amount decided at order time, not
    // itemized), just re-capped so it can never exceed the new subtotal.
    const remaining = await tx.orderItem.findMany({
      where: { orderId: item.order.id, status: { not: "UNAVAILABLE" } },
      select: { unitPrice: true, qty: true },
    });
    const newSubtotal = remaining.reduce((sum, i) => sum + (i.unitPrice ?? 0) * i.qty, 0);
    const discount = Math.min(item.order.discount, newSubtotal);
    const newTotal = Math.max(0, newSubtotal - discount);

    await tx.order.update({
      where: { id: item.order.id },
      data: { subtotal: newSubtotal, discount, total: newTotal },
    });

    // If the order was already paid before this item turned out to be
    // unavailable, the customer was charged the old (higher) total — there is
    // no automated refund flow in this app, so surface it instead of quietly
    // absorbing the difference.
    if (item.order.paidAt) {
      const refundDue = item.order.total - newTotal;
      if (refundDue > 0) {
        await tx.orderLog.create({
          data: {
            orderId: item.order.id,
            actorId: session.id,
            status: effectiveStatus,
            note: `Item marked unavailable after payment — customer already paid ${item.order.total}, new total is ${newTotal}. Refund ${refundDue} manually.`,
          },
        });
      }
    }
  });

  revalidatePath(`/warehouse/orders/${item.order.id}`);
  revalidatePath("/warehouse/orders");
  return { ok: true };
}

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  const session = await fulfilmentGuard();

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "errOrderNotFound" };
  if (!["PENDING", "PICKING", "PACKED", "READY"].includes(order.status)) {
    return { ok: false, error: "errOrderCannotBeCancelled" };
  }

  await db.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.productType !== "REGULAR" || !item.variantId) continue;
      if (item.status !== "PENDING" && item.status !== "PICKED") continue;

      const movements = await tx.stockMovement.findMany({
        where: { orderItemId: item.id, type: "SALE_OUT" },
        include: { stockEntry: { select: { locationId: true } } },
      });
      for (const mv of movements) {
        if (!mv.stockEntry) continue;
        await adjustStock(tx, {
          variantId: item.variantId,
          locationId: mv.stockEntry.locationId,
          qtyDelta: -mv.qty,
          type: "RETURN_IN",
          actorId: session.id,
          orderItemId: item.id,
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    await tx.orderLog.create({ data: { orderId, actorId: session.id, status: "CANCELLED" } });
  });

  revalidatePath(`/warehouse/orders/${orderId}`);
  revalidatePath("/warehouse/orders");
  revalidatePath(`/pos/orders/${orderId}`);
  return { ok: true };
}

export async function markOrderPacked(orderId: string): Promise<ActionResult> {
  const session = await guard();

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { ok: false, error: "errOrderNotFound" };
  if (order.status !== "PICKING") return { ok: false, error: "errOrderMustBeFullyPicked" };
  if (order.items.some((i) => i.status === "PENDING")) {
    return { ok: false, error: "errEveryItemMustBeResolved" };
  }

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "PACKED", packedAt: new Date() } }),
    db.orderLog.create({ data: { orderId, actorId: session.id, status: "PACKED" } }),
  ]);

  revalidatePath(`/warehouse/orders/${orderId}`);
  revalidatePath("/warehouse/orders");
  return { ok: true };
}

export async function markOrderReady(orderId: string): Promise<ActionResult> {
  const session = await fulfilmentGuard();

  const order = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!order) return { ok: false, error: "errOrderNotFound" };
  if (order.status !== "PACKED") return { ok: false, error: "errOrderMustBePacked" };

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "READY", readyAt: new Date() } }),
    db.orderLog.create({ data: { orderId, actorId: session.id, status: "READY" } }),
  ]);

  revalidatePath(`/warehouse/orders/${orderId}`);
  revalidatePath("/warehouse/orders");
  return { ok: true };
}

export async function completeOrder(
  orderId: string,
  method: "PICKED_UP" | "DELIVERED"
): Promise<ActionResult> {
  const session = await fulfilmentGuard();

  const order = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!order) return { ok: false, error: "errOrderNotFound" };
  if (order.status !== "READY") return { ok: false, error: "errOrderMustBeReady" };

  const now = new Date();
  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: {
        status: method,
        pickedUpAt: method === "PICKED_UP" ? now : undefined,
        deliveredAt: method === "DELIVERED" ? now : undefined,
      },
    }),
    db.orderLog.create({ data: { orderId, actorId: session.id, status: method } }),
  ]);

  revalidatePath(`/warehouse/orders/${orderId}`);
  revalidatePath("/warehouse/orders");
  return { ok: true };
}
