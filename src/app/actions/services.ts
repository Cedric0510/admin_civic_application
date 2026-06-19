"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("services").insert({
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || null,
    description: (formData.get("description") as string) || null,
    phone: (formData.get("phone") as string) || null,
    address: (formData.get("address") as string) || null,
    hours: (formData.get("hours") as string) || null,
  });

  if (error) throw new Error("Impossible de créer le service.");

  revalidatePath("/services");
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("services")
    .update({
      name: formData.get("name") as string,
      category: (formData.get("category") as string) || null,
      description: (formData.get("description") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
      hours: (formData.get("hours") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error("Impossible de mettre à jour le service.");

  revalidatePath("/services");
}

export async function deleteService(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) throw new Error("Impossible de supprimer le service.");

  revalidatePath("/services");
}
