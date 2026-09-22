"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api/client";
import { getManagedCommune } from "@/lib/session";
import type { Service } from "@/lib/types";

function serviceFields(formData: FormData) {
  return {
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    hours: (formData.get("hours") as string) || undefined,
    imageUrl: (formData.get("image_url") as string) || undefined,
  };
}

export async function getServices(): Promise<Service[]> {
  const commune = await getManagedCommune();
  if (!commune) return [];
  return api.get<Service[]>(`/services?communeSlug=${commune.slug}`);
}

export async function getService(id: string): Promise<Service | null> {
  try {
    return await api.get<Service>(`/services/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

export async function createService(formData: FormData) {
  const commune = await getManagedCommune();
  await api.post("/services", {
    ...serviceFields(formData),
    communeId: commune?.id,
  });
  revalidatePath("/services");
}

export async function updateService(id: string, formData: FormData) {
  await api.patch(`/services/${id}`, serviceFields(formData));
  revalidatePath("/services");
}

export async function deleteService(id: string) {
  await api.delete(`/services/${id}`);
  revalidatePath("/services");
}
