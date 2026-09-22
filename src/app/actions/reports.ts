"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/client";
import { getManagedCommune } from "@/lib/session";
import type { Report, ReportStatus } from "@/lib/types";

export async function getReports(): Promise<Report[]> {
  const commune = await getManagedCommune();
  if (!commune) return [];
  return api.get<Report[]>(`/reports?communeSlug=${commune.slug}`);
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  await api.patch(`/reports/${id}/status`, { status });
  revalidatePath("/reports");
}
