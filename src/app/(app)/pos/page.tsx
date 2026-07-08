import { prisma as db } from "@/lib/db";
import { getVariantsTotalStock } from "@/lib/inventory";
import POSScreen from "./POSScreen";

export const dynamic = "force-dynamic";

export default async function PosPage() {
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
      stock: stockMap[v.id] ?? 0,
    })),
  }));

  return <POSScreen catalog={catalog} />;
}
