import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { warehouseDict } from "@/lib/i18n/dict/warehouse";
import PickingDetail from "./PickingDetail";

export const dynamic = "force-dynamic";

export default async function WarehouseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSession();
  const t = warehouseDict[user.language];
  const STATUS_LABELS: Record<string, string> = {
    PENDING: t.statusPending,
    PICKING: t.statusPicking,
    PACKED: t.statusPacked,
    READY: t.statusReady,
    DELIVERED: t.statusDelivered,
    PICKED_UP: t.statusPickedUp,
    CANCELLED: t.statusCancelled,
  };
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      cashier: { select: { name: true } },
      customer: { select: { name: true } },
      items: {
        include: {
          picks: {
            include: { location: { include: { shelf: true, area: true } } },
          },
        },
      },
      logs: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true } } } },
    },
  });
  if (!order) notFound();

  const variantIds = order.items.filter((i) => i.variantId).map((i) => i.variantId as string);
  const stockByVariant = variantIds.length
    ? await db.stockEntry.findMany({
        where: { variantId: { in: variantIds }, qty: { gt: 0 } },
        include: { location: { include: { shelf: true, area: true } } },
        orderBy: { qty: "desc" },
      })
    : [];

  const items = order.items.map((it) => ({
    id: it.id,
    productName: it.productName,
    variantSku: it.variantSku,
    variantOptions: it.variantOptions as Record<string, string> | null,
    productType: it.productType,
    qty: it.qty,
    status: it.status,
    locations:
      it.status === "PICKED"
        ? it.picks.map((p) => ({
            label: locationLabel(p.location.area.name, p.location.shelf?.name ?? null, p.location.name),
            qty: -p.qtyPicked,
          }))
        : it.variantId
        ? stockByVariant
            .filter((s) => s.variantId === it.variantId)
            .map((s) => ({
              label: locationLabel(s.location.area.name, s.location.shelf?.name ?? null, s.location.name),
              qty: s.qty,
            }))
        : [],
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="section-title">{t.orderTitlePrefix}{order.id.slice(-8).toUpperCase()}</h1>
        <p className="text-sm text-gray-500">
          {order.customerName || order.customer?.name || t.walkInCustomer} — {order.channel}
        </p>
      </div>

      <PickingDetail
        orderId={order.id}
        orderStatus={order.status}
        items={items}
        lang={user.language}
      />

      {order.logs.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{t.activityTitle}</h3>
          <ul className="space-y-1 text-xs text-gray-500">
            {order.logs.map((log) => (
              <li key={log.id}>
                {formatDateTime(log.createdAt)} — <strong>{log.actor?.name ?? t.systemActor}</strong> {STATUS_LABELS[log.status] ?? log.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function locationLabel(area: string, shelf: string | null, section: string): string {
  return [area, shelf, section].filter(Boolean).join(" / ");
}
