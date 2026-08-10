"use client";

import { useActionState } from "react";
import { changeOwnPassword } from "./actions";
import { profileDict } from "@/lib/i18n/dict/profile";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

type State = { ok: boolean | null; error: string | null };
const initialState: State = { ok: null, error: null };

export default function PasswordForm({ lang }: { lang: Language }) {
  const t = profileDict[lang];
  const c = commonDict[lang];

  async function action(_prev: State, formData: FormData): Promise<State> {
    const result = await changeOwnPassword(formData);
    if (result.ok) return { ok: true, error: null };
    return { ok: false, error: result.error };
  }

  const [state, formAction, pending] = useActionState(action, initialState);

  const errorText =
    state.error && state.error in t
      ? t[state.error as keyof typeof t]
      : state.error;

  return (
    <form action={formAction} className="space-y-4" key={state.ok ? "reset" : "form"}>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          {t.currentPassword}
        </label>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          {t.newPassword}
        </label>
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="input"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          {t.confirmPassword}
        </label>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="input"
        />
      </div>

      {state.ok === false && errorText && (
        <p className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">
          {errorText}
        </p>
      )}
      {state.ok === true && (
        <p className="rounded-xl bg-green-50 border border-green-100 px-3 py-2.5 text-sm text-green-700">
          {t.passwordUpdated}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? c.saving : t.updatePassword}
      </button>
    </form>
  );
}
