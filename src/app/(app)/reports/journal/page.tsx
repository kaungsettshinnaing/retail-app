import { prisma as db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getDateRange } from "@/lib/reports";

export const dynamic = "force-dynamic";

export default async function JournalReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from: fromParam, to: toParam } = await searchParams;
  const { fromStr, toStr, from, to } = getDateRange(fromParam, toParam);

  const [entries, priorLines] = await Promise.all([
    db.journalEntry.findMany({
      where: { date: { gte: from, lt: to } },
      include: { lines: { include: { account: true }, orderBy: { id: "asc" } } },
      orderBy: { entryNo: "asc" },
    }),
    db.journalLine.findMany({
      where: { entry: { date: { lt: from } } },
      select: { debit: true, credit: true, account: { select: { type: true } } },
    }),
  ]);

  const totals = entries.reduce(
    (acc, e) => {
      for (const l of e.lines) {
        acc.debit += l.debit;
        acc.credit += l.credit;
      }
      return acc;
    },
    { debit: 0, credit: 0 },
  );

  // Balance carried over from before the selected range — cumulative net
  // (revenue − expense) of every entry dated earlier, so the daily running
  // balance below doesn't reset to zero at an arbitrary date-picker boundary.
  const openingBalance = priorLines.reduce((sum, l) => {
    if (l.account.type === "REVENUE") return sum + (l.credit - l.debit);
    if (l.account.type === "EXPENSE") return sum - (l.debit - l.credit);
    return sum;
  }, 0);

  // Daily ins/outs — "in" = net revenue recognized that day (credits to
  // REVENUE accounts minus contra-revenue debits, e.g. Discounts &
  // Allowances), "out" = expenses recognized that day (debits to EXPENSE
  // accounts, incl. COGS and payroll). Exactly how the P&L above is
  // derived, just broken out per day. "In" is further broken down by which
  // asset account received the money (Cash, Bank, ...) and "Out" by expense
  // category, each down to the individual entries that made it up.
  type Breakdown = { code: string; name: string; amount: number };
  type OutCategory = Breakdown & { items: { entryNo: number; description: string; amount: number }[] };
  type DayRow = { date: string; in: number; out: number; inByAccount: Breakdown[]; outByCategory: OutCategory[] };

  const dailyMap = new Map<string, DayRow>();
  for (const e of entries) {
    const dayKey = e.date.toISOString().slice(0, 10);
    const row = dailyMap.get(dayKey) ?? { date: dayKey, in: 0, out: 0, inByAccount: [], outByCategory: [] };

    const isRevenueEntry = e.lines.some((l) => l.account.type === "REVENUE");
    for (const l of e.lines) {
      if (l.account.type === "REVENUE") row.in += l.credit - l.debit;
      if (l.account.type === "EXPENSE") row.out += l.debit - l.credit;

      if (isRevenueEntry && l.account.type === "ASSET" && l.debit > 0) {
        const existing = row.inByAccount.find((a) => a.code === l.account.code);
        if (existing) existing.amount += l.debit;
        else row.inByAccount.push({ code: l.account.code, name: l.account.name, amount: l.debit });
      }

      if (l.account.type === "EXPENSE" && l.debit > 0) {
        let cat = row.outByCategory.find((c) => c.code === l.account.code);
        if (!cat) {
          cat = { code: l.account.code, name: l.account.name, amount: 0, items: [] };
          row.outByCategory.push(cat);
        }
        cat.amount += l.debit;
        cat.items.push({ entryNo: e.entryNo, description: e.description, amount: l.debit });
      }
    }
    dailyMap.set(dayKey, row);
  }
  const dailyRowsRaw = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  let runningBalance = openingBalance;
  const dailyRows = dailyRowsRaw.map((d) => {
    runningBalance += d.in - d.out;
    return { ...d, balance: runningBalance };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title">General Journal</h1>
        <div className="flex items-end gap-2">
          <form className="flex items-end gap-2" method="get">
            <div>
              <label className="text-sm text-gray-600 block mb-1">From</label>
              <input type="date" name="from" defaultValue={fromStr} className="input" />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">To</label>
              <input type="date" name="to" defaultValue={toStr} className="input" />
            </div>
            <button type="submit" className="btn-outline">Filter</button>
          </form>
          <a
            href={`/reports/journal/export?from=${fromStr}&to=${toStr}`}
            className="btn-outline"
          >
            Export Excel
          </a>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="card p-6 text-center text-gray-400">No journal entries in this period.</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Daily ins & outs
          </div>

          <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-x-3 border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
            <span>Date</span>
            <span className="text-right w-24">In</span>
            <span className="text-right w-24">Out</span>
            <span className="text-right w-24">Net</span>
            <span className="text-right w-28">Balance</span>
          </div>

          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
            Balance carried over: <span className="font-semibold tabular-nums text-gray-700">{formatMoney(openingBalance)}</span>
          </div>

          <div className="divide-y divide-gray-50">
            {dailyRows.map((d) => {
              const net = d.in - d.out;
              return (
                <details key={d.date} className="group">
                  <summary className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-x-3 items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-50">
                    <span className="text-gray-700">{d.date}</span>
                    <span className="text-right w-24 tabular-nums text-green-700">{formatMoney(d.in)}</span>
                    <span className="text-right w-24 tabular-nums text-red-700">{formatMoney(d.out)}</span>
                    <span className={`text-right w-24 tabular-nums font-semibold ${net >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {net >= 0 ? "+" : ""}{formatMoney(net)}
                    </span>
                    <span className="text-right w-28 tabular-nums text-gray-700">{formatMoney(d.balance)}</span>
                  </summary>

                  <div className="px-4 pb-3 pl-6 space-y-3 bg-gray-50/60 text-xs">
                    <div>
                      <p className="mb-1 font-semibold text-green-700">In</p>
                      {d.inByAccount.length === 0 ? (
                        <p className="text-gray-400">—</p>
                      ) : (
                        d.inByAccount.map((a) => (
                          <div key={a.code} className="flex items-center justify-between py-0.5">
                            <span className="text-gray-600">{a.name}</span>
                            <span className="tabular-nums text-gray-800">{formatMoney(a.amount)}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div>
                      <p className="mb-1 font-semibold text-red-700">Out</p>
                      {d.outByCategory.length === 0 ? (
                        <p className="text-gray-400">—</p>
                      ) : (
                        d.outByCategory.map((c) => (
                          <details key={c.code} className="mb-0.5">
                            <summary className="flex cursor-pointer items-center justify-between py-0.5 text-gray-600">
                              <span>{c.name}</span>
                              <span className="tabular-nums text-gray-800">{formatMoney(c.amount)}</span>
                            </summary>
                            <div className="pl-4">
                              {c.items.map((it, i) => (
                                <div key={i} className="flex items-center justify-between py-0.5 text-[11px] text-gray-500">
                                  <span>{it.description}</span>
                                  <span className="tabular-nums">{formatMoney(it.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        ))
                      )}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>

          <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-x-3 border-t-2 border-gray-200 px-4 py-2 text-sm font-bold">
            <span>Total</span>
            <span className="text-right w-24 tabular-nums text-green-700">{formatMoney(dailyRows.reduce((s, d) => s + d.in, 0))}</span>
            <span className="text-right w-24 tabular-nums text-red-700">{formatMoney(dailyRows.reduce((s, d) => s + d.out, 0))}</span>
            <span className="text-right w-24 tabular-nums">{formatMoney(dailyRows.reduce((s, d) => s + (d.in - d.out), 0))}</span>
            <span className="text-right w-28 tabular-nums">{formatMoney(dailyRows.length > 0 ? dailyRows[dailyRows.length - 1].balance : openingBalance)}</span>
          </div>
        </div>
      )}

      <div className={`card flex items-center justify-between p-4 ${totals.debit === totals.credit ? "" : "border-red-300 bg-red-50"}`}>
        <span className="text-sm font-semibold text-gray-700">
          Total Debit {formatMoney(totals.debit)} · Total Credit {formatMoney(totals.credit)}
        </span>
        <span className={`text-xs font-bold ${totals.debit === totals.credit ? "text-green-700" : "text-red-700"}`}>
          {totals.debit === totals.credit ? "Balanced ✓" : "⚠ Unbalanced — investigate"}
        </span>
      </div>
    </div>
  );
}
