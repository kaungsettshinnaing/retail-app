"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  return requireAnyRole(["ADMIN", "MANAGER", "HR"]);
}

export async function createFine(fd: FormData): Promise<ActionResult> {
  const session = await guard();
  const employeeId = (fd.get("employeeId") as string | null) ?? "";
  const amount = parseInt(fd.get("amount") as string);
  const reason = ((fd.get("reason") as string | null) ?? "").trim();
  const deductMonth = parseInt(fd.get("deductMonth") as string);
  const deductYear = parseInt(fd.get("deductYear") as string);

  if (!employeeId || !amount || amount <= 0 || !reason || !deductMonth || !deductYear) {
    return { ok: false, error: "Employee, amount, reason, and deduction month/year are required" };
  }

  await db.employeeFine.create({
    data: { employeeId, amount, reason, deductMonth, deductYear, createdById: session.id },
  });

  revalidatePath("/hr/fines");
  return { ok: true };
}

export async function deleteFine(id: string): Promise<ActionResult> {
  await guard();
  const fine = await db.employeeFine.findUnique({ where: { id } });
  if (!fine) return { ok: false, error: "Fine not found" };
  if (fine.deducted) return { ok: false, error: "Cannot delete an already-deducted fine" };

  await db.employeeFine.delete({ where: { id } });
  revalidatePath("/hr/fines");
  return { ok: true };
}
