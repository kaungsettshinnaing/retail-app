"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";
import { postAdvanceGiven } from "@/lib/journal-postings";

async function guard() {
  return requireAnyRole(["ADMIN", "MANAGER", "HR"]);
}

export async function createAdvance(fd: FormData): Promise<ActionResult> {
  const session = await guard();
  const employeeId = (fd.get("employeeId") as string | null) ?? "";
  const amount = parseInt(fd.get("amount") as string);
  const note = ((fd.get("note") as string | null) ?? "").trim();
  const month = parseInt(fd.get("month") as string);
  const year = parseInt(fd.get("year") as string);

  if (!employeeId || !amount || amount <= 0 || !month || !year) {
    return { ok: false, error: "Employee, amount, and deduction month/year are required" };
  }

  await db.$transaction(async (tx) => {
    const advance = await tx.salaryAdvance.create({
      data: { employeeId, totalAmount: amount, note: note || null, createdById: session.id },
    });
    await tx.advanceInstalment.create({
      data: { advanceId: advance.id, month, year, amount },
    });
    await postAdvanceGiven(tx, advance);
  });

  revalidatePath("/hr/advances");
  return { ok: true };
}

export async function deleteInstalment(id: string): Promise<ActionResult> {
  await guard();
  const inst = await db.advanceInstalment.findUnique({ where: { id } });
  if (!inst) return { ok: false, error: "Instalment not found" };
  if (inst.deducted) return { ok: false, error: "Cannot delete an already-deducted instalment" };

  await db.advanceInstalment.delete({ where: { id } });
  const remaining = await db.advanceInstalment.count({ where: { advanceId: inst.advanceId } });
  if (remaining === 0) await db.salaryAdvance.delete({ where: { id: inst.advanceId } });

  revalidatePath("/hr/advances");
  return { ok: true };
}
