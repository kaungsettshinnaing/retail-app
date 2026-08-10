"use client";

import { useState, useTransition } from "react";
import { issuePortalAccess } from "@/app/(app)/b2b/actions";
import { b2bDict } from "@/lib/i18n/dict/b2b";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

export default function IssuePortalAccessForm({ customerId, lang }: { customerId: string; lang: Language }) {
  const t = b2bDict[lang];
  const c = commonDict[lang];
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return <span className="text-xs text-green-600">{t.portalAccessIssued}</span>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-brand hover:underline">
        {t.issuePortalAccessBtn}
      </button>
    );
  }

  function submit() {
    startTransition(async () => {
      const res = await issuePortalAccess(customerId, { email, password });
      if (!res.ok) {
        setError(res.error in t ? t[res.error as keyof typeof t] : res.error);
        return;
      }
      setError("");
      setDone(true);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.emailPlaceholder}
        type="email"
        className="input w-36 text-xs py-1"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t.passwordPlaceholder}
        type="password"
        className="input w-28 text-xs py-1"
      />
      <button onClick={submit} disabled={isPending} className="btn-primary text-xs px-2 py-1">
        {isPending ? c.saving : c.save}
      </button>
      <button onClick={() => setOpen(false)} disabled={isPending} className="btn-outline text-xs px-2 py-1">
        {c.cancel}
      </button>
      {error && <span className="w-full text-xs text-red-600">{error}</span>}
    </div>
  );
}
