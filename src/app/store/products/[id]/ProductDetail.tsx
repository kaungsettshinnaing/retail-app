"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/components/store/CartContext";
import { submitInquiry } from "./actions";

type Variant = {
  id: string;
  sku: string;
  optionValues: unknown;
  price: number | null;
  comparePrice: number | null;
  imageUrl: string | null;
  stock: number;
};
type Product = {
  id: string;
  name: string;
  description: string | null;
  type: "REGULAR" | "PASS_THROUGH" | "CONTACT_PRICE";
  unit: string;
  imageUrl: string | null;
  variants: Variant[];
  category: { name: string } | null;
};

function optionLabel(optionValues: unknown): string {
  const opts = optionValues as Record<string, string> | null;
  return opts && Object.keys(opts).length ? Object.values(opts).join(" / ") : "";
}

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedId, setSelectedId] = useState(product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addLine } = useCart();

  const selected = product.variants.find((v) => v.id === selectedId) ?? null;

  function handleAddToCart() {
    if (product.type === "REGULAR" && (!selected || selected.stock <= 0)) return;
    if (!selected) return;
    addLine({
      key: selected.id,
      productId: product.id,
      productName: product.name,
      productType: product.type,
      variantId: selected.id,
      sku: selected.sku,
      optionLabel: optionLabel(selected.optionValues),
      unitPrice: selected.price ?? 0,
      qty,
      maxStock: product.type === "REGULAR" ? selected.stock : null,
      imageUrl: selected.imageUrl ?? product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="aspect-square bg-gray-100 rounded overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-300 text-sm">No image</span>
        )}
      </div>

      <div className="space-y-4">
        {product.category && <p className="text-xs text-gray-400 uppercase tracking-wide">{product.category.name}</p>}
        <h1 className="text-2xl font-semibold text-gray-800">{product.name}</h1>
        {product.description && <p className="text-sm text-gray-500">{product.description}</p>}

        {product.type === "CONTACT_PRICE" ? (
          <InquirySection productId={product.id} />
        ) : (
          <>
            <p className="text-xl font-semibold text-brand">
              {selected?.price != null ? formatMoney(selected.price) : "—"}
              {selected?.comparePrice != null && selected.comparePrice > (selected.price ?? 0) && (
                <span className="ml-2 text-sm text-gray-400 line-through">{formatMoney(selected.comparePrice)}</span>
              )}
            </p>

            {product.variants.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className={`badge border ${v.id === selectedId ? "border-brand text-brand" : "border-gray-200 text-gray-500"}`}
                  >
                    {optionLabel(v.optionValues) || v.sku}
                  </button>
                ))}
              </div>
            )}

            {product.type === "REGULAR" && (
              <p className="text-sm text-gray-500">
                {selected && selected.stock > 0 ? `${selected.stock} ${product.unit} in stock` : "Out of stock"}
              </p>
            )}
            {product.type === "PASS_THROUGH" && <p className="text-sm text-blue-600">Available to order — supplied on demand</p>}

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="input w-20 text-center"
              />
              <button
                onClick={handleAddToCart}
                disabled={product.type === "REGULAR" && (!selected || selected.stock <= 0)}
                className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {added ? "Added!" : "Add to Cart"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InquirySection({ productId }: { productId: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const res = await submitInquiry({ productId, contactName: name, contactPhone: phone, contactEmail: email, message });
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
        Thanks! We&apos;ll contact you with a price shortly.
      </div>
    );
  }

  return (
    <div className="card space-y-2">
      <p className="text-sm font-medium text-gray-700">Contact for Price</p>
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input w-full text-sm" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="input w-full text-sm" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="input w-full text-sm" />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message (optional)" rows={3} className="input w-full text-sm" />
      <button onClick={handleSubmit} disabled={submitting || !name || !phone} className="btn-primary w-full">
        {submitting ? "Sending…" : "Request Price"}
      </button>
    </div>
  );
}
