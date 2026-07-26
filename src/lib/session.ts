import { api, ApiError } from "@/lib/api/client";

export type CurrentStaff = {
  id: string;
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
