"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  return requireAnyRole(["ADMIN", "MANAGER", "HR"]);
}

function parseInputDate(value: FormDataEntryValue | null): Date | undefined {
  const s = (value as string | null)?.trim();
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function createEmployee(fd: FormData) {
  await guard();

  const userId = (fd.get("userId") as string | null)?.trim();
  if (!userId) redirect("/hr/employees/new?error=missing");

  const existing = await db.employee.findUnique({ where: { userId } });
  if (existing) redirect("/hr/employees/new?error=exists");

  const staffRoleId = (fd.get("staffRoleId") as string | null)?.trim() || null;
  const employeeNo = (fd.get("employeeNo") as string | null)?.trim() || undefined;
  const startDate = parseInputDate(fd.get("startDate")) ?? new Date();
  const dateOfBirth = parseInputDate(fd.get("dateOfBirth"));
  const basicSalary = parseInt(fd.get("basicSalary") as string) || 0;
  const attendanceBonus = parseInt(fd.get("attendanceBonus") as string) || 0;
  const restDays = fd.getAll("restDays").map((v) => parseInt(v as string));
  const phone = (fd.get("phone") as string | null)?.trim() || undefined;
  const address = (fd.get("address") as string | null)?.trim() || undefined;
  const emergencyContact = (fd.get("emergencyContact") as string | null)?.trim() || undefined;
  const bankAccount = (fd.get("bankAccount") as string | null)?.trim() || undefined;

  await db.employee.create({
    data: {
      userId,
      staffRoleId,
      employeeNo,
      startDate,
      dateOfBirth,
      basicSalary,
      attendanceBonus,
      restDays,
      phone,
      address,
      emergencyContact,
      bankAccount,
    },
  });

  revalidatePath("/hr/employees");
  redirect(`/hr/employees/${userId}`);
}

export async function updateEmployee(userId: string, fd: FormData) {
  await guard();

  const staffRoleId = (fd.get("staffRoleId") as string | null)?.trim() || null;
  const employeeNo = (fd.get("employeeNo") as string | null)?.trim() || null;
  const startDate = parseInputDate(fd.get("startDate")) ?? new Date();
  const dateOfBirth = parseInputDate(fd.get("dateOfBirth")) ?? null;
  const basicSalary = parseInt(fd.get("basicSalary") as string) || 0;
  const attendanceBonus = parseInt(fd.get("attendanceBonus") as string) || 0;
  const restDays = fd.getAll("restDays").map((v) => parseInt(v as string));
  const phone = (fd.get("phone") as string | null)?.trim() || null;
  const address = (fd.get("address") as string | null)?.trim() || null;
  const emergencyContact = (fd.get("emergencyContact") as string | null)?.trim() || null;
  const bankAccount = (fd.get("bankAccount") as string | null)?.trim() || null;

  await db.employee.update({
    where: { userId },
    data: {
      staffRoleId,
      employeeNo,
      startDate,
      dateOfBirth,
      basicSalary,
      attendanceBonus,
      restDays,
      phone,
      address,
      emergencyContact,
      bankAccount,
    },
  });

  revalidatePath(`/hr/employees/${userId}`);
  redirect(`/hr/employees/${userId}`);
}

export async function toggleEmployeeActive(userId: string, isActive: boolean): Promise<ActionResult> {
  await guard();
  const emp = await db.employee.findUnique({ where: { userId } });
  if (!emp) return { ok: false, error: "Employee not found" };

  await db.employee.update({ where: { userId }, data: { isActive } });
  revalidatePath("/hr/employees");
  revalidatePath(`/hr/employees/${userId}`);
  return { ok: true };
}
