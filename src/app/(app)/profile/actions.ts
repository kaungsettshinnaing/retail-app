"use server";

import { cookies } from "next/headers";
import { prisma as db } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  hashPassword,
  requireSession,
  verifyPassword,
} from "@/lib/auth";
import { isLanguage } from "@/lib/i18n/language";
import type { ActionResult } from "@/lib/action-result";

export async function changeOwnPassword(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (newPassword.length < 6) return { ok: false, error: "passwordTooShort" };
  if (newPassword !== confirmPassword) return { ok: false, error: "passwordMismatch" };

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
    return { ok: false, error: "currentPasswordWrong" };
  }

  await db.user.update({
    where: { id: session.id },
    data: { passwordHash: hashPassword(newPassword) },
  });

  return { ok: true };
}

export async function changeOwnLanguage(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();

  const language = formData.get("language");
  if (!isLanguage(language)) return { ok: false, error: "Invalid language" };

  const user = await db.user.update({
    where: { id: session.id },
    data: { language },
  });

  // Language lives in the session JWT, so re-mint the cookie immediately —
  // otherwise the change wouldn't take effect until the next login.
  const token = await createSessionToken({
    id: user.id,
    username: user.username,
    name: user.name,
    roles: session.roles,
    language: user.language,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return { ok: true };
}
