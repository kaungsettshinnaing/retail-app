import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma as db } from "@/lib/db";
import { updateProduct } from "../actions";
import ProductForm from "../ProductForm";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireSession();
  const t = adminDict[user.language];

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    }),
  ]);

  if (!product) notFound();

  const action = updateProduct.bind(null, id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">{product.name}</h1>
        <Link href={`/admin/products/${id}/variants`} className="btn-accent text-sm">
          {t.productManageVariants}
        </Link>
      </div>
      <ProductForm
        categories={categories}
        action={action}
        defaultValues={{
          name: product.name,
          description: product.description ?? undefined,
          type: product.type,
          categoryId: product.categoryId ?? undefined,
          unit: product.unit,
          isOnline: product.isOnline,
          isActive: product.isActive,
          lowStockAlert: product.lowStockAlert,
          imageUrl: product.imageUrl,
          options: product.options,
        }}
        submitLabel={t.saveChanges}
        lang={user.language}
      />
    </div>
  );
}
