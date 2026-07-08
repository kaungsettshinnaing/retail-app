import { notFound } from "next/navigation";
import { getStoreCategory, getStoreProducts } from "@/lib/store";
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

  const products = await getStoreProducts({ categoryId: category.id });

  return (
    <div className="space-y-4">
      <h1 className="section-title">{category.name}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.length === 0 && <p className="text-sm text-gray-400">No products in this category yet.</p>}
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
