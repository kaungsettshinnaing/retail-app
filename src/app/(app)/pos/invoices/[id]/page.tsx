import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import InvoiceDetail from "./InvoiceDetail";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [invoice, products] = await Promise.all([
    db.supplierInvoice.findUnique({
      where: { id },
      include: {
        supplier: { select: { name: true } },
        cashier: { select: { name: true } },
        counter: { select: { name: true } },
        items: { orderBy: { id: "asc" } },
        logs: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true } } } },
      },
    }),
    db.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, sku: true, optionValues: true },
        },
      },
    }),
  ]);

  if (!invoice) notFound();

  return <InvoiceDetail invoice={invoice} products={products} />;
}
