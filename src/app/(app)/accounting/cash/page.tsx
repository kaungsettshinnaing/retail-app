import { prisma as db } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import NewEntryForm from "./NewEntryForm";

export const dynamic = "force-dynamic";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const SOURCE_STYLES: Record<string, string> = {
  SALE: "bg-green-100 text-green-700",
  EXPENSE: "bg-red-100 text-red-700",
  ADJUSTMENT: "bg-blue-100 text-blue-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default async function CashLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const dateStr = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayStr();
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const [priorEntries, dayEntries] = await Promise.all([
    db.cashEntry.findMany({ where: { date: { lt: dayStart } }, select: { type: true, amount: true } }),
    db.cashEntry.findMany({
      where: { date: { gte: dayStart, lt: dayEnd } },
      orderBy: { createdAt: "asc" },
      include: { recordedBy: { select: { name: true } } },
    }),
  ]);

  const openingBalance = priorEntries.reduce((sum, e) => sum + (e.type === "IN" ? e.amount : -e.amount), 0);
  const dayNet = dayEntries.reduce((sum, e) => sum + (e.type === "IN" ? e.amount : -e.amount), 0);
  const closingBalance = openingBalance + dayNet;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title">Cash Ledger</h1>
        <form className="flex items-center gap-2" method="get">
          <input type="date" name="date" defaultValue={dateStr} className="input" />
          <button type="submit" className="btn-outline">
            Go
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Opening Balance</div>
          <div className="text-lg font-semibold text-gray-800">{formatMoney(openingBalance)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Net for the day</div>
          <div className={`text-lg font-semibold ${dayNet >= 0 ? "text-green-700" : "text-red-700"}`}>
            {dayNet >= 0 ? "+" : ""}
            {formatMoney(dayNet)}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Closing Balance</div>
          <div className="text-lg font-semibold text-gray-800">{formatMoney(closingBalance)}</div>
        </div>
      </div>

      <NewEntryForm date={dateStr} />

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Time</th>
              <th className="py-2 px-3 text-left">Description</th>
              <th className="py-2 px-3 text-left">Source</th>
              <th className="py-2 px-3 text-left">Recorded By</th>
              <th className="py-2 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {dayEntries.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                  No cash entries for this date.
                </td>
              </tr>
            )}
            {dayEntries.map((e) => (
              <tr key={e.id}>
                <td className="py-2 px-3 text-sm text-gray-500">{formatDateTime(e.createdAt)}</td>
                <td className="py-2 px-3 text-sm text-gray-800">{e.description}</td>
                <td className="py-2 px-3">
                  <span className={`badge ${SOURCE_STYLES[e.source] ?? ""}`}>{e.source}</span>
                </td>
                <td className="py-2 px-3 text-sm text-gray-600">{e.recordedBy.name}</td>
                <td className={`py-2 px-3 text-sm text-right font-medium ${e.type === "IN" ? "text-green-700" : "text-red-700"}`}>
                  {e.type === "IN" ? "+" : "-"}
                  {formatMoney(e.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
