"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import { adjustStock } from "@/lib/inventory";
import { postSupplierInvoiceVariance, postCogsBackfill } from "@/lib/journal-postings";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  return requireAnyRole(["STOREMAN", "MANAGER", "ADMIN"]);
}

export async function updateCount(
  itemId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await guard();

  const item = await db.supplierInvoiceItem.findUnique({
    where: { id: itemId },
    select: { invoiceId: true, invoice: { select: { status: true } } },
  });
  if (!item) return { ok: false, error: "errLineItemNotFound" };
  if (!["SUBMITTED", "COUNTING"].includes(item.invoice.status)) {
    return { ok: false, error: "errInvoiceNotOpenForCounting" };
  }

  const countedQtyRaw = formData.get("countedQty");
  const countedQty = countedQtyRaw === null || countedQtyRaw === "" ? null : Number(countedQtyRaw);
  if (countedQty !== null && (!Number.isInteger(countedQty) || countedQty < 0)) {
    return { ok: false, error: "errCountedQtyInvalid" };
  }
  const locationId = String(formData.get("locationId") || "").trim() || null;

  await db.$transaction(async (tx) => {
    await tx.supplierInvoiceItem.update({
      where: { id: itemId },
      data: { countedQty, locationId },
    });
    if (item.invoice.status === "SUBMITTED") {
      await tx.supplierInvoice.update({
        where: { id: item.invoiceId },
        data: { status: "COUNTING", counterId: session.id },
      });
      await tx.supplierInvoiceLog.create({
        data: { invoiceId: item.invoiceId, actorId: session.id, action: "COUNTING" },
      });
    }
  });

  revalidatePath(`/warehouse/invoices/${item.invoiceId}`);
  return { ok: true };
}

export async function confirmPlacement(invoiceId: string): Promise<ActionResult> {
  const session = await guard();

  const invoice = await db.supplierInvoice.findUnique({
    where: { id: invoiceId },
    include: { items: true },
  });
  if (!invoice) return { ok: false, error: "errInvoiceNotFound" };
  if (invoice.status !== "COUNTING") {
    return { ok: false, error: "errInvoiceMustBeCounting" };
  }

  for (const item of invoice.items) {
    if (item.countedQty == null) {
      return { ok: false, error: "errEveryItemMustHaveCount" };
    }
    if (item.variantId && item.countedQty > 0 && !item.locationId) {
      return { ok: false, error: "errAssignLocationToEveryItem" };
    }
  }

  const result = await db.$transaction(async (tx) => {
    const placedAt = new Date();
    let variance = 0;

    for (const item of invoice.items) {
      const finalQty = item.countedQty ?? 0;
      variance += (finalQty - item.invoicedQty) * (item.unitCost ?? 0);

      if (item.variantId && item.locationId && finalQty > 0) {
        const res = await adjustStock(tx, {
          variantId: item.variantId,
          locationId: item.locationId,
          qtyDelta: finalQty,
          type: "INVOICE_IN",
          actorId: session.id,
          invoiceItemId: item.id,
          note: `Placed from invoice ${invoiceId}`,
        });
        if (!res.ok) return res;
      }

      await tx.supplierInvoiceItem.update({
        where: { id: item.id },
        data: { finalQty, placedQty: finalQty, placedAt },
      });

      // Backfill sales that had no cost data at time of sale (sold before any
      // invoice for this variant had been placed) — otherwise those
      // OrderItem rows keep unitCost=null forever and permanently record $0
      // COGS even now that we know the cost.
      if (item.variantId && item.unitCost != null) {
        const uncosted = await tx.orderItem.findMany({
          where: { variantId: item.variantId, unitCost: null },
          select: { id: true, qty: true, order: { select: { paidAt: true } } },
        });
        for (const oi of uncosted) {
          await tx.orderItem.update({ where: { id: oi.id }, data: { unitCost: item.unitCost } });
          if (oi.order.paidAt) {
            await postCogsBackfill(tx, { id: oi.id, amount: item.unitCost * oi.qty, date: placedAt });
          }
        }
      }
    }

    // Counted qty can differ from invoiced qty (short shipment, damage) —
    // reconcile the invoice total and the ledger to what was actually
    // received rather than leaving them permanently based on invoicedQty.
    const adjustedTotal = (invoice.totalAmount ?? 0) + variance;

    await tx.supplierInvoice.update({
      where: { id: invoiceId },
      data: {
        status: "PLACED",
        counterId: session.id,
        counterSubmittedAt: placedAt,
        totalAmount: adjustedTotal,
      },
    });
    await tx.supplierInvoiceLog.create({
      data: {
        invoiceId,
        actorId: session.id,
        action: "PLACED",
        note: variance !== 0 ? `Counted qty differed from invoiced qty — totalAmount adjusted by ${variance}` : undefined,
      },
    });

    if (variance !== 0) {
      await postSupplierInvoiceVariance(tx, { id: invoiceId, variance, placedAt });
    }

    return { ok: true as const };
  });

  if (!result.ok) return result;

  revalidatePath("/warehouse/invoices");
  revalidatePath(`/warehouse/invoices/${invoiceId}`);
  return { ok: true };
}
