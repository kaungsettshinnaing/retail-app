"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession, hashPassword, type SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageAllLeads, type Role } from "@/lib/rbac";
import { saveUpload } from "@/lib/upload";
import type { LeadListItem, LeadDetail, ActivityItem } from "@/lib/lead-types";

const B2B_ROLES: Role[] = ["BD_REP", "BD_LEAD", "MANAGER", "ADMIN"];

async function requireB2BUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error("errNotSignedIn");
  if (!user.roles.some((r) => B2B_ROLES.includes(r))) throw new Error("errNotAuthorized");
  return user;
}

function assertLeadAccess(roles: Role[], ownerId: string | null, userId: string) {
  if (canManageAllLeads(roles)) return;
  if (ownerId !== userId) throw new Error("errNotAuthorizedModifyLead");
}

const leadCreateSchema = z.object({
  businessName: z.string().min(1),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  shopField: z.string().optional(),
  mapsURL: z.string().optional(),
  address: z.string().optional(),
  township: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  ownerId: z.string().nullable().optional(),
});

export async function createLead(
  input: z.infer<typeof leadCreateSchema>,
): Promise<{ ok: true; lead: LeadListItem } | { ok: false; error: string }> {
  try {
    const user = await requireB2BUser();
    const parsed = leadCreateSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
    const body = parsed.data;

    // BD_REP always self-assigns. BD_LEAD/MANAGER/ADMIN may assign to anyone,
    // or leave it unassigned (null) to triage later.
    const ownerId = canManageAllLeads(user.roles) ? (body.ownerId ?? null) : user.id;

    const lead = await prisma.lead.create({
      data: {
        businessName: body.businessName.trim(),
        contactName: body.contactName?.trim() || null,
        phone: body.phone?.trim() || null,
        shopField: body.shopField?.trim() || null,
        mapsURL: body.mapsURL?.trim() || null,
        address: body.address?.trim() || null,
        township: body.township?.trim() || null,
        city: body.city?.trim() || null,
        notes: body.notes?.trim() || null,
        ownerId,
      },
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { activities: true } },
      },
    });
    revalidatePath("/b2b");
    revalidatePath("/b2b/dashboard");
    return { ok: true, lead: { ...lead, activities: [] } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "errFailedToCreateLead" };
  }
}

const leadPatchSchema = z.object({
  stage: z.enum(["NEW", "CONTACTED", "TO_RETURN", "TO_ONBOARD", "WON", "LOST"]).optional(),
  mapsURL: z.string().optional(),
  notes: z.string().optional(),
  lostReason: z.string().optional(),
  ownerId: z.string().nullable().optional(),
});

export async function updateLead(
  leadId: string,
  patch: z.infer<typeof leadPatchSchema>,
): Promise<{ ok: true; lead: LeadDetail } | { ok: false; error: string }> {
  try {
    const user = await requireB2BUser();
    const parsed = leadPatchSchema.safeParse(patch);
    if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
    const body = parsed.data;

    const existing = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!existing) return { ok: false, error: "errLeadNotFound" };
    assertLeadAccess(user.roles, existing.ownerId, user.id);

    if (body.ownerId !== undefined && !canManageAllLeads(user.roles)) {
      return { ok: false, error: "errOnlyLeadsManagersReassign" };
    }
    if (body.stage === "LOST" && !body.lostReason?.trim()) {
      return { ok: false, error: "errLostReasonRequired" };
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...(body.stage !== undefined ? { stage: body.stage } : {}),
        ...(body.mapsURL !== undefined ? { mapsURL: body.mapsURL || null } : {}),
        ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
        ...(body.lostReason !== undefined ? { lostReason: body.lostReason || null } : {}),
        ...(body.ownerId !== undefined ? { ownerId: body.ownerId } : {}),
      },
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { activities: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { id: true, name: true } } },
        },
      },
    });
    revalidatePath("/b2b");
    revalidatePath("/b2b/dashboard");
    return { ok: true, lead };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "errUpdateFailed" };
  }
}

const activitySchema = z.object({
  type: z.enum(["CALL", "MEETING", "NOTE", "EMAIL", "TASK"]),
  content: z.string().min(1),
  dueAt: z.string().nullable().optional(),
});

export async function addActivity(
  leadId: string,
  input: z.infer<typeof activitySchema>,
): Promise<{ ok: true; activity: ActivityItem } | { ok: false; error: string }> {
  try {
    const user = await requireB2BUser();
    const parsed = activitySchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { ok: false, error: "errLeadNotFound" };
    assertLeadAccess(user.roles, lead.ownerId, user.id);

    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        type: parsed.data.type,
        content: parsed.data.content.trim(),
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
        createdById: user.id,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    revalidatePath("/b2b");
    return { ok: true, activity };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "errFailedToLogActivity" };
  }
}

export async function deleteLead(leadId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await requireB2BUser();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { ok: false, error: "errLeadNotFound" };
    assertLeadAccess(user.roles, lead.ownerId, user.id);

    await prisma.lead.delete({ where: { id: leadId } });
    revalidatePath("/b2b");
    revalidatePath("/b2b/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "errDeleteFailed" };
  }
}

export async function uploadLeadPhoto(
  leadId: string,
  formData: FormData,
): Promise<{ ok: true; photoUrl: string } | { ok: false; error: string }> {
  try {
    const user = await requireB2BUser();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { ok: false, error: "errLeadNotFound" };
    assertLeadAccess(user.roles, lead.ownerId, user.id);

    const file = formData.get("file");
    if (!(file instanceof File)) return { ok: false, error: "errNoFileProvided" };
    const { path } = await saveUpload(file, "leads");

    await prisma.lead.update({ where: { id: leadId }, data: { photoUrl: path } });
    revalidatePath("/b2b");
    return { ok: true, photoUrl: path };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "errUploadFailed" };
  }
}

export async function convertLeadToCustomer(
  leadId: string,
): Promise<{ ok: true; customerId: string } | { ok: false; error: string }> {
  try {
    const user = await requireB2BUser();
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { ok: false, error: "errLeadNotFound" };
    assertLeadAccess(user.roles, lead.ownerId, user.id);
    if (lead.stage !== "WON") return { ok: false, error: "errLeadMustBeWon" };
    if (lead.convertedCustomerId) return { ok: false, error: "errAlreadyConverted" };

    const customer = await prisma.customer.create({
      data: {
        name: lead.businessName,
        phone: lead.phone,
        address: [lead.address, lead.township, lead.city].filter(Boolean).join(", ") || null,
        isB2B: true,
      },
    });
    await prisma.lead.update({
      where: { id: leadId },
      data: { convertedCustomerId: customer.id, convertedAt: new Date() },
    });
    revalidatePath("/b2b");
    revalidatePath("/b2b/customers");
    return { ok: true, customerId: customer.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "errConversionFailed" };
  }
}

export async function getLead(leadId: string): Promise<LeadDetail | null> {
  const user = await requireB2BUser();
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { activities: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { id: true, name: true } } },
      },
    },
  });
  if (!lead) return null;
  if (!canManageAllLeads(user.roles) && lead.ownerId !== user.id) return null;
  return lead;
}

const issuePortalAccessSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Leads converted to a Customer have no login credentials yet — this issues
// them, letting the B2B customer sign in at /store/account/login and see
// their wholesale pricing.
export async function issuePortalAccess(
  customerId: string,
  input: z.infer<typeof issuePortalAccessSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await requireB2BUser();
    if (!canManageAllLeads(user.roles)) return { ok: false, error: "errNotAuthorized" };

    const parsed = issuePortalAccessSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return { ok: false, error: "errCustomerNotFound" };
    if (customer.email) return { ok: false, error: "errCustomerAlreadyHasPortalAccess" };

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) return { ok: false, error: "errAccountAlreadyExists" };

    await prisma.customer.update({
      where: { id: customerId },
      data: { email, passwordHash: hashPassword(parsed.data.password) },
    });
    revalidatePath("/b2b/customers");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "errFailedToIssuePortalAccess" };
  }
}
