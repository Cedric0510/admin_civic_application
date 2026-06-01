"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteAppointment(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id);

  if (error) throw new Error("Impossible de supprimer le rendez-vous.");

  revalidatePath("/appointments");
}
