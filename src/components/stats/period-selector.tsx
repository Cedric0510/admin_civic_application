import Link from "next/link";
import { STATS_PERIODS } from "@/lib/stats";
import type { StatsPeriodDays } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PeriodSelector({
  active,
  onDark = false,
}: {
  active: StatsPeriodDays;
  onDark?: boolean;
}) {
  return (
    <nav
      aria-label="Période analysée"
      className={cn(
        "inline-flex rounded-xl p-1",
        onDark
          ? "bg-white/10 ring-1 ring-white/20"
          : "border border-slate-200 bg-white",
      )}
    >
      {STATS_PERIODS.map((days) => {
        const isActive = days === active;
        return (
          <Link
            key={days}
            href={`/?period=${days}`}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? onDark
                  ? "bg-white text-brand-700 shadow-sm"
                  : "bg-brand-600 text-white shadow-sm"
                : onDark
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {days} jours
          </Link>
        );
      })}
    </nav>
  );
}
