"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualCashEntry } from "./actions";

export default function NewEntryForm({ date }: { date: string }) {
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    setError("");
    startTransition(async () => {
      const res = await createManualCashEntry({ type, amount, description, date });
      if (!res.ok) {
        setError(res.error ?? "Something went wrong");
        return;
      }
      setAmount(0);
      setDescription("");
      router.refresh();
    });
  }

  return (
    <div className="card space-y-3">
      <div className="section-title text-base">New Manual Entry</div>
      {error && <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as "IN" | "OUT")} className="input">
            <option value="IN">Cash In</option>
            <option value="OUT">Cash Out</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Amount</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="input w-32"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm text-gray-600 block mb-1">Description</label>
          <input
            type="text"
            placeholder="e.g. Till float, petty cash withdrawal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full"
          />
        </div>
        <button disabled={pending} onClick={submit} className="btn-primary">
          Add Entry
        </button>
      </div>
    </div>
  );
}
