"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveAttendance } from "./actions";
import { hrDict } from "@/lib/i18n/dict/hr";
import type { Language } from "@/lib/i18n/language";

export default function ApproveButton({ id, lang }: { id: string; lang: Language }) {
  const t = hrDict[lang];
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => {
        await approveAttendance(id);
        router.refresh();
      })}
      className="text-xs text-brand hover:underline"
    >
      {t.approveBtn}
    </button>
  );
}
