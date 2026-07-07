import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export interface AppSettings {
  storeName: string;
  currency: string;
  storePhone: string;
  storeAddress: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  storeName:    "Retail Store",
  currency:     "MMK",
  storePhone:   "",
  storeAddress: "",
};

export async function getSettings(): Promise<AppSettings> {
  const rows = await prisma.setting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.valueJson as unknown]));
  const str = (k: keyof AppSettings) =>
    typeof map.get(k) === "string" ? (map.get(k) as string) : (DEFAULT_SETTINGS[k] as string);

  return {
    storeName:    str("storeName"),
    currency:     str("currency"),
    storePhone:   str("storePhone"),
    storeAddress: str("storeAddress"),
  };
}

export async function setSetting(key: string, value: Prisma.InputJsonValue): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { valueJson: value },
    create: { key, valueJson: value },
  });
}
