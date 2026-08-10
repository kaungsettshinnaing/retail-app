import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { updateSupplier } from "../actions";
import { SupplierForm } from "../SupplierForm";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";

export const dynamic = "force-dynamic";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireSession();
  const t = adminDict[user.language];
  const supplier = await db.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  const action = updateSupplier.bind(null, id);

  return (
    <div className="space-y-4">
      <h1 className="section-title">{supplier.name}</h1>
      <SupplierForm
        action={action}
        defaults={supplier}
        supplierId={id}
        submitLabel={t.saveChanges}
        lang={user.language}
      />
    </div>
  );
}
