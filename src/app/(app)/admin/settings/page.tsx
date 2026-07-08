import { getSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-4">
      <h1 className="section-title">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
