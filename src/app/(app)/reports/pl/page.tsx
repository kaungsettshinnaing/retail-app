import { prisma as db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getDateRange, monthsInRange } from "@/lib/reports";
import { requireSession } from "@/lib/auth";
import { reportsDict } from "@/lib/i18n/dict/reports";
import { commonDict } from "@/lib/i18n/dict/common";

export const dynamic = "force-dynamic";

export default async function PLReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const user = await requireSession();
  const t = reportsDict[user.language];
  const c = commonDict[user.language];

  const { from: fromParam, to: toParam } = await searchParams;
  const { fromStr, toStr, from, to } = getDateRange(fromParam, toParam);

  // Revenue + COGS: orders paid within the period, excluding cancelled orders.
  // Order.total is already net of discount (total = subtotal - discount), and
  // cancelled orders are excluded — the same "net sales" convention used by
  // QQ Hotpot's reports (net of discount, void/cancelled excluded).
  const orders = await db.order.findMany({
    where: {
      paidAt: { gte: from, lt: to },
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
      total: true,
      items: {
        where: { status: { not: "UNAVAILABLE" } },
        select: {
          qty: true,
          unitPrice: true,
          unitCost: true,
          product: { select: { category: { select: { id: true, name: true } } } },
        },
      },
    },
  });

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const cogs = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + (i.unitCost ?? 0) * i.qty, 0),
    0
  );
  const grossProfit = revenue - cogs;

  // Revenue breakdown by category — item-level price × qty (pre order-discount
  // allocation), grouped by the product's current category.
  const revenueByCategory = new Map<string, { name: string; amount: number }>();
  for (const o of orders) {
    for (const item of o.items) {
      const catId = item.product.category?.id ?? "__none__";
      const catName = item.product.category?.name ?? "Uncategorized";
      const amount = (item.unitPrice ?? 0) * item.qty;
      const existing = revenueByCategory.get(catId);
      if (existing) existing.amount += amount;
      else revenueByCategory.set(catId, { name: catName, amount });
    }
  }
  const revenueRows = [...revenueByCategory.values()].sort((a, b) => b.amount - a.amount);

  // Expenses in the period, grouped by category.
  const expenses = await db.expense.findMany({
    where: { date: { gte: from, lt: to } },
    select: { amount: true, category: { select: { id: true, name: true } } },
  });
  const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseByCategory = new Map<string, { name: string; amount: number }>();
  for (const e of expenses) {
    const existing = expenseByCategory.get(e.category.id);
    if (existing) existing.amount += e.amount;
    else expenseByCategory.set(e.category.id, { name: e.category.name, amount: e.amount });
  }
  const expenseRows = [...expenseByCategory.values()].sort((a, b) => b.amount - a.amount);

  // Payroll cost — net wage expense for every calendar month touched by the
  // selected range, matching what the General Journal posts to EXPENSE-type
  // accounts for payroll (see postPayrollItem in journal-postings.ts):
  // Dr Salaries & Wages Expense (netPay + advanceDeduction + fineDeduction),
  // Cr Fines & Deductions Recovered (fineDeduction) — fineDeduction is itself
  // an EXPENSE-type contra account, so it nets out of the ledger's payroll
  // expense total. advanceDeduction credits Advances Receivable, a
  // balance-sheet asset account, so it does NOT net out — it stays part of
  // the expense. Net EXPENSE-account effect = netPay + advanceDeduction.
  const months = monthsInRange(from, to);
  const payrolls = await db.payroll.findMany({
    where: { OR: months.map((m) => ({ month: m.month, year: m.year })) },
    include: { items: { select: { netPay: true, advanceDeduction: true } } },
  });
  const payrollCost = payrolls.reduce(
    (sum, p) => sum + p.items.reduce((s, i) => s + i.netPay + i.advanceDeduction, 0),
    0
  );

  const operatingCost = expensesTotal + payrollCost;
  const netProfit = grossProfit - operatingCost;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title">{t.plTitle}</h1>
        <form className="flex items-end gap-2" method="get">
          <div>
            <label className="text-sm text-gray-600 block mb-1">{t.fromLabel}</label>
            <input type="date" name="from" defaultValue={fromStr} className="input" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">{t.toLabel}</label>
            <input type="date" name="to" defaultValue={toStr} className="input" />
          </div>
          <button type="submit" className="btn-outline">
            {c.filter}
          </button>
        </form>
      </div>

      {/* Summary */}
      <div className="card overflow-hidden p-0">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {t.summaryTitle}
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-50">
            <tr>
              <td className="py-2 px-4 text-gray-600">{t.revenueNetSales}</td>
              <td className="py-2 px-4 text-right font-medium">{formatMoney(revenue)}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-gray-600">{t.cogs}</td>
              <td className="py-2 px-4 text-right text-red-700">-{formatMoney(cogs)}</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="py-2 px-4 font-semibold">{t.grossProfit}</td>
              <td className="py-2 px-4 text-right font-semibold">{formatMoney(grossProfit)}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-gray-600">{t.expenses}</td>
              <td className="py-2 px-4 text-right text-red-700">-{formatMoney(expensesTotal)}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-gray-600">{t.payrollCost}</td>
              <td className="py-2 px-4 text-right text-red-700">-{formatMoney(payrollCost)}</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="py-2 px-4 font-semibold">{t.operatingCost}</td>
              <td className="py-2 px-4 text-right font-semibold">{formatMoney(operatingCost)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-base font-bold">{t.netProfit}</td>
              <td
                className={`py-3 px-4 text-right text-base font-bold ${
                  netProfit >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {formatMoney(netProfit)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue breakdown */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t.revenueByCategory}
          </div>
          <p className="px-4 pt-2 text-[11px] text-gray-400">
            {t.revenueByCategoryNote}
          </p>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {revenueRows.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-center text-gray-400" colSpan={2}>
                    {t.noSalesInPeriod}
                  </td>
                </tr>
              )}
              {revenueRows.map((r) => (
                <tr key={r.name}>
                  <td className="py-2 px-4 text-gray-700">{r.name}</td>
                  <td className="py-2 px-4 text-right">{formatMoney(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expense breakdown */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t.expensesByCategory}
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {expenseRows.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-center text-gray-400" colSpan={2}>
                    {t.noExpensesInPeriod}
                  </td>
                </tr>
              )}
              {expenseRows.map((r) => (
                <tr key={r.name}>
                  <td className="py-2 px-4 text-gray-700">{r.name}</td>
                  <td className="py-2 px-4 text-right text-red-700">{formatMoney(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
