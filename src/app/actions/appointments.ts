"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import { getManagedCommune } from "@/lib/session";
import type { Appointment } from "@/lib/types";

export async function getAppointments(): Promise<Appointment[]> {
  const commune = await getManagedCommune();
  if (!commune) return [];
  return api.get<Appointment[]>(`/appointments?communeSlug=${commune.slug}`);
}

export async function deleteAppointment(id: string) {
  await api.delete(`/appointments/${id}`);
  revalidatePath("/appointments");
}
