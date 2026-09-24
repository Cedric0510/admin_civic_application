import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatNumber, type TrendView } from "@/lib/stats-format";
import { cn } from "@/lib/utils";

const accents = {
  blue: { text: "text-blue-600", bg: "bg-blue-50" },
  red: { text: "text-red-600", bg: "bg-red-50" },
  green: { text: "text-green-600", bg: "bg-green-50" },
  purple: { text: "text-purple-600", bg: "bg-purple-50" },
  amber: { text: "text-amber-600", bg: "bg-amber-50" },
};

const toneClasses = {
  good: "bg-green-50 text-green-700",
  bad: "bg-red-50 text-red-700",
  neutral: "bg-gray-100 text-gray-600",
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
        toneClasses[trend.tone],
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {trend.label}
    </span>
  );
}

export type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  caption?: string;
  trend?: TrendView | null;
  accent?: keyof typeof accents;
  href?: string;
};

export function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  trend,
  accent = "blue",
  href,
}: StatCardProps) {
  const colors = accents[accent];
  const content = (
    <div
      className={cn(
        "flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5",
        href && "transition-colors hover:border-gray-300 hover:bg-gray-50",
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg p-2.5", colors.bg)}>
          <Icon size={20} className={colors.text} aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      {(caption || trend) && (
        <div className="mt-auto flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {caption && <span>{caption}</span>}
          {trend && <TrendBadge trend={trend} />}
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}
