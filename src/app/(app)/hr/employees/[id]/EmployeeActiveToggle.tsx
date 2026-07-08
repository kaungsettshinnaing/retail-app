"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleEmployeeActive } from "../actions";

export default function EmployeeActiveToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    setError("");
    startTransition(async () => {
      const res = await toggleEmployeeActive(userId, !isActive);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={pending}
        onClick={toggle}
        className={`btn-outline text-sm px-4 py-2 ${isActive ? "text-red-600" : "text-green-700"}`}
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
