"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api/client";
import { getManagedCommune } from "@/lib/session";
import type { Commerce, CommerceManager } from "@/lib/types";

function commerceFields(formData: FormData) {
  return {
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    hours: (formData.get("hours") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    imageUrl: (formData.get("image_url") as string) || undefined,
  };
}

export async function getCommerces(): Promise<Commerce[]> {
  const commune = await getManagedCommune();
  if (!commune) return [];
  return api.get<Commerce[]>(`/commerces?communeSlug=${commune.slug}`);
}

export async function getCommerce(id: string): Promise<Commerce | null> {
  try {
    return await api.get<Commerce>(`/commerces/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

export async function createCommerce(formData: FormData) {
  const commune = await getManagedCommune();
  await api.post("/commerces", {
    ...commerceFields(formData),
    communeId: commune?.id,
  });
  revalidatePath("/commerces");
}

export async function updateCommerce(id: string, formData: FormData) {
  await api.patch(`/commerces/${id}`, commerceFields(formData));
  revalidatePath("/commerces");
}

export async function deleteCommerce(id: string) {
  await api.delete(`/commerces/${id}`);
  revalidatePath("/commerces");
}

export async function getCommerceManagers(
  id: string,
): Promise<CommerceManager[]> {
  return api.get<CommerceManager[]>(`/commerces/${id}/managers`);
}

export async function assignCommerceManager(id: string, citizenEmail: string) {
  await api.post(`/commerces/${id}/managers`, { citizenEmail });
  revalidatePath(`/commerces/${id}/edit`);
}

export async function unassignCommerceManager(id: string, citizenId: string) {
  await api.delete(`/commerces/${id}/managers/${citizenId}`);
  revalidatePath(`/commerces/${id}/edit`);
}
