"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

const initialState: { error: string | null } = { error: null };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Username
        </label>
        <input
          name="username"
          autoComplete="username"
          autoFocus
          className="input"
          placeholder="Enter username"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Password
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className="input"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full py-3 text-base"
      >
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
