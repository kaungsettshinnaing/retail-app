"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  return requireAnyRole(["MANAGER", "ADMIN"]);
}

export async function createManualCashEntry(input: {
  type: "IN" | "OUT";
  amount: number;
  description: string;
  date: string; // "YYYY-MM-DD"
}): Promise<ActionResult> {
  const session = await guard();

  if (input.type !== "IN" && input.type !== "OUT") return { ok: false, error: "Invalid entry type" };
  if (!Number.isFinite(input.amount) || input.amount <= 0) return { ok: false, error: "Enter a valid amount" };
  if (!input.description.trim()) return { ok: false, error: "Enter a description" };
  const date = new Date(`${input.date}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "Invalid date" };

  await db.cashEntry.create({
    data: {
      type: input.type,
      amount: Math.round(input.amount),
      description: input.description.trim(),
      source: "OTHER",
      date,
      recordedById: session.id,
    },
  });

  revalidatePath("/accounting/cash");
  return { ok: true };
}
