import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

const UPLOADS_ROOT = process.env.UPLOADS_DIR || join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function saveUpload(
  file: File,
  subdir: string,
): Promise<{ path: string }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large (max 5 MB)");
  }
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    throw new Error("Unsupported file type");
  }

  const dir = join(UPLOADS_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  const fullPath = join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  return { path: `/uploads/${subdir}/${filename}` };
}
