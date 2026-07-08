import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { formatMoney, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PICKING: "bg-amber-100 text-amber-700",
  PACKED: "bg-purple-100 text-purple-700",
  READY: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  PICKED_UP: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      cashier: { select: { name: true } },
      customer: { select: { name: true } },
      items: true,
      logs: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true } } } },
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">
            {order.customerName || order.customer?.name || "Walk-in customer"}
            {order.customerPhone ? ` — ${order.customerPhone}` : ""}
          </p>
        </div>
        <span className={`badge ${STATUS_STYLES[order.status] ?? ""}`}>{order.status}</span>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Item</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3 text-right">Unit Price</th>
              <th className="py-2 px-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {order.items.map((it) => (
              <tr key={it.id}>
                <td className="py-2 px-3 text-sm">
                  {it.productName}
                  {it.variantSku && <span className="text-xs text-gray-400"> — {it.variantSku}</span>}
                </td>
                <td className="py-2 px-3 text-sm text-center">{it.qty}</td>
                <td className="py-2 px-3 text-sm text-right">{it.unitPrice != null ? formatMoney(it.unitPrice) : "—"}</td>
                <td className="py-2 px-3 text-sm text-right">
                  {it.unitPrice != null ? formatMoney(it.unitPrice * it.qty) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-100">
              <td colSpan={3} className="py-2 px-3 text-right text-sm text-gray-500">Subtotal</td>
              <td className="py-2 px-3 text-right text-sm">{formatMoney(order.subtotal)}</td>
            </tr>
            {order.discount > 0 && (
              <tr>
                <td colSpan={3} className="py-2 px-3 text-right text-sm text-gray-500">Discount</td>
                <td className="py-2 px-3 text-right text-sm">-{formatMoney(order.discount)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={3} className="py-2 px-3 text-right text-sm font-medium text-gray-600">Total</td>
              <td className="py-2 px-3 text-right text-sm font-semibold">{formatMoney(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="card text-sm text-gray-600 space-y-1">
        <p>Cashier: <strong>{order.cashier?.name ?? "—"}</strong></p>
        <p>Payment: <strong>{order.paymentMethod ?? "—"}</strong>{order.paidAt ? ` — paid ${formatDateTime(order.paidAt)}` : ""}</p>
        {order.notes && <p>Notes: {order.notes}</p>}
      </div>

      {order.logs.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Activity</h3>
          <ul className="space-y-1 text-xs text-gray-500">
            {order.logs.map((log) => (
              <li key={log.id}>
                {formatDateTime(log.createdAt)} — <strong>{log.actor?.name ?? "System"}</strong> {log.status}
                {log.note ? `: ${log.note}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
