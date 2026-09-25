import { getSettings, refreshCommuneWeather } from "@/app/actions/settings";
import { PageHeader } from "@/components/layout/page-header";
import { WeatherStatusPanel } from "@/components/weather-status-panel";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Paramètres"
        description="L'identité de la commune et les textes légaux que les habitants doivent accepter à l'inscription."
      />
      {settings ? (
        <>
          <WeatherStatusPanel
            postalCode={settings.postal_code || null}
            snapshot={settings.weather}
            refresh={refreshCommuneWeather}
          />
          <SettingsForm settings={settings} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Impossible de charger les paramètres de la commune.
        </p>
      )}
    </div>
  );
}
