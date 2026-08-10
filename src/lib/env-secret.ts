// Shared by both auth.ts (Node runtime) and middleware.ts (Edge runtime) —
// keep this dependency-free so it's safe to import from either.

/**
 * Reads a required secret from the environment. In production, a missing
 * value throws immediately rather than silently falling back to a
 * hardcoded string — a hardcoded JWT signing secret would let anyone forge
 * a valid session. The fallback only ever applies outside production, so
 * local dev works without a .env file.
 */
export function requireSecret(envVar: string, devFallback: string): string {
  const value = process.env[envVar];
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `${envVar} is not set — refusing to sign/verify sessions with a hardcoded fallback secret in production.`,
    );
  }
  return devFallback;
}
