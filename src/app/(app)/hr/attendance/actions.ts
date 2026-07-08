"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";
import type { AttendanceStatus, DayType } from "@prisma/client";

async function guard() {
  return requireAnyRole(["ADMIN", "MANAGER", "HR"]);
}

export async function markAttendance(fd: FormData): Promise<ActionResult> {
  const session = await guard();
  const employeeId = (fd.get("employeeId") as string | null) ?? "";
  const rawDate = (fd.get("date") as string | null) ?? "";
  const status = ((fd.get("status") as string | null) ?? "").trim();
  const dayType = ((fd.get("dayType") as string | null) || "FULL") as DayType;
  const note = ((fd.get("note") as string | null) ?? "").trim();

  if (!employeeId || !rawDate) return { ok: false, error: "Employee and date are required" };
  const [y, m, d] = rawDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  if (!status) {
    // Blank status = clear the attendance record for this employee/day.
    await db.attendance.deleteMany({ where: { employeeId, date } });
  } else {
    await db.attendance.upsert({
      where: { employeeId_date: { employeeId, date } },
      update: { status: status as AttendanceStatus, dayType, note: note || null, isApproved: true, approvedById: session.id },
      create: { employeeId, date, status: status as AttendanceStatus, dayType, note: note || null, isApproved: true, approvedById: session.id },
    });
  }

  revalidatePath("/hr/attendance");
  return { ok: true };
}

export async function approveAttendance(id: string): Promise<ActionResult> {
  const session = await guard();
  const att = await db.attendance.findUnique({ where: { id } });
  if (!att) return { ok: false, error: "Attendance record not found" };

  await db.attendance.update({
    where: { id },
    data: { isApproved: true, approvedById: session.id },
  });
  revalidatePath("/hr/attendance");
  return { ok: true };
}
