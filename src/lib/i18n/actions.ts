"use server";

import { cookies } from "next/headers";
import { isLanguage, LANGUAGE_COOKIE, type Language } from "./language";

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export async function setLanguageCookie(language: Language): Promise<void> {
  if (!isLanguage(language)) return;
  const jar = await cookies();
  jar.set(LANGUAGE_COOKIE, language, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function getLanguageCookie(): Promise<Language> {
  const value = (await cookies()).get(LANGUAGE_COOKIE)?.value;
  return isLanguage(value) ? value : "EN";
}
