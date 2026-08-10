"use client";

import { useState } from "react";
import ModalSheet from "./ModalSheet";
import { createLead } from "@/app/(app)/b2b/actions";
import { b2bDict } from "@/lib/i18n/dict/b2b";
import type { Language } from "@/lib/i18n/language";

export default function LeadFormSheet({
  onClose,
  onCreated,
  lang,
}: {
  onClose: () => void;
  onCreated: () => void;
  lang: Language;
}) {
  const t = b2bDict[lang];
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [shopField, setShopField] = useState("");
  const [township, setTownship] = useState("");
  const [city, setCity] = useState("");
  const [mapsURL, setMapsURL] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!businessName.trim()) {
      setError(t.businessNameRequiredError);
      return;
    }
    setSaving(true);
    setError(null);
    const res = await createLead({
      businessName,
      contactName: contactName || undefined,
      phone: phone || undefined,
      shopField: shopField || undefined,
      township: township || undefined,
      city: city || undefined,
      mapsURL: mapsURL || undefined,
      notes: notes || undefined,
    });
    if (!res.ok) {
      setError(res.error in t ? t[res.error as keyof typeof t] : res.error);
      setSaving(false);
      return;
    }
    onCreated();
  }

  return (
    <ModalSheet title={t.newLeadTitle} onClose={onClose} lang={lang}>
      <div className="space-y-3">
        <input className="input" placeholder={t.businessNamePlaceholder} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        <input className="input" placeholder={t.contactPersonPlaceholder} value={contactName} onChange={(e) => setContactName(e.target.value)} />
        <input className="input" placeholder={t.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="input" placeholder={t.shopFieldPlaceholder} value={shopField} onChange={(e) => setShopField(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" placeholder={t.townshipPlaceholder} value={township} onChange={(e) => setTownship(e.target.value)} />
          <input className="input" placeholder={t.cityPlaceholder} value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <input className="input" placeholder={t.mapsLinkPlaceholder} value={mapsURL} onChange={(e) => setMapsURL(e.target.value)} />
        <textarea className="input" placeholder={t.notePlaceholder} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <p className="text-xs text-gray-500">{t.photoHint}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button onClick={submit} disabled={saving} className="btn-primary w-full text-sm py-2.5">
          {saving ? t.creatingEllipsis : t.createLeadBtn}
        </button>
      </div>
    </ModalSheet>
  );
}
