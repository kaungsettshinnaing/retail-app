import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  QUOTED: "bg-blue-100 text-blue-700",
  CONVERTED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

export default async function InquiriesPage() {
  const inquiries = await db.priceInquiry.findMany({
    where: { status: { in: ["OPEN", "QUOTED"] } },
    orderBy: { createdAt: "asc" },
    include: { product: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">Price Inquiries</h1>
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Product</th>
              <th className="py-2 px-3 text-left">Contact</th>
              <th className="py-2 px-3 text-left">Received</th>
              <th className="py-2 px-3 text-right">Quoted Price</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  No open inquiries.
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
                  <span className={`badge ${STATUS_STYLES[inq.status] ?? ""}`}>{inq.status}</span>
                </td>
                <td className="py-2 px-3 text-right">
                  <Link href={`/pos/inquiries/${inq.id}`} className="text-sm text-brand hover:underline">
                    Open
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
