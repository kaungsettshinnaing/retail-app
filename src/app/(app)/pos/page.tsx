import { prisma as db } from "@/lib/db";
import { getVariantsTotalStock } from "@/lib/inventory";
import { requireSession } from "@/lib/auth";
import POSScreen from "./POSScreen";

export const dynamic = "force-dynamic";

export default async function PosPage({
  searchParams,
}: {
  searchParams: Promise<{ inquiryProductId?: string; inquiryPrice?: string }>;
}) {
  const user = await requireSession();
  const { inquiryProductId, inquiryPrice } = await searchParams;
  const price = Number(inquiryPrice);
  const initialLine =
    inquiryProductId && Number.isFinite(price) && price > 0
      ? { productId: inquiryProductId, price }
      : null;

  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const allVariantIds = products.flatMap((p) => p.variants.map((v) => v.id));
  const stockMap = await getVariantsTotalStock(allVariantIds);

  const catalog = products.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    unit: p.unit,
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      optionValues: v.optionValues,
      price: v.price,
      b2bPrice: v.b2bPrice,
      stock: stockMap[v.id] ?? 0,
    })),
  }));

  return <POSScreen catalog={catalog} initialLine={initialLine} lang={user.language} />;
}
