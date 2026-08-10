import { prisma as db } from "@/lib/db";
import { createProduct } from "../actions";
import ProductForm from "../ProductForm";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const user = await requireSession();
  const t = adminDict[user.language];
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">{t.productNewTitle}</h1>
      <ProductForm categories={categories} action={createProduct} submitLabel={t.productCreateAndManage} lang={user.language} />
    </div>
  );
}
