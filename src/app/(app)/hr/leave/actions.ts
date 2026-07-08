"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  return requireAnyRole(["ADMIN", "MANAGER", "HR"]);
}

function parseDay(raw: string): Date {
  const [y, m, d] = raw.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function createLeaveRequest(fd: FormData): Promise<ActionResult> {
  await guard();
  const employeeId = (fd.get("employeeId") as string | null) ?? "";
  const startRaw = (fd.get("startDate") as string | null) ?? "";
  const endRaw = (fd.get("endDate") as string | null) ?? "";
  const reason = ((fd.get("reason") as string | null) ?? "").trim();

  if (!employeeId || !startRaw || !endRaw) {
    return { ok: false, error: "Employee, start date, and end date are required" };
  }
  const startDate = parseDay(startRaw);
  const endDate = parseDay(endRaw);
  if (endDate < startDate) return { ok: false, error: "End date must be on or after start date" };

  await db.leaveRequest.create({
    data: { employeeId, startDate, endDate, reason: reason || null },
  });

  revalidatePath("/hr/leave");
  return { ok: true };
}

export async function reviewLeave(id: string, decision: "APPROVED" | "REJECTED"): Promise<ActionResult> {
  const session = await guard();
  const req = await db.leaveRequest.findUnique({ where: { id } });
  if (!req) return { ok: false, error: "Leave request not found" };
  if (req.status !== "PENDING") return { ok: false, error: "This request has already been reviewed" };

  await db.leaveRequest.update({
    where: { id },
    data: { status: decision, reviewedById: session.id, reviewedAt: new Date() },
  });

  if (decision === "APPROVED") {
    // Mark each day in the range as LEAVE on the attendance calendar.
    const startDay = req.startDate.getTime();
    const endDay = req.endDate.getTime();
    for (let t = startDay; t <= endDay; t += 24 * 60 * 60 * 1000) {
      const date = new Date(t);
      await db.attendance.upsert({
        where: { employeeId_date: { employeeId: req.employeeId, date } },
        update: { status: "LEAVE" },
        create: { employeeId: req.employeeId, date, status: "LEAVE", isApproved: true, approvedById: session.id },
      });
    }
  }

  revalidatePath("/hr/leave");
  revalidatePath("/hr/attendance");
  return { ok: true };
}
