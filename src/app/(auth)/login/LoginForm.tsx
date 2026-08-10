"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { authDict } from "@/lib/i18n/dict/auth";
import type { Language } from "@/lib/i18n/language";

const initialState: { error: string | null } = { error: null };

const ERROR_KEY: Record<string, keyof typeof authDict.EN> = {
  "Enter your username and password.": "enterBoth",
  "Invalid username or password.": "invalid",
};

export default function LoginForm({ lang }: { lang: Language }) {
  const t = authDict[lang];
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const errorText = state.error ? t[ERROR_KEY[state.error] ?? "invalid"] : null;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          {t.username}
        </label>
        <input
          name="username"
          autoComplete="username"
          autoFocus
          className="input"
          placeholder={t.usernamePlaceholder}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          {t.password}
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className="input"
          placeholder="••••••••"
        />
      </div>

      {errorText && (
        <p className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">
          {errorText}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full py-3 text-base"
      >
        {pending ? t.signingIn : t.signIn}
      </button>
    </form>
  );
}
