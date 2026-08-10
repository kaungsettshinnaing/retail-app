import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { warehouseDict } from "@/lib/i18n/dict/warehouse";
import { commonDict } from "@/lib/i18n/dict/common";

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

export default async function WarehouseOrdersPage() {
  const user = await requireSession();
  const t = warehouseDict[user.language];
  const c = commonDict[user.language];
  const STATUS_LABELS: Record<string, string> = {
    PENDING: t.statusPending,
    PICKING: t.statusPicking,
    PACKED: t.statusPacked,
    READY: t.statusReady,
    DELIVERED: t.statusDelivered,
    PICKED_UP: t.statusPickedUp,
    CANCELLED: t.statusCancelled,
  };

  const orders = await db.order.findMany({
    where: { status: { in: ["PENDING", "PICKING", "PACKED", "READY"] } },
    orderBy: { createdAt: "asc" },
    include: {
      items: { select: { status: true } },
      cashier: { select: { name: true } },
      customer: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">{t.orderFulfilmentTitle}</h1>
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">{t.colOrder}</th>
              <th className="py-2 px-3 text-left">{t.colCustomer}</th>
              <th className="py-2 px-3 text-left">{t.colChannel}</th>
              <th className="py-2 px-3 text-center">{t.colItems}</th>
              <th className="py-2 px-3 text-left">{t.colPlaced}</th>
              <th className="py-2 px-3 text-left">{c.status}</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                  {t.noOrdersAwaitingFulfilment}
                </td>
              </tr>
            )}
            {orders.map((o) => {
              const picked = o.items.filter((i) => i.status !== "PENDING").length;
              return (
                <tr key={o.id}>
                  <td className="py-2 px-3 text-sm font-medium text-gray-800">
                    #{o.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    {o.customerName || o.customer?.name || t.walkIn}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-500">{o.channel}</td>
                  <td className="py-2 px-3 text-sm text-center text-gray-500">
                    {picked}/{o.items.length}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-500">{formatDateTime(o.createdAt)}</td>
                  <td className="py-2 px-3">
                    <span className={`badge ${STATUS_STYLES[o.status] ?? ""}`}>{STATUS_LABELS[o.status] ?? o.status}</span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Link href={`/warehouse/orders/${o.id}`} className="text-sm text-brand hover:underline">
                      {t.openLink}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
