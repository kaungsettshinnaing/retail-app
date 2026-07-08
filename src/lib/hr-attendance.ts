import { prisma as db } from "./db";
import { workingDaysInMonth } from "./hr-payroll";

// Ported from qq-app/src/lib/hr-attendance.ts, adapted to retail-app's schema:
// - retail-app has no Employee.isSystem field (qq-app used it to exclude POS terminal
//   "employees"), so that filter is simply dropped here.
// - qq-app used Myanmar-timezone-aware helpers from "./business-day" (mmTodayUTC/mmNow).
//   retail-app has no such module, so we use plain UTC-midnight helpers instead.

/** Today's calendar date at UTC midnight (matches the @db.Date storage convention). */
export function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** All attendance rows for a month, keyed by employeeId+date. */
export async function getMonthAttendance(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return db.attendance.findMany({
    where: { date: { gte: start, lt: end } },
    include: { employee: { include: { user: { select: { id: true, name: true } } } } },
    orderBy: [{ employeeId: "asc" }, { date: "asc" }],
  });
}

/** Attendance summary for a single employee in a month (for payroll generation). */
export async function getAttendanceSummary(
  employeeId: string,
  year: number,
  month: number,
  restDays: number[],
) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const rows = await db.attendance.findMany({
    where: { employeeId, date: { gte: start, lt: end } },
  });

  const workingDays = workingDaysInMonth(year, month, restDays);

  // Half-day rows count as 0.5; PRESENT+HALF means worked half, absent half
  const absentDays = rows.reduce((sum, r) => {
    const factor = r.dayType === "HALF" ? 0.5 : 1;
    if (r.status === "ABSENT" || r.status === "LEAVE") return sum + factor;
    if (r.status === "PRESENT" && r.dayType === "HALF") return sum + 0.5;
    return sum;
  }, 0);

  const otDays = rows.reduce((sum, r) => {
    if (r.status !== "OT") return sum;
    return sum + (r.dayType === "HALF" ? 0.5 : 1);
  }, 0);

  return { workingDays, absentDays, otDays };
}

/** Today's attendance record for an employee, or null if none yet. */
export async function getTodayAttendance(employeeId: string) {
  return db.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: todayUTC() } },
  });
}

/** Live status of all active employees: current clock state today. */
export async function getLiveAttendanceStatus() {
  const today = todayUTC();
  const dayOfWeek = today.getUTCDay(); // 0=Sun … 6=Sat
  const now = new Date();

  const employees = await db.employee.findMany({
    where: { isActive: true },
    include: {
      user: { select: { id: true, name: true } },
      attendances: {
        where: { date: today },
        take: 1,
        include: { breaks: { orderBy: { startAt: "asc" } } },
      },
      leaveRequests: {
        where: { status: "APPROVED", startDate: { lte: today }, endDate: { gte: today } },
        take: 1,
        select: { id: true },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  return employees.map((emp) => {
    const att = emp.attendances[0] ?? null;
    const openBreak = att?.breaks.find((b) => !b.endAt) ?? null;
    const isRestDay = emp.restDays.includes(dayOfWeek);

    let status: "not_started" | "working" | "on_break" | "clocked_out" | "on_leave" | "rest" = "not_started";
    if (att) {
      if (att.clockOutAt) status = "clocked_out";
      else if (att.clockInAt) status = openBreak ? "on_break" : "working";
    } else if (emp.leaveRequests.length > 0) {
      status = "on_leave";
    } else if (isRestDay) {
      status = "rest";
    }

    const totalBreakMins = Math.floor(
      (att?.breaks ?? []).reduce((sum, b) => {
        return sum + ((b.endAt ?? now).getTime() - b.startAt.getTime()) / 60000;
      }, 0),
    );
    return {
      employeeId: emp.userId,
      name: emp.user.name,
      attendance: att,
      status,
      isRestDay,
      openBreak,
      breakCount: att?.breaks.length ?? 0,
      totalBreakMins,
    };
  });
}
