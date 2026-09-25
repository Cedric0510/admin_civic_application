"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import { getManagedCommune } from "@/lib/session";
import type {
  CitySettings,
  Commune,
  CommuneLegal,
  WeatherRefreshResult,
} from "@/lib/types";
import { toWeatherSnapshot } from "@/lib/weather-snapshot";

export async function getSettings(): Promise<CitySettings | null> {
  const commune = await getManagedCommune();
  const query = commune ? `?communeId=${commune.id}` : "";
  try {
    const result = await api.get<Commune>(`/communes/me${query}`);
    const legal = await api.get<CommuneLegal>(
      `/communes/${encodeURIComponent(result.slug)}/legal`,
    );
    return {
      village_name: result.name,
      postal_code: result.postalCode ?? "",
      weather: toWeatherSnapshot(result),
      legal,
    };
  } catch {
    return null;
  }
}

export type SettingsChanges = {
  name?: string;
  postalCode?: string;
  legalNotice?: string;
  privacyPolicy?: string;
};

export async function updateSettings(
  changes: SettingsChanges,
): Promise<WeatherRefreshResult | undefined> {
  const commune = await getManagedCommune();
  const query = commune ? `?communeId=${commune.id}` : "";
  const updated = await api.patch<{ weather?: WeatherRefreshResult }>(
    `/communes/me${query}`,
    changes,
  );
  revalidatePath("/settings");
  return updated.weather;
}

export async function refreshCommuneWeather(
  communeId?: string,
): Promise<WeatherRefreshResult> {
  const id = communeId ?? (await getManagedCommune())?.id;
  const query = id ? `?communeId=${id}` : "";
  const result = await api.post<WeatherRefreshResult>(
    `/communes/me/weather/refresh${query}`,
  );
  revalidatePath("/settings");
  if (id) revalidatePath(`/superadmin/${id}`);
  return result;
}
