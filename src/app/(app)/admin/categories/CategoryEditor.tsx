"use client";

import { useState, useTransition } from "react";
import {
  createCategory,
  updateCategory,
  toggleCategory,
  deleteCategory,
} from "./actions";
import { adminDict } from "@/lib/i18n/dict/admin";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

type Cat = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  children: Cat[];
  _count: { products: number };
};

function errText(t: typeof adminDict.EN, key: string): string {
  return key in t ? t[key as keyof typeof t] : key;
}

function CategoryRow({
  cat,
  indent = 0,
  parents,
  lang,
}: {
  cat: Cat;
  indent?: number;
  parents: { id: string; name: string }[];
  lang: Language;
}) {
  const t = adminDict[lang];
  const c = commonDict[lang];
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const res = await updateCategory(cat.id, formData);
      if (!res.ok) { setError(errText(t, res.error)); return; }
      setEditing(false);
      setError("");
    });
  }

  function handleToggle() {
    startTransition(async () => {
      await toggleCategory(cat.id, !cat.isActive);
    });
  }

  function handleDelete() {
    if (!confirm(t.categoryDeleteConfirm.replace("{name}", cat.name))) return;
    startTransition(async () => {
      const res = await deleteCategory(cat.id);
      if (!res.ok) alert(errText(t, res.error));
    });
  }

  return (
    <>
      <tr className={!cat.isActive ? "opacity-50" : ""}>
        <td className="py-2 px-3 text-sm" style={{ paddingLeft: `${indent * 20 + 12}px` }}>
          {indent > 0 && <span className="mr-1 text-gray-400">↳</span>}
          {cat.name}
        </td>
        <td className="py-2 px-3 text-xs text-gray-400">{cat.slug}</td>
        <td className="py-2 px-3 text-xs text-center text-gray-500">{cat._count.products}</td>
        <td className="py-2 px-3">
          <span className={`badge ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {cat.isActive ? c.active : c.inactive}
          </span>
        </td>
        <td className="py-2 px-3 text-right space-x-2">
          <button onClick={() => setEditing(!editing)} className="text-xs text-brand hover:underline">
            {c.edit}
          </button>
          <button onClick={handleToggle} disabled={isPending} className="text-xs text-gray-500 hover:underline">
            {cat.isActive ? t.deactivate : t.activate}
          </button>
          <button onClick={handleDelete} disabled={isPending || cat._count.products > 0}
            className="text-xs text-red-500 hover:underline disabled:opacity-40">
            {c.delete}
          </button>
        </td>
      </tr>
      {editing && (
        <tr>
          <td colSpan={5} className="bg-brand-light px-4 py-3">
            {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
            <form action={handleUpdate} className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">{c.name}</label>
                <input name="name" defaultValue={cat.name} className="input w-48" required />
              </div>
              {indent === 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">{t.sortOrderLabel}</label>
                  <input name="sortOrder" type="number" defaultValue={cat.sortOrder} className="input w-20" />
                </div>
              )}
              {indent > 0 && (
                <>
                  <input type="hidden" name="parentId" value={cat.parentId ?? ""} />
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">{t.sortOrderLabel}</label>
                    <input name="sortOrder" type="number" defaultValue={cat.sortOrder} className="input w-20" />
                  </div>
                </>
              )}
              <button type="submit" disabled={isPending} className="btn-primary text-xs px-3 py-1.5">
                {c.save}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline text-xs px-3 py-1.5">
                {c.cancel}
              </button>
            </form>
          </td>
        </tr>
      )}
      {cat.children.map((c) => (
        <CategoryRow key={c.id} cat={c} indent={indent + 1} parents={parents} lang={lang} />
      ))}
    </>
  );
}

function AddCategoryForm({ parents, lang }: { parents: { id: string; name: string }[]; lang: Language }) {
  const t = adminDict[lang];
  const c = commonDict[lang];
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const res = await createCategory(formData);
      if (!res.ok) { setError(errText(t, res.error)); return; }
      setOpen(false);
      setError("");
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary text-sm">
        + {t.categoryAdd}
      </button>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{t.categoryFormTitle}</h3>
      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
      <form action={handleCreate} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">{c.name}</label>
          <input name="name" className="input w-48" placeholder={t.categoryNamePlaceholder} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">{t.categoryParentLabel}</label>
          <select name="parentId" className="input w-48">
            <option value="">{t.categoryTopLevelOption}</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">{t.sortOrderLabel}</label>
          <input name="sortOrder" type="number" defaultValue={0} className="input w-20" />
        </div>
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          {isPending ? c.saving : c.save}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline text-sm">
          {c.cancel}
        </button>
      </form>
    </div>
  );
}

export default function CategoryEditor({
  categories,
  lang,
}: {
  categories: Cat[];
  lang: Language;
}) {
  const t = adminDict[lang];
  const c = commonDict[lang];
  const topLevel = categories.filter((cat) => !cat.parentId);

  return (
    <div className="space-y-4">
      <AddCategoryForm parents={topLevel.map((cat) => ({ id: cat.id, name: cat.name }))} lang={lang} />

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">{c.name}</th>
              <th className="py-2 px-3 text-left">{t.categoryColSlug}</th>
              <th className="py-2 px-3 text-center">{t.categoryColProducts}</th>
              <th className="py-2 px-3 text-left">{c.status}</th>
              <th className="py-2 px-3 text-right">{c.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {topLevel.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                  {t.categoryEmpty}
                </td>
              </tr>
            ) : (
              topLevel.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  parents={topLevel.map((c) => ({ id: c.id, name: c.name }))}
                  lang={lang}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
