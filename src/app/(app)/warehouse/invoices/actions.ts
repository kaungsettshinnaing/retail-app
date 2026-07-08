"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import { adjustStock } from "@/lib/inventory";
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
  if (!item) return { ok: false, error: "Line item not found" };
  if (!["SUBMITTED", "COUNTING"].includes(item.invoice.status)) {
    return { ok: false, error: "This invoice is no longer open for counting" };
  }

  const countedQtyRaw = formData.get("countedQty");
  const countedQty = countedQtyRaw === null || countedQtyRaw === "" ? null : Number(countedQtyRaw);
  if (countedQty !== null && (!Number.isInteger(countedQty) || countedQty < 0)) {
    return { ok: false, error: "Counted quantity must be a non-negative whole number" };
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
  if (!invoice) return { ok: false, error: "Invoice not found" };
  if (invoice.status !== "COUNTING") {
    return { ok: false, error: "Invoice must be in Counting status before it can be placed" };
  }

  for (const item of invoice.items) {
    if (item.countedQty == null) {
      return { ok: false, error: "Every line item must have a counted quantity" };
    }
    if (item.variantId && item.countedQty > 0 && !item.locationId) {
      return { ok: false, error: "Assign a warehouse location to every counted item" };
    }
  }

  const result = await db.$transaction(async (tx) => {
    for (const item of invoice.items) {
      const finalQty = item.countedQty ?? 0;

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
        data: { finalQty, placedQty: finalQty, placedAt: new Date() },
      });
    }

    await tx.supplierInvoice.update({
      where: { id: invoiceId },
      data: { status: "PLACED", counterId: session.id, counterSubmittedAt: new Date() },
    });
    await tx.supplierInvoiceLog.create({
      data: { invoiceId, actorId: session.id, action: "PLACED" },
    });

    return { ok: true as const };
  });

  if (!result.ok) return result;

  revalidatePath("/warehouse/invoices");
  revalidatePath(`/warehouse/invoices/${invoiceId}`);
  return { ok: true };
}
