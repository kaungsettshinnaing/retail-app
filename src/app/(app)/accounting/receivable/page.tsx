import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReceivablePage() {
  const proofs = await db.orderPaymentProof.findMany({
    where: { status: "PENDING" },
    orderBy: { uploadedAt: "asc" },
    include: { order: { select: { id: true, customerName: true, customerPhone: true, total: true, customer: { select: { name: true, phone: true } } } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">Accounts Receivable</h1>
      <p className="text-sm text-gray-500">Online orders awaiting bank transfer confirmation.</p>
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Order</th>
              <th className="py-2 px-3 text-left">Customer</th>
              <th className="py-2 px-3 text-left">Uploaded</th>
              <th className="py-2 px-3 text-right">Total</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {proofs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                  No pending payment proofs.
                </td>
              </tr>
            )}
            {proofs.map((p) => (
              <tr key={p.id}>
                <td className="py-2 px-3 text-sm font-medium text-gray-800">{p.order.id.slice(0, 8)}</td>
                <td className="py-2 px-3 text-sm text-gray-600">
                  {p.order.customerName ?? p.order.customer?.name ?? "—"}
                  {(p.order.customerPhone || p.order.customer?.phone) && (
                    <span className="text-xs text-gray-400"> — {p.order.customerPhone ?? p.order.customer?.phone}</span>
                  )}
                </td>
                <td className="py-2 px-3 text-sm text-gray-500">{formatDateTime(p.uploadedAt)}</td>
                <td className="py-2 px-3 text-sm text-right">{formatMoney(p.order.total)}</td>
                <td className="py-2 px-3 text-right">
                  <Link href={`/accounting/receivable/${p.order.id}`} className="text-sm text-brand hover:underline">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
