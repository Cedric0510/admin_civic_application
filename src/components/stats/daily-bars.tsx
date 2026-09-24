import { formatDayMonth } from "@/lib/paris-time";
import { formatNumber, peakOf } from "@/lib/stats-format";
import type { DailyCount } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toneSolid, toneStrong, type Tone } from "./tone";

export function DailyBars({
  series,
  label,
  emptyLabel,
  tone = "brand",
}: {
  series: DailyCount[];
  label: string;
  emptyLabel: string;
  tone?: Tone;
}) {
  if (series.length === 0) return null;

  const highest = Math.max(...series.map((day) => day.count));
  const total = series.reduce((sum, day) => sum + day.count, 0);
  const peak = peakOf(series);
  const middle = series[Math.floor(series.length / 2)];

  return (
    <figure className="space-y-2">
      <div className="flex gap-2">
        <div className="flex h-40 w-7 shrink-0 flex-col justify-between text-right text-[11px] leading-none text-slate-400 tabular-nums">
          <span>{highest === 0 ? "" : formatNumber(highest)}</span>
          <span>0</span>
        </div>
        <div className="relative h-40 min-w-0 flex-1">
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-200" />
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-100" />
          <div
            role="img"
            aria-label={`${label} : ${total} sur ${series.length} jours`}
            className="absolute inset-0 flex items-end gap-[3px] border-b border-slate-200"
          >
            {series.map((day) => {
              const isPeak = peak !== null && day.date === peak.date;
              return (
                <div
                  key={day.date}
                  className="group relative flex h-full min-w-px flex-1 items-end"
                >
                  <div
                    className={cn(
                      "w-full rounded-t-[3px] transition-opacity group-hover:opacity-100",
                      day.count === 0
                        ? "bg-slate-200"
                        : isPeak
                          ? toneStrong[tone]
                          : cn(toneSolid[tone], "opacity-60"),
                    )}
                    style={{
                      height:
                        day.count === 0
                          ? "2px"
                          : `${Math.max(4, (day.count / highest) * 100)}%`,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:block"
                  >
                    {formatDayMonth(day.date)} · {day.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <figcaption className="flex items-center justify-between gap-3 pl-9 text-xs text-slate-400">
        <span>{formatDayMonth(series[0].date)}</span>
        {series.length >= 14 && <span>{formatDayMonth(middle.date)}</span>}
        <span>{formatDayMonth(series[series.length - 1].date)}</span>
      </figcaption>
      <p className="pl-9 text-xs text-slate-500">
        {peak
          ? `Pic : ${formatNumber(peak.count)} le ${formatDayMonth(peak.date)}`
          : emptyLabel}
      </p>
    </figure>
  );
}
