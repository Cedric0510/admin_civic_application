"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function getImageUrl(formData: FormData) {
  const rawUrl = (formData.get("image_url") as string | null)?.trim();
  if (!rawUrl) return null;

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

export async function createArticle(formData: FormData) {
  const supabase = await createClient();
  const imageUrl = getImageUrl(formData);

  const { error } = await supabase.from("articles").insert({
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    image_url: imageUrl,
    published_at: new Date().toISOString(),
  });

  if (error) throw new Error("Impossible de créer l'article.");

  revalidatePath("/articles");
}

export async function updateArticle(id: string, formData: FormData) {
  const supabase = await createClient();
  const imageUrl = getImageUrl(formData);

  const { error } = await supabase
    .from("articles")
    .update({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      image_url: imageUrl,
    })
    .eq("id", id);

  if (error) throw new Error("Impossible de mettre à jour l'article.");

  revalidatePath("/articles");
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) throw new Error("Impossible de supprimer l'article.");

  revalidatePath("/articles");
}
