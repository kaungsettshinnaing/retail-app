import { requireSession } from "@/lib/auth";
import { landingFor, type Role } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const user = await requireSession();
  const landing = landingFor(user.roles as Role[]);
  redirect(landing ?? "/login");
}
