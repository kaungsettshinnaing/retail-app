import { STAGE_COLORS, type Stage } from "@/lib/pipeline";
import { b2bDict } from "@/lib/i18n/dict/b2b";
import type { Language } from "@/lib/i18n/language";

export default function StageBadge({ stage, lang }: { stage: Stage; lang: Language }) {
  const t = b2bDict[lang];
  const STAGE_LABELS: Record<Stage, string> = {
    NEW: t.stageNew,
    CONTACTED: t.stageContacted,
    TO_RETURN: t.stageToReturn,
    TO_ONBOARD: t.stageToOnboard,
    WON: t.stageWon,
    LOST: t.stageLost,
  };
  return (
    <span className="badge text-white" style={{ backgroundColor: STAGE_COLORS[stage] }}>
      {STAGE_LABELS[stage]}
    </span>
  );
}
