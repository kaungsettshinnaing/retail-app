"use server";

import { revalidatePath } from "next/cache";
import { prisma as db } from "@/lib/db";
import { requireAnyRole } from "@/lib/auth";
import type { ActionResult } from "@/lib/action-result";

async function guard() {
  return requireAnyRole(["STOREMAN", "MANAGER", "ADMIN"]);
}

async function fulfilmentGuard() {
  return requireAnyRole(["STOREMAN", "CASHIER", "MANAGER", "ADMIN"]);
}

export async function confirmItemPicked(orderItemId: string): Promise<ActionResult> {
  const session = await guard();

  const item = await db.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: { select: { id: true, status: true } } },
  });
  if (!item) return { ok: false, error: "Order item not found" };
  if (item.status !== "PENDING") return { ok: false, error: "This item has already been processed" };
  if (!["PENDING", "PICKING"].includes(item.order.status)) {
    return { ok: false, error: "This order is not open for picking" };
  }

  await db.$transaction(async (tx) => {
    if (item.order.status === "PENDING") {
      await tx.order.update({ where: { id: item.order.id }, data: { status: "PICKING", pickedAt: new Date() } });
      await tx.orderLog.create({ data: { orderId: item.order.id, actorId: session.id, status: "PICKING" } });
    }

    if (item.variantId) {
      const movements = await tx.stockMovement.findMany({
        where: { orderItemId: item.id, type: "SALE_OUT" },
        include: { stockEntry: { select: { locationId: true } } },
      });
      for (const mv of movements) {
        if (!mv.stockEntry) continue;
        await tx.stockPick.create({
          data: {
            orderId: item.order.id,
            orderItemId: item.id,
            locationId: mv.stockEntry.locationId,
            qtyPicked: -mv.qty,
            pickedById: session.id,
          },
        });
      }
    }

    await tx.orderItem.update({ where: { id: item.id }, data: { status: "PICKED" } });
  });

  revalidatePath(`/warehouse/orders/${item.order.id}`);
  revalidatePath("/warehouse/orders");
  return { ok: true };
}

export async function markItemUnavailable(orderItemId: string): Promise<ActionResult> {
  const session = await guard();

  const item = await db.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: { select: { id: true, status: true } } },
  });
  if (!item) return { ok: false, error: "Order item not found" };
  if (item.status !== "PENDING") return { ok: false, error: "This item has already been processed" };

  await db.$transaction(async (tx) => {
    if (item.order.status === "PENDING") {
      await tx.order.update({ where: { id: item.order.id }, data: { status: "PICKING", pickedAt: new Date() } });
      await tx.orderLog.create({ data: { orderId: item.order.id, actorId: session.id, status: "PICKING" } });
    }
    await tx.orderItem.update({ where: { id: item.id }, data: { status: "UNAVAILABLE" } });
  });

  revalidatePath(`/warehouse/orders/${item.order.id}`);
  revalidatePath("/warehouse/orders");
  return { ok: true };
}

export async function markOrderPacked(orderId: string): Promise<ActionResult> {
  const session = await guard();

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { ok: false, error: "Order not found" };
  if (order.status !== "PICKING") return { ok: false, error: "Order must be fully picked first" };
  if (order.items.some((i) => i.status === "PENDING")) {
    return { ok: false, error: "Every item must be picked or marked unavailable first" };
  }

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "PACKED", packedAt: new Date() } }),
    db.orderLog.create({ data: { orderId, actorId: session.id, status: "PACKED" } }),
  ]);

  revalidatePath(`/warehouse/orders/${orderId}`);
  revalidatePath("/warehouse/orders");
  return { ok: true };
}

export async function markOrderReady(orderId: string): Promise<ActionResult> {
  const session = await fulfilmentGuard();

  const order = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!order) return { ok: false, error: "Order not found" };
  if (order.status !== "PACKED") return { ok: false, error: "Order must be packed first" };

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "READY", readyAt: new Date() } }),
    db.orderLog.create({ data: { orderId, actorId: session.id, status: "READY" } }),
  ]);

  revalidatePath(`/warehouse/orders/${orderId}`);
  revalidatePath("/warehouse/orders");
  return { ok: true };
}

export async function completeOrder(
  orderId: string,
  method: "PICKED_UP" | "DELIVERED"
): Promise<ActionResult> {
  const session = await fulfilmentGuard();

  const order = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!order) return { ok: false, error: "Order not found" };
  if (order.status !== "READY") return { ok: false, error: "Order must be ready first" };

  const now = new Date();
  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: {
        status: method,
        pickedUpAt: method === "PICKED_UP" ? now : undefined,
        deliveredAt: method === "DELIVERED" ? now : undefined,
      },
    }),
    db.orderLog.create({ data: { orderId, actorId: session.id, status: method } }),
  ]);

  revalidatePath(`/warehouse/orders/${orderId}`);
  revalidatePath("/warehouse/orders");
  return { ok: true };
}
