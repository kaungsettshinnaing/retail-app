"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ALL_ROLES } from "@/lib/rbac";
import { createStaffRole, toggleStaffRole } from "./actions";

export function CreateStaffRoleForm() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(fd: FormData) {
    setError("");
    startTransition(async () => {
      const res = await createStaffRole(fd);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="card max-w-lg space-y-3">
      <h2 className="section-title text-sm">Add Staff Role</h2>
      <form action={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
          <input name="name" required className="input w-full" placeholder="e.g. Senior Cashier" disabled={pending} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">System Permissions</label>
          <div className="flex flex-wrap gap-3">
            {ALL_ROLES.map((r) => (
              <label key={r} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="permissions" value={r} disabled={pending} />
                {r}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Creating…" : "Create Staff Role"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}

export function ToggleStaffRoleButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => {
        await toggleStaffRole(id, !isActive);
        router.refresh();
      })}
      className={`text-xs hover:underline disabled:opacity-60 ${isActive ? "text-red-500" : "text-green-700"}`}
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
