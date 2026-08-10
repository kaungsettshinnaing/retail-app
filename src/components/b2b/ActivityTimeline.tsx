"use client";

import { useState } from "react";
import { addActivity } from "@/app/(app)/b2b/actions";
import { ACTIVITY_TYPES, ACTIVITY_ICONS, type ActivityKind } from "@/lib/pipeline";
import type { ActivityItem } from "@/lib/lead-types";
import { b2bDict } from "@/lib/i18n/dict/b2b";
import type { Language } from "@/lib/i18n/language";

function formatWhen(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function ActivityTimeline({
  leadId,
  activities,
  onAdded,
  lang,
}: {
  leadId: string;
  activities: ActivityItem[];
  onAdded: (activity: ActivityItem) => void;
  lang: Language;
}) {
  const t = b2bDict[lang];
  const ACTIVITY_LABELS: Record<ActivityKind, string> = {
    CALL: t.activityCall,
    MEETING: t.activityMeeting,
    NOTE: t.activityNote,
    EMAIL: t.activityEmail,
    TASK: t.activityTask,
  };
  const [type, setType] = useState<ActivityKind>("NOTE");
  const [content, setContent] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    const res = await addActivity(leadId, {
      type,
      content,
      dueAt: type === "TASK" && dueAt ? new Date(dueAt).toISOString() : null,
    });
    if (!res.ok) {
      setError(res.error in t ? t[res.error as keyof typeof t] : res.error);
      setSaving(false);
      return;
    }
    onAdded(res.activity);
    setContent("");
    setDueAt("");
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 p-3 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full px-2.5 py-1 text-xs ${
                type === t ? "bg-brand text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {ACTIVITY_ICONS[t]} {ACTIVITY_LABELS[t]}
            </button>
          ))}
        </div>
        <textarea
          className="input"
          rows={2}
          placeholder={type === "TASK" ? t.taskContentPlaceholder : t.noteContentPlaceholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {type === "TASK" && (
          <input
            type="datetime-local"
            className="input"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button onClick={submit} disabled={saving || !content.trim()} className="btn-primary w-full text-sm py-2">
          {saving ? t.savingEllipsis : t.logBtn}
        </button>
      </div>

      <div className="space-y-2">
        {activities.length === 0 && <p className="text-sm text-gray-500">{t.noActivityYet}</p>}
        {activities.map((a) => (
          <div key={a.id} className="flex gap-2 text-sm">
            <span>{ACTIVITY_ICONS[a.type]}</span>
            <div className="flex-1">
              <p className="text-gray-800">{a.content}</p>
              <p className="text-xs text-gray-500">
                {a.createdBy.name} · {formatWhen(a.createdAt)}
                {a.dueAt && ` · ${t.dueLabel} ${formatWhen(a.dueAt)}`}
                {a.completedAt && ` · ✅ ${t.doneLabel}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
