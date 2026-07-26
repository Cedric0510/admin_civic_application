import { getSettings } from "@/app/actions/settings";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SettingsForm villageName={settings?.village_name ?? ""} />
      </div>
    </div>
  );
}
