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

  const entries = await db.journalEntry.findMany({
    where: { date: { gte: from, lt: to } },
    include: { lines: { include: { account: true }, orderBy: { id: "asc" } } },
    orderBy: { entryNo: "asc" },
  });

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
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="card overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs">
                <span>
                  <span className="font-mono text-gray-400">JE-{String(e.entryNo).padStart(6, "0")}</span>
                  <span className="ml-2 font-medium text-gray-800">{e.description}</span>
                </span>
                <span className="text-gray-400">{e.date.toISOString().slice(0, 10)}</span>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {e.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-1.5 px-4 text-gray-600">{l.account.code} · {l.account.name}</td>
                      <td className="py-1.5 px-4 text-right tabular-nums">{l.debit > 0 ? formatMoney(l.debit) : ""}</td>
                      <td className="py-1.5 px-4 text-right tabular-nums">{l.credit > 0 ? formatMoney(l.credit) : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
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
