import { MessageSquareText, Star } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { Panel } from "@/components/layout/panel";
import { StatusBadge } from "@/components/layout/status-badge";
import { formatDateTime } from "@/lib/paris-time";
import type { FeedbackItem } from "@/lib/types";
import { feedbackKindLabels, feedbackKindTones } from "./feedback-labels";

function Rating({ value }: { value: number }) {
  return (
    <span role="img" aria-label={`${value} sur 5`} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          aria-hidden="true"
          className={
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40"
          }
        />
      ))}
    </span>
  );
}

export function FeedbackList({
  items,
  showCommune,
}: {
  items: FeedbackItem[];
  showCommune: boolean;
}) {
  if (items.length === 0) {
    return (
      <Panel padded={false}>
        <EmptyState
          icon={MessageSquareText}
          title="Aucun avis pour l'instant"
          description="Les avis des habitants arriveront ici dès qu'ils en enverront depuis l'application."
        />
      </Panel>
    );
  }

  return (
    <Panel padded={false} title="Derniers avis">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="space-y-2 px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <Rating value={item.rating} />
              <StatusBadge tone={feedbackKindTones[item.kind]}>
                {feedbackKindLabels[item.kind]}
              </StatusBadge>
              {showCommune && (
                <span className="text-sm font-medium text-foreground">
                  {item.communeName}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </span>
            </div>
            <p className="whitespace-pre-line text-sm text-foreground">
              {item.message}
            </p>
            {item.contactEmail && (
              <a
                href={`mailto:${item.contactEmail}`}
                className="inline-block text-sm font-medium text-brand-600 underline"
              >
                Répondre à {item.contactEmail}
              </a>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
