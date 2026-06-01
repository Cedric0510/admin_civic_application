"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();
  const villageName = formData.get("village_name") as string;

  const { error } = await supabase
    .from("settings")
    .update({ village_name: villageName })
    .eq("id", 1);

  if (error) throw new Error("Impossible de sauvegarder les paramètres.");

  revalidatePath("/settings");
}
