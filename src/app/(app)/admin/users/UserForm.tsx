"use client";

import { useState, useTransition } from "react";
import SubmitButton from "@/components/SubmitButton";
import { ALL_ROLES, type Role } from "@/lib/rbac";
import { toggleUser, resetUserPassword } from "./actions";

type UserDefaults = {
  name?: string;
  username?: string;
  roles?: Role[];
  isActive?: boolean;
  isSystemAccount?: boolean;
};

export function UserForm({
  action,
  defaults = {},
  userId,
  error,
  submitLabel = "Save",
  isNew = false,
}: {
  action: (fd: FormData) => void;
  defaults?: UserDefaults;
  userId?: string;
  error?: string;
  submitLabel?: string;
  isNew?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [pwOpen, setPwOpen] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  function handleToggle() {
    if (!userId) return;
    startTransition(async () => {
      const res = await toggleUser(userId, !defaults.isActive);
      if (!res.ok) alert(res.error);
    });
  }

  function handleResetPassword(formData: FormData) {
    if (!userId) return;
    startTransition(async () => {
      const res = await resetUserPassword(userId, formData);
      if (!res.ok) { setPwError(res.error); setPwSaved(false); return; }
      setPwError("");
      setPwSaved(true);
    });
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="card space-y-5">
        {error && (
          <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input name="name" defaultValue={defaults.name} className="input w-full" required />
          </div>
          {isNew ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input name="username" defaultValue={defaults.username} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input name="password" type="password" minLength={6} className="input w-full" required />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input value={defaults.username} disabled className="input w-full bg-gray-50 text-gray-400" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roles *</label>
            <div className="flex flex-wrap gap-3">
              {ALL_ROLES.map((r) => (
                <label key={r} className="flex items-center gap-1.5 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="roles"
                    value={r}
                    defaultChecked={defaults.roles?.includes(r)}
                    className="rounded border-gray-300"
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2 items-center">
            <SubmitButton className="btn-primary" pendingText="Saving…">{submitLabel}</SubmitButton>
            <a href="/admin/users" className="btn-outline text-sm px-4 py-2 text-center">Cancel</a>
            {userId && !defaults.isSystemAccount && (
              <button type="button" onClick={handleToggle} disabled={isPending}
                className={`ml-auto text-sm px-3 py-2 rounded-lg border ${defaults.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-700 border-green-200 hover:bg-green-50"}`}>
                {defaults.isActive ? "Deactivate" : "Activate"}
              </button>
            )}
          </div>
        </form>
      </div>

      {userId && (
        <div className="card space-y-3">
          <button onClick={() => setPwOpen(!pwOpen)} className="text-sm font-medium text-brand hover:underline">
            {pwOpen ? "Hide" : "Reset Password"}
          </button>
          {pwOpen && (
            <form action={handleResetPassword} className="flex gap-2 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">New Password</label>
                <input name="password" type="password" minLength={6} className="input w-48" required />
              </div>
              <button type="submit" disabled={isPending} className="btn-primary text-sm px-3 py-2">
                {isPending ? "Saving…" : "Set Password"}
              </button>
              {pwError && <span className="text-xs text-red-600">{pwError}</span>}
              {pwSaved && <span className="text-xs text-green-600">Password updated.</span>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
