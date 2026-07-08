import { prisma as db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import PaymentForm from "./PaymentForm";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function agingBadge(invoiceDate: Date): { label: string; style: string } {
  const days = Math.floor((Date.now() - invoiceDate.getTime()) / DAY_MS);
  if (days > 30) return { label: `Overdue (${days}d)`, style: "bg-red-100 text-red-700" };
  if (days >= 23) return { label: `Due soon (${days}d)`, style: "bg-amber-100 text-amber-700" };
  return { label: `Current (${days}d)`, style: "bg-gray-100 text-gray-600" };
}

export default async function PayablePage() {
  const invoices = await db.supplierInvoice.findMany({
    where: { paidAt: null, status: { not: "DRAFT" } },
    orderBy: { invoiceDate: "asc" },
    include: { supplier: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">Accounts Payable</h1>
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Invoice</th>
              <th className="py-2 px-3 text-left">Supplier</th>
              <th className="py-2 px-3 text-left">Invoice Date</th>
              <th className="py-2 px-3 text-left">Aging</th>
              <th className="py-2 px-3 text-right">Amount</th>
              <th className="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  No unpaid supplier invoices.
                </td>
              </tr>
            )}
            {invoices.map((inv) => {
              const aging = agingBadge(inv.invoiceDate);
              return (
                <tr key={inv.id}>
                  <td className="py-2 px-3 text-sm font-medium text-gray-800">{inv.invoiceNo ?? inv.id.slice(0, 8)}</td>
                  <td className="py-2 px-3 text-sm text-gray-600">{inv.supplier?.name ?? "—"}</td>
                  <td className="py-2 px-3 text-sm text-gray-500">{formatDate(inv.invoiceDate)}</td>
                  <td className="py-2 px-3">
                    <span className={`badge ${aging.style}`}>{aging.label}</span>
                  </td>
                  <td className="py-2 px-3 text-sm text-right">{inv.totalAmount != null ? formatMoney(inv.totalAmount) : "—"}</td>
                  <td className="py-2 px-3">
                    <PaymentForm invoiceId={inv.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
