"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import {
  newCredentialsError,
  STAFF_CREDENTIAL_FIELDS,
} from "@/lib/credentials";
import { getManagedCommune } from "@/lib/session";
import type { StaffMember, StaffRole } from "@/lib/types";

export async function getStaff(): Promise<StaffMember[]> {
  const commune = await getManagedCommune();
  // Sans commune gérée (super-admin qui n'a encore rien choisi), civic_api
  // renvoie tout le staff toutes communes confondues -- pas le bon défaut
  // pour cette page, qui affiche "les agents de la commune en cours".
  if (!commune) return [];
  return api.get<StaffMember[]>(`/staff?communeId=${commune.id}`);
}

export async function createStaff(formData: FormData) {
  const mismatch = newCredentialsError(formData, STAFF_CREDENTIAL_FIELDS);
  if (mismatch) throw new Error(mismatch);
  const commune = await getManagedCommune();
  await api.post("/staff", {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as StaffRole,
    communeId: commune?.id,
  });
  revalidatePath("/staff");
}

export async function updateStaff(
  id: string,
  changes: { role?: StaffRole; name?: string },
) {
  await api.patch(`/staff/${id}`, changes);
  revalidatePath("/staff");
}

export async function deleteStaff(id: string) {
  await api.delete(`/staff/${id}`);
  revalidatePath("/staff");
}
