import { cn } from "@/lib/utils";
import { toneSolid, type Tone } from "./tone";

export function MeterBar({
  value,
  label,
  tone = "brand",
}: {
  value: number;
  label: string;
  tone?: Tone;
}) {
  const percent = Math.min(100, Math.max(0, value));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
    >
      <div
        className={cn("h-full rounded-full", toneSolid[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
