import { cookies } from "next/headers";
import { api, ApiError } from "@/lib/api/client";
import { MANAGED_COMMUNE_COOKIE } from "@/lib/api/constants";

export type CurrentStaff = {
  id: string;
  name: string;
  email: string;
  role: "AGENT" | "ADMINISTRATEUR" | "SUPER_ADMIN";
  commune: { id: string; name: string; slug: string } | null;
};

// null si pas connecté ou token invalide/expiré — jamais une exception, pour
// que les pages puissent simplement tester le résultat et rediriger.
export async function getCurrentStaff(): Promise<CurrentStaff | null> {
  try {
    return await api.get<CurrentStaff>("/staff/me");
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    throw error;
  }
}

export type ManagedCommune = { id: string; name: string; slug: string };

// La commune sur laquelle l'utilisateur connecté agit réellement : la
// sienne pour un agent/administrateur (communeId non-null), ou celle
// explicitement choisie via /superadmin pour un super-admin -- null si ce
// dernier n'a encore rien choisi. C'est cette valeur, pas staff.commune,
// que toutes les pages/actions doivent utiliser pour lire/écrire des
// données de commune (articles, services, agents...), pour qu'un
// super-admin en "gère une" comme s'il en était administrateur.
//
// `staff` peut être passé pré-chargé pour éviter un second GET /staff/me
// (ex. depuis (dashboard)/layout.tsx, qui l'a déjà).
export async function getManagedCommune(
  staff?: CurrentStaff | null,
): Promise<ManagedCommune | null> {
  const currentStaff = staff !== undefined ? staff : await getCurrentStaff();
  if (!currentStaff) return null;
  if (currentStaff.commune) return currentStaff.commune;
  if (currentStaff.role !== "SUPER_ADMIN") return null;

  const slug = (await cookies()).get(MANAGED_COMMUNE_COOKIE)?.value;
  if (!slug) return null;

  try {
    return await api.get<ManagedCommune>(`/communes/${slug}`);
  } catch {
    // Cookie obsolète (commune renommée/supprimée depuis) : traité comme
    // aucune commune choisie plutôt que comme une erreur.
    return null;
  }
}
