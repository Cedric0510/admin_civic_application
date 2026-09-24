import { cn } from "@/lib/utils";

export function MeterBar({
  value,
  label,
  className = "bg-blue-500",
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const percent = Math.min(100, Math.max(0, value));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
    >
      <div
        className={cn("h-full rounded-full", className)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
