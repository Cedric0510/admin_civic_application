import { formatNumber } from "@/lib/stats-format";
import { cn } from "@/lib/utils";
import { toneSolid, type Tone } from "./tone";

export type Segment = {
  key: string;
  label: string;
  value: number;
  tone: Tone;
};

export function SegmentedBar({
  segments,
  emptyLabel,
}: {
  segments: Segment[];
  emptyLabel: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const description = segments
    .map((segment) => `${segment.label} : ${segment.value}`)
    .join(", ");

  return (
    <div className="space-y-2.5">
      {total === 0 ? (
        <>
          <div className="h-3 rounded-full bg-slate-100" />
          <p className="text-sm text-slate-500">{emptyLabel}</p>
        </>
      ) : (
        <>
          <div
            role="img"
            aria-label={description}
            className="flex h-3 gap-0.5 overflow-hidden rounded-full"
          >
            {segments
              .filter((segment) => segment.value > 0)
              .map((segment) => (
                <div
                  key={segment.key}
                  className={cn("h-full", toneSolid[segment.tone])}
                  style={{ flexGrow: segment.value, flexBasis: 0 }}
                />
              ))}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
            {segments.map((segment) => (
              <li key={segment.key} className="flex items-center gap-2 text-slate-600">
                <span
                  aria-hidden="true"
                  className={cn("size-2.5 rounded-full", toneSolid[segment.tone])}
                />
                {segment.label}
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatNumber(segment.value)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
