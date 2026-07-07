// Role-based access control. Pure module — safe to use in middleware and client components.

export type Role = "ADMIN" | "MANAGER" | "CASHIER" | "STOREMAN" | "HR";

export const ALL_ROLES: Role[] = ["ADMIN", "MANAGER", "CASHIER", "STOREMAN", "HR"];

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
  { key: "admin",      label: "Admin",      href: "/admin",      roles: ["ADMIN"],                                          icon: "⚙️" },
];

export function hasAnyRole(userRoles: Role[], allowed: Role[]): boolean {
  return userRoles.some((r) => allowed.includes(r));
}

export function modulesFor(userRoles: Role[]): ModuleDef[] {
  return MODULES.filter((m) => hasAnyRole(userRoles, m.roles));
}

const ROLE_PRIORITY: Role[] = ["ADMIN", "MANAGER", "HR", "CASHIER", "STOREMAN"];
const LANDING: Record<Role, string> = {
  ADMIN:    "/admin",
  MANAGER:  "/pos",
  HR:       "/hr",
  CASHIER:  "/pos",
  STOREMAN: "/warehouse",
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
  "/admin":      ["ADMIN"],
};
