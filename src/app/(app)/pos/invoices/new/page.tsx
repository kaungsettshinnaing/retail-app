import { prisma as db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { posDict } from "@/lib/i18n/dict/pos";
import NewInvoiceForm from "./NewInvoiceForm";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const user = await requireSession();
  const t = posDict[user.language];

  const suppliers = await db.supplier.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="section-title">{t.newSupplierInvoiceTitle}</h1>
      <NewInvoiceForm suppliers={suppliers} lang={user.language} />
    </div>
  );
}
