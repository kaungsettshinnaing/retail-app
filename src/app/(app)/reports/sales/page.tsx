import { prisma as db } from "@/lib/db";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { getDateRange } from "@/lib/reports";

export const dynamic = "force-dynamic";

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from: fromParam, to: toParam } = await searchParams;
  const { fromStr, toStr, from, to } = getDateRange(fromParam, toParam);

  // Same "net sales" convention as the P&L report: orders paid in the period,
  // excluding cancelled orders; Order.total is already net of discount.
  const orders = await db.order.findMany({
    where: {
      paidAt: { gte: from, lt: to },
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
      total: true,
      paidAt: true,
      channel: true,
      items: {
        select: {
          qty: true,
          unitPrice: true,
          productId: true,
          productName: true,
          variantSku: true,
          product: { select: { category: { select: { id: true, name: true } } } },
        },
      },
    },
    orderBy: { paidAt: "asc" },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  // Revenue by day
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const day = (o.paidAt ?? new Date()).toISOString().slice(0, 10);
    const existing = byDay.get(day);
    if (existing) {
      existing.revenue += o.total;
      existing.orders += 1;
    } else {
      byDay.set(day, { revenue: o.total, orders: 1 });
    }
  }
  const dayRows = [...byDay.entries()]
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => (a.day < b.day ? 1 : -1));

  // Top products (by revenue, item price × qty)
  const productMap = new Map<
    string,
    { name: string; sku: string | null; qty: number; revenue: number }
  >();
  const categoryMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders) {
    for (const item of o.items) {
      const revenue = (item.unitPrice ?? 0) * item.qty;

      const pKey = item.productId;
      const p = productMap.get(pKey);
      if (p) {
        p.qty += item.qty;
        p.revenue += revenue;
      } else {
        productMap.set(pKey, {
          name: item.productName,
          sku: item.variantSku,
          qty: item.qty,
          revenue,
        });
      }

      const catId = item.product.category?.id ?? "__none__";
      const catName = item.product.category?.name ?? "Uncategorized";
      const c = categoryMap.get(catId);
      if (c) {
        c.qty += item.qty;
        c.revenue += revenue;
      } else {
        categoryMap.set(catId, { name: catName, qty: item.qty, revenue });
      }
    }
  }
  const topProducts = [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 15);
  const topCategories = [...categoryMap.values()].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title">Sales Report</h1>
        <form className="flex items-end gap-2" method="get">
          <div>
            <label className="text-sm text-gray-600 block mb-1">From</label>
            <input type="date" name="from" defaultValue={fromStr} className="input" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">To</label>
            <input type="date" name="to" defaultValue={toStr} className="input" />
          </div>
          <button type="submit" className="btn-outline">
            Filter
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Revenue</div>
          <div className="text-lg font-semibold text-gray-800">{formatMoney(totalRevenue)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Orders</div>
          <div className="text-lg font-semibold text-gray-800">{formatNumber(orderCount)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Order Value</div>
          <div className="text-lg font-semibold text-gray-800">{formatMoney(avgOrderValue)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by day */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Revenue by Day
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-right">Orders</th>
                <th className="py-2 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dayRows.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-center text-gray-400" colSpan={3}>
                    No sales in this period.
                  </td>
                </tr>
              )}
              {dayRows.map((r) => (
                <tr key={r.day}>
                  <td className="py-2 px-4 text-gray-700">{formatDate(r.day)}</td>
                  <td className="py-2 px-4 text-right">{r.orders}</td>
                  <td className="py-2 px-4 text-right font-medium">{formatMoney(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top categories */}
        <div className="card overflow-hidden p-0">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Revenue by Category
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-2 px-4 text-left">Category</th>
                <th className="py-2 px-4 text-right">Qty</th>
                <th className="py-2 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topCategories.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-center text-gray-400" colSpan={3}>
                    No sales in this period.
                  </td>
                </tr>
              )}
              {topCategories.map((c) => (
                <tr key={c.name}>
                  <td className="py-2 px-4 text-gray-700">{c.name}</td>
                  <td className="py-2 px-4 text-right">{formatNumber(c.qty)}</td>
                  <td className="py-2 px-4 text-right font-medium">{formatMoney(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top products */}
      <div className="card overflow-hidden p-0">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Top Sellers
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-4 text-left">Product</th>
              <th className="py-2 px-4 text-left">SKU</th>
              <th className="py-2 px-4 text-right">Qty Sold</th>
              <th className="py-2 px-4 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {topProducts.length === 0 && (
              <tr>
                <td className="py-6 px-4 text-center text-gray-400" colSpan={4}>
                  No sales in this period.
                </td>
              </tr>
            )}
            {topProducts.map((p, i) => (
              <tr key={i}>
                <td className="py-2 px-4 text-gray-700">{p.name}</td>
                <td className="py-2 px-4 text-gray-400 text-xs">{p.sku ?? "—"}</td>
                <td className="py-2 px-4 text-right">{formatNumber(p.qty)}</td>
                <td className="py-2 px-4 text-right font-medium">{formatMoney(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
