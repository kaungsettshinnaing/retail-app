import { notFound } from "next/navigation";
import { getStoreProduct } from "@/lib/store";
import { getCustomerSession } from "@/lib/auth";
import { getLanguageCookie } from "@/lib/i18n/actions";
import ProductDetail from "./ProductDetail";

export const dynamic = "force-dynamic";

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerSession();
  const lang = customer?.language ?? (await getLanguageCookie());
  const product = await getStoreProduct(id, { isB2B: customer?.isB2B ?? false });
  if (!product) notFound();

  return <ProductDetail product={product} lang={lang} />;
}
