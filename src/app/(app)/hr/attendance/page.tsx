import { prisma as db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { todayUTC } from "@/lib/hr-attendance";
import MarkAttendanceForm from "./MarkAttendanceForm";
import ApproveButton from "./ApproveButton";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-blue-100 text-blue-700",
  REST_DAY: "bg-gray-100 text-gray-400",
  OT: "bg-purple-100 text-purple-700",
};

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const now = todayUTC();
  const sp = await searchParams;
  const month = parseInt(sp.month ?? String(now.getUTCMonth() + 1));
  const year = parseInt(sp.year ?? String(now.getUTCFullYear()));

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const [employees, pending] = await Promise.all([
    db.employee.findMany({
      where: { isActive: true },
      include: {
        user: { select: { name: true } },
        attendances: { where: { date: { gte: start, lt: end } } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    db.attendance.findMany({
      where: { isApproved: false, status: { not: "REST_DAY" } },
      include: { employee: { include: { user: { select: { name: true } } } } },
      orderBy: { date: "desc" },
      take: 30,
    }),
  ]);

  const prev = month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
  const next = month === 12 ? { month: 1, year: year + 1 } : { month: month + 1, year };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="section-title">Attendance</h1>
        <div className="flex items-center gap-2 text-sm">
          <a href={`?month=${prev.month}&year=${prev.year}`} className="btn-outline px-2 py-1">‹</a>
          <span className="font-medium">
            {new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <a href={`?month=${next.month}&year=${next.year}`} className="btn-outline px-2 py-1">›</a>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-amber-600">Unapproved Attendance ({pending.length})</h2>
          <div className="card bg-amber-50 border-amber-200 space-y-1">
            {pending.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span>{a.employee.user.name} — {formatDate(a.date)} ({a.status})</span>
                <ApproveButton id={a.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full text-xs">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-3 py-2 text-left font-semibold">Employee</th>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <th key={i} className="px-1 py-2 text-center font-medium text-gray-400">{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp) => {
              const attMap = new Map(emp.attendances.map((a) => [a.date.getUTCDate(), a]));
              return (
                <tr key={emp.userId}>
                  <td className="sticky left-0 bg-white px-3 py-1.5 font-medium whitespace-nowrap">{emp.user.name}</td>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const a = attMap.get(day);
                    const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
                    const isRestDay = !a && emp.restDays.includes(dow);
                    return (
                      <td key={day} className="px-0.5 py-1 text-center">
                        {a ? (
                          <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium ${STATUS_STYLES[a.status]}`}>
                            {a.status.slice(0, 2)}
                          </span>
                        ) : isRestDay ? (
                          <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium ${STATUS_STYLES.REST_DAY}`}>
                            RE
                          </span>
                        ) : (
                          <span className="text-gray-200">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {employees.length === 0 && (
              <tr>
                <td colSpan={daysInMonth + 1} className="py-8 text-center text-sm text-gray-400">
                  No active employees.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MarkAttendanceForm
        employees={employees.map((e) => ({ userId: e.userId, name: e.user.name }))}
        today={now.toISOString().slice(0, 10)}
      />

      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(STATUS_STYLES).map(([s, cls]) => (
          <span key={s} className={`rounded px-2 py-0.5 ${cls}`}>{s}</span>
        ))}
      </div>
    </div>
  );
}
