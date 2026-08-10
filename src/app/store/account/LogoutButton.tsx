"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutCustomer } from "./actions";
import { storeDict } from "@/lib/i18n/dict/store";
import type { Language } from "@/lib/i18n/language";

export default function LogoutButton({ lang }: { lang: Language }) {
  const t = storeDict[lang];
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await logoutCustomer();
          router.push("/store");
          router.refresh();
        })
      }
      className="btn-outline text-sm"
    >
      {t.signOut}
    </button>
  );
}
