import { prisma as db } from "./db";
import type { Prisma, StockMovementType } from "@prisma/client";

export type Tx = Prisma.TransactionClient;

export async function getVariantTotalStock(variantId: string): Promise<number> {
  const agg = await db.stockEntry.aggregate({
    where: { variantId },
    _sum: { qty: true },
  });
  return agg._sum.qty ?? 0;
}

export async function getVariantsTotalStock(
  variantIds: string[]
): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  for (const id of variantIds) map[id] = 0;
  if (variantIds.length === 0) return map;

  const rows = await db.stockEntry.groupBy({
    by: ["variantId"],
    where: { variantId: { in: variantIds } },
    _sum: { qty: true },
  });
  for (const r of rows) map[r.variantId] = r._sum.qty ?? 0;
  return map;
}

export async function getVariantStockByLocation(variantId: string) {
  return db.stockEntry.findMany({
    where: { variantId, qty: { not: 0 } },
    include: { location: { include: { shelf: true, area: true } } },
    orderBy: { qty: "desc" },
  });
}

export async function getLowStockVariants() {
  const products = await db.product.findMany({
    where: { type: "REGULAR", lowStockAlert: { not: null }, isActive: true },
    include: { variants: { where: { isActive: true } } },
  });
  const variantIds = products.flatMap((p) => p.variants.map((v) => v.id));
  const stockMap = await getVariantsTotalStock(variantIds);

  const alerts: {
    productId: string;
    productName: string;
    variantId: string;
    sku: string;
    stock: number;
    threshold: number;
  }[] = [];

  for (const p of products) {
    if (p.lowStockAlert == null) continue;
    for (const v of p.variants) {
      const stock = stockMap[v.id] ?? 0;
      if (stock < p.lowStockAlert) {
        alerts.push({
          productId: p.id,
          productName: p.name,
          variantId: v.id,
          sku: v.sku,
          stock,
          threshold: p.lowStockAlert,
        });
      }
    }
  }
  return alerts;
}

export type StockAdjustParams = {
  variantId: string;
  locationId: string;
  qtyDelta: number; // positive = stock in, negative = stock out
  type: StockMovementType;
  actorId: string;
  invoiceItemId?: string;
  orderItemId?: string;
  note?: string;
};

export type StockAdjustResult =
  | { ok: true; newQty: number }
  | { ok: false; error: string };

/**
 * Locks the StockEntry row for variant+location with SELECT ... FOR UPDATE
 * before adjusting qty, so concurrent sales/placements can't oversell.
 * Must be called inside a `db.$transaction(async (tx) => ...)` block.
 */
export async function adjustStock(
  tx: Tx,
  params: StockAdjustParams
): Promise<StockAdjustResult> {
  const { variantId, locationId, qtyDelta, type, actorId, invoiceItemId, orderItemId, note } = params;

  // Ensure the row exists via an atomic upsert (Prisma/Postgres translate
  // this to a single INSERT ... ON CONFLICT DO NOTHING-equivalent statement
  // for a compound-unique target) before locking it — otherwise two
  // concurrent first-time adjustments to the same variant+location could
  // both see no row, both attempt `create`, and one would fail on the
  // @@unique([variantId, locationId]) constraint.
  await tx.stockEntry.upsert({
    where: { variantId_locationId: { variantId, locationId } },
    create: { variantId, locationId, qty: 0 },
    update: {},
  });

  const locked = await tx.$queryRaw<{ id: string; qty: number }[]>`
    SELECT id, qty FROM "StockEntry"
    WHERE "variantId" = ${variantId} AND "locationId" = ${locationId}
    FOR UPDATE
  `;
  if (locked.length === 0) {
    return { ok: false, error: "Stock entry could not be created" };
  }

  const entryId = locked[0].id;
  const previousQty = locked[0].qty;

  const newQty = previousQty + qtyDelta;
  if (newQty < 0) {
    return { ok: false, error: previousQty === 0 ? "No stock at this location" : "Insufficient stock" };
  }

  await tx.stockEntry.update({ where: { id: entryId }, data: { qty: newQty } });
  await tx.stockMovement.create({
    data: {
      variantId,
      stockEntryId: entryId,
      type,
      qty: qtyDelta,
      previousQty,
      invoiceItemId,
      orderItemId,
      actorId,
      note,
    },
  });

  return { ok: true, newQty };
}
