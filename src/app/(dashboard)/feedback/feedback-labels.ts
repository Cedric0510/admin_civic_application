import type { Tone } from "@/components/stats/tone";
import type { FeedbackKind } from "@/lib/types";

export const feedbackKindLabels: Record<FeedbackKind, string> = {
  PROBLEME: "Problème",
  IDEE: "Idée",
  AUTRE: "Autre",
};

export const feedbackKindTones: Record<FeedbackKind, Tone> = {
  PROBLEME: "bad",
  IDEE: "brand",
  AUTRE: "neutral",
};

export function formatAverage(average: number | null): string {
  return average === null
    ? "—"
    : average.toLocaleString("fr-FR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
}
