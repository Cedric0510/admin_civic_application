"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api/client";
import type { Commune } from "@/lib/types";

export async function getCommunes(): Promise<Commune[]> {
  return api.get<Commune[]>("/communes");
}

// Provisionne une commune et son premier administrateur en une seule
// action : POST /communes n'a pas de contrepartie DELETE, donc si la
// création du compte admin échoue (email déjà utilisé, par ex.), la
// commune reste créée sans administrateur -- signalé explicitement dans le
// message d'erreur plutôt que masqué, pour qu'un super-admin sache qu'il
// doit retenter la partie compte plutôt que de recréer la commune.
export async function provisionCommune(formData: FormData) {
  const name = formData.get("communeName") as string;
  const slug = formData.get("communeSlug") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminPassword = formData.get("adminPassword") as string;

  const commune = await api.post<Commune>("/communes", { name, slug });

  try {
    await api.post("/staff", {
      email: adminEmail,
      password: adminPassword,
      role: "ADMINISTRATEUR",
      communeId: commune.id,
    });
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "Erreur inconnue.";
    throw new Error(
      `Commune "${commune.name}" créée, mais la création de son administrateur a échoué : ${message}. La commune existe déjà -- ne pas la recréer.`,
    );
  }

  revalidatePath("/superadmin");
}
