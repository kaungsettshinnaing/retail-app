import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageAllLeads } from "@/lib/rbac";
import { BOARD_STAGES, STAGE_COLORS, type Stage } from "@/lib/pipeline";
import { b2bDict } from "@/lib/i18n/dict/b2b";

export const dynamic = "force-dynamic";

export default async function B2BDashboardPage() {
  const user = await requireSession();
  const t = b2bDict[user.language];
  const STAGE_LABELS: Record<Stage, string> = {
    NEW: t.stageNew,
    CONTACTED: t.stageContacted,
    TO_RETURN: t.stageToReturn,
    TO_ONBOARD: t.stageToOnboard,
    WON: t.stageWon,
    LOST: t.stageLost,
  };
  const scoped = canManageAllLeads(user.roles) ? {} : { ownerId: user.id };

  const leads = await prisma.lead.findMany({
    where: scoped,
    select: {
      id: true,
      businessName: true,
      stage: true,
      updatedAt: true,
      ownerId: true,
      owner: { select: { name: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  });

  const byStage: Record<Stage, number> = Object.fromEntries(BOARD_STAGES.map((s) => [s, 0])) as Record<Stage, number>;
  for (const l of leads) byStage[l.stage]++;
  const totalLeads = leads.length;
  const closed = byStage.WON + byStage.LOST;
  const conversionRate = closed > 0 ? byStage.WON / closed : 0;
  const maxCount = Math.max(1, ...BOARD_STAGES.map((s) => byStage[s]));

  const byRepMap = new Map<string, { name: string; open: number; won: number; lost: number }>();
  for (const l of leads) {
    const key = l.ownerId ?? "unassigned";
    const row = byRepMap.get(key) ?? { name: l.owner?.name ?? "Unassigned", open: 0, won: 0, lost: 0 };
    if (l.stage === "WON") row.won++;
    else if (l.stage === "LOST") row.lost++;
    else row.open++;
    byRepMap.set(key, row);
  }
  const byRep = Array.from(byRepMap.entries()).map(([id, row]) => ({ id, ...row }));

  const now = Date.now();
  const stale = leads
    .filter((l) => l.stage !== "WON" && l.stage !== "LOST")
    .map((l) => ({
      id: l.id,
      businessName: l.businessName,
      stage: l.stage,
      ownerName: l.owner?.name ?? t.unassigned,
      lastTouch: l.activities[0]?.createdAt ?? l.updatedAt,
    }))
    .filter((l) => (now - l.lastTouch.getTime()) / (1000 * 60 * 60 * 24) >= 7);

  return (
    <div className="space-y-5">
      <h1 className="section-title">{t.dashboardTitle}</h1>

      <div className="grid grid-cols-2 gap-3">
        <Stat label={t.statTotalLeads} value={String(totalLeads)} />
        <Stat label={t.statWinRate} value={`${Math.round(conversionRate * 100)}%`} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-800">{t.funnelTitle}</h2>
        <div className="card space-y-1.5 p-3">
          {BOARD_STAGES.map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs">
              <span className="w-28 shrink-0 text-gray-500">{STAGE_LABELS[s]}</span>
              <div className="h-4 flex-1 overflow-hidden rounded bg-gray-100">
                <div
                  className="h-full rounded"
                  style={{ width: `${(byStage[s] / maxCount) * 100}%`, backgroundColor: STAGE_COLORS[s] }}
                />
              </div>
              <span className="w-6 shrink-0 text-right font-medium text-gray-800">{byStage[s]}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-800">{t.byRepTitle}</h2>
        <div className="card overflow-hidden p-0">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">{t.colRep}</th>
                <th className="px-3 py-2 text-right">{t.colOpen}</th>
                <th className="px-3 py-2 text-right">{t.colWon}</th>
                <th className="px-3 py-2 text-right">{t.colLost}</th>
              </tr>
            </thead>
            <tbody>
              {byRep.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">{r.name}</td>
                  <td className="px-3 py-2 text-right">{r.open}</td>
                  <td className="px-3 py-2 text-right text-green-600">{r.won}</td>
                  <td className="px-3 py-2 text-right text-red-500">{r.lost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-800">{t.staleLeadsTitle}</h2>
        {stale.length === 0 ? (
          <p className="text-sm text-gray-500">{t.noStaleLeads}</p>
        ) : (
          <div className="space-y-1.5">
            {stale.map((l) => (
              <div key={l.id} className="card p-2 text-sm">
                <span className="font-medium text-gray-800">{l.businessName}</span>
                <span className="text-gray-500"> · {STAGE_LABELS[l.stage]} · {l.ownerName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-base font-bold text-gray-800">{value}</p>
    </div>
  );
}
