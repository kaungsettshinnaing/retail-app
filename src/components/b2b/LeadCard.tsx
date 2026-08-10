import type { LeadListItem, StaffRow } from "@/lib/lead-types";
import { b2bDict } from "@/lib/i18n/dict/b2b";
import type { Language } from "@/lib/i18n/language";

function daysAgo(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function LeadCard({
  lead,
  onClick,
  team,
  canAssign,
  onAssign,
  lang,
}: {
  lead: LeadListItem;
  onClick: () => void;
  team?: StaffRow[];
  canAssign?: boolean;
  onAssign?: (userId: string) => void;
  lang: Language;
}) {
  const t = b2bDict[lang];
  const lastTouch = lead.activities[0]?.createdAt ?? lead.createdAt;
  const idleDays = daysAgo(lastTouch);
  const stale = idleDays >= 7 && lead.stage !== "WON" && lead.stage !== "LOST";
  const showAssign = canAssign && lead.stage === "NEW" && !lead.owner && team && team.length > 0;

  return (
    <div
      onClick={onClick}
      className="card w-full cursor-pointer p-3 text-left active:scale-[0.98] transition"
    >
      <div className="flex items-start gap-2">
        {lead.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lead.photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-gray-800 text-sm leading-snug">{lead.businessName}</span>
            {stale && <span title={`${t.staleTooltipPrefix} ${idleDays}${t.daySuffixShort}`}>⏰</span>}
          </div>
          {lead.shopField && <div className="mt-0.5 text-xs text-gray-500">{lead.shopField}</div>}
          {(lead.contactName || lead.phone) && (
            <div className="truncate text-xs text-gray-500">
              {[lead.contactName, lead.phone].filter(Boolean).join(" · ")}
            </div>
          )}
          {(lead.township || lead.city) && (
            <div className="text-xs text-gray-500">{[lead.township, lead.city].filter(Boolean).join(", ")}</div>
          )}
        </div>
      </div>

      {showAssign ? (
        <div onClick={(e) => e.stopPropagation()} className="mt-2">
          <select
            defaultValue=""
            onChange={(e) => e.target.value && onAssign?.(e.target.value)}
            className="input py-1 text-xs"
          >
            <option value="" disabled>
              {t.assignToPlaceholder}
            </option>
            {team!.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mt-2 text-xs text-gray-500">{lead.owner?.name ?? t.unassigned}</div>
      )}
    </div>
  );
}
