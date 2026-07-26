"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api/client";
import { getCurrentStaff } from "@/lib/session";
import type { Service } from "@/lib/types";

function serviceFields(formData: FormData) {
  return {
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    hours: (formData.get("hours") as string) || undefined,
  };
}

export async function getServices(): Promise<Service[]> {
  const staff = await getCurrentStaff();
  if (!staff?.commune) return [];
  return api.get<Service[]>(`/services?communeSlug=${staff.commune.slug}`);
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
  await api.post("/services", serviceFields(formData));
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
