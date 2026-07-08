"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  return requireAnyRole(["CASHIER", "MANAGER", "ADMIN"]);
}

export async function quoteInquiry(inquiryId: string, price: number): Promise<ActionResult> {
  const session = await guard();
  if (!Number.isFinite(price) || price <= 0) return { ok: false, error: "Enter a valid price" };

  const inquiry = await db.priceInquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) return { ok: false, error: "Inquiry not found" };
  if (inquiry.status !== "OPEN") return { ok: false, error: "This inquiry has already been handled" };

  await db.priceInquiry.update({
    where: { id: inquiryId },
    data: { status: "QUOTED", quotedPrice: price, quotedById: session.id, quotedAt: new Date() },
  });

  revalidatePath(`/pos/inquiries/${inquiryId}`);
  revalidatePath("/pos/inquiries");
  return { ok: true };
}

export async function closeInquiry(inquiryId: string): Promise<ActionResult> {
  await guard();

  const inquiry = await db.priceInquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) return { ok: false, error: "Inquiry not found" };
  if (inquiry.status === "CONVERTED") return { ok: false, error: "This inquiry has already converted to an order" };

  await db.priceInquiry.update({ where: { id: inquiryId }, data: { status: "CLOSED" } });

  revalidatePath(`/pos/inquiries/${inquiryId}`);
  revalidatePath("/pos/inquiries");
  return { ok: true };
}

export async function markInquiryConverted(inquiryId: string): Promise<ActionResult> {
  await guard();

  const inquiry = await db.priceInquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) return { ok: false, error: "Inquiry not found" };
  if (inquiry.status !== "QUOTED") return { ok: false, error: "Quote the price before converting" };

  await db.priceInquiry.update({ where: { id: inquiryId }, data: { status: "CONVERTED" } });

  revalidatePath(`/pos/inquiries/${inquiryId}`);
  revalidatePath("/pos/inquiries");
  return { ok: true };
}
