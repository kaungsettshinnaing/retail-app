"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

const VariantSchema = z.object({
  sku: z.string().min(1).max(100),
  price: z.coerce.number().int().min(0).optional(),
  comparePrice: z.coerce.number().int().min(0).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

function revalidate(productId: string) {
  revalidatePath(`/admin/products/${productId}/variants`);
  revalidatePath("/admin/products");
}

export async function createVariant(productId: string, formData: FormData) {
  await requireAnyRole(["ADMIN", "MANAGER"]);

  // Parse option values from form fields named optionValue[OptionName]
  const optionValues: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^optionValue\[(.+)\]$/);
    if (match) optionValues[match[1]] = String(value);
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false as const, error: "Product not found" };

  const raw = {
    sku: formData.get("sku"),
    price: product.type === "CONTACT_PRICE" ? undefined : (formData.get("price") || undefined),
    comparePrice: formData.get("comparePrice") || undefined,
    sortOrder: formData.get("sortOrder") || "0",
    isActive: formData.get("isActive") !== "false",
  };

  const parsed = VariantSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid data: " + parsed.error.issues.map(i => i.message).join(", ") };

  // Handle image upload
  let imageUrl: string | undefined;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      const result = await saveUpload(imageFile, "products");
      imageUrl = result.path;
    } catch (err: unknown) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Upload failed" };
    }
  }

  try {
    await db.productVariant.create({
      data: {
        productId,
        sku: parsed.data.sku,
        optionValues,
        price: parsed.data.price ?? null,
        comparePrice: parsed.data.comparePrice ?? null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        imageUrl,
      },
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return { ok: false as const, error: "SKU already exists" };
    }
    throw err;
  }

  revalidate(productId);
  return { ok: true as const };
}

export async function updateVariant(productId: string, variantId: string, formData: FormData) {
  await requireAnyRole(["ADMIN", "MANAGER"]);

  const optionValues: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^optionValue\[(.+)\]$/);
    if (match) optionValues[match[1]] = String(value);
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false as const, error: "Product not found" };

  const raw = {
    sku: formData.get("sku"),
    price: product.type === "CONTACT_PRICE" ? undefined : (formData.get("price") || undefined),
    comparePrice: formData.get("comparePrice") || undefined,
    sortOrder: formData.get("sortOrder") || "0",
    isActive: formData.get("isActive") !== "false",
  };

  const parsed = VariantSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid data" };

  let imageUrl: string | undefined;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      const result = await saveUpload(imageFile, "products");
      imageUrl = result.path;
    } catch (err: unknown) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Upload failed" };
    }
  }

  try {
    await db.productVariant.update({
      where: { id: variantId },
      data: {
        sku: parsed.data.sku,
        optionValues,
        price: parsed.data.price ?? null,
        comparePrice: parsed.data.comparePrice ?? null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return { ok: false as const, error: "SKU already exists" };
    }
    throw err;
  }

  revalidate(productId);
  return { ok: true as const };
}

export async function deleteVariant(productId: string, variantId: string) {
  await requireAnyRole(["ADMIN", "MANAGER"]);

  const hasStock = await db.stockEntry.count({ where: { variantId } });
  if (hasStock > 0) return { ok: false as const, error: "Variant has stock entries — deactivate instead" };

  await db.productVariant.delete({ where: { id: variantId } });
  revalidate(productId);
  return { ok: true as const };
}
