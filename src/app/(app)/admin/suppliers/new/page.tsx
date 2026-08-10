import { createSupplier } from "../actions";
import { SupplierForm } from "../SupplierForm";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";

export default async function NewSupplierPage() {
  const user = await requireSession();
  const t = adminDict[user.language];
  return (
    <div className="space-y-4">
      <h1 className="section-title">{t.supplierNewTitle}</h1>
      <SupplierForm action={createSupplier} submitLabel={t.supplierCreateButton} lang={user.language} />
    </div>
  );
}
