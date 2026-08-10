import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { accountingDict } from "@/lib/i18n/dict/accounting";
import ProofReview from "./ProofReview";

export const dynamic = "force-dynamic";

export default async function ReceivableDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requireSession();
  const t = accountingDict[user.language];

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
      <h1 className="section-title">{t.orderTitle} {order.id.slice(0, 8)}</h1>

      <div className="card text-sm text-gray-600 space-y-1">
        <p>{t.customerLabel} <strong>{order.customerName ?? order.customer?.name ?? "—"}</strong></p>
        {(order.customerPhone || order.customer?.phone) && <p>{t.phoneLabel} {order.customerPhone ?? order.customer?.phone}</p>}
        {order.customer?.email && <p>{t.emailLabel} {order.customer.email}</p>}
        <p>{t.totalLabel} <strong>{formatMoney(order.total)}</strong></p>
        <p>{t.proofUploadedLabel} {formatDateTime(proof.uploadedAt)}</p>
      </div>

      <div className="card space-y-2">
        <div className="text-sm text-gray-600">{t.orderItemsTitle}</div>
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
        <div className="text-sm text-gray-600">{t.paymentProofTitle}</div>
        <img src={proof.imageUrl} alt={t.paymentProofAlt} className="max-w-full rounded border border-gray-200" />
      </div>

      <ProofReview proofId={proof.id} status={proof.status} lang={user.language} />
    </div>
  );
}
