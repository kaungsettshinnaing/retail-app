import Link from "next/link";
import { prisma as db } from "@/lib/db";
import type { ProductType } from "@prisma/client";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";
import { commonDict } from "@/lib/i18n/dict/common";

export const dynamic = "force-dynamic";

const TYPE_COLORS: Record<ProductType, string> = {
  REGULAR: "bg-blue-100 text-blue-700",
  PASS_THROUGH: "bg-purple-100 text-purple-700",
  CONTACT_PRICE: "bg-amber-100 text-amber-700",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; cat?: string; q?: string; active?: string }>;
}) {
  const user = await requireSession();
  const t = adminDict[user.language];
  const c = commonDict[user.language];
  const TYPE_LABELS: Record<ProductType, string> = {
    REGULAR: t.productTypeRegular,
    PASS_THROUGH: t.productTypePassThrough,
    CONTACT_PRICE: t.productTypeContactPrice,
  };
  const sp = await searchParams;
  const VALID_TYPES: ProductType[] = ["REGULAR", "PASS_THROUGH", "CONTACT_PRICE"];
  const typeFilter = VALID_TYPES.includes(sp.type as ProductType)
    ? (sp.type as ProductType)
    : undefined;
  const catFilter = sp.cat;
  const q = sp.q?.trim();
  const activeOnly = sp.active !== "false";

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: {
        isActive: activeOnly ? true : undefined,
        type: typeFilter || undefined,
        categoryId: catFilter || undefined,
        name: q ? { contains: q, mode: "insensitive" } : undefined,
      },
      include: {
        category: true,
        variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { variants: true } },
      },
      orderBy: { name: "asc" },
    }),
    db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">{t.productTitle}</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm">+ {t.productNewButton}</Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder={t.productSearchPlaceholder}
          className="input w-48 text-sm"
        />
        <select name="type" defaultValue={typeFilter ?? ""} className="input text-sm">
          <option value="">{t.productAllTypes}</option>
          <option value="REGULAR">{t.productTypeRegular}</option>
          <option value="PASS_THROUGH">{t.productTypePassThrough}</option>
          <option value="CONTACT_PRICE">{t.productTypeContactPrice}</option>
        </select>
        <select name="cat" defaultValue={catFilter ?? ""} className="input text-sm">
          <option value="">{t.productAllCategories}</option>
          {categories.map((cat: { id: string; name: string }) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-600">
          <input type="checkbox" name="active" value="true" defaultChecked={activeOnly}
            className="rounded"
          />
          {t.productActiveOnly}
        </label>
        <button type="submit" className="btn-outline text-sm px-3">{c.filter}</button>
      </form>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">{t.productColProduct}</th>
              <th className="py-2 px-3 text-left">{t.productCategoryFieldLabel}</th>
              <th className="py-2 px-3 text-left">{t.productColType}</th>
              <th className="py-2 px-3 text-center">{t.productColVariants}</th>
              <th className="py-2 px-3 text-left">{c.status}</th>
              <th className="py-2 px-3 text-right">{c.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">{t.productEmpty}</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="h-8 w-8 rounded object-cover bg-gray-100" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                          IMG
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500">{p.category?.name ?? "—"}</td>
                  <td className="py-2.5 px-3">
                    <span className={`badge ${TYPE_COLORS[p.type]}`}>{TYPE_LABELS[p.type]}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{p._count.variants}</td>
                  <td className="py-2.5 px-3">
                    <span className={`badge ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.isActive ? c.active : c.inactive}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-2">
                    <Link href={`/admin/products/${p.id}`} className="text-xs text-brand hover:underline">
                      {c.edit}
                    </Link>
                    <Link href={`/admin/products/${p.id}/variants`} className="text-xs text-gray-500 hover:underline">
                      {t.productVariantsLink}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
