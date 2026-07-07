import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { Role } from "./rbac";

// ── Staff session ────────────────────────────────────────────────────────────

export const SESSION_COOKIE = "rs_session";
const SESSION_HOURS = 12;

function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-only-secret-change-me",
  );
}

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  roles: Role[];
}

export function hashPassword(pw: string): string {
  return bcrypt.hashSync(pw, 10);
}

export function verifyPassword(pw: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(pw, hash);
  } catch {
    return false;
  }
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ username: user.username, name: user.name, roles: user.roles })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      username: String(payload.username ?? ""),
      name: String(payload.name ?? ""),
      roles: (payload.roles as Role[]) ?? [],
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export async function requireAnyRole(allowed: Role[]): Promise<SessionUser> {
  const s = await requireSession();
  if (!s.roles.some((r) => allowed.includes(r))) redirect("/");
  return s;
}

export const SESSION_MAX_AGE = SESSION_HOURS * 60 * 60;

// ── Customer session (online store) ─────────────────────────────────────────

export const CUSTOMER_COOKIE = "rs_customer";

function getCustomerSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.CUSTOMER_AUTH_SECRET || "dev-customer-secret-change-me",
  );
}

export interface CustomerSession {
  id: string;
  name: string | null;
  email: string | null;
}

export async function createCustomerToken(c: CustomerSession): Promise<string> {
  return new SignJWT({ name: c.name, email: c.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(c.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getCustomerSecret());
}

export async function verifyCustomerToken(token: string): Promise<CustomerSession | null> {
  try {
    const { payload } = await jwtVerify(token, getCustomerSecret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      name: payload.name ? String(payload.name) : null,
      email: payload.email ? String(payload.email) : null,
    };
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export const CUSTOMER_MAX_AGE = 30 * 24 * 60 * 60;
