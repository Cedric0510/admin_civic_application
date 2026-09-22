"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError, TOKEN_COOKIE } from "@/lib/api/client";
import { MANAGED_COMMUNE_COOKIE } from "@/lib/api/constants";

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

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(MANAGED_COMMUNE_COOKIE);
  redirect("/login");
}
