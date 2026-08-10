import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { posDict } from "@/lib/i18n/dict/pos";
import InquiryDetail from "./InquiryDetail";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSession();
  const t = posDict[user.language];
  const { id } = await params;

  const inquiry = await db.priceInquiry.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, imageUrl: true, unit: true } },
      customer: { select: { name: true, email: true } },
      quotedBy: { select: { name: true } },
    },
  });
  if (!inquiry) notFound();

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="section-title">{inquiry.product.name}</h1>

      <div className="card text-sm text-gray-600 space-y-1">
        <p>{t.contactLabel} <strong>{inquiry.contactName ?? inquiry.customer?.name ?? "—"}</strong></p>
        {inquiry.contactPhone && <p>{t.phoneLabel} {inquiry.contactPhone}</p>}
        {(inquiry.contactEmail || inquiry.customer?.email) && <p>{t.emailLabel} {inquiry.contactEmail ?? inquiry.customer?.email}</p>}
        {inquiry.message && <p>{t.messageLabel} {inquiry.message}</p>}
        <p>{t.receivedPrefix} {formatDateTime(inquiry.createdAt)} {t.viaLabel} {inquiry.channel}</p>
        {inquiry.quotedAt && (
          <p>
            {t.quotedByLabel(inquiry.quotedBy?.name ?? "—", formatDateTime(inquiry.quotedAt))}
          </p>
        )}
      </div>

      <InquiryDetail
        inquiryId={inquiry.id}
        productId={inquiry.productId}
        status={inquiry.status}
        quotedPrice={inquiry.quotedPrice}
        lang={user.language}
      />
    </div>
  );
}
