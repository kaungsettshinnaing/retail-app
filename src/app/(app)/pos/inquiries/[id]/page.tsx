import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import InquiryDetail from "./InquiryDetail";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
        <p>Contact: <strong>{inquiry.contactName ?? inquiry.customer?.name ?? "—"}</strong></p>
        {inquiry.contactPhone && <p>Phone: {inquiry.contactPhone}</p>}
        {(inquiry.contactEmail || inquiry.customer?.email) && <p>Email: {inquiry.contactEmail ?? inquiry.customer?.email}</p>}
        {inquiry.message && <p>Message: {inquiry.message}</p>}
        <p>Received: {formatDateTime(inquiry.createdAt)} via {inquiry.channel}</p>
        {inquiry.quotedAt && (
          <p>
            Quoted by {inquiry.quotedBy?.name ?? "—"} on {formatDateTime(inquiry.quotedAt)}
          </p>
        )}
      </div>

      <InquiryDetail
        inquiryId={inquiry.id}
        productId={inquiry.productId}
        status={inquiry.status}
        quotedPrice={inquiry.quotedPrice}
      />
    </div>
  );
}
