"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import { getAttendanceSummary } from "@/lib/hr-attendance";
import { computePayrollItem } from "@/lib/hr-payroll";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  return requireAnyRole(["ADMIN", "MANAGER", "HR"]);
}

function parseYearMonth(slug: string): { year: number; month: number } {
  const [y, m] = slug.split("-").map(Number);
  return { year: y, month: m };
}

export async function generatePayroll(yearMonth: string): Promise<ActionResult> {
  await guard();
  const { year, month } = parseYearMonth(yearMonth);
  if (!year || !month) return { ok: false, error: "Invalid period" };

  const payroll = await db.payroll.upsert({
    where: { month_year: { month, year } },
    update: {},
    create: { month, year, status: "DRAFT" },
  });

  if (payroll.status === "LOCKED") {
    return { ok: false, error: "Cannot regenerate a locked payroll" };
  }

  const employees = await db.employee.findMany({ where: { isActive: true } });

  for (const emp of employees) {
    const { workingDays, absentDays, otDays } = await getAttendanceSummary(
      emp.userId, year, month, emp.restDays,
    );

    const adHocRows = await db.adHocBonus.findMany({
      where: { employeeId: emp.userId, month, year },
    });
    const adHocBonuses = adHocRows.reduce((s, b) => s + b.amount, 0);

    const advanceInstalments = await db.advanceInstalment.findMany({
      where: { advance: { employeeId: emp.userId }, month, year },
    });
    const advanceDeduction = advanceInstalments.reduce((s, i) => s + i.amount, 0);

    const fines = await db.employeeFine.findMany({
      where: { employeeId: emp.userId, deductMonth: month, deductYear: year },
    });
    const fineDeduction = fines.reduce((s, f) => s + f.amount, 0);

    const result = computePayrollItem({
      basicSalary: emp.basicSalary,
      workingDays,
      absentDays,
      otDays,
      attendanceBonusAmt: emp.attendanceBonus,
      adHocBonuses,
      advanceDeduction,
      fineDeduction,
    });

    await db.payrollItem.upsert({
      where: { payrollId_employeeId: { payrollId: payroll.id, employeeId: emp.userId } },
      update: {
        basicSalary: emp.basicSalary,
        workingDays,
        absentDays,
        otDays,
        attendanceBonusAmt: emp.attendanceBonus,
        dailyRate: result.dailyRate,
        absenceDeduction: result.absenceDeduction,
        otPremium: result.otPremium,
        adHocBonuses,
        advanceDeduction,
        fineDeduction,
        netPay: result.netPay,
      },
      create: {
        payrollId: payroll.id,
        employeeId: emp.userId,
        basicSalary: emp.basicSalary,
        workingDays,
        absentDays,
        otDays,
        attendanceBonusAmt: emp.attendanceBonus,
        dailyRate: result.dailyRate,
        absenceDeduction: result.absenceDeduction,
        otPremium: result.otPremium,
        adHocBonuses,
        advanceDeduction,
        fineDeduction,
        netPay: result.netPay,
      },
    });
  }

  revalidatePath(`/hr/payroll/${yearMonth}`);
  revalidatePath("/hr/payroll");
  return { ok: true };
}

export async function lockPayroll(yearMonth: string): Promise<ActionResult> {
  const session = await guard();
  const { year, month } = parseYearMonth(yearMonth);

  const payroll = await db.payroll.findUnique({ where: { month_year: { month, year } } });
  if (!payroll) return { ok: false, error: "Generate the payroll before locking it" };
  if (payroll.status === "LOCKED") return { ok: false, error: "Payroll is already locked" };

  await db.payroll.update({
    where: { id: payroll.id },
    data: { status: "LOCKED", lockedById: session.id, lockedAt: new Date() },
  });

  const items = await db.payrollItem.findMany({ where: { payrollId: payroll.id } });
  for (const item of items) {
    await db.advanceInstalment.updateMany({
      where: { advance: { employeeId: item.employeeId }, month, year },
      data: { deducted: true },
    });
    await db.employeeFine.updateMany({
      where: { employeeId: item.employeeId, deductMonth: month, deductYear: year },
      data: { deducted: true },
    });
  }

  revalidatePath(`/hr/payroll/${yearMonth}`);
  revalidatePath("/hr/payroll");
  revalidatePath("/hr/advances");
  revalidatePath("/hr/fines");
  return { ok: true };
}
