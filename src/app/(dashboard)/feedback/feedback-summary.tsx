import { Star } from "lucide-react";
import { StatusBadge } from "@/components/layout/status-badge";
import type { FeedbackKind, FeedbackOverview } from "@/lib/types";
import {
  feedbackKindLabels,
  feedbackKindTones,
  formatAverage,
} from "./feedback-labels";

const kinds: FeedbackKind[] = ["PROBLEME", "IDEE", "AUTRE"];

function SummaryCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function FeedbackSummaryCards({
  summary,
}: {
  summary: FeedbackOverview["summary"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard label="Avis reçus">
        <p className="text-3xl font-semibold tracking-tight">{summary.total}</p>
      </SummaryCard>
      <SummaryCard label="Note moyenne">
        <p className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tracking-tight">
            {formatAverage(summary.average)}
          </span>
          <span className="text-sm text-muted-foreground">/ 5</span>
          {summary.average !== null && (
            <Star
              size={18}
              aria-hidden="true"
              className="ml-1 self-center fill-amber-400 text-amber-400"
            />
          )}
        </p>
      </SummaryCard>
      <SummaryCard label="Par type">
        <ul className="flex flex-wrap gap-2">
          {kinds.map((kind) => (
            <li key={kind}>
              <StatusBadge tone={feedbackKindTones[kind]}>
                {feedbackKindLabels[kind]} · {summary.byKind[kind]}
              </StatusBadge>
            </li>
          ))}
        </ul>
      </SummaryCard>
    </div>
  );
}
