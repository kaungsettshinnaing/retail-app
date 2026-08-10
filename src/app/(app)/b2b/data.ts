import { prisma } from "@/lib/db";
import { canManageAllLeads } from "@/lib/rbac";
import type { SessionUser } from "@/lib/auth";
import type { LeadListItem, StaffRow } from "@/lib/lead-types";

export async function getLeadsForUser(user: SessionUser): Promise<LeadListItem[]> {
  const scoped = canManageAllLeads(user.roles) ? {} : { ownerId: user.id };
  return prisma.lead.findMany({
    where: scoped,
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { activities: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTeam(): Promise<StaffRow[]> {
  return prisma.user.findMany({
    where: { isActive: true, roles: { hasSome: ["BD_REP", "BD_LEAD", "MANAGER", "ADMIN"] } },
    select: { id: true, name: true, roles: true },
    orderBy: { name: "asc" },
  });
}
