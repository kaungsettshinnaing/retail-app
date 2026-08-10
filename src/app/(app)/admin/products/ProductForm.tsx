"use client";

import { useState, useRef } from "react";
import SubmitButton from "@/components/SubmitButton";
import { adminDict } from "@/lib/i18n/dict/admin";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

type Category = { id: string; name: string; parentId: string | null };
type Option = { id?: string; name: string };

type ProductFormProps = {
  categories: Category[];
  action: (fd: FormData) => void;
  defaultValues?: {
    name?: string;
    description?: string;
    type?: string;
    categoryId?: string;
    unit?: string;
    isOnline?: boolean;
    isActive?: boolean;
    lowStockAlert?: number | null;
    imageUrl?: string | null;
    options?: Option[];
  };
  error?: string;
  submitLabel?: string;
  lang: Language;
};

export default function ProductForm({
  categories,
  action,
  defaultValues = {},
  error,
  submitLabel,
  lang,
}: ProductFormProps) {
  const t = adminDict[lang];
  const c = commonDict[lang];
  const TYPE_OPTIONS = [
    { value: "REGULAR",       label: t.productTypeRegularOption },
    { value: "PASS_THROUGH",  label: t.productTypePassThroughOption },
    { value: "CONTACT_PRICE", label: t.productTypeContactPriceOption },
  ];
  const [type, setType] = useState(defaultValues.type ?? "REGULAR");
  const [options, setOptions] = useState<Option[]>(defaultValues.options ?? []);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultValues.imageUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Build grouped category options (parents + indented children)
  const parents = categories.filter((c) => !c.parentId);
  const children = categories.filter((c) => c.parentId);

  function addOption() {
    setOptions((prev) => [...prev, { name: "" }]);
  }
  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }
  function setOptionName(i: number, val: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, name: val } : o)));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <div className="card max-w-2xl space-y-5">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <form action={action} encType="multipart/form-data" className="space-y-5">
        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.productImageLabel}</label>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center text-gray-300 text-xs">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : t.noImage}
            </div>
            <input
              ref={fileRef}
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline text-sm">
              {t.chooseImage}
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.productNameLabel}</label>
          <input name="name" defaultValue={defaultValues.name} className="input w-full" required />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.productDescriptionLabel}</label>
          <textarea name="description" defaultValue={defaultValues.description} rows={3} className="input w-full resize-y" />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.productTypeLabel}</label>
          <select name="type" value={type} onChange={(e) => setType(e.target.value)} className="input w-full">
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.productCategoryFieldLabel}</label>
          <select name="categoryId" defaultValue={defaultValues.categoryId ?? ""} className="input w-full">
            <option value="">{t.productNoCategoryOption}</option>
            {parents.map((p) => (
              <optgroup key={p.id} label={p.name}>
                <option value={p.id}>{p.name}</option>
                {children.filter((ch) => ch.parentId === p.id).map((ch) => (
                  <option key={ch.id} value={ch.id}>  ↳ {ch.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.productUnitLabel}</label>
          <input name="unit" defaultValue={defaultValues.unit ?? "unit"} className="input w-32" placeholder={t.productUnitPlaceholder} />
        </div>

        {/* Low stock alert (REGULAR only) */}
        {type === "REGULAR" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.productLowStockLabel}</label>
            <input name="lowStockAlert" type="number" min={0} defaultValue={defaultValues.lowStockAlert ?? ""}
              className="input w-32" placeholder={t.productLowStockPlaceholder} />
          </div>
        )}

        {/* Toggles */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isOnline" value="true"
              defaultChecked={defaultValues.isOnline ?? true}
              className="rounded accent-brand" />
            {t.productShowOnline}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" value="true"
              defaultChecked={defaultValues.isActive ?? true}
              className="rounded accent-brand" />
            {c.active}
          </label>
        </div>

        {/* Options (variant axes) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">{t.productVariantOptionsLabel}</label>
            <button type="button" onClick={addOption} className="text-xs text-brand hover:underline">
              + {t.productAddOption}
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-2">{t.productOptionsHint}</p>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  name="optionName"
                  value={opt.name}
                  onChange={(e) => setOptionName(i, e.target.value)}
                  className="input flex-1"
                  placeholder={t.productOptionPlaceholder.replace("{n}", String(i + 1))}
                />
                <button type="button" onClick={() => removeOption(i)}
                  className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
              </div>
            ))}
            {options.length === 0 && (
              <p className="text-xs text-gray-400 italic">{t.productNoOptions}</p>
            )}
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <SubmitButton className="btn-primary" pendingText={c.saving}>{submitLabel ?? c.save}</SubmitButton>
          <a href="/admin/products" className="btn-outline text-sm px-4 py-2 text-center">{c.cancel}</a>
        </div>
      </form>
    </div>
  );
}
