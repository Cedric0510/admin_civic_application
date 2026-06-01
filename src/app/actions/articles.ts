"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createArticle(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("articles").insert({
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    image_url: (formData.get("image_url") as string) || null,
    published_at: new Date().toISOString(),
  });

  if (error) throw new Error("Impossible de créer l'article.");

  revalidatePath("/articles");
  redirect("/articles");
}

export async function updateArticle(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("articles")
    .update({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      image_url: (formData.get("image_url") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error("Impossible de mettre à jour l'article.");

  revalidatePath("/articles");
  redirect("/articles");
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) throw new Error("Impossible de supprimer l'article.");

  revalidatePath("/articles");
}
