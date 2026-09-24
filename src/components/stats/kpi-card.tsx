import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatNumber, type TrendView } from "@/lib/stats-format";
import { cn } from "@/lib/utils";
import { toneSoft, type Tone } from "./tone";

const trendTones: Record<TrendView["tone"], Tone> = {
  good: "good",
  bad: "bad",
  neutral: "neutral",
};

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

export function TrendBadge({ trend }: { trend: TrendView }) {
  const Icon = trendIcons[trend.direction];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        toneSoft[trendTones[trend.tone]],
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {trend.label}
    </span>
  );
}

export function IconTile({
  icon: Icon,
  tone = "brand",
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl",
        toneSoft[tone],
        className,
      )}
    >
      <Icon size={18} aria-hidden="true" />
    </span>
  );
}

export function BigNumber({
  value,
  unit,
}: {
  value: string | number;
  unit?: string;
}) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="text-4xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {typeof value === "number" ? formatNumber(value) : value}
      </span>
      {unit && <span className="text-sm text-slate-500">{unit}</span>}
    </p>
  );
}

export function MiniStat({
  label,
  value,
  unit,
  hint,
  trend,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  trend?: TrendView | null;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <BigNumber value={value} unit={unit} />
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
      {trend && (
        <div>
          <TrendBadge trend={trend} />
        </div>
      )}
    </div>
  );
}

export function KpiCard({
  icon,
  label,
  value,
  unit,
  hint,
  trend,
  tone = "brand",
  children,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  trend?: TrendView | null;
  tone?: Tone;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <IconTile icon={icon} tone={tone} />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
      <div className="space-y-1.5">
        <BigNumber value={value} unit={unit} />
        {hint && <p className="text-sm text-slate-500">{hint}</p>}
        {trend && (
          <div>
            <TrendBadge trend={trend} />
          </div>
        )}
      </div>
      {children && <div className="mt-auto pt-1">{children}</div>}
    </div>
  );
}
