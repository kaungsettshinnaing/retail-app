"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/components/store/CartContext";

export default function CartPage() {
  const { lines, updateQty, removeLine, subtotal } = useCart();

  if (lines.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">Your cart is empty.</p>
        <Link href="/store" className="btn-primary inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="section-title">Your Cart</h1>
      <div className="card divide-y divide-gray-50">
        {lines.map((l) => (
          <div key={l.key} className="flex items-center gap-3 py-3 text-sm">
            <div className="flex-1">
              <p className="text-gray-800">{l.productName}</p>
              {l.optionLabel && <p className="text-xs text-gray-400">{l.optionLabel}</p>}
            </div>
            <input
              type="number"
              min={0}
              value={l.qty}
              onChange={(e) => updateQty(l.key, Number(e.target.value))}
              className="input w-16 text-xs text-center"
            />
            <span className="w-24 text-right text-gray-600">{formatMoney(l.unitPrice * l.qty)}</span>
            <button onClick={() => removeLine(l.key)} className="text-red-400 hover:text-red-600 text-xs">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="card flex items-center justify-between">
        <span className="text-sm text-gray-500">Subtotal</span>
        <span className="text-lg font-semibold text-gray-800">{formatMoney(subtotal)}</span>
      </div>

      <Link href="/store/checkout" className="btn-primary block text-center">
        Proceed to Checkout
      </Link>
    </div>
  );
}
