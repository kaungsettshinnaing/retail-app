import LoginForm from "./LoginForm";
import LanguageSwitch from "@/components/LanguageSwitch";
import { getLanguageCookie } from "@/lib/i18n/actions";
import { navDict } from "@/lib/i18n/dict/nav";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const lang = await getLanguageCookie();
  const t = navDict[lang];

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
      <div className="mb-4 flex justify-end">
        <LanguageSwitch lang={lang} />
      </div>
      <div className="mb-7 flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-accent bg-brand shadow-lg">
          <span className="text-2xl font-extrabold tracking-tighter text-accent">RS</span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Retail Store</h1>
          <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest">
            {t.management}
          </p>
        </div>
      </div>
      <LoginForm lang={lang} />
    </div>
  );
}
