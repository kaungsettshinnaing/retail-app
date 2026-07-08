import { prisma as db } from "./db";
import { getVariantsTotalStock } from "./inventory";

export async function getStoreCategories() {
  return db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getStoreCategory(slug: string) {
  return db.category.findFirst({ where: { slug, isActive: true } });
}

export async function getStoreProducts(opts: { categoryId?: string; search?: string } = {}) {
  const products = await db.product.findMany({
    where: {
      isActive: true,
      isOnline: true,
      ...(opts.categoryId ? { categoryId: opts.categoryId } : {}),
      ...(opts.search
        ? { name: { contains: opts.search, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { name: "asc" },
    include: { variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
  });

  const variantIds = products.flatMap((p) => p.variants.map((v) => v.id));
  const stockMap = await getVariantsTotalStock(variantIds);

  return products.map((p) => ({
    ...p,
    variants: p.variants.map((v) => ({ ...v, stock: stockMap[v.id] ?? 0 })),
  }));
}

export async function getStoreProduct(id: string) {
  const product = await db.product.findFirst({
    where: { id, isActive: true, isOnline: true },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });
  if (!product) return null;

  const variantIds = product.variants.map((v) => v.id);
  const stockMap = await getVariantsTotalStock(variantIds);

  return {
    ...product,
    variants: product.variants.map((v) => ({ ...v, stock: stockMap[v.id] ?? 0 })),
  };
}
