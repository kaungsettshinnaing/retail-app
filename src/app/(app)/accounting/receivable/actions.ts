"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  return requireAnyRole(["MANAGER", "ADMIN"]);
}

export async function confirmPaymentProof(proofId: string): Promise<ActionResult> {
  const session = await guard();

  const proof = await db.orderPaymentProof.findUnique({ where: { id: proofId }, include: { order: true } });
  if (!proof) return { ok: false, error: "Payment proof not found" };
  if (proof.status !== "PENDING") return { ok: false, error: "This proof has already been reviewed" };

  await db.$transaction(async (tx) => {
    await tx.orderPaymentProof.update({
      where: { id: proofId },
      data: { status: "CONFIRMED", confirmedById: session.id, confirmedAt: new Date() },
    });

    const order = proof.order;
    if (!order.paidAt) {
      await tx.order.update({ where: { id: order.id }, data: { paidAt: new Date() } });
    }
  });

  revalidatePath("/accounting/receivable");
  revalidatePath(`/accounting/receivable/${proof.orderId}`);
  return { ok: true };
}

export async function rejectPaymentProof(proofId: string): Promise<ActionResult> {
  const session = await guard();

  const proof = await db.orderPaymentProof.findUnique({ where: { id: proofId } });
  if (!proof) return { ok: false, error: "Payment proof not found" };
  if (proof.status !== "PENDING") return { ok: false, error: "This proof has already been reviewed" };

  await db.orderPaymentProof.update({
    where: { id: proofId },
    data: { status: "REJECTED", confirmedById: session.id, confirmedAt: new Date() },
  });

  revalidatePath("/accounting/receivable");
  revalidatePath(`/accounting/receivable/${proof.orderId}`);
  return { ok: true };
}
