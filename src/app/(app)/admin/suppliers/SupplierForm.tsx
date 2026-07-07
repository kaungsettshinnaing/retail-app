"use client";

import { useState, useTransition } from "react";
import SubmitButton from "@/components/SubmitButton";
import { toggleSupplier } from "./actions";

type SupplierDefaults = {
  name?: string;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive?: boolean;
};

export function SupplierForm({
  action,
  defaults = {},
  supplierId,
  error,
  submitLabel = "Save",
}: {
  action: (fd: FormData) => void;
  defaults?: SupplierDefaults;
  supplierId?: string;
  error?: string;
  submitLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (!supplierId) return;
    startTransition(async () => {
      await toggleSupplier(supplierId, !defaults.isActive);
    });
  }

  return (
    <div className="card max-w-lg space-y-5">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
          <input name="name" defaultValue={defaults.name} className="input w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
          <input name="contact" defaultValue={defaults.contact ?? ""} className="input w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" defaultValue={defaults.phone ?? ""} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" defaultValue={defaults.email ?? ""} className="input w-full" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea name="address" defaultValue={defaults.address ?? ""} rows={2} className="input w-full resize-y" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" defaultValue={defaults.notes ?? ""} rows={2} className="input w-full resize-y" />
        </div>

        <div className="flex gap-3 pt-2 items-center">
          <SubmitButton className="btn-primary" pendingText="Saving…">{submitLabel}</SubmitButton>
          <a href="/admin/suppliers" className="btn-outline text-sm px-4 py-2 text-center">Cancel</a>
          {supplierId && (
            <button type="button" onClick={handleToggle} disabled={isPending}
              className={`ml-auto text-sm px-3 py-2 rounded-lg border ${defaults.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-700 border-green-200 hover:bg-green-50"}`}>
              {defaults.isActive ? "Deactivate" : "Activate"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
