import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma as db } from "@/lib/db";
import VariantsEditor from "./VariantsEditor";
import type { ProductType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function VariantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) notFound();

  const variants = product.variants.map((v) => ({
    ...v,
    optionValues: v.optionValues as Record<string, string>,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">{product.name} — Variants</h1>
          <p className="text-sm text-gray-500">
            Type: <span className="font-medium">{product.type}</span>
            {product.options.length > 0 && (
              <> · Options: <span className="font-medium">{product.options.map((o) => o.name).join(", ")}</span></>
            )}
          </p>
        </div>
        <Link href={`/admin/products/${id}`} className="btn-outline text-sm">
          ← Edit Product
        </Link>
      </div>

      {product.options.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This product has no variant options defined. Add options (e.g. "Size", "Color") on the{" "}
          <Link href={`/admin/products/${id}`} className="underline">Edit Product</Link> page if needed.
          You can still add a single unnamed variant below.
        </div>
      )}

      <VariantsEditor
        productId={id}
        productType={product.type as ProductType}
        optionNames={product.options.map((o) => o.name)}
        variants={variants}
      />
    </div>
  );
}
