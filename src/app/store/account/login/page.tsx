"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginCustomer } from "../actions";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const res = await loginCustomer({ email, password });
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    router.push("/store/account");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto card space-y-3">
      <h1 className="section-title">Sign In</h1>
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="input w-full" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="input w-full" />
      <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
        {submitting ? "Signing in…" : "Sign In"}
      </button>
      <p className="text-xs text-gray-500 text-center">
        No account? <Link href="/store/account/register" className="text-brand hover:underline">Register</Link>
      </p>
    </div>
  );
}
