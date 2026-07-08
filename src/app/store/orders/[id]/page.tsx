import { notFound, redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";
import { prisma as db } from "@/lib/db";
import { formatMoney, formatDateTime } from "@/lib/format";
import ProofUpload from "./ProofUpload";

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

export default async function StoreOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCustomerSession();
  if (!session) redirect("/store/account/login");

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, paymentProof: true },
  });
  if (!order || order.customerId !== session.id) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <span className={`badge ${STATUS_STYLES[order.status] ?? ""}`}>{order.status}</span>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Item</th>
              <th className="py-2 px-3 text-center">Qty</th>
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
                <td className="py-2 px-3 text-sm text-right">{it.unitPrice != null ? formatMoney(it.unitPrice * it.qty) : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-100">
              <td colSpan={2} className="py-2 px-3 text-right text-sm font-medium text-gray-600">Total</td>
              <td className="py-2 px-3 text-right text-sm font-semibold">{formatMoney(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="card text-sm text-gray-600 space-y-1">
        <p>Placed: {formatDateTime(order.createdAt)}</p>
        <p>Payment: <strong>{order.paymentMethod}</strong>{order.paidAt ? ` — paid ${formatDateTime(order.paidAt)}` : ""}</p>
        {order.shippingAddress && <p>Address: {order.shippingAddress}</p>}
        {order.notes && <p>Notes: {order.notes}</p>}
      </div>

      {order.paymentMethod === "TRANSFER" && (
        <div className="card space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Payment Proof</h2>
          {order.paymentProof ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.paymentProof.imageUrl} alt="Payment proof" className="max-w-xs rounded border border-gray-200" />
              <p className="text-xs text-gray-500">
                Status: <span className="font-medium">{order.paymentProof.status}</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Upload a screenshot of your bank transfer for confirmation.</p>
          )}
          <ProofUpload orderId={order.id} />
        </div>
      )}
    </div>
  );
}
