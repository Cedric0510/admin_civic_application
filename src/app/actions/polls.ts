"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api/client";
import { getManagedCommune } from "@/lib/session";
import type { Poll } from "@/lib/types";

export async function getPolls(): Promise<Poll[]> {
  const commune = await getManagedCommune();
  if (!commune) return [];
  return api.get<Poll[]>(`/polls/manage?communeSlug=${commune.slug}`);
}

export async function getPoll(id: string): Promise<Poll | null> {
  try {
    return await api.get<Poll>(`/polls/${id}`);
  } catch (error) {
    // 400 inclus : un id mal formé dans l'URL n'est pas plus "trouvable"
    // qu'un id inexistant, du point de vue de l'utilisateur du dashboard.
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

export async function createPoll(formData: FormData) {
  const commune = await getManagedCommune();
  const question = formData.get("question") as string;
  const optionsRaw = formData.getAll("option") as string[];
  const options = optionsRaw.filter((o) => o.trim().length > 0);

  if (options.length < 2) {
    throw new Error("Un sondage doit avoir au moins 2 options.");
  }

  await api.post("/polls", { question, options, communeId: commune?.id });

  revalidatePath("/polls");
  redirect("/polls");
}

export async function togglePoll(id: string, isActive: boolean) {
  await api.patch(`/polls/${id}`, { isActive });
  revalidatePath("/polls");
}

export async function deletePoll(id: string) {
  await api.delete(`/polls/${id}`);
  revalidatePath("/polls");
}
