"use client";

import { Button } from "@/components/ui/button";

export function FormActions({
  pending,
  submitLabel,
  pendingLabel,
  onCancel,
}: {
  pending: boolean;
  submitLabel: string;
  pendingLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 border-t border-border pt-5">
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </Button>
      <Button type="button" size="lg" variant="outline" onClick={onCancel}>
        Annuler
      </Button>
    </div>
  );
}
