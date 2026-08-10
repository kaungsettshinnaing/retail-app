"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ModuleDef } from "@/lib/rbac";
import { navDict } from "@/lib/i18n/dict/nav";
import type { Language } from "@/lib/i18n/language";

const MODULE_KEY: Record<string, keyof typeof navDict.EN> = {
  pos: "pos",
  warehouse: "warehouse",
  accounting: "accounting",
  reports: "reports",
  hr: "hr",
  b2b: "b2b",
  admin: "admin",
};

export default function NavBar({ modules, lang }: { modules: ModuleDef[]; lang: Language }) {
  const path = usePathname();
  const t = navDict[lang];
  return (
    <nav className="scrollbar-none flex overflow-x-auto sm:overflow-x-visible sm:flex-wrap py-0.5 gap-0.5">
      {modules.map((m) => {
        const active = path === m.href || path.startsWith(m.href + "/");
        return (
          <Link
            key={m.key}
            href={m.href}
            className={
              "flex-shrink-0 px-3.5 py-1.5 text-sm font-medium transition-all rounded-full " +
              (active
                ? "bg-accent text-brand-dark shadow-sm"
                : "text-white/80 hover:bg-white/15 hover:text-white")
            }
          >
            <span className="mr-1 text-xs">{m.icon}</span>
            {t[MODULE_KEY[m.key]] ?? m.label}
          </Link>
        );
      })}
    </nav>
  );
}
