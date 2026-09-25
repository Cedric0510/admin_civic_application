"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import { getManagedCommune } from "@/lib/session";
import type { CitySettings, CommuneLegal } from "@/lib/types";

export async function getSettings(): Promise<CitySettings | null> {
  const commune = await getManagedCommune();
  const query = commune ? `?communeId=${commune.id}` : "";
  try {
    const result = await api.get<{ name: string; slug: string }>(
      `/communes/me${query}`,
    );
    const legal = await api.get<CommuneLegal>(
      `/communes/${encodeURIComponent(result.slug)}/legal`,
    );
    return { village_name: result.name, legal };
  } catch {
    return null;
  }
}

export type SettingsChanges = {
  name?: string;
  legalNotice?: string;
  privacyPolicy?: string;
};

export async function updateSettings(changes: SettingsChanges) {
  const commune = await getManagedCommune();
  const query = commune ? `?communeId=${commune.id}` : "";
  await api.patch(`/communes/me${query}`, changes);
  revalidatePath("/settings");
}
