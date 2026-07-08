"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAttendance } from "./actions";

const STATUSES = ["PRESENT", "ABSENT", "LEAVE", "REST_DAY", "OT"] as const;

export default function MarkAttendanceForm({
  employees,
  today,
}: {
  employees: { userId: string; name: string }[];
  today: string;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(fd: FormData) {
    setError("");
    startTransition(async () => {
      const res = await markAttendance(fd);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="card">
      <h2 className="section-title text-sm mb-3">Mark Attendance</h2>
      <form action={handleSubmit} className="grid gap-3 sm:grid-cols-6">
        <select name="employeeId" required className="input" disabled={pending}>
          <option value="">Employee…</option>
          {employees.map((e) => (
            <option key={e.userId} value={e.userId}>{e.name}</option>
          ))}
        </select>
        <input name="date" type="date" required defaultValue={today} className="input" disabled={pending} />
        <select name="status" className="input" disabled={pending}>
          <option value="">— Clear —</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="dayType" className="input" disabled={pending} defaultValue="FULL">
          <option value="FULL">Full Day</option>
          <option value="HALF">Half Day</option>
        </select>
        <input name="note" className="input" placeholder="Note (optional)" disabled={pending} />
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Mark"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
