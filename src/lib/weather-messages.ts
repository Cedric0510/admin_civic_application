import type { WeatherRefreshResult } from "@/lib/types";

export type WeatherNotice = { tone: "success" | "warning"; message: string };

export function formatTemperature(value: number): string {
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

export function describeWeatherResult(
  result: WeatherRefreshResult,
  postalCode?: string | null,
): WeatherNotice {
  switch (result.status) {
    case "ok":
      return {
        tone: "success",
        message: `Météo trouvée : ${result.placeName}, ${formatTemperature(result.temperature)} °C, ${result.description}.`,
      };
    case "not-found":
      return {
        tone: "warning",
        message: postalCode
          ? `Aucune météo trouvée pour le code postal ${postalCode}. Vérifiez-le dans les paramètres de la commune.`
          : "Aucune météo trouvée pour cette commune. Renseignez son code postal dans les paramètres.",
      };
    case "not-configured":
      return {
        tone: "warning",
        message:
          "La clé OpenWeatherMap n'est pas configurée sur le serveur : aucune météo ne peut être récupérée.",
      };
    case "unavailable":
      return {
        tone: "warning",
        message:
          "Le service météo ne répond pas. Réessayez dans quelques minutes.",
      };
  }
}
