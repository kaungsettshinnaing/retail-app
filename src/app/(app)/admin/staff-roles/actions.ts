"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import { ALL_ROLES, type Role } from "@/lib/rbac";
import type { ActionResult } from "@/lib/action-result";

const RoleEnum = z.enum(ALL_ROLES as [Role, ...Role[]]);

const StaffRoleSchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(RoleEnum),
});

export async function createStaffRole(formData: FormData): Promise<ActionResult> {
  await requireAnyRole(["ADMIN"]);

  const parsed = StaffRoleSchema.safeParse({
    name: formData.get("name"),
    permissions: formData.getAll("permissions").map(String),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const existing = await db.staffRole.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { ok: false, error: "A staff role with this name already exists" };

  await db.staffRole.create({
    data: { name: parsed.data.name, permissions: parsed.data.permissions },
  });

  revalidatePath("/admin/staff-roles");
  return { ok: true };
}

export async function toggleStaffRole(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAnyRole(["ADMIN"]);
  await db.staffRole.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/staff-roles");
  return { ok: true };
}
