import { requireSession } from "@/lib/auth";
import { profileDict } from "@/lib/i18n/dict/profile";
import { commonDict } from "@/lib/i18n/dict/common";
import PasswordForm from "./PasswordForm";
import LanguageForm from "./LanguageForm";

export const dynamic = "force-dynamic";

const ROLE_KEY: Record<string, keyof typeof commonDict.EN> = {
  ADMIN: "roleAdmin",
  MANAGER: "roleManager",
  HR: "roleHr",
  CASHIER: "roleCashier",
  STOREMAN: "roleStoreman",
  BD_LEAD: "roleBdLead",
  BD_REP: "roleBdRep",
};

export default async function ProfilePage() {
  const user = await requireSession();
  const t = profileDict[user.language];
  const c = commonDict[user.language];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>

      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          {t.accountInfo}
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-gray-500">{t.yourName}</dt>
          <dd className="font-medium text-gray-900">{user.name}</dd>
          <dt className="text-gray-500">{t.yourUsername}</dt>
          <dd className="font-medium text-gray-900">{user.username}</dd>
          <dt className="text-gray-500">{t.yourRoles}</dt>
          <dd className="font-medium text-gray-900">
            {user.roles.map((r) => c[ROLE_KEY[r] ?? "roleAdmin"]).join(", ")}
          </dd>
        </dl>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          {t.changePassword}
        </h2>
        <PasswordForm lang={user.language} />
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          {t.language}
        </h2>
        <LanguageForm lang={user.language} />
      </section>
    </div>
  );
}
