import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("village_name")
    .eq("id", 1)
    .single();

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SettingsForm villageName={data?.village_name ?? ""} />
      </div>
    </div>
  );
}
