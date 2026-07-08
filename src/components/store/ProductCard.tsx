import Link from "next/link";
import { formatMoney } from "@/lib/format";

type Variant = { id: string; price: number | null; stock: number };
type Product = {
  id: string;
  name: string;
  type: "REGULAR" | "PASS_THROUGH" | "CONTACT_PRICE";
  imageUrl: string | null;
  variants: Variant[];
};

export default function ProductCard({ product }: { product: Product }) {
  const prices = product.variants.map((v) => v.price).filter((p): p is number => p != null);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <Link href={`/store/products/${product.id}`} className="card hover:border-brand block">
      <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-300 text-xs">No image</span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-sm font-semibold text-brand">
          {product.type === "CONTACT_PRICE" ? "Contact for Price" : minPrice != null ? formatMoney(minPrice) : "—"}
        </span>
        {product.type === "REGULAR" && (
          <span className={`badge ${totalStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {totalStock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        )}
        {product.type === "PASS_THROUGH" && <span className="badge bg-blue-100 text-blue-700">On Demand</span>}
      </div>
    </Link>
  );
}
