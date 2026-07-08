"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  await requireAnyRole(["ADMIN", "MANAGER"]);
}

// ── Areas ────────────────────────────────────────────────────────────────

export async function createArea(formData: FormData): Promise<ActionResult> {
  await guard();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, error: "Name is required" };
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const exists = await db.warehouseArea.findUnique({ where: { name } });
  if (exists) return { ok: false, error: "An area with this name already exists" };

  await db.warehouseArea.create({ data: { name, sortOrder } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

export async function updateArea(id: string, formData: FormData): Promise<ActionResult> {
  await guard();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, error: "Name is required" };
  const sortOrder = Number(formData.get("sortOrder") || 0);

  await db.warehouseArea.update({ where: { id }, data: { name, sortOrder } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

export async function toggleArea(id: string, isActive: boolean): Promise<ActionResult> {
  await guard();
  await db.warehouseArea.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

export async function deleteArea(id: string): Promise<ActionResult> {
  await guard();
  const [shelfCount, sectionCount] = await Promise.all([
    db.warehouseShelf.count({ where: { areaId: id } }),
    db.warehouseSection.count({ where: { areaId: id } }),
  ]);
  if (shelfCount > 0 || sectionCount > 0) {
    return { ok: false, error: "Cannot delete an area that has shelves or sections" };
  }
  await db.warehouseArea.delete({ where: { id } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

// ── Shelves ──────────────────────────────────────────────────────────────

export async function createShelf(formData: FormData): Promise<ActionResult> {
  await guard();
  const areaId = String(formData.get("areaId") || "");
  const name = String(formData.get("name") || "").trim();
  if (!areaId || !name) return { ok: false, error: "Area and name are required" };
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const exists = await db.warehouseShelf.findUnique({ where: { areaId_name: { areaId, name } } });
  if (exists) return { ok: false, error: "A shelf with this name already exists in this area" };

  await db.warehouseShelf.create({ data: { areaId, name, sortOrder } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

export async function updateShelf(id: string, formData: FormData): Promise<ActionResult> {
  await guard();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, error: "Name is required" };
  const sortOrder = Number(formData.get("sortOrder") || 0);

  await db.warehouseShelf.update({ where: { id }, data: { name, sortOrder } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

export async function toggleShelf(id: string, isActive: boolean): Promise<ActionResult> {
  await guard();
  await db.warehouseShelf.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

export async function deleteShelf(id: string): Promise<ActionResult> {
  await guard();
  const sectionCount = await db.warehouseSection.count({ where: { shelfId: id } });
  if (sectionCount > 0) return { ok: false, error: "Cannot delete a shelf that has sections" };
  await db.warehouseShelf.delete({ where: { id } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

// ── Sections ─────────────────────────────────────────────────────────────

export async function createSection(formData: FormData): Promise<ActionResult> {
  await guard();
  const areaId = String(formData.get("areaId") || "");
  const shelfId = String(formData.get("shelfId") || "") || null;
  const name = String(formData.get("name") || "").trim();
  if (!areaId || !name) return { ok: false, error: "Area and name are required" };
  const sortOrder = Number(formData.get("sortOrder") || 0);

  await db.warehouseSection.create({ data: { areaId, shelfId, name, sortOrder } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

export async function updateSection(id: string, formData: FormData): Promise<ActionResult> {
  await guard();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, error: "Name is required" };
  const sortOrder = Number(formData.get("sortOrder") || 0);

  await db.warehouseSection.update({ where: { id }, data: { name, sortOrder } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

export async function toggleSection(id: string, isActive: boolean): Promise<ActionResult> {
  await guard();
  await db.warehouseSection.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}

export async function deleteSection(id: string): Promise<ActionResult> {
  await guard();
  const stockCount = await db.stockEntry.count({ where: { locationId: id, qty: { not: 0 } } });
  if (stockCount > 0) return { ok: false, error: "Cannot delete a section that holds stock" };
  await db.warehouseSection.delete({ where: { id } });
  revalidatePath("/admin/warehouse");
  return { ok: true };
}
