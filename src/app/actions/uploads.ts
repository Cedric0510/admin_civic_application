"use server";

import { api } from "@/lib/api/client";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { url } = await api.post<{ url: string }>("/uploads", formData);
  return url;
}
