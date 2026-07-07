import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Edge middleware: gate staff routes behind a valid session cookie.
// The /store/* paths are public and excluded.
// Fine-grained role checks happen server-side in each module layout.

const SESSION_COOKIE = "rs_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-secret-change-me",
);

function isPublic(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname === "/favicon.ico") return true;
  // Online store is public — no staff auth required
  if (pathname.startsWith("/store")) return true;
  // Static assets
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/icons")) return true;
  if (pathname.startsWith("/assets")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      /* fall through to redirect */
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  const res = NextResponse.redirect(url);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
