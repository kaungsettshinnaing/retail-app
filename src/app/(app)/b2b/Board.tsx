"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BOARD_STAGES, type Stage } from "@/lib/pipeline";
import type { LeadListItem, StaffRow } from "@/lib/lead-types";
import type { Role } from "@/lib/rbac";
import LeadCard from "@/components/b2b/LeadCard";
import LeadFormSheet from "@/components/b2b/LeadFormSheet";
import LeadDetailSheet from "@/components/b2b/LeadDetailSheet";
import { updateLead } from "./actions";
import { b2bDict } from "@/lib/i18n/dict/b2b";
import type { Language } from "@/lib/i18n/language";

export default function Board({
  leads,
  team,
  currentUser,
  canAssign,
  lang,
}: {
  leads: LeadListItem[];
  team: StaffRow[];
  currentUser: { id: string; roles: Role[] };
  canAssign: boolean;
  lang: Language;
}) {
  const t = b2bDict[lang];
  const STAGE_LABELS: Record<Stage, string> = {
    NEW: t.stageNew,
    CONTACTED: t.stageContacted,
    TO_RETURN: t.stageToReturn,
    TO_ONBOARD: t.stageToOnboard,
    WON: t.stageWon,
    LOST: t.stageLost,
  };
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  async function assign(leadId: string, userId: string) {
    const res = await updateLead(leadId, { ownerId: userId });
    if (!res.ok) {
      setError(res.error in t ? t[res.error as keyof typeof t] : res.error);
      return;
    }
    refresh();
  }

  const byStage: Record<Stage, LeadListItem[]> = Object.fromEntries(
    BOARD_STAGES.map((s) => [s, [] as LeadListItem[]])
  ) as Record<Stage, LeadListItem[]>;
  for (const lead of leads) byStage[lead.stage].push(lead);

  // Oldest last-interaction first — the ones needing attention surface at the top.
  function lastTouch(lead: LeadListItem): number {
    return (lead.activities[0]?.createdAt ?? lead.createdAt).getTime();
  }
  for (const stage of BOARD_STAGES) byStage[stage].sort((a, b) => lastTouch(a) - lastTouch(b));

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col">
      <div className="flex items-center justify-between pb-2">
        <h1 className="section-title">{t.pipelineTitle}</h1>
        <button onClick={() => setShowNew(true)} className="btn-primary text-sm px-3 py-1.5">
          {t.newLeadBtn}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
        {BOARD_STAGES.map((stage) => (
          <div key={stage} className="flex w-64 shrink-0 flex-col rounded-xl bg-black/[0.02]">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold text-gray-800">{STAGE_LABELS[stage]}</span>
              <span className="rounded-full bg-gray-200 px-2 text-xs text-gray-500">{byStage[stage].length}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-3">
              {byStage[stage].map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onClick={() => setOpenLeadId(lead.id)}
                  team={team}
                  canAssign={canAssign}
                  onAssign={(userId) => assign(lead.id, userId)}
                  lang={lang}
                />
              ))}
              {byStage[stage].length === 0 && <p className="px-1 text-xs text-gray-400">—</p>}
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <LeadFormSheet
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            refresh();
          }}
          lang={lang}
        />
      )}

      {openLeadId && (
        <LeadDetailSheet
          leadId={openLeadId}
          currentUser={currentUser}
          team={team}
          onClose={() => setOpenLeadId(null)}
          onChanged={refresh}
          onDeleted={() => {
            setOpenLeadId(null);
            refresh();
          }}
          lang={lang}
        />
      )}
    </div>
  );
}
