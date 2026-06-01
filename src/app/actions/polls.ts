"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const optionsRaw = formData.getAll("option") as string[];
  const options = optionsRaw.filter((o) => o.trim().length > 0);

  if (options.length < 2) {
    throw new Error("Un sondage doit avoir au moins 2 options.");
  }

  const { data: poll, error } = await supabase
    .from("polls")
    .insert({ question, is_active: true })
    .select("id")
    .single();

  if (error || !poll) throw new Error("Impossible de créer le sondage.");

  const { error: optError } = await supabase.from("poll_options").insert(
    options.map((text) => ({
      poll_id: poll.id,
      option_text: text,
      vote_count: 0,
    })),
  );

  if (optError) throw new Error("Impossible de créer les options.");

  revalidatePath("/polls");
  redirect("/polls");
}

export async function togglePoll(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("polls")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error("Impossible de modifier le sondage.");

  revalidatePath("/polls");
}

export async function deletePoll(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("polls").delete().eq("id", id);

  if (error) throw new Error("Impossible de supprimer le sondage.");

  revalidatePath("/polls");
}
