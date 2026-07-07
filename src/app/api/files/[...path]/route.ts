import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import { join, extname, resolve } from "path";

const UPLOADS_ROOT = resolve(process.env.UPLOADS_DIR || join(process.cwd(), "uploads"));

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const rel = segments.join("/");

  // Prevent path traversal
  const fullPath = resolve(join(UPLOADS_ROOT, rel));
  if (!fullPath.startsWith(UPLOADS_ROOT)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    await access(fullPath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = extname(fullPath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const buffer = await readFile(fullPath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
