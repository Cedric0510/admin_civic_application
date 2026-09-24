import { cn } from "@/lib/utils";
import { toneSolid, type Tone } from "./tone";

export const DELAY_BUCKETS: { label: string; tone: Tone }[] = [
  { label: "< 1 h", tone: "good" },
  { label: "1 à 4 h", tone: "good" },
  { label: "4 à 24 h", tone: "warn" },
  { label: "1 à 3 j", tone: "bad" },
  { label: "> 3 j", tone: "bad" },
];

export function BucketBars({ buckets }: { buckets: number[] }) {
  const highest = Math.max(...buckets, 0);
  const description = DELAY_BUCKETS.map(
    (bucket, index) => `${bucket.label} : ${buckets[index] ?? 0}`,
  ).join(", ");

  return (
    <div role="img" aria-label={description} className="flex h-28 items-end gap-2">
      {DELAY_BUCKETS.map((bucket, index) => {
        const count = buckets[index] ?? 0;
        return (
          <div key={bucket.label} className="flex h-full flex-1 flex-col justify-end gap-1.5">
            <span className="text-center text-xs font-semibold text-slate-700 tabular-nums">
              {count}
            </span>
            <div
              className={cn("w-full rounded-t-md", count === 0 ? "bg-slate-100" : toneSolid[bucket.tone])}
              style={{
                height: count === 0 ? "3px" : `${Math.max(8, (count / highest) * 70)}%`,
              }}
            />
            <span className="text-center text-[11px] leading-tight text-slate-500">
              {bucket.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
