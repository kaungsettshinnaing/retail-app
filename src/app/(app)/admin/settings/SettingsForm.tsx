"use client";

import { useState, useTransition } from "react";
import SubmitButton from "@/components/SubmitButton";
import { updateSettings } from "./actions";
import type { AppSettings } from "@/lib/settings";

export default function SettingsForm({ settings }: { settings: AppSettings }) {
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      const res = await updateSettings(formData);
      if (!res.ok) { setError(res.error); return; }
      setError("");
      setSaved(true);
    });
  }

  return (
    <div className="card max-w-lg space-y-5">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {saved && (
        <div className="rounded bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">Settings saved.</div>
      )}
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input name="storeName" defaultValue={settings.storeName} className="input w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <input name="currency" defaultValue={settings.currency} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Phone</label>
          <input name="storePhone" defaultValue={settings.storePhone} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
          <textarea name="storeAddress" defaultValue={settings.storeAddress} rows={2} className="input w-full resize-y" />
        </div>
        <SubmitButton className="btn-primary" pendingText="Saving…">Save Settings</SubmitButton>
      </form>
    </div>
  );
}
