"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { storeDict } from "@/lib/i18n/dict/store";
import LanguageSwitch from "@/components/LanguageSwitch";
import type { Language } from "@/lib/i18n/language";

export default function StoreNav({
  customerName,
  isB2B,
  lang,
}: {
  customerName: string | null;
  isB2B?: boolean;
  lang: Language;
}) {
  const { count } = useCart();
  const t = storeDict[lang];
  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/store" className="text-gray-600 hover:text-brand">
        {t.navShop}
      </Link>
      <Link href="/store/cart" className="text-gray-600 hover:text-brand">
        {t.navCart} {count > 0 && <span className="badge bg-brand text-white ml-1">{count}</span>}
      </Link>
      {customerName ? (
        <Link href="/store/account" className="text-gray-600 hover:text-brand">
          {customerName}
          {isB2B && <span className="badge bg-brand text-white ml-1.5 text-[10px]">{t.navWholesale}</span>}
        </Link>
      ) : (
        <Link href="/store/account/login" className="text-gray-600 hover:text-brand">
          {t.navSignIn}
        </Link>
      )}
      <LanguageSwitch lang={lang} />
    </nav>
  );
}
