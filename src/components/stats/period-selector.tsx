import Link from "next/link";
import { STATS_PERIODS } from "@/lib/stats";
import type { StatsPeriodDays } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PeriodSelector({ active }: { active: StatsPeriodDays }) {
  return (
    <nav
      aria-label="Période analysée"
      className="inline-flex rounded-lg border border-gray-200 bg-white p-1"
    >
      {STATS_PERIODS.map((days) => (
        <Link
          key={days}
          href={`/?period=${days}`}
          aria-current={days === active ? "true" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            days === active
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100",
          )}
        >
          {days} jours
        </Link>
      ))}
    </nav>
  );
}
