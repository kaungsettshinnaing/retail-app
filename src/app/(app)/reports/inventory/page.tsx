import { prisma as db } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { getLowStockVariants } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export default async function InventoryReportPage() {
  // Stock is only tracked for REGULAR products (PASS_THROUGH has no stock,
  // CONTACT_PRICE is quote-only) — see Product.type in schema.prisma.
  const [products, lowStockAlerts] = await Promise.all([
    db.product.findMany({
      where: { type: "REGULAR", isActive: true },
      include: {
        category: { select: { name: true } },
        variants: {
          where: { isActive: true },
          include: {
            stockEntries: {
              where: { qty: { not: 0 } },
              include: { location: { include: { area: true, shelf: true } } },
              orderBy: { qty: "desc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    getLowStockVariants(),
  ]);

  const rows = products.flatMap((p) =>
    p.variants.map((v) => {
      const totalStock = v.stockEntries.reduce((s, e) => s + e.qty, 0);
      const locations = v.stockEntries
        .map((e) => {
          const areaName = e.location.area.name;
          const shelfName = e.location.shelf?.name;
          const sectionName = e.location.name;
          const path = shelfName ? `${areaName}/${shelfName}/${sectionName}` : `${areaName}/${sectionName}`;
          return `${path} (${e.qty})`;
        })
        .join(", ");
      return {
        productId: p.id,
        productName: p.name,
        categoryName: p.category?.name ?? "Uncategorized",
        sku: v.sku,
        totalStock,
        locations: locations || "—",
        lowStockAlert: p.lowStockAlert,
        isLow: p.lowStockAlert != null && totalStock < p.lowStockAlert,
      };
    })
  );

  const totalUnitsInStock = rows.reduce((s, r) => s + r.totalStock, 0);
  const skuCount = rows.length;

  return (
    <div className="space-y-4">
      <h1 className="section-title">Inventory Report</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">SKUs Tracked</div>
          <div className="text-lg font-semibold text-gray-800">{formatNumber(skuCount)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Units in Stock</div>
          <div className="text-lg font-semibold text-gray-800">{formatNumber(totalUnitsInStock)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Low Stock Alerts</div>
          <div className={`text-lg font-semibold ${lowStockAlerts.length > 0 ? "text-red-700" : "text-gray-800"}`}>
            {formatNumber(lowStockAlerts.length)}
          </div>
        </div>
      </div>

      {lowStockAlerts.length > 0 && (
        <div className="card overflow-hidden p-0 border-red-200">
          <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-700">
            Low Stock
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-2 px-4 text-left">Product</th>
                <th className="py-2 px-4 text-left">SKU</th>
                <th className="py-2 px-4 text-right">Stock</th>
                <th className="py-2 px-4 text-right">Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lowStockAlerts.map((a) => (
                <tr key={a.variantId}>
                  <td className="py-2 px-4 text-gray-700">{a.productName}</td>
                  <td className="py-2 px-4 text-gray-400 text-xs">{a.sku}</td>
                  <td className="py-2 px-4 text-right text-red-700 font-medium">{formatNumber(a.stock)}</td>
                  <td className="py-2 px-4 text-right text-gray-500">{formatNumber(a.threshold)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Stock by Product / Location
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-4 text-left">Product</th>
              <th className="py-2 px-4 text-left">Category</th>
              <th className="py-2 px-4 text-left">SKU</th>
              <th className="py-2 px-4 text-right">Stock</th>
              <th className="py-2 px-4 text-left">Locations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 && (
              <tr>
                <td className="py-8 px-4 text-center text-gray-400" colSpan={5}>
                  No REGULAR products found.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.sku}>
                <td className="py-2 px-4 text-gray-800 font-medium">{r.productName}</td>
                <td className="py-2 px-4 text-gray-500">{r.categoryName}</td>
                <td className="py-2 px-4 text-gray-400 text-xs">{r.sku}</td>
                <td className={`py-2 px-4 text-right font-medium ${r.isLow ? "text-red-700" : "text-gray-800"}`}>
                  {formatNumber(r.totalStock)}
                  {r.isLow && <span className="badge bg-red-100 text-red-700 ml-2">Low</span>}
                </td>
                <td className="py-2 px-4 text-gray-500 text-xs">{r.locations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
