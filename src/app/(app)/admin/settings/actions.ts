"use server";

import { revalidatePath } from "next/cache";
import { requireAnyRole } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import type { ActionResult } from "@/lib/action-result";

export async function updateSettings(formData: FormData): Promise<ActionResult> {
  await requireAnyRole(["ADMIN"]);

  const storeName = String(formData.get("storeName") || "").trim();
  const currency = String(formData.get("currency") || "").trim();
  const storePhone = String(formData.get("storePhone") || "").trim();
  const storeAddress = String(formData.get("storeAddress") || "").trim();

  if (!storeName) return { ok: false, error: "Store name is required" };

  await setSetting("storeName", storeName);
  await setSetting("currency", currency || "MMK");
  await setSetting("storePhone", storePhone);
  await setSetting("storeAddress", storeAddress);

  revalidatePath("/admin/settings");
  return { ok: true };
}
