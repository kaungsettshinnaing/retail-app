"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function StoreNav({ customerName }: { customerName: string | null }) {
  const { count } = useCart();
  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/store" className="text-gray-600 hover:text-brand">
        Shop
      </Link>
      <Link href="/store/cart" className="text-gray-600 hover:text-brand">
        Cart {count > 0 && <span className="badge bg-brand text-white ml-1">{count}</span>}
      </Link>
      {customerName ? (
        <Link href="/store/account" className="text-gray-600 hover:text-brand">
          {customerName}
        </Link>
      ) : (
        <Link href="/store/account/login" className="text-gray-600 hover:text-brand">
          Sign in
        </Link>
      )}
    </nav>
  );
}
