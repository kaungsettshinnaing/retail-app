"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma as db } from "@/lib/db";
import { requireAnyRole, hashPassword } from "@/lib/auth";
import { ALL_ROLES, type Role } from "@/lib/rbac";
import type { ActionResult } from "@/lib/action-result";

const RoleEnum = z.enum(ALL_ROLES as [Role, ...Role[]]);

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, dots, dashes only"),
  password: z.string().min(6),
  roles: z.array(RoleEnum).min(1, "Select at least one role"),
});

function rolesFromForm(formData: FormData): string[] {
  return formData.getAll("roles").map(String);
}

export async function createUser(formData: FormData): Promise<ActionResult> {
  await requireAnyRole(["ADMIN"]);

  const parsed = CreateSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
    roles: rolesFromForm(formData),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const existing = await db.user.findUnique({ where: { username: parsed.data.username } });
  if (existing) return { ok: false, error: "Username already taken" };

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      username: parsed.data.username,
      passwordHash: hashPassword(parsed.data.password),
      roles: parsed.data.roles,
    },
  });

  revalidatePath("/admin/users");
  redirect(`/admin/users/${user.id}`);
}

const UpdateSchema = z.object({
  name: z.string().min(1).max(200),
  roles: z.array(RoleEnum).min(1, "Select at least one role"),
});

export async function updateUser(id: string, formData: FormData): Promise<ActionResult> {
  await requireAnyRole(["ADMIN"]);

  const parsed = UpdateSchema.safeParse({
    name: formData.get("name"),
    roles: rolesFromForm(formData),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

  await db.user.update({
    where: { id },
    data: { name: parsed.data.name, roles: parsed.data.roles },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { ok: true };
}

export async function resetUserPassword(id: string, formData: FormData): Promise<ActionResult> {
  await requireAnyRole(["ADMIN"]);
  const password = String(formData.get("password") || "");
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };

  await db.user.update({ where: { id }, data: { passwordHash: hashPassword(password) } });
  return { ok: true };
}

export async function toggleUser(id: string, isActive: boolean): Promise<ActionResult> {
  const session = await requireAnyRole(["ADMIN"]);
  if (session.id === id && !isActive) {
    return { ok: false, error: "You cannot deactivate your own account" };
  }
  const target = await db.user.findUnique({ where: { id }, select: { isSystemAccount: true } });
  if (target?.isSystemAccount && !isActive) {
    return { ok: false, error: "Cannot deactivate the system admin account" };
  }
  await db.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/users");
  return { ok: true };
}
