import { prisma as db } from "@/lib/db";
import NewInvoiceForm from "./NewInvoiceForm";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const suppliers = await db.supplier.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="section-title">New Supplier Invoice</h1>
      <NewInvoiceForm suppliers={suppliers} />
    </div>
  );
}
