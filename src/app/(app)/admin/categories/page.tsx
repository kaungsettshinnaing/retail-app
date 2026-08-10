import { prisma as db } from "@/lib/db";
import CategoryEditor from "./CategoryEditor";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const user = await requireSession();
  const t = adminDict[user.language];
  const categories = await db.category.findMany({
    include: { children: { include: { _count: { select: { products: true } } } }, _count: { select: { products: true } } },
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  // Flatten to a single list including children (CategoryEditor handles nesting display)
  const flat = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    parentId: cat.parentId,
    _count: cat._count,
    children: cat.children
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        parentId: c.parentId,
        _count: c._count,
        children: [],
      })),
  }));

  return (
    <div>
      <div className="mb-4">
        <h1 className="section-title">{t.categoryTitle}</h1>
        <p className="text-sm text-gray-500">{t.categoryDescription}</p>
      </div>
      <CategoryEditor categories={flat} lang={user.language} />
    </div>
  );
}
