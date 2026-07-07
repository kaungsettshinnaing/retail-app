"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";

const SupplierSchema = z.object({
  name: z.string().min(1).max(200),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

function toData(formData: FormData) {
  return {
    name: formData.get("name"),
    contact: formData.get("contact") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
  };
}

export async function createSupplier(formData: FormData) {
  await requireAnyRole(["ADMIN", "MANAGER"]);
  const parsed = SupplierSchema.safeParse(toData(formData));
  if (!parsed.success) return { ok: false as const, error: "Invalid data" };

  const supplier = await db.supplier.create({ data: parsed.data });
  revalidatePath("/admin/suppliers");
  redirect(`/admin/suppliers/${supplier.id}`);
}

export async function updateSupplier(id: string, formData: FormData) {
  await requireAnyRole(["ADMIN", "MANAGER"]);
  const parsed = SupplierSchema.safeParse(toData(formData));
  if (!parsed.success) return { ok: false as const, error: "Invalid data" };

  await db.supplier.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/suppliers");
  revalidatePath(`/admin/suppliers/${id}`);
  return { ok: true as const };
}

export async function toggleSupplier(id: string, isActive: boolean) {
  await requireAnyRole(["ADMIN", "MANAGER"]);
  await db.supplier.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/suppliers");
  return { ok: true as const };
}
