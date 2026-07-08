import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import ProofReview from "./ProofReview";

export const dynamic = "force-dynamic";

export default async function ReceivableDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      paymentProof: true,
      items: { select: { productName: true, qty: true, unitPrice: true } },
    },
  });
  if (!order || !order.paymentProof) notFound();

  const proof = order.paymentProof;

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="section-title">Order {order.id.slice(0, 8)}</h1>

      <div className="card text-sm text-gray-600 space-y-1">
        <p>Customer: <strong>{order.customerName ?? order.customer?.name ?? "—"}</strong></p>
        {(order.customerPhone || order.customer?.phone) && <p>Phone: {order.customerPhone ?? order.customer?.phone}</p>}
        {order.customer?.email && <p>Email: {order.customer.email}</p>}
        <p>Total: <strong>{formatMoney(order.total)}</strong></p>
        <p>Proof uploaded: {formatDateTime(proof.uploadedAt)}</p>
      </div>

      <div className="card space-y-2">
        <div className="text-sm text-gray-600">Order Items</div>
        <ul className="text-sm text-gray-700 divide-y divide-gray-50">
          {order.items.map((it, i) => (
            <li key={i} className="py-1 flex justify-between">
              <span>
                {it.productName} × {it.qty}
              </span>
              <span>{it.unitPrice != null ? formatMoney(it.unitPrice * it.qty) : "—"}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card space-y-2">
        <div className="text-sm text-gray-600">Payment Proof</div>
        <img src={proof.imageUrl} alt="Payment proof" className="max-w-full rounded border border-gray-200" />
      </div>

      <ProofReview proofId={proof.id} status={proof.status} />
    </div>
  );
}
