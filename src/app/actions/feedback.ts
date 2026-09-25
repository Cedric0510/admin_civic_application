"use server";

import { api } from "@/lib/api/client";
import { getManagedCommune } from "@/lib/session";
import type { FeedbackOverview } from "@/lib/types";

export async function getFeedback(): Promise<FeedbackOverview> {
  const commune = await getManagedCommune();
  const query = commune ? `?communeId=${commune.id}` : "";
  return api.get<FeedbackOverview>(`/feedback${query}`);
}
