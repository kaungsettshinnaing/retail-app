import { prisma as db } from "@/lib/db";
import { formatMoney, formatMonthYear, formatNumber } from "@/lib/format";
import { currentYearMonth } from "@/lib/reports";

export const dynamic = "force-dynamic";

const YM_RE = /^\d{4}-\d{2}$/;

export default async function PayrollReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const yearMonth = monthParam && YM_RE.test(monthParam) ? monthParam : currentYearMonth();
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const [payroll, recentPayrolls] = await Promise.all([
    db.payroll.findUnique({
      where: { month_year: { month, year } },
      include: {
        items: {
          include: { employee: { include: { user: { select: { name: true } } } } },
          orderBy: { employee: { user: { name: "asc" } } },
        },
      },
    }),
    db.payroll.findMany({
      include: { _count: { select: { items: true } }, items: { select: { netPay: true, basicSalary: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    }),
  ]);

  const items = payroll?.items ?? [];
  const totalNetPay = items.reduce((s, i) => s + i.netPay, 0);
  const totalBasic = items.reduce((s, i) => s + i.basicSalary, 0);
  const headcount = items.length;

  const monthlyTotals = recentPayrolls
    .map((p) => ({
      month: p.month,
      year: p.year,
      headcount: p._count.items,
      total: p.items.reduce((s, i) => s + i.netPay, 0),
    }))
    .sort((a, b) => (a.year !== b.year ? b.year - a.year : b.month - a.month));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title">Payroll Report</h1>
        <form className="flex items-end gap-2" method="get">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Month</label>
            <input type="month" name="month" defaultValue={yearMonth} className="input" />
          </div>
          <button type="submit" className="btn-outline">
            Go
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {formatMonthYear(month, year)} — Headcount
          </div>
          <div className="text-lg font-semibold text-gray-800">{formatNumber(headcount)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Basic Salary</div>
          <div className="text-lg font-semibold text-gray-800">{formatMoney(totalBasic)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Net Pay</div>
          <div className="text-lg font-semibold text-brand">{formatMoney(totalNetPay)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card overflow-hidden p-0">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Net Pay by Employee — {formatMonthYear(month, year)}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-2 px-4 text-left">Employee</th>
                <th className="py-2 px-4 text-right">Basic</th>
                <th className="py-2 px-4 text-right">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.length === 0 && (
                <tr>
                  <td className="py-8 px-4 text-center text-gray-400" colSpan={3}>
                    No payroll generated for this month.
                  </td>
                </tr>
              )}
              {items.map((i) => (
                <tr key={i.id}>
                  <td className="py-2 px-4 text-gray-800">{i.employee.user.name}</td>
                  <td className="py-2 px-4 text-right text-gray-500">{formatMoney(i.basicSalary)}</td>
                  <td className="py-2 px-4 text-right font-medium">{formatMoney(i.netPay)}</td>
                </tr>
              ))}
            </tbody>
            {items.length > 0 && (
              <tfoot className="border-t border-gray-100 bg-gray-50">
                <tr>
                  <td className="py-2 px-4 text-right font-semibold" colSpan={2}>
                    Total
                  </td>
                  <td className="py-2 px-4 text-right font-bold text-brand">{formatMoney(totalNetPay)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Payroll Cost by Month
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-2 px-4 text-left">Period</th>
                <th className="py-2 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyTotals.length === 0 && (
                <tr>
                  <td className="py-8 px-4 text-center text-gray-400" colSpan={2}>
                    No payrolls yet.
                  </td>
                </tr>
              )}
              {monthlyTotals.map((m) => (
                <tr key={`${m.year}-${m.month}`}>
                  <td className="py-2 px-4 text-gray-700">{formatMonthYear(m.month, m.year)}</td>
                  <td className="py-2 px-4 text-right font-medium">{formatMoney(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
