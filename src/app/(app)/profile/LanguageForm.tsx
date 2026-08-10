"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { changeOwnLanguage } from "./actions";
import { profileDict } from "@/lib/i18n/dict/profile";
import { commonDict } from "@/lib/i18n/dict/common";
import { LANGUAGES, LANGUAGE_LABEL, type Language } from "@/lib/i18n/language";

type State = { ok: boolean | null; error: string | null };
const initialState: State = { ok: null, error: null };

export default function LanguageForm({ lang }: { lang: Language }) {
  const t = profileDict[lang];
  const c = commonDict[lang];
  const router = useRouter();

  async function action(_prev: State, formData: FormData): Promise<State> {
    const result = await changeOwnLanguage(formData);
    if (result.ok) return { ok: true, error: null };
    return { ok: false, error: result.error };
  }

  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-gray-500">{t.languageDesc}</p>
      <div className="flex flex-wrap gap-3">
        {LANGUAGES.map((code) => (
          <label
            key={code}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium has-[:checked]:border-brand has-[:checked]:bg-brand/5"
          >
            <input
              type="radio"
              name="language"
              value={code}
              defaultChecked={code === lang}
              className="accent-brand"
            />
            {LANGUAGE_LABEL[code]}
          </label>
        ))}
      </div>

      {state.ok === true && (
        <p className="rounded-xl bg-green-50 border border-green-100 px-3 py-2.5 text-sm text-green-700">
          {t.languageUpdated}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? c.saving : t.saveLanguage}
      </button>
    </form>
  );
}
