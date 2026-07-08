"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutCustomer } from "./actions";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await logoutCustomer();
          router.push("/store");
          router.refresh();
        })
      }
      className="btn-outline text-sm"
    >
      Sign Out
    </button>
  );
}
