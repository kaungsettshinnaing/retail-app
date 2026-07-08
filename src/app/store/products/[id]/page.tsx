import { notFound } from "next/navigation";
import { getStoreProduct } from "@/lib/store";
import ProductDetail from "./ProductDetail";

export const dynamic = "force-dynamic";

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getStoreProduct(id);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
