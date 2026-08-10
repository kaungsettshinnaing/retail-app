import { prisma as db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { LeaveRequestForm, LeaveReviewButtons } from "./LeaveActions";
import { requireSession } from "@/lib/auth";
import { hrDict } from "@/lib/i18n/dict/hr";

export const dynamic = "force-dynamic";

export default async function LeavePage() {
  const user = await requireSession();
  const t = hrDict[user.language];
  const [pending, recent, employees] = await Promise.all([
    db.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: { employee: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    db.leaveRequest.findMany({
      where: { status: { not: "PENDING" } },
      include: {
        employee: { include: { user: { select: { name: true } } } },
        reviewedBy: { select: { name: true } },
      },
      orderBy: { reviewedAt: "desc" },
      take: 30,
    }),
    db.employee.findMany({
      where: { isActive: true },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="section-title">{t.leaveTitle}</h1>

      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm">{t.pendingRequestsTitle} ({pending.length})</h2>
          {pending.map((r) => (
            <div key={r.id} className="card border-amber-200 bg-amber-50">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-medium">{r.employee.user.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </span>
                  {r.reason && <p className="mt-1 text-sm text-gray-600">&ldquo;{r.reason}&rdquo;</p>}
                </div>
                <LeaveReviewButtons id={r.id} lang={user.language} />
              </div>
            </div>
          ))}
        </div>
      )}

      <LeaveRequestForm employees={employees.map((e) => ({ userId: e.userId, name: e.user.name }))} lang={user.language} />

      {recent.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-sm">{t.recentDecisionsTitle}</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left">{t.colEmployee}</th>
                  <th className="px-4 py-2 text-left">{t.colDates}</th>
                  <th className="px-4 py-2 text-left">{t.colStatus}</th>
                  <th className="px-4 py-2 text-left">{t.colReviewedBy}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2">{r.employee.user.name}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {formatDate(r.startDate)} – {formatDate(r.endDate)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`badge ${r.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {r.status === "APPROVED" ? t.leaveStatusApproved : t.leaveStatusRejected}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{r.reviewedBy?.name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
