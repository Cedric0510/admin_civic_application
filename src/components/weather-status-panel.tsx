"use client";

import { Panel } from "@/components/layout/panel";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { formatCompactDateTime } from "@/lib/paris-time";
import type { WeatherRefreshResult, WeatherSnapshot } from "@/lib/types";
import {
  describeWeatherResult,
  formatTemperature,
} from "@/lib/weather-messages";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function WeatherStatusPanel({
  postalCode,
  snapshot,
  refresh,
}: {
  postalCode: string | null;
  snapshot: WeatherSnapshot | null;
  refresh: () => Promise<WeatherRefreshResult>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(async () => {
      try {
        const { tone, message } = describeWeatherResult(
          await refresh(),
          postalCode,
        );
        toast[tone](message);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <Panel
      title="Météo de la commune"
      description="Affichée sur l'accueil de l'application, rafraîchie chaque jour à 6 h et à 12 h."
      actions={
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={handleRefresh}
        >
          <RefreshCw size={16} aria-hidden="true" />
          {pending ? "Recherche…" : "Rafraîchir la météo"}
        </Button>
      }
    >
      <div className="space-y-2 text-sm">
        {snapshot ? (
          <>
            <StatusBadge tone="good">Météo disponible</StatusBadge>
            <p className="text-foreground">
              {formatTemperature(snapshot.temperature)} °C
              {snapshot.description ? `, ${snapshot.description}` : ""}
            </p>
            <p className="text-muted-foreground">
              Lieu trouvé : {snapshot.placeName ?? "non précisé"}
              {postalCode ? ` (code postal ${postalCode})` : ""}. Mise à jour le{" "}
              {formatCompactDateTime(snapshot.updatedAt)}.
            </p>
          </>
        ) : (
          <>
            <StatusBadge tone="warn">Aucune météo</StatusBadge>
            <p className="text-muted-foreground">
              {postalCode
                ? `La météo du code postal ${postalCode} n'a pas pu être récupérée. Vérifiez le code postal, puis rafraîchissez.`
                : "Sans code postal, la commune est cherchée par son nom, ce qui peut désigner un autre village. Renseignez le code postal dans les paramètres."}
            </p>
          </>
        )}
      </div>
    </Panel>
  );
}
