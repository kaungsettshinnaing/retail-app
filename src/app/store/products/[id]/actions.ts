"use server";

import { prisma as db } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";

export type InquiryPayload = {
  productId: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  message?: string;
};

export async function submitInquiry(payload: InquiryPayload): Promise<ActionResult> {
  if (!payload.contactName.trim() || !payload.contactPhone.trim()) {
    return { ok: false, error: "Name and phone are required" };
  }
  const product = await db.product.findUnique({ where: { id: payload.productId } });
  if (!product) return { ok: false, error: "Product not found" };

  const customer = await getCustomerSession();

  await db.priceInquiry.create({
    data: {
      productId: payload.productId,
      customerId: customer?.id,
      channel: "ONLINE",
      contactName: payload.contactName.trim(),
      contactPhone: payload.contactPhone.trim(),
      contactEmail: payload.contactEmail?.trim() || undefined,
      message: payload.message?.trim() || undefined,
    },
  });

  return { ok: true };
}
