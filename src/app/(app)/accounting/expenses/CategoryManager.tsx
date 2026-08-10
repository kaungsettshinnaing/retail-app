"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseCategory, renameExpenseCategory, toggleExpenseCategory } from "./actions";
import { accountingDict } from "@/lib/i18n/dict/accounting";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

type Category = { id: string; name: string; isActive: boolean };

export default function CategoryManager({ categories, lang }: { categories: Category[]; lang: Language }) {
  const t = accountingDict[lang];
  const c = commonDict[lang];
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, onSuccess?: () => void) {
    setError("");
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        const code = res.error;
        setError((code && code in t ? t[code as keyof typeof t] : code) ?? t.errSomethingWrong);
      } else {
        onSuccess?.();
        router.refresh();
      }
    });
  }

  return (
    <div className="card space-y-3">
      <div className="section-title text-base">{t.categoriesTitle}</div>
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      <ul className="divide-y divide-gray-50">
        {categories.length === 0 && <li className="py-2 text-sm text-gray-400">{t.noCategories}</li>}
        {categories.map((cat) => (
          <li key={cat.id} className="py-2 flex items-center gap-2">
            {editingId === cat.id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input flex-1 text-sm" />
                <button
                  disabled={pending}
                  onClick={() => run(() => renameExpenseCategory(cat.id, editName), () => setEditingId(null))}
                  className="btn-primary text-sm py-1"
                >
                  {c.save}
                </button>
                <button onClick={() => setEditingId(null)} className="btn-outline text-sm py-1">
                  {c.cancel}
                </button>
              </>
            ) : (
              <>
                <span className={`flex-1 text-sm ${cat.isActive ? "text-gray-800" : "text-gray-400 line-through"}`}>{cat.name}</span>
                <button
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditName(cat.name);
                  }}
                  className="text-xs text-brand hover:underline"
                >
                  {t.rename}
                </button>
                <button
                  disabled={pending}
                  onClick={() => run(() => toggleExpenseCategory(cat.id, !cat.isActive))}
                  className="text-xs text-gray-500 hover:underline"
                >
                  {cat.isActive ? t.deactivate : t.activate}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t.newCategoryPlaceholder}
          className="input flex-1 text-sm"
        />
        <button
          disabled={pending}
          onClick={() => run(() => createExpenseCategory(newName), () => setNewName(""))}
          className="btn-primary text-sm py-1"
        >
          {c.add}
        </button>
      </div>
    </div>
  );
}
