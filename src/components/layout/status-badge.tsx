import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toneSoft, toneSolid, type Tone } from "@/components/stats/tone";

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneSoft[tone],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", toneSolid[tone])}
      />
      {children}
    </span>
  );
}
