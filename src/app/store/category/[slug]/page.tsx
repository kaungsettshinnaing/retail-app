import { notFound } from "next/navigation";
import { getStoreCategory, getStoreProducts } from "@/lib/store";
import { getCustomerSession } from "@/lib/auth";
import { getLanguageCookie } from "@/lib/i18n/actions";
import { storeDict } from "@/lib/i18n/dict/store";
import ProductCard from "@/components/store/ProductCard";

export const dynamic = "force-dynamic";

export default async function StoreCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getStoreCategory(slug);
  if (!category) notFound();

  const customer = await getCustomerSession();
  const lang = customer?.language ?? (await getLanguageCookie());
  const t = storeDict[lang];
  const products = await getStoreProducts({ categoryId: category.id, isB2B: customer?.isB2B ?? false });

  return (
    <div className="space-y-4">
      <h1 className="section-title">{category.name}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.length === 0 && <p className="text-sm text-gray-400">{t.noProductsInCategory}</p>}
        {products.map((p) => (
          <ProductCard key={p.id} product={p} lang={lang} />
        ))}
      </div>
    </div>
  );
}
