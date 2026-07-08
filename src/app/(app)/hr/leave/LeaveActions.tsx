"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLeaveRequest, reviewLeave } from "./actions";

export function LeaveRequestForm({ employees }: { employees: { userId: string; name: string }[] }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(fd: FormData) {
    setError("");
    startTransition(async () => {
      const res = await createLeaveRequest(fd);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="card">
      <h2 className="section-title text-sm mb-3">Log Leave Request</h2>
      <form action={handleSubmit} className="grid gap-3 sm:grid-cols-5">
        <select name="employeeId" required className="input" disabled={pending}>
          <option value="">Employee…</option>
          {employees.map((e) => (
            <option key={e.userId} value={e.userId}>{e.name}</option>
          ))}
        </select>
        <input name="startDate" type="date" required className="input" disabled={pending} />
        <input name="endDate" type="date" required className="input" disabled={pending} />
        <input name="reason" className="input" placeholder="Reason (optional)" disabled={pending} />
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Log Request"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function LeaveReviewButtons({ id }: { id: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function decide(decision: "APPROVED" | "REJECTED") {
    setError("");
    startTransition(async () => {
      const res = await reviewLeave(id, decision);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button disabled={pending} onClick={() => decide("APPROVED")}
        className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-60">
        Approve
      </button>
      <button disabled={pending} onClick={() => decide("REJECTED")}
        className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-60">
        Reject
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
