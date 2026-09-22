"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import type { StaffMember, StaffRole } from "@/lib/types";

export async function getStaff(): Promise<StaffMember[]> {
  return api.get<StaffMember[]>("/staff");
}

export async function createStaff(formData: FormData) {
  await api.post("/staff", {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as StaffRole,
  });
  revalidatePath("/staff");
}

export async function updateStaffRole(id: string, role: StaffRole) {
  await api.patch(`/staff/${id}`, { role });
  revalidatePath("/staff");
}

export async function deleteStaff(id: string) {
  await api.delete(`/staff/${id}`);
  revalidatePath("/staff");
}
