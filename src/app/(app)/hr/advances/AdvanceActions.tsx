"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAdvance, deleteInstalment } from "./actions";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function CreateAdvanceForm({ employees }: { employees: { userId: string; name: string }[] }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const now = new Date();

  function handleSubmit(fd: FormData) {
    setError("");
    startTransition(async () => {
      const res = await createAdvance(fd);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="card">
      <h2 className="section-title text-sm mb-3">Add Salary Advance</h2>
      <form action={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select name="employeeId" required className="input" disabled={pending}>
          <option value="">Select employee…</option>
          {employees.map((e) => (
            <option key={e.userId} value={e.userId}>{e.name}</option>
          ))}
        </select>
        <input name="amount" type="number" min="1" required placeholder="Amount (MMK)" className="input" disabled={pending} />
        <input name="note" placeholder="Note" className="input" disabled={pending} />
        <select name="month" className="input" defaultValue={now.getMonth() + 1} disabled={pending}>
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <input name="year" type="number" defaultValue={now.getFullYear()} className="input" disabled={pending} />
        <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-5" disabled={pending}>
          {pending ? "Saving…" : "Add Advance"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function DeleteInstalmentButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => {
        await deleteInstalment(id);
        router.refresh();
      })}
      className="text-xs text-red-500 hover:underline disabled:opacity-60"
    >
      Delete
    </button>
  );
}
