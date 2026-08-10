export const STAGES = ["NEW", "CONTACTED", "TO_RETURN", "TO_ONBOARD", "WON", "LOST"] as const;

export type Stage = (typeof STAGES)[number];

// Stages shown as board columns, in order — WON/LOST are terminal and shown
// as thin columns at the end rather than mixed into the active pipeline flow.
export const BOARD_STAGES: Stage[] = ["NEW", "CONTACTED", "TO_RETURN", "TO_ONBOARD", "WON", "LOST"];

export const STAGE_LABELS: Record<Stage, string> = {
  NEW: "New Lead",
  CONTACTED: "Contacted",
  TO_RETURN: "To Return",
  TO_ONBOARD: "To Onboard",
  WON: "Won",
  LOST: "Lost",
};

export const STAGE_COLORS: Record<Stage, string> = {
  NEW: "#5b6b94",
  CONTACTED: "#0ea5e9",
  TO_RETURN: "#c17f0a",
  TO_ONBOARD: "#f0206a",
  WON: "#1baa6a",
  LOST: "#9ca3af",
};

// Forward path through the funnel — used to render "move to next stage".
export function nextStage(stage: Stage): Stage | null {
  const order: Stage[] = ["NEW", "CONTACTED", "TO_RETURN", "TO_ONBOARD", "WON"];
  const i = order.indexOf(stage);
  if (i === -1 || i === order.length - 1) return null;
  return order[i + 1];
}

export const ACTIVITY_TYPES = ["CALL", "MEETING", "NOTE", "EMAIL", "TASK"] as const;
export type ActivityKind = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_LABELS: Record<ActivityKind, string> = {
  CALL: "Call",
  MEETING: "Meeting",
  NOTE: "Note",
  EMAIL: "Email",
  TASK: "Task",
};

export const ACTIVITY_ICONS: Record<ActivityKind, string> = {
  CALL: "📞",
  MEETING: "🤝",
  NOTE: "📝",
  EMAIL: "✉️",
  TASK: "☑️",
};
