"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api/client";
import { MANAGED_COMMUNE_COOKIE } from "@/lib/api/constants";
import {
  COMMUNE_ADMIN_CREDENTIAL_FIELDS,
  newCredentialsError,
} from "@/lib/credentials";
import type { AppModule, Commune } from "@/lib/types";

export async function getCommunes(): Promise<Commune[]> {
  return api.get<Commune[]>("/communes");
}

export async function setCommuneModules(
  communeId: string,
  disabledModules: AppModule[],
): Promise<void> {
  await api.put(`/communes/${communeId}/modules`, { disabledModules });
  revalidatePath("/superadmin");
  revalidatePath(`/superadmin/${communeId}`);
}

export async function setCommuneSuspended(
  communeId: string,
  suspended: boolean,
): Promise<void> {
  await api.patch(`/communes/${communeId}/access`, { suspended });
  revalidatePath("/superadmin");
  revalidatePath(`/superadmin/${communeId}`);
}

// Provisionne une commune et son premier administrateur en une seule
// action : POST /communes n'a pas de contrepartie DELETE, donc si la
// création du compte admin échoue (email déjà utilisé, par ex.), la
// commune reste créée sans administrateur -- signalé explicitement dans le
// message d'erreur plutôt que masqué, pour qu'un super-admin sache qu'il
// doit retenter la partie compte plutôt que de recréer la commune.
export async function provisionCommune(formData: FormData) {
  const mismatch = newCredentialsError(
    formData,
    COMMUNE_ADMIN_CREDENTIAL_FIELDS,
  );
  if (mismatch) throw new Error(mismatch);
  const name = formData.get("communeName") as string;
  const slug = formData.get("communeSlug") as string;
  const postalCode = String(formData.get("communePostalCode") ?? "").trim();
  const adminName = formData.get("adminName") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminPassword = formData.get("adminPassword") as string;

  const commune = await api.post<Commune>("/communes", {
    name,
    slug,
    ...(postalCode ? { postalCode } : {}),
  });

  try {
    await api.post("/staff", {
      name: adminName,
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

// Un super-admin "entre" dans une commune pour la gérer comme s'il en était
// administrateur -- pas de compte séparé à créer/retenir, civic_api
// autorise déjà un SUPER_ADMIN à agir sur n'importe quelle commune, il ne
// manquait qu'un moyen côté dashboard de dire laquelle. Le cookie est ce
// que getManagedCommune() (session.ts) lit ensuite sur chaque page.
export async function manageCommune(formData: FormData) {
  const slug = formData.get("slug") as string;
  (await cookies()).set(MANAGED_COMMUNE_COOKIE, slug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
  redirect("/");
}

export async function stopManagingCommune() {
  (await cookies()).delete(MANAGED_COMMUNE_COOKIE);
  redirect("/superadmin");
}
