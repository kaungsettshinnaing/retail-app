import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { posDict } from "@/lib/i18n/dict/pos";
import { commonDict } from "@/lib/i18n/dict/common";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  QUOTED: "bg-blue-100 text-blue-700",
  CONVERTED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

export default async function InquiriesPage() {
  const user = await requireSession();
  const t = posDict[user.language];
  const c = commonDict[user.language];
  const STATUS_LABELS: Record<string, string> = {
    OPEN: t.inquiryStatusOpen,
    QUOTED: t.inquiryStatusQuoted,
    CONVERTED: t.inquiryStatusConverted,
    CLOSED: t.inquiryStatusClosed,
  };

  const inquiries = await db.priceInquiry.findMany({
    where: { status: { in: ["OPEN", "QUOTED"] } },
    orderBy: { createdAt: "asc" },
    include: { product: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">{t.priceInquiriesTitle}</h1>
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">{t.colProduct}</th>
              <th className="py-2 px-3 text-left">{t.colContact}</th>
              <th className="py-2 px-3 text-left">{t.colReceived}</th>
              <th className="py-2 px-3 text-right">{t.colQuotedPrice}</th>
              <th className="py-2 px-3 text-left">{c.status}</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  {t.noOpenInquiries}
                </td>
              </tr>
            )}
            {inquiries.map((inq) => (
              <tr key={inq.id}>
                <td className="py-2 px-3 text-sm font-medium text-gray-800">{inq.product.name}</td>
                <td className="py-2 px-3 text-sm text-gray-600">
                  {inq.contactName}
                  {inq.contactPhone && <span className="text-xs text-gray-400"> — {inq.contactPhone}</span>}
                </td>
                <td className="py-2 px-3 text-sm text-gray-500">{formatDateTime(inq.createdAt)}</td>
                <td className="py-2 px-3 text-sm text-right">{inq.quotedPrice != null ? formatMoney(inq.quotedPrice) : "—"}</td>
                <td className="py-2 px-3">
                  <span className={`badge ${STATUS_STYLES[inq.status] ?? ""}`}>{STATUS_LABELS[inq.status] ?? inq.status}</span>
                </td>
                <td className="py-2 px-3 text-right">
                  <Link href={`/pos/inquiries/${inq.id}`} className="text-sm text-brand hover:underline">
                    {t.openLink}
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
