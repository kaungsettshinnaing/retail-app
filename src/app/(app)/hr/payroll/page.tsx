import Link from "next/link";
import { prisma as db } from "@/lib/db";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function PayrollListPage() {
  const now = new Date();

  const payrolls = await db.payroll.findMany({
    include: {
      _count: { select: { items: true } },
      lockedBy: { select: { name: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: 24,
  });

  const recentMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });

  return (
    <div className="space-y-6">
      <h1 className="section-title">Payroll</h1>

      <div className="flex flex-wrap gap-2">
        {recentMonths.map(({ month, year }) => {
          const slug = `${year}-${String(month).padStart(2, "0")}`;
          const existing = payrolls.find((p) => p.month === month && p.year === year);
          return (
            <Link
              key={slug}
              href={`/hr/payroll/${slug}`}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                existing?.status === "LOCKED"
                  ? "border-green-300 bg-green-50 text-green-700"
                  : existing?.status === "DRAFT"
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {MONTHS[month - 1]} {year}
              {existing?.status === "LOCKED" && " ✓"}
              {existing?.status === "DRAFT" && " (draft)"}
            </Link>
          );
        })}
      </div>

      {payrolls.length > 0 ? (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left">Period</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Employees</th>
                <th className="px-4 py-2 text-left">Locked By</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payrolls.map((p) => {
                const slug = `${p.year}-${String(p.month).padStart(2, "0")}`;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-2 font-medium">{MONTHS[p.month - 1]} {p.year}</td>
                    <td className="px-4 py-2">
                      <span className={`badge ${p.status === "LOCKED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.status === "LOCKED" ? "Locked" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-2">{p._count.items}</td>
                    <td className="px-4 py-2 text-gray-500">{p.lockedBy?.name ?? "—"}</td>
                    <td className="px-4 py-2 text-right">
                      <Link href={`/hr/payroll/${slug}`} className="text-sm text-brand hover:underline">
                        Open →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center text-gray-400 py-10">
          No payrolls generated yet. Pick a month above to get started.
        </div>
      )}
    </div>
  );
}
