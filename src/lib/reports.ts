// Shared helpers for the Reports module — date-range parsing + month enumeration.

export type DateRange = {
  fromStr: string; // YYYY-MM-DD
  toStr: string; // YYYY-MM-DD
  from: Date; // inclusive, UTC midnight
  to: Date; // exclusive, UTC midnight of the day after `toStr`
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses from/to query params, defaulting to the current month-to-date. */
export function getDateRange(fromParam?: string, toParam?: string): DateRange {
  const fromStr = fromParam && DATE_RE.test(fromParam) ? fromParam : firstOfMonthStr();
  const toStr = toParam && DATE_RE.test(toParam) ? toParam : todayStr();

  const from = new Date(`${fromStr}T00:00:00.000Z`);
  const to = new Date(`${toStr}T00:00:00.000Z`);
  to.setUTCDate(to.getUTCDate() + 1); // exclusive upper bound

  return { fromStr, toStr, from, to };
}

/** Enumerates every {month, year} pair (1-12, calendar year) touched by [from, to]. */
export function monthsInRange(from: Date, to: Date): { month: number; year: number }[] {
  const months: { month: number; year: number }[] = [];
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
  while (cursor <= end) {
    months.push({ month: cursor.getUTCMonth() + 1, year: cursor.getUTCFullYear() });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

export function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
