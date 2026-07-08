import Link from "next/link";
import { getStoreCategories, getStoreProducts } from "@/lib/store";
import ProductCard from "@/components/store/ProductCard";

export const dynamic = "force-dynamic";

export default async function StoreHomePage() {
  const [categories, products] = await Promise.all([getStoreCategories(), getStoreProducts()]);

  return (
    <div className="space-y-8">
      {categories.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Shop by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c.id} className="contents">
                <Link href={`/store/category/${c.slug}`} className="badge bg-white border border-gray-200 hover:border-brand">
                  {c.name}
                </Link>
                {c.children.map((sub) => (
                  <Link key={sub.id} href={`/store/category/${sub.slug}`} className="badge bg-white border border-gray-100 text-gray-500 hover:border-brand">
                    {sub.name}
                  </Link>
                ))}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title mb-3">All Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.length === 0 && <p className="text-sm text-gray-400">No products available yet.</p>}
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
