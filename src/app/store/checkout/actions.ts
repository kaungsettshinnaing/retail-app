"use server";

import { getCustomerSession } from "@/lib/auth";
import { createOrder, type CreateOrderItemInput } from "@/lib/orders";
import { prisma as db } from "@/lib/db";
import { saveUpload } from "@/lib/upload";
import type { ActionResult } from "@/lib/action-result";

export type CheckoutPayload = {
  shippingAddress: string;
  paymentMethod: "COD" | "TRANSFER";
  notes?: string;
  items: CreateOrderItemInput[];
};

export async function placeOnlineOrder(
  payload: CheckoutPayload
): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const session = await getCustomerSession();
  if (!session) return { ok: false, error: "Please sign in to check out" };
  if (!payload.shippingAddress.trim()) return { ok: false, error: "Shipping address is required" };

  const customer = await db.customer.findUnique({ where: { id: session.id } });
  if (!customer) return { ok: false, error: "Account not found" };

  return createOrder({
    channel: "ONLINE",
    customerId: customer.id,
    customerName: customer.name ?? undefined,
    customerPhone: customer.phone ?? undefined,
    shippingAddress: payload.shippingAddress.trim(),
    paymentMethod: payload.paymentMethod,
    notes: payload.notes,
    items: payload.items,
  });
}

export async function uploadPaymentProof(orderId: string, formData: FormData): Promise<ActionResult> {
  const session = await getCustomerSession();
  if (!session) return { ok: false, error: "Please sign in" };

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== session.id) return { ok: false, error: "Order not found" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "Select an image to upload" };

  let path: string;
  try {
    const res = await saveUpload(file, "payment-proofs");
    path = res.path;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed" };
  }

  await db.orderPaymentProof.upsert({
    where: { orderId },
    update: { imageUrl: path, status: "PENDING", uploadedAt: new Date(), confirmedById: null, confirmedAt: null },
    create: { orderId, imageUrl: path },
  });

  return { ok: true };
}
