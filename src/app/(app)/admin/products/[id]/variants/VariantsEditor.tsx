"use client";

import { useState, useTransition, useRef } from "react";
import { createVariant, updateVariant, deleteVariant } from "./actions";
import type { ProductType } from "@prisma/client";

type Variant = {
  id: string;
  sku: string;
  optionValues: Record<string, string>;
  price: number | null;
  comparePrice: number | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

function formatPrice(v: number | null): string {
  if (v === null) return "—";
  return v.toLocaleString();
}

function VariantRow({
  variant,
  productId,
  productType,
  optionNames,
}: {
  variant: Variant;
  productId: string;
  productType: ProductType;
  optionNames: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(variant.imageUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const res = await updateVariant(productId, variant.id, formData);
      if (!res.ok) { setError(res.error); return; }
      setEditing(false);
      setError("");
    });
  }

  function handleDelete() {
    if (!confirm(`Delete variant SKU "${variant.sku}"?`)) return;
    startTransition(async () => {
      const res = await deleteVariant(productId, variant.id);
      if (!res.ok) alert(res.error);
    });
  }

  const optionDisplay = optionNames.map((n) => variant.optionValues[n] ?? "—").join(" / ");

  return (
    <>
      <tr className={!variant.isActive ? "opacity-50" : ""}>
        <td className="py-2 px-3">
          <div className="flex items-center gap-2">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-8 w-8 rounded object-cover bg-gray-100" />
            ) : (
              <div className="h-8 w-8 rounded bg-gray-100 text-gray-300 text-[10px] flex items-center justify-center">IMG</div>
            )}
            <span className="font-mono text-xs text-gray-600">{variant.sku}</span>
          </div>
        </td>
        <td className="py-2 px-3 text-sm">{optionDisplay || "—"}</td>
        <td className="py-2 px-3 text-sm">
          {productType === "CONTACT_PRICE" ? (
            <span className="badge bg-amber-100 text-amber-700">Quotation</span>
          ) : (
            <span>{formatPrice(variant.price)}</span>
          )}
        </td>
        <td className="py-2 px-3 text-sm text-gray-400">{formatPrice(variant.comparePrice)}</td>
        <td className="py-2 px-3">
          <span className={`badge ${variant.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {variant.isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="py-2 px-3 text-right space-x-2">
          <button onClick={() => setEditing(!editing)} className="text-xs text-brand hover:underline">Edit</button>
          <button onClick={handleDelete} disabled={isPending}
            className="text-xs text-red-500 hover:underline disabled:opacity-40">Delete</button>
        </td>
      </tr>
      {editing && (
        <tr>
          <td colSpan={6} className="bg-brand-light px-4 py-3">
            {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
            <form action={handleUpdate} encType="multipart/form-data" className="flex flex-wrap gap-3 items-end">
              {/* Variant image */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Image</label>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center text-gray-300 text-[10px]">
                    {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover" /> : "IMG"}
                  </div>
                  <input ref={fileRef} type="file" name="image" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreviewUrl(URL.createObjectURL(f)); }} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline text-xs px-2 py-1">Choose</button>
                </div>
              </div>

              {/* Option values */}
              {optionNames.map((name) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">{name}</label>
                  <input name={`optionValue[${name}]`} defaultValue={variant.optionValues[name] ?? ""}
                    className="input w-28" placeholder={name} />
                </div>
              ))}

              {/* SKU */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">SKU *</label>
                <input name="sku" defaultValue={variant.sku} className="input w-32 font-mono" required />
              </div>

              {/* Price */}
              {productType !== "CONTACT_PRICE" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Price</label>
                    <input name="price" type="number" min={0} defaultValue={variant.price ?? ""}
                      className="input w-28" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Compare Price</label>
                    <input name="comparePrice" type="number" min={0} defaultValue={variant.comparePrice ?? ""}
                      className="input w-28" placeholder="optional" />
                  </div>
                </>
              )}

              {/* Sort + active */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Sort</label>
                <input name="sortOrder" type="number" defaultValue={variant.sortOrder} className="input w-16" />
              </div>
              <label className="flex items-center gap-1 text-xs self-end pb-1">
                <input type="checkbox" name="isActive" value="true" defaultChecked={variant.isActive} />
                Active
              </label>

              <div className="flex gap-2 self-end">
                <button type="submit" disabled={isPending} className="btn-primary text-xs px-3 py-1.5">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="btn-outline text-xs px-3 py-1.5">Cancel</button>
              </div>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

function AddVariantForm({
  productId,
  productType,
  optionNames,
}: {
  productId: string;
  productType: ProductType;
  optionNames: string[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const res = await createVariant(productId, formData);
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      setError("");
      setPreviewUrl(null);
      formRef.current?.reset();
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary text-sm">+ Add Variant</button>
    );
  }

  return (
    <div className="card bg-brand-light">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">New Variant</h3>
      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
      <form ref={formRef} action={handleCreate} encType="multipart/form-data" className="flex flex-wrap gap-3 items-end">
        {/* Image */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Image</label>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded border border-gray-200 overflow-hidden bg-white flex items-center justify-center text-gray-300 text-[10px]">
              {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover" /> : "IMG"}
            </div>
            <input ref={fileRef} type="file" name="image" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreviewUrl(URL.createObjectURL(f)); }} />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline text-xs px-2 py-1">Choose</button>
          </div>
        </div>

        {optionNames.map((name) => (
          <div key={name}>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">{name}</label>
            <input name={`optionValue[${name}]`} className="input w-28" placeholder={name} />
          </div>
        ))}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">SKU *</label>
          <input name="sku" className="input w-32 font-mono" required placeholder="SKU-001" />
        </div>

        {productType !== "CONTACT_PRICE" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Price</label>
              <input name="price" type="number" min={0} className="input w-28" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Compare Price</label>
              <input name="comparePrice" type="number" min={0} className="input w-28" placeholder="optional" />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Sort</label>
          <input name="sortOrder" type="number" defaultValue={0} className="input w-16" />
        </div>

        <div className="flex gap-2 self-end">
          <button type="submit" disabled={isPending} className="btn-primary text-sm">
            {isPending ? "Saving…" : "Add"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn-outline text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default function VariantsEditor({
  productId,
  productType,
  optionNames,
  variants,
}: {
  productId: string;
  productType: ProductType;
  optionNames: string[];
  variants: Variant[];
}) {
  return (
    <div className="space-y-4">
      <AddVariantForm productId={productId} productType={productType} optionNames={optionNames} />

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">SKU</th>
              <th className="py-2 px-3 text-left">
                {optionNames.length > 0 ? optionNames.join(" / ") : "Variant"}
              </th>
              <th className="py-2 px-3 text-left">Price</th>
              <th className="py-2 px-3 text-left">Compare</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {variants.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  No variants yet — add one above.
                </td>
              </tr>
            ) : (
              variants.map((v) => (
                <VariantRow
                  key={v.id}
                  variant={v}
                  productId={productId}
                  productType={productType}
                  optionNames={optionNames}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
