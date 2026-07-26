"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import type { CitySettings } from "@/lib/types";

export async function getSettings(): Promise<CitySettings | null> {
  try {
    const commune = await api.get<{ name: string }>("/communes/me");
    return { village_name: commune.name };
  } catch {
    return null;
  }
}

export async function updateSettings(formData: FormData) {
  const villageName = formData.get("village_name") as string;
  await api.patch("/communes/me", { name: villageName });
  revalidatePath("/settings");
}
