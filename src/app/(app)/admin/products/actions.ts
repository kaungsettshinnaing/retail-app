"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(["REGULAR", "PASS_THROUGH", "CONTACT_PRICE"]),
  categoryId: z.string().optional(),
  unit: z.string().default("unit"),
  isOnline: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  lowStockAlert: z.coerce.number().int().optional(),
});

export async function createProduct(formData: FormData) {
  await requireAnyRole(["ADMIN", "MANAGER"]);

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    categoryId: formData.get("categoryId") || undefined,
    unit: formData.get("unit") || "unit",
    isOnline: formData.get("isOnline") === "true",
    isActive: formData.get("isActive") !== "false",
    lowStockAlert: formData.get("lowStockAlert") || undefined,
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid data" };

  // Parse option names (comma-separated or multi-value)
  const optionNames = formData.getAll("optionName") as string[];

  // Handle image upload
  let imageUrl: string | undefined;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      const result = await saveUpload(imageFile, "products");
      imageUrl = result.path;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      return { ok: false as const, error: message };
    }
  }

  const product = await db.product.create({
    data: {
      ...parsed.data,
      categoryId: parsed.data.categoryId || null,
      lowStockAlert: parsed.data.lowStockAlert ?? null,
      imageUrl,
      options: {
        create: optionNames
          .filter((n) => n.trim())
          .map((n, i) => ({ name: n.trim(), sortOrder: i })),
      },
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/variants`);
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAnyRole(["ADMIN", "MANAGER"]);

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    categoryId: formData.get("categoryId") || undefined,
    unit: formData.get("unit") || "unit",
    isOnline: formData.get("isOnline") === "true",
    isActive: formData.get("isActive") !== "false",
    lowStockAlert: formData.get("lowStockAlert") || undefined,
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid data" };

  let imageUrl: string | undefined;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      const result = await saveUpload(imageFile, "products");
      imageUrl = result.path;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      return { ok: false as const, error: message };
    }
  }

  // Sync options: delete all and re-create (simple approach for now)
  const optionNames = formData.getAll("optionName") as string[];

  await db.$transaction([
    db.productOption.deleteMany({ where: { productId: id } }),
    db.product.update({
      where: { id },
      data: {
        ...parsed.data,
        categoryId: parsed.data.categoryId || null,
        lowStockAlert: parsed.data.lowStockAlert ?? null,
        ...(imageUrl ? { imageUrl } : {}),
        options: {
          create: optionNames
            .filter((n) => n.trim())
            .map((n, i) => ({ name: n.trim(), sortOrder: i })),
        },
      },
    }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { ok: true as const };
}

export async function toggleProduct(id: string, isActive: boolean) {
  await requireAnyRole(["ADMIN", "MANAGER"]);
  await db.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/products");
  return { ok: true as const };
}
