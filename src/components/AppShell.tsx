import { modulesFor } from "@/lib/rbac";
import type { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/session-actions";
import NavBar from "./NavBar";

const ROLE_PRIORITY = ["ADMIN", "MANAGER", "HR", "CASHIER", "STOREMAN"] as const;
const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin", MANAGER: "Manager", HR: "HR",
  CASHIER: "Cashier", STOREMAN: "Storeman",
};

function primaryRole(roles: string[]): string {
  for (const r of ROLE_PRIORITY) if (roles.includes(r)) return ROLE_LABEL[r] ?? r;
  return roles[0] ?? "Staff";
}

export default function AppShell({
  user,
  storeName,
  children,
}: {
  user: SessionUser;
  storeName: string;
  children: React.ReactNode;
}) {
  const mods = modulesFor(user.roles);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header
        className="sticky top-0 z-20 shadow-md"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #152b47 100%)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">

          {/* Logo + store name */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent bg-accent/10 text-sm font-extrabold text-accent shadow-inner">
              RS
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-bold text-accent tracking-wide">{storeName}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-widest">Management</div>
            </div>
          </div>

          {/* Module nav */}
          <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1">
            <NavBar modules={mods} />
          </div>

          {/* Right: user + logout */}
          <div className="order-2 ml-auto flex items-center gap-3 sm:order-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-white">{user.name}</div>
              <div className="text-[10px] text-white/60">{primaryRole(user.roles)}</div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
              >
                Logout
              </button>
            </form>
          </div>

        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 p-4">{children}</main>

      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #1e3a5f, #f59e0b, #1e3a5f)" }} />
    </div>
  );
}
