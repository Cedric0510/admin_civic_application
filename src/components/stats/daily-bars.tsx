import { formatDayMonth } from "@/lib/paris-time";
import type { DailyCount } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DailyBars({
  series,
  label,
  emptyLabel,
  barClassName = "bg-blue-500",
}: {
  series: DailyCount[];
  label: string;
  emptyLabel: string;
  barClassName?: string;
}) {
  if (series.length === 0) return null;

  const highest = Math.max(...series.map((day) => day.count));
  const total = series.reduce((sum, day) => sum + day.count, 0);

  return (
    <figure className="space-y-2">
      <div
        role="img"
        aria-label={`${label} : ${total} sur ${series.length} jours`}
        className="flex h-28 items-end gap-px"
      >
        {series.map((day) => (
          <div
            key={day.date}
            title={`${formatDayMonth(day.date)} : ${day.count}`}
            className={cn(
              "min-w-px flex-1 rounded-t-sm",
              day.count === 0 ? "bg-gray-200" : barClassName,
            )}
            style={{
              height: `${day.count === 0 ? 3 : Math.max(6, (day.count / highest) * 100)}%`,
            }}
          />
        ))}
      </div>
      <figcaption className="flex justify-between text-xs text-gray-400">
        <span>{formatDayMonth(series[0].date)}</span>
        {highest === 0 && <span className="text-gray-500">{emptyLabel}</span>}
        <span>{formatDayMonth(series[series.length - 1].date)}</span>
      </figcaption>
    </figure>
  );
}
