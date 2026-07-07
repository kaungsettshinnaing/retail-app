import { createSupplier } from "../actions";
import { SupplierForm } from "../SupplierForm";

export default function NewSupplierPage() {
  return (
    <div className="space-y-4">
      <h1 className="section-title">New Supplier</h1>
      <SupplierForm action={createSupplier} submitLabel="Create Supplier" />
    </div>
  );
}
