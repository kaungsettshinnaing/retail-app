"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";
import type { PaymentMethod } from "@prisma/client";
import { postSupplierInvoicePaid } from "@/lib/journal-postings";

async function guard() {
  return requireAnyRole(["MANAGER", "ADMIN"]);
}

export async function recordInvoicePayment(invoiceId: string, paymentMethod: PaymentMethod): Promise<ActionResult> {
  const session = await guard();

  const invoice = await db.supplierInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { ok: false, error: "errInvoiceNotFound" };
  if (invoice.paidAt) return { ok: false, error: "errInvoiceAlreadyPaid" };

  const paidAt = new Date();
  const totalAmount = invoice.totalAmount ?? 0;
  await db.$transaction(async (tx) => {
    await tx.supplierInvoice.update({
      where: { id: invoiceId },
      data: { paidAt, paymentMethod },
    });
    await postSupplierInvoicePaid(tx, { id: invoiceId, totalAmount, paidAt, paymentMethod });

    // Cash Ledger only tracks cash-in-hand, not bank balances (see
    // /accounting/cash) — mirror the pattern used for POS cash sales and
    // cash expenses so cash-paid supplier invoices are reflected too.
    if (paymentMethod === "CASH" && totalAmount > 0) {
      await tx.cashEntry.create({
        data: {
          type: "OUT",
          amount: totalAmount,
          description: `Supplier invoice paid ${invoiceId}`,
          source: "SUPPLIER_PAYMENT",
          referenceId: invoiceId,
          date: paidAt,
          recordedById: session.id,
        },
      });
    }
  });

  revalidatePath("/accounting/payable");
  return { ok: true };
}
