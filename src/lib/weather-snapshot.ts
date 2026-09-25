import type { Commune, WeatherSnapshot } from "@/lib/types";

export function toWeatherSnapshot(
  commune: Pick<
    Commune,
    | "weatherPlaceName"
    | "weatherTemperature"
    | "weatherDescription"
    | "weatherUpdatedAt"
  >,
): WeatherSnapshot | null {
  if (commune.weatherTemperature === null || !commune.weatherUpdatedAt) {
    return null;
  }
  return {
    placeName: commune.weatherPlaceName,
    temperature: commune.weatherTemperature,
    description: commune.weatherDescription,
    updatedAt: commune.weatherUpdatedAt,
  };
}
