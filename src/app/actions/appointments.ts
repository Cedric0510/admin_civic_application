"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import { getCurrentStaff } from "@/lib/session";
import type { Appointment } from "@/lib/types";

export async function getAppointments(): Promise<Appointment[]> {
  const staff = await getCurrentStaff();
  if (!staff?.commune) return [];
  return api.get<Appointment[]>(
    `/appointments?communeSlug=${staff.commune.slug}`,
  );
}

export async function deleteAppointment(id: string) {
  await api.delete(`/appointments/${id}`);
  revalidatePath("/appointments");
}
