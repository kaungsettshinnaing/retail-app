"use server";

import { cookies } from "next/headers";
import { prisma as db } from "@/lib/db";
import {
  CUSTOMER_COOKIE,
  CUSTOMER_MAX_AGE,
  createCustomerToken,
  hashPassword,
  verifyPassword,
  getCustomerSession,
} from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";
import type { Language } from "@/lib/i18n/language";

async function setCustomerCookie(customer: {
  id: string;
  name: string | null;
  email: string | null;
  isB2B: boolean;
  language: Language;
}) {
  const token = await createCustomerToken(customer);
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
  jar.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CUSTOMER_MAX_AGE,
  });
}

export async function registerCustomer(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<ActionResult> {
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim() || !email || input.password.length < 6) {
    return { ok: false, error: "errNameEmailPasswordRequired" };
  }

  const existing = await db.customer.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "errEmailExists" };

  const customer = await db.customer.create({
    data: {
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || undefined,
      passwordHash: hashPassword(input.password),
    },
  });

  await setCustomerCookie(customer);
  return { ok: true };
}

export async function loginCustomer(input: { email: string; password: string }): Promise<ActionResult> {
  const email = input.email.trim().toLowerCase();
  const customer = await db.customer.findUnique({ where: { email } });
  if (!customer || !customer.isActive || !customer.passwordHash) {
    return { ok: false, error: "errInvalidCredentials" };
  }
  if (!verifyPassword(input.password, customer.passwordHash)) {
    return { ok: false, error: "errInvalidCredentials" };
  }

  await setCustomerCookie(customer);
  return { ok: true };
}

export async function logoutCustomer(): Promise<void> {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

export async function updateCustomerProfile(input: {
  name: string;
  phone?: string;
  address?: string;
}): Promise<ActionResult> {
  const session = await getCustomerSession();
  if (!session) return { ok: false, error: "errPleaseSignIn" };

  await db.customer.update({
    where: { id: session.id },
    data: {
      name: input.name.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      address: input.address?.trim() || undefined,
    },
  });
  return { ok: true };
}
