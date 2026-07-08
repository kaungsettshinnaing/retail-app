import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import CountingDetail from "./CountingDetail";

export const dynamic = "force-dynamic";

export default async function WarehouseInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [invoice, locations] = await Promise.all([
    db.supplierInvoice.findUnique({
      where: { id },
      include: {
        supplier: { select: { name: true } },
        cashier: { select: { name: true } },
        counter: { select: { name: true } },
        items: {
          orderBy: { id: "asc" },
          include: { variant: { select: { sku: true, optionValues: true } } },
        },
        logs: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true } } } },
      },
    }),
    db.warehouseSection.findMany({
      where: { isActive: true },
      orderBy: [{ areaId: "asc" }, { sortOrder: "asc" }],
      include: { area: { select: { name: true } }, shelf: { select: { name: true } } },
    }),
  ]);

  if (!invoice) notFound();

  return <CountingDetail invoice={invoice} locations={locations} />;
}
