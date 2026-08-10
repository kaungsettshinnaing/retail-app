"use client";

import { useEffect, useRef, useState } from "react";
import ModalSheet from "./ModalSheet";
import ActivityTimeline from "./ActivityTimeline";
import StageBadge from "./StageBadge";
import {
  getLead,
  updateLead,
  deleteLead,
  uploadLeadPhoto,
  convertLeadToCustomer,
} from "@/app/(app)/b2b/actions";
import { BOARD_STAGES, nextStage, type Stage } from "@/lib/pipeline";
import type { LeadDetail, StaffRow, ActivityItem } from "@/lib/lead-types";
import type { Role } from "@/lib/rbac";
import { b2bDict } from "@/lib/i18n/dict/b2b";
import { commonDict } from "@/lib/i18n/dict/common";
import type { Language } from "@/lib/i18n/language";

export default function LeadDetailSheet({
  leadId,
  currentUser,
  team,
  onClose,
  onChanged,
  onDeleted,
  lang,
}: {
  leadId: string;
  currentUser: { id: string; roles: Role[] };
  team: StaffRow[];
  onClose: () => void;
  onChanged: () => void;
  onDeleted: () => void;
  lang: Language;
}) {
  const t = b2bDict[lang];
  const c = commonDict[lang];
  const STAGE_LABELS: Record<Stage, string> = {
    NEW: t.stageNew,
    CONTACTED: t.stageContacted,
    TO_RETURN: t.stageToReturn,
    TO_ONBOARD: t.stageToOnboard,
    WON: t.stageWon,
    LOST: t.stageLost,
  };
  const canManageAll = currentUser.roles.some((r) => r === "ADMIN" || r === "MANAGER" || r === "BD_LEAD");

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lostReasonDraft, setLostReasonDraft] = useState("");
  const [mapsURLDraft, setMapsURLDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getLead(leadId).then((l) => {
      if (!l) {
        setError(t.errLeadNotFound);
        return;
      }
      setLead(l);
      setMapsURLDraft(l.mapsURL ?? "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  async function patch(body: Parameters<typeof updateLead>[1]) {
    setBusy(true);
    setError(null);
    const res = await updateLead(leadId, body);
    if (!res.ok) {
      setError(res.error in t ? t[res.error as keyof typeof t] : res.error);
      setBusy(false);
      return;
    }
    setLead(res.lead);
    onChanged();
    setBusy(false);
  }

  async function uploadPhoto(file: File) {
    setUploadingPhoto(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    const res = await uploadLeadPhoto(leadId, form);
    if (!res.ok) {
      setError(res.error in t ? t[res.error as keyof typeof t] : res.error);
      setUploadingPhoto(false);
      return;
    }
    setLead((prev) => (prev ? { ...prev, photoUrl: res.photoUrl } : prev));
    onChanged();
    setUploadingPhoto(false);
  }

  async function convert() {
    setBusy(true);
    setError(null);
    const res = await convertLeadToCustomer(leadId);
    if (!res.ok) {
      setError(res.error in t ? t[res.error as keyof typeof t] : res.error);
      setBusy(false);
      return;
    }
    setLead((prev) => (prev ? { ...prev, convertedCustomerId: res.customerId } : prev));
    onChanged();
    setBusy(false);
  }

  function handleActivityAdded(activity: ActivityItem) {
    setLead((prev) => (prev ? { ...prev, activities: [activity, ...prev.activities] } : prev));
    onChanged();
  }

  async function remove() {
    setBusy(true);
    setError(null);
    const res = await deleteLead(leadId);
    if (!res.ok) {
      setError(res.error in t ? t[res.error as keyof typeof t] : res.error);
      setBusy(false);
      return;
    }
    onDeleted();
  }

  if (error && !lead) {
    return (
      <ModalSheet title={t.leadModalFallbackTitle} onClose={onClose} lang={lang}>
        <p className="text-sm text-red-600">{error}</p>
      </ModalSheet>
    );
  }
  if (!lead) {
    return (
      <ModalSheet title={t.leadModalFallbackTitle} onClose={onClose} lang={lang}>
        <p className="text-sm text-gray-500">{t.loadingEllipsis}</p>
      </ModalSheet>
    );
  }

  const next = nextStage(lead.stage);
  const terminal = lead.stage === "WON" || lead.stage === "LOST";
  const canDelete = canManageAll || lead.owner?.id === currentUser.id;

  return (
    <ModalSheet title={lead.businessName} onClose={onClose} wide lang={lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StageBadge stage={lead.stage} lang={lang} />
          <span className="text-xs text-gray-500">{t.ownerLabelPrefix} {lead.owner?.name ?? t.unassigned}</span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <div className="shrink-0">
            {lead.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lead.photoUrl} alt="Shop" className="h-20 w-20 rounded-xl object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 text-2xl">🏪</div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="mt-1 w-20 rounded-lg border border-gray-200 py-1 text-[10px] text-gray-500 disabled:opacity-50"
            >
              {uploadingPhoto ? t.uploadingEllipsis : lead.photoUrl ? t.replaceBtn : t.addPhotoBtn}
            </button>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-2 text-sm text-gray-800">
            {lead.contactName && <div>👤 {lead.contactName}</div>}
            {lead.phone && <div>📞 {lead.phone}</div>}
            {lead.shopField && <div>🏷️ {lead.shopField}</div>}
            {(lead.township || lead.city) && <div>📍 {[lead.township, lead.city].filter(Boolean).join(", ")}</div>}
            {lead.mapsURL && (
              <a href={lead.mapsURL} target="_blank" rel="noreferrer" className="text-brand underline">
                {t.googleMapLinkText}
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <input className="input" placeholder={t.mapsLinkPlaceholder} value={mapsURLDraft} onChange={(e) => setMapsURLDraft(e.target.value)} />
          <button disabled={busy} onClick={() => patch({ mapsURL: mapsURLDraft })} className="btn-outline shrink-0 text-xs">
            {t.saveBtn}
          </button>
        </div>

        {lead.notes && <p className="rounded-lg bg-gray-50 p-2 text-sm text-gray-500">{lead.notes}</p>}

        {!terminal && (
          <div className="flex flex-wrap gap-2">
            {next && (
              <button disabled={busy} onClick={() => patch({ stage: next })} className="btn-primary text-xs px-3 py-2">
                {t.moveToPrefix} {STAGE_LABELS[next]} →
              </button>
            )}
            <select
              disabled={busy}
              value=""
              onChange={(e) => e.target.value && patch({ stage: e.target.value as Stage })}
              className="input py-2 text-xs w-auto"
            >
              <option value="">{t.jumpToStagePlaceholder}</option>
              {BOARD_STAGES.filter((s) => s !== lead.stage).map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        )}

        {lead.stage === "LOST" && (
          <div className="rounded-lg bg-gray-50 p-2 text-sm">
            <p className="font-medium text-gray-800">{t.lostReasonTitle}</p>
            <p className="text-gray-500">{lead.lostReason || "—"}</p>
          </div>
        )}

        {lead.stage !== "LOST" && (
          <div className="rounded-lg border border-gray-200 p-2 space-y-1">
            <p className="text-xs font-medium text-gray-500">{t.markAsLostTitle}</p>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder={t.reasonRequiredPlaceholder}
                value={lostReasonDraft}
                onChange={(e) => setLostReasonDraft(e.target.value)}
              />
              <button
                disabled={busy || !lostReasonDraft.trim()}
                onClick={() => patch({ stage: "LOST", lostReason: lostReasonDraft })}
                className="btn-danger shrink-0 text-xs px-3 py-2"
              >
                {t.markLostBtn}
              </button>
            </div>
          </div>
        )}

        {lead.stage === "WON" && (
          <div className="rounded-lg border border-green-200 p-2 space-y-1">
            {lead.convertedCustomerId ? (
              <p className="text-xs font-medium text-green-700">
                {t.convertedMessagePrefix}{" "}
                <a href="/b2b/customers" className="underline">
                  {t.customersTabLinkText}
                </a>{" "}
                {t.convertedMessageSuffix}
              </p>
            ) : (
              <>
                <p className="text-xs font-medium text-gray-500">{t.wonMessage}</p>
                <button disabled={busy} onClick={convert} className="btn-primary text-xs px-3 py-2">
                  {t.convertToCustomerBtn}
                </button>
              </>
            )}
          </div>
        )}

        {canManageAll && (
          <div>
            <label className="text-xs font-medium text-gray-500">{t.ownerFieldLabel}</label>
            <select
              disabled={busy}
              value={lead.owner?.id ?? ""}
              onChange={(e) => patch({ ownerId: e.target.value || null })}
              className="input"
            >
              <option value="">{t.unassigned}</option>
              {team.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roles.join(", ")})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">{t.activityTitle}</p>
          <ActivityTimeline leadId={lead.id} activities={lead.activities} onAdded={handleActivityAdded} lang={lang} />
        </div>

        {canDelete && (
          <div className="border-t border-gray-200 pt-3">
            {confirmingDelete ? (
              <div className="flex items-center gap-2">
                <p className="flex-1 text-xs text-red-600">{t.deleteLeadConfirmText}</p>
                <button disabled={busy} onClick={remove} className="btn-danger shrink-0 text-xs px-3 py-2">
                  {busy ? t.deletingEllipsis : t.confirmDeleteBtn}
                </button>
                <button disabled={busy} onClick={() => setConfirmingDelete(false)} className="btn-outline shrink-0 text-xs px-3 py-2">
                  {c.cancel}
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmingDelete(true)} className="text-xs text-red-600 underline">
                {t.deleteLeadLink}
              </button>
            )}
          </div>
        )}
      </div>
    </ModalSheet>
  );
}
