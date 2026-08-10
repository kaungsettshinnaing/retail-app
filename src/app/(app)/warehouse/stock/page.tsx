import { prisma as db } from "@/lib/db";
import { getLowStockVariants } from "@/lib/inventory";
import { formatNumber } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { warehouseDict } from "@/lib/i18n/dict/warehouse";

export const dynamic = "force-dynamic";

function variantLabel(optionValues: unknown): string {
  const opts = optionValues as Record<string, string> | null;
  return opts && Object.keys(opts).length ? Object.values(opts).join(" / ") : "—";
}

export default async function StockOverviewPage() {
  const user = await requireSession();
  const t = warehouseDict[user.language];

  const [products, lowStock] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            stockEntries: {
              where: { qty: { not: 0 } },
              include: { location: { include: { area: true, shelf: true } } },
            },
          },
        },
      },
    }),
    getLowStockVariants(),
  ]);

  const lowStockIds = new Set(lowStock.map((a) => a.variantId));

  return (
    <div className="space-y-6">
      {lowStock.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-amber-700 mb-2">{t.lowStockAlertsTitle}</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-amber-50 text-xs text-amber-700 uppercase tracking-wide">
                  <th className="py-2 px-3 text-left">{t.colProduct}</th>
                  <th className="py-2 px-3 text-left">{t.colSku}</th>
                  <th className="py-2 px-3 text-center">{t.colStock}</th>
                  <th className="py-2 px-3 text-center">{t.colThreshold}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lowStock.map((a) => (
                  <tr key={a.variantId} className="bg-amber-50/40">
                    <td className="py-2 px-3 text-sm">{a.productName}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{a.sku}</td>
                    <td className="py-2 px-3 text-sm text-center font-medium text-amber-700">{a.stock}</td>
                    <td className="py-2 px-3 text-sm text-center text-gray-500">{a.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h1 className="section-title">{t.stockOverviewTitle}</h1>
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-2 px-3 text-left">{t.colProduct}</th>
                <th className="py-2 px-3 text-left">{t.colVariant}</th>
                <th className="py-2 px-3 text-left">{t.colSku}</th>
                <th className="py-2 px-3 text-center">{t.colTotalStock}</th>
                <th className="py-2 px-3 text-left">{t.colByLocation}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.flatMap((p) =>
                p.variants.map((v) => {
                  const total = v.stockEntries.reduce((sum, e) => sum + e.qty, 0);
                  const low = lowStockIds.has(v.id);
                  return (
                    <tr key={v.id} className={low ? "bg-amber-50/40" : ""}>
                      <td className="py-2 px-3 text-sm">{p.name}</td>
                      <td className="py-2 px-3 text-sm text-gray-500">{variantLabel(v.optionValues)}</td>
                      <td className="py-2 px-3 text-sm text-gray-500">{v.sku}</td>
                      <td className={`py-2 px-3 text-sm text-center font-medium ${low ? "text-amber-700" : "text-gray-700"}`}>
                        {formatNumber(total)}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-500">
                        {v.stockEntries.length === 0
                          ? "—"
                          : v.stockEntries
                              .map((e) => {
                                const loc = e.location.shelf
                                  ? `${e.location.area.name}/${e.location.shelf.name}/${e.location.name}`
                                  : `${e.location.area.name}/${e.location.name}`;
                                return `${loc}: ${e.qty}`;
                              })
                              .join(", ")}
                      </td>
                    </tr>
                  );
                })
              )}
              {products.every((p) => p.variants.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                    {t.noProductVariantsYet}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
