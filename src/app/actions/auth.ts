"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError, TOKEN_COOKIE } from "@/lib/api/client";
import { MANAGED_COMMUNE_COOKIE } from "@/lib/api/constants";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

type LoginResponse = { accessToken: string };

export async function login(formData: FormData) {
  let accessToken: string;
  try {
    const result = await api.post<LoginResponse>("/staff/login", {
      email: formData.get("email"),
      password: formData.get("password"),
    });
    accessToken = result.accessToken;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: "Identifiants incorrects." };
    }
    return { error: "Impossible de contacter le serveur." };
  }

  (await cookies()).set(TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Aligné sur JWT_EXPIRES_IN_SECONDS côté civic_api.
    maxAge: 60 * 60 * 2,
  });

  redirect("/");
}

export type PasswordResetRequestResult = { sent: true } | { error: string };

export async function requestPasswordReset(
  formData: FormData,
): Promise<PasswordResetRequestResult> {
  try {
    await api.post("/staff/forgot-password", {
      email: formData.get("email"),
    });
    return { sent: true };
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return { error: "Trop de demandes. Réessayez dans une minute." };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { error: "Saisissez une adresse e-mail valide." };
    }
    return { error: "Impossible de contacter le serveur." };
  }
}

export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    };
  }
  if (password !== confirmation) {
    return { error: "Les deux mots de passe ne sont pas identiques." };
  }

  try {
    await api.post("/staff/reset-password", { token, password });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return {
        error: "Ce lien est invalide ou a expiré. Demandez-en un nouveau.",
      };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { error: "Trop de tentatives. Réessayez dans une minute." };
    }
    return { error: "Impossible de contacter le serveur." };
  }

  redirect("/login?reset=1");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(MANAGED_COMMUNE_COOKIE);
  redirect("/login");
}
