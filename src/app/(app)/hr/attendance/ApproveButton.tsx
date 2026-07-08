"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveAttendance } from "./actions";

export default function ApproveButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => {
        await approveAttendance(id);
        router.refresh();
      })}
      className="text-xs text-brand hover:underline"
    >
      Approve
    </button>
  );
}
