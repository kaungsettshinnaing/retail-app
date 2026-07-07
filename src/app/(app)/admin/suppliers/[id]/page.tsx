import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { updateSupplier } from "../actions";
import { SupplierForm } from "../SupplierForm";

export const dynamic = "force-dynamic";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
        submitLabel="Save Changes"
      />
    </div>
  );
}
