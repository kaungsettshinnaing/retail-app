import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  COUNTING: "bg-amber-100 text-amber-700",
  PLACED: "bg-purple-100 text-purple-700",
  COMPLETE: "bg-green-100 text-green-700",
};

export default async function WarehouseInvoicesPage() {
  const invoices = await db.supplierInvoice.findMany({
    where: { status: { in: ["SUBMITTED", "COUNTING", "PLACED", "COMPLETE"] } },
    orderBy: { cashierSubmittedAt: "desc" },
    include: {
      supplier: { select: { name: true } },
      _count: { select: { items: true } },
    },
    take: 100,
  });

  const pending = invoices.filter((i) => i.status === "SUBMITTED" || i.status === "COUNTING");
  const done = invoices.filter((i) => i.status === "PLACED" || i.status === "COMPLETE");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Pending Invoices</h1>
        <InvoiceTable invoices={pending} emptyText="No invoices waiting for counting." />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-600 mb-2">Recently Placed</h2>
        <InvoiceTable invoices={done} emptyText="No invoices placed yet." />
      </div>
    </div>
  );
}

function InvoiceTable({
  invoices,
  emptyText,
}: {
  invoices: {
    id: string;
    invoiceNo: string | null;
    invoiceDate: Date;
    status: string;
    supplier: { name: string } | null;
    _count: { items: number };
  }[];
  emptyText: string;
}) {
  return (
    <div className="card overflow-hidden p-0">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <th className="py-2 px-3 text-left">Supplier</th>
            <th className="py-2 px-3 text-left">Invoice No.</th>
            <th className="py-2 px-3 text-left">Date</th>
            <th className="py-2 px-3 text-center">Items</th>
            <th className="py-2 px-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-sm text-gray-400">{emptyText}</td>
            </tr>
          ) : (
            invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 text-sm">
                  <Link href={`/warehouse/invoices/${inv.id}`} className="text-brand hover:underline">
                    {inv.supplier?.name ?? "—"}
                  </Link>
                </td>
                <td className="py-2 px-3 text-sm text-gray-600">{inv.invoiceNo || "—"}</td>
                <td className="py-2 px-3 text-sm text-gray-600">{formatDate(inv.invoiceDate)}</td>
                <td className="py-2 px-3 text-sm text-center text-gray-500">{inv._count.items}</td>
                <td className="py-2 px-3">
                  <span className={`badge ${STATUS_STYLES[inv.status] ?? ""}`}>{inv.status}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
