import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { __retail_prisma?: PrismaClient };

export const prisma =
  g.__retail_prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  g.__retail_prisma = prisma;
}
