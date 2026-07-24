"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";
import { postSupplierInvoiceReceived } from "@/lib/journal-postings";

async function guard() {
  return requireAnyRole(["CASHIER", "MANAGER", "ADMIN"]);
}

const CreateInvoiceSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  invoiceNo: z.string().max(100).optional(),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  notes: z.string().max(1000).optional(),
});

export async function createInvoice(formData: FormData): Promise<ActionResult> {
  const session = await guard();

  const parsed = CreateInvoiceSchema.safeParse({
    supplierId: formData.get("supplierId"),
    invoiceNo: String(formData.get("invoiceNo") || "").trim() || undefined,
    invoiceDate: formData.get("invoiceDate"),
    notes: String(formData.get("notes") || "").trim() || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const invoice = await db.supplierInvoice.create({
    data: {
      supplierId: parsed.data.supplierId,
      invoiceNo: parsed.data.invoiceNo,
      invoiceDate: new Date(parsed.data.invoiceDate),
      notes: parsed.data.notes,
      status: "DRAFT",
      logs: {
        create: { actorId: session.id, action: "CREATED" },
      },
    },
  });

  revalidatePath("/pos/invoices");
  redirect(`/pos/invoices/${invoice.id}`);
}

const ItemSchema = z.object({
  variantId: z.string().optional(),
  description: z.string().max(300).optional(),
  invoicedQty: z.coerce.number().int().positive("Quantity must be greater than 0"),
  unitCost: z.coerce.number().int().nonnegative().optional(),
});

async function assertDraft(invoiceId: string) {
  const invoice = await db.supplierInvoice.findUnique({ where: { id: invoiceId }, select: { status: true } });
  if (!invoice) return "Invoice not found";
  if (invoice.status !== "DRAFT") return "Invoice can only be edited while in Draft status";
  return null;
}

export async function addInvoiceItem(invoiceId: string, formData: FormData): Promise<ActionResult> {
  await guard();

  const err = await assertDraft(invoiceId);
  if (err) return { ok: false, error: err };

  const variantId = String(formData.get("variantId") || "").trim() || undefined;
  const description = String(formData.get("description") || "").trim() || undefined;

  const parsed = ItemSchema.safeParse({
    variantId,
    description,
    invoicedQty: formData.get("invoicedQty"),
    unitCost: formData.get("unitCost") || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  if (!parsed.data.variantId && !parsed.data.description) {
    return { ok: false, error: "Select a product or enter a description" };
  }

  let productId: string | undefined;
  if (parsed.data.variantId) {
    const variant = await db.productVariant.findUnique({ where: { id: parsed.data.variantId }, select: { productId: true } });
    if (!variant) return { ok: false, error: "Product variant not found" };
    productId = variant.productId;
  }

  await db.supplierInvoiceItem.create({
    data: {
      invoiceId,
      productId,
      variantId: parsed.data.variantId,
      description: parsed.data.description,
      invoicedQty: parsed.data.invoicedQty,
      unitCost: parsed.data.unitCost,
    },
  });

  revalidatePath(`/pos/invoices/${invoiceId}`);
  return { ok: true };
}

export async function updateInvoiceItem(itemId: string, formData: FormData): Promise<ActionResult> {
  await guard();

  const item = await db.supplierInvoiceItem.findUnique({ where: { id: itemId }, select: { invoiceId: true } });
  if (!item) return { ok: false, error: "Line item not found" };

  const err = await assertDraft(item.invoiceId);
  if (err) return { ok: false, error: err };

  const parsed = ItemSchema.safeParse({
    invoicedQty: formData.get("invoicedQty"),
    unitCost: formData.get("unitCost") || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

  await db.supplierInvoiceItem.update({
    where: { id: itemId },
    data: { invoicedQty: parsed.data.invoicedQty, unitCost: parsed.data.unitCost },
  });

  revalidatePath(`/pos/invoices/${item.invoiceId}`);
  return { ok: true };
}

export async function deleteInvoiceItem(itemId: string): Promise<ActionResult> {
  await guard();

  const item = await db.supplierInvoiceItem.findUnique({ where: { id: itemId }, select: { invoiceId: true } });
  if (!item) return { ok: false, error: "Line item not found" };

  const err = await assertDraft(item.invoiceId);
  if (err) return { ok: false, error: err };

  await db.supplierInvoiceItem.delete({ where: { id: itemId } });

  revalidatePath(`/pos/invoices/${item.invoiceId}`);
  return { ok: true };
}

export async function submitInvoice(invoiceId: string): Promise<ActionResult> {
  const session = await guard();

  const invoice = await db.supplierInvoice.findUnique({
    where: { id: invoiceId },
    include: { items: true },
  });
  if (!invoice) return { ok: false, error: "Invoice not found" };
  if (invoice.status !== "DRAFT") return { ok: false, error: "Invoice has already been submitted" };
  if (invoice.items.length === 0) return { ok: false, error: "Add at least one line item before submitting" };

  const totalAmount = invoice.items.reduce(
    (sum, it) => sum + (it.unitCost ?? 0) * it.invoicedQty,
    0
  );

  await db.$transaction(async (tx) => {
    await tx.supplierInvoice.update({
      where: { id: invoiceId },
      data: {
        status: "SUBMITTED",
        totalAmount,
        cashierId: session.id,
        cashierSubmittedAt: new Date(),
      },
    });
    await tx.supplierInvoiceLog.create({
      data: { invoiceId, actorId: session.id, action: "CASHIER_SUBMITTED" },
    });
    await postSupplierInvoiceReceived(tx, { id: invoiceId, totalAmount, invoiceDate: invoice.invoiceDate });
  });

  revalidatePath("/pos/invoices");
  revalidatePath(`/pos/invoices/${invoiceId}`);
  return { ok: true };
}

export async function deleteInvoice(invoiceId: string): Promise<ActionResult> {
  await guard();

  const invoice = await db.supplierInvoice.findUnique({ where: { id: invoiceId }, select: { status: true } });
  if (!invoice) return { ok: false, error: "Invoice not found" };
  if (invoice.status !== "DRAFT") return { ok: false, error: "Only draft invoices can be deleted" };

  await db.supplierInvoice.delete({ where: { id: invoiceId } });

  revalidatePath("/pos/invoices");
  redirect("/pos/invoices");
}
