import { prisma as db } from "@/lib/db";
import { createProduct } from "../actions";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="space-y-4">
      <h1 className="section-title">New Product</h1>
      <ProductForm categories={categories} action={createProduct} submitLabel="Create & Manage Variants" />
    </div>
  );
}
