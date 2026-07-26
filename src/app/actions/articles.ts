"use server";

import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api/client";
import { getCurrentStaff } from "@/lib/session";
import type { Article } from "@/lib/types";

function getImageUrl(formData: FormData): string | undefined {
  const rawUrl = (formData.get("image_url") as string | null)?.trim();
  if (!rawUrl) return undefined;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error("L'image doit être une URL valide.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("L'image doit être une URL HTTP ou HTTPS.");
  }

  return parsedUrl.toString();
}

export async function getArticles(): Promise<Article[]> {
  const staff = await getCurrentStaff();
  if (!staff?.commune) {
    // Super-admin sans commune : pas encore géré par ce dashboard
    // (cf. docs/ROADMAP.md — Dashboard SuperAdmin, à venir).
    return [];
  }
  return api.get<Article[]>(`/articles?communeSlug=${staff.commune.slug}`);
}

export async function getArticle(id: string): Promise<Article | null> {
  try {
    return await api.get<Article>(`/articles/${id}`);
  } catch (error) {
    // 400 inclus : un id mal formé dans l'URL n'est pas plus "trouvable"
    // qu'un id inexistant, du point de vue de l'utilisateur du dashboard.
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

export async function createArticle(formData: FormData) {
  const imageUrl = getImageUrl(formData);
  await api.post("/articles", {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    imageUrl,
  });
  revalidatePath("/articles");
}

export async function updateArticle(id: string, formData: FormData) {
  const imageUrl = getImageUrl(formData);
  await api.patch(`/articles/${id}`, {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    imageUrl,
  });
  revalidatePath("/articles");
}

export async function deleteArticle(id: string) {
  await api.delete(`/articles/${id}`);
  revalidatePath("/articles");
}
