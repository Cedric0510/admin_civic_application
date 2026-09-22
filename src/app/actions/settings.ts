"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import { getManagedCommune } from "@/lib/session";
import type { CitySettings } from "@/lib/types";

export async function getSettings(): Promise<CitySettings | null> {
  const commune = await getManagedCommune();
  const query = commune ? `?communeId=${commune.id}` : "";
  try {
    const result = await api.get<{ name: string }>(`/communes/me${query}`);
    return { village_name: result.name };
  } catch {
    return null;
  }
}

export async function updateSettings(formData: FormData) {
  const commune = await getManagedCommune();
  const query = commune ? `?communeId=${commune.id}` : "";
  const villageName = formData.get("village_name") as string;
  await api.patch(`/communes/me${query}`, { name: villageName });
  revalidatePath("/settings");
}
