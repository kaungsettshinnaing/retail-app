// Role-based access control. Pure module — safe to use in middleware and client components.

export type Role = "ADMIN" | "MANAGER" | "CASHIER" | "STOREMAN" | "HR" | "BD_LEAD" | "BD_REP";

export const ALL_ROLES: Role[] = ["ADMIN", "MANAGER", "CASHIER", "STOREMAN", "HR", "BD_LEAD", "BD_REP"];

export interface ModuleDef {
  key: string;
  label: string;
  href: string;
  roles: Role[];
  icon: string;
}

export const MODULES: ModuleDef[] = [
  { key: "pos",        label: "POS",        href: "/pos",        roles: ["CASHIER", "MANAGER", "ADMIN"],                    icon: "🛒" },
  { key: "warehouse",  label: "Warehouse",  href: "/warehouse",  roles: ["STOREMAN", "MANAGER", "ADMIN"],                   icon: "📦" },
  { key: "accounting", label: "Accounting", href: "/accounting", roles: ["MANAGER", "ADMIN"],                               icon: "📒" },
  { key: "reports",    label: "Reports",    href: "/reports",    roles: ["MANAGER", "ADMIN"],                               icon: "📊" },
  { key: "hr",         label: "HR",         href: "/hr",         roles: ["HR", "MANAGER", "ADMIN"],                        icon: "👥" },
  { key: "b2b",        label: "B2B",        href: "/b2b",        roles: ["BD_REP", "BD_LEAD", "MANAGER", "ADMIN"],          icon: "🤝" },
  { key: "admin",      label: "Admin",      href: "/admin",      roles: ["ADMIN"],                                          icon: "⚙️" },
];

export function hasAnyRole(userRoles: Role[], allowed: Role[]): boolean {
  return userRoles.some((r) => allowed.includes(r));
}

// B2B lead pipeline: ADMIN/MANAGER/BD_LEAD see and assign every lead; BD_REP
// sees and edits only leads they own.
export function canManageAllLeads(userRoles: Role[]): boolean {
  return hasAnyRole(userRoles, ["ADMIN", "MANAGER", "BD_LEAD"]);
}

export function modulesFor(userRoles: Role[]): ModuleDef[] {
  return MODULES.filter((m) => hasAnyRole(userRoles, m.roles));
}

const ROLE_PRIORITY: Role[] = ["ADMIN", "MANAGER", "HR", "CASHIER", "STOREMAN", "BD_LEAD", "BD_REP"];
const LANDING: Record<Role, string> = {
  ADMIN:    "/admin",
  MANAGER:  "/pos",
  HR:       "/hr",
  CASHIER:  "/pos",
  STOREMAN: "/warehouse",
  BD_LEAD:  "/b2b",
  BD_REP:   "/b2b",
};

export function landingFor(userRoles: Role[]): string | null {
  const mods = modulesFor(userRoles);
  if (mods.length === 0) return null;
  for (const r of ROLE_PRIORITY) {
    if (userRoles.includes(r)) {
      const href = LANDING[r];
      if (mods.some((m) => m.href === href)) return href;
    }
  }
  return mods[0].href;
}

export const ROUTE_ROLES: Record<string, Role[]> = {
  "/pos":        ["CASHIER", "MANAGER", "ADMIN"],
  "/warehouse":  ["STOREMAN", "MANAGER", "ADMIN"],
  "/accounting": ["MANAGER", "ADMIN"],
  "/reports":    ["MANAGER", "ADMIN"],
  "/hr":         ["HR", "MANAGER", "ADMIN"],
  "/b2b":        ["BD_REP", "BD_LEAD", "MANAGER", "ADMIN"],
  "/admin":      ["ADMIN"],
};
