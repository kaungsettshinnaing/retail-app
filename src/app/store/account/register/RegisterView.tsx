"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomer } from "../actions";
import { storeDict } from "@/lib/i18n/dict/store";
import type { Language } from "@/lib/i18n/language";

export default function RegisterView({ lang }: { lang: Language }) {
  const t = storeDict[lang];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const res = await registerCustomer({ name, email, phone, password });
    setSubmitting(false);
    if (!res.ok) { setError(res.error in t ? (t[res.error as keyof typeof t] as string) : res.error); return; }
    router.push("/store/account");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto card space-y-3">
      <h1 className="section-title">{t.createAccount}</h1>
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.fullNamePlaceholder} className="input w-full" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} type="email" className="input w-full" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phoneOptionalPlaceholder} className="input w-full" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} type="password" className="input w-full" />
      <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
        {submitting ? t.creatingAccount : t.createAccount}
      </button>
      <p className="text-xs text-gray-500 text-center">
        {t.alreadyHaveAccount} <Link href="/store/account/login" className="text-brand hover:underline">{t.signInLink}</Link>
      </p>
    </div>
  );
}
