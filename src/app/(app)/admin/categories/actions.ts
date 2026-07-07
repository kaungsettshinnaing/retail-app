"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (true) {
    const existing = await db.category.findFirst({
      where: { slug, NOT: excludeId ? { id: excludeId } : undefined },
    });
    if (!existing) return slug;
    slug = `${base}-${++n}`;
  }
}

const CategorySchema = z.object({
  name: z.string().min(1).max(80),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createCategory(formData: FormData) {
  await requireAnyRole(["ADMIN", "MANAGER"]);
  const parsed = CategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false as const, error: "Invalid data" };
  const { name, parentId, sortOrder } = parsed.data;

  // Only allow 2 levels: if parentId has a parent, reject
  if (parentId) {
    const parent = await db.category.findUnique({ where: { id: parentId } });
    if (!parent) return { ok: false as const, error: "Parent not found" };
    if (parent.parentId) return { ok: false as const, error: "Maximum 2 levels allowed" };
  }

  const slug = await uniqueSlug(slugify(name));
  await db.category.create({ data: { name, slug, parentId: parentId || null, sortOrder } });
  revalidatePath("/admin/categories");
  return { ok: true as const };
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAnyRole(["ADMIN", "MANAGER"]);
  const parsed = CategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false as const, error: "Invalid data" };
  const { name, parentId, sortOrder } = parsed.data;

  const slug = await uniqueSlug(slugify(name), id);
  await db.category.update({
    where: { id },
    data: { name, slug, parentId: parentId || null, sortOrder },
  });
  revalidatePath("/admin/categories");
  return { ok: true as const };
}

export async function toggleCategory(id: string, isActive: boolean) {
  await requireAnyRole(["ADMIN", "MANAGER"]);
  await db.category.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/categories");
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  await requireAnyRole(["ADMIN", "MANAGER"]);
  const hasProducts = await db.product.count({ where: { categoryId: id } });
  if (hasProducts > 0) return { ok: false as const, error: "Category has products — deactivate instead" };
  const hasChildren = await db.category.count({ where: { parentId: id } });
  if (hasChildren > 0) return { ok: false as const, error: "Category has sub-categories — remove them first" };
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { ok: true as const };
}
