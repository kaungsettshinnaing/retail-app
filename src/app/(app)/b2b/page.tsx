import { requireSession } from "@/lib/auth";
import { canManageAllLeads } from "@/lib/rbac";
import { getLeadsForUser, getTeam } from "./data";
import Board from "./Board";

export const dynamic = "force-dynamic";

export default async function B2BPipelinePage() {
  const user = await requireSession();
  const [leads, team] = await Promise.all([getLeadsForUser(user), getTeam()]);

  return (
    <Board
      leads={leads}
      team={team}
      currentUser={{ id: user.id, roles: user.roles }}
      canAssign={canManageAllLeads(user.roles)}
      lang={user.language}
    />
  );
}
