import type { Stage, ActivityKind } from "./pipeline";

export type OwnerRef = { id: string; name: string };

export type LeadListItem = {
  id: string;
  businessName: string;
  contactName: string | null;
  phone: string | null;
  shopField: string | null;
  photoUrl: string | null;
  mapsURL: string | null;
  township: string | null;
  city: string | null;
  stage: Stage;
  lostReason: string | null;
  convertedCustomerId: string | null;
  owner: OwnerRef | null;
  updatedAt: Date;
  createdAt: Date;
  _count: { activities: number };
  activities: { createdAt: Date }[];
};

export type ActivityItem = {
  id: string;
  type: ActivityKind;
  content: string;
  dueAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  createdBy: OwnerRef;
};

export type LeadDetail = Omit<LeadListItem, "activities"> & {
  address: string | null;
  notes: string | null;
  activities: ActivityItem[];
};

export type StaffRow = { id: string; name: string; roles: string[] };
