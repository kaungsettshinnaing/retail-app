"use server";

import { requireAnyRole } from "@/lib/auth";
import { prisma as db } from "@/lib/db";
import { createOrder, type CreateOrderItemInput } from "@/lib/orders";
import type { PaymentMethod } from "@prisma/client";

export type PosOrderPayload = {
  customerId?: string;
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

export type CustomerSearchResult = { id: string; name: string | null; phone: string | null; isB2B: boolean };

export async function searchCustomers(query: string): Promise<CustomerSearchResult[]> {
  await requireAnyRole(["CASHIER", "MANAGER", "ADMIN"]);
  const q = query.trim();
  if (!q) return [];
  return db.customer.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ],
    },
    select: { id: true, name: true, phone: true, isB2B: true },
    take: 10,
    orderBy: { name: "asc" },
  });
}
