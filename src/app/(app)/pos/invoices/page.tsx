import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  COUNTING: "bg-amber-100 text-amber-700",
  PLACED: "bg-purple-100 text-purple-700",
  COMPLETE: "bg-green-100 text-green-700",
};

export default async function InvoicesPage() {
  const invoices = await db.supplierInvoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { name: true } },
      _count: { select: { items: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Supplier Invoices</h1>
        <Link href="/pos/invoices/new" className="btn-primary text-sm">
          + New Invoice
        </Link>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Supplier</th>
              <th className="py-2 px-3 text-left">Invoice No.</th>
              <th className="py-2 px-3 text-left">Date</th>
              <th className="py-2 px-3 text-center">Items</th>
              <th className="py-2 px-3 text-right">Total</th>
              <th className="py-2 px-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  No supplier invoices yet — create one above.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-sm">
                    <Link href={`/pos/invoices/${inv.id}`} className="text-brand hover:underline">
                      {inv.supplier?.name ?? "—"}
                    </Link>
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">{inv.invoiceNo || "—"}</td>
                  <td className="py-2 px-3 text-sm text-gray-600">{formatDate(inv.invoiceDate)}</td>
                  <td className="py-2 px-3 text-sm text-center text-gray-500">{inv._count.items}</td>
                  <td className="py-2 px-3 text-sm text-right text-gray-700">
                    {inv.totalAmount != null ? formatMoney(inv.totalAmount) : "—"}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`badge ${STATUS_STYLES[inv.status] ?? ""}`}>{inv.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
