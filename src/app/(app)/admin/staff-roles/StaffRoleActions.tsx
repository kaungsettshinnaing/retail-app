"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ALL_ROLES, type Role } from "@/lib/rbac";
import { createStaffRole, toggleStaffRole } from "./actions";
import { adminDict } from "@/lib/i18n/dict/admin";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

const ROLE_KEY: Record<Role, keyof typeof commonDict.EN> = {
  ADMIN: "roleAdmin",
  MANAGER: "roleManager",
  HR: "roleHr",
  CASHIER: "roleCashier",
  STOREMAN: "roleStoreman",
  BD_LEAD: "roleBdLead",
  BD_REP: "roleBdRep",
};

export function CreateStaffRoleForm({ lang }: { lang: Language }) {
  const t = adminDict[lang];
  const c = commonDict[lang];
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(fd: FormData) {
    setError("");
    startTransition(async () => {
      const res = await createStaffRole(fd);
      if (!res.ok) setError(res.error in t ? t[res.error as keyof typeof t] : res.error);
      else router.refresh();
    });
  }

  return (
    <div className="card max-w-lg space-y-3">
      <h2 className="section-title text-sm">{t.staffRoleAddTitle}</h2>
      <form action={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.staffRoleNameLabel}</label>
          <input name="name" required className="input w-full" placeholder={t.staffRoleNamePlaceholder} disabled={pending} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.staffRolePermissionsLabel}</label>
          <div className="flex flex-wrap gap-3">
            {ALL_ROLES.map((r) => (
              <label key={r} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="permissions" value={r} disabled={pending} />
                {c[ROLE_KEY[r]]}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? c.saving : t.staffRoleCreateButton}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}

export function ToggleStaffRoleButton({ id, isActive, lang }: { id: string; isActive: boolean; lang: Language }) {
  const t = adminDict[lang];
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
      {isActive ? t.deactivate : t.activate}
    </button>
  );
}
