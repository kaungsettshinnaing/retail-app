"use server";

import { requireAnyRole } from "@/lib/auth";
import { createOrder, type CreateOrderItemInput } from "@/lib/orders";
import type { PaymentMethod } from "@prisma/client";

export type PosOrderPayload = {
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  discount?: number;
  notes?: string;
  items: CreateOrderItemInput[];
};

export async function submitPosOrder(
  payload: PosOrderPayload
): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const session = await requireAnyRole(["CASHIER", "MANAGER", "ADMIN"]);
  return createOrder({ ...payload, cashierId: session.id });
}
