"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";
import type { PaymentMethod } from "@prisma/client";

async function guard() {
  return requireAnyRole(["MANAGER", "ADMIN"]);
}

export async function recordInvoicePayment(invoiceId: string, paymentMethod: PaymentMethod): Promise<ActionResult> {
  await guard();

  const invoice = await db.supplierInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { ok: false, error: "Invoice not found" };
  if (invoice.paidAt) return { ok: false, error: "This invoice is already marked paid" };

  await db.supplierInvoice.update({
    where: { id: invoiceId },
    data: { paidAt: new Date(), paymentMethod },
  });

  revalidatePath("/accounting/payable");
  return { ok: true };
}
