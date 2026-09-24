import Link from "next/link";
import { ArrowRight, CircleCheck, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Urgency } from "@/lib/stats-format";
import { cn } from "@/lib/utils";
import { BigNumber, IconTile } from "./kpi-card";
import { toneSoft, toneSolid, type Tone } from "./tone";

const urgencyView: Record<Urgency, { tone: Tone; label: string }> = {
  clear: { tone: "good", label: "Tout est à jour" },
  calm: { tone: "brand", label: "Dans les temps" },
  soon: { tone: "warn", label: "À traiter rapidement" },
  late: { tone: "bad", label: "En retard" },
};

export function TaskCard({
  icon,
  title,
  count,
  unit,
  urgency,
  waiting,
  href,
  actionLabel,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  unit: string;
  urgency: Urgency;
  waiting: string | null;
  href: string;
  actionLabel: string;
  children?: React.ReactNode;
}) {
  const { tone, label } = urgencyView[urgency];

  return (
    <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 pl-6 shadow-sm">
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-1.5", toneSolid[tone])}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <IconTile icon={icon} tone={tone} />
          <p className="font-medium text-slate-800">{title}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
            toneSoft[tone],
          )}
        >
          {label}
        </span>
      </div>

      <div className="space-y-2">
        <BigNumber value={count} unit={unit} />
        <p className="flex items-center gap-1.5 text-sm text-slate-600">
          {waiting ? (
            <>
              <Clock size={14} aria-hidden="true" className="text-slate-400" />
              La plus ancienne attend depuis {waiting}
            </>
          ) : (
            <>
              <CircleCheck size={14} aria-hidden="true" className="text-emerald-500" />
              Rien n&apos;attend de réponse
            </>
          )}
        </p>
        {children}
      </div>

      <Link
        href={href}
        className="mt-auto inline-flex items-center gap-1.5 self-start rounded-lg bg-slate-900/[0.04] px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-900/[0.08]"
      >
        {actionLabel}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
