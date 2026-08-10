import { getSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";
import { requireSession } from "@/lib/auth";
import { adminDict } from "@/lib/i18n/dict/admin";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireSession();
  const t = adminDict[user.language];
  const settings = await getSettings();
  return (
    <div className="space-y-4">
      <h1 className="section-title">{t.settingsTitle}</h1>
      <SettingsForm settings={settings} lang={user.language} />
    </div>
  );
}
