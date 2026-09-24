import type { LucideIcon } from "lucide-react";
import type { DailyCount, DelayTrend, Trend } from "@/lib/types";
import {
  countTrend,
  delayTrend,
  formatDuration,
  pluralize,
  withinDayRate,
} from "@/lib/stats-format";
import { BucketBars } from "./bucket-bars";
import { IconTile, MiniStat } from "./kpi-card";
import { Ring } from "./ring";
import { SegmentedBar, type Segment } from "./segmented-bar";
import { Sparkline } from "./sparkline";
import { Panel } from "./stats-section";
import type { Tone } from "./tone";

function rateTone(rate: number): Tone {
  if (rate >= 80) return "good";
  if (rate >= 50) return "warn";
  return "bad";
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-t border-slate-100 pt-5">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {children}
    </div>
  );
}

export function RequestPanel({
  icon,
  title,
  subtitle,
  days,
  delay,
  received,
  receivedByDay,
  receivedLabel,
  statusTitle,
  statusEmpty,
  segments,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  days: number;
  delay: DelayTrend;
  received: Trend;
  receivedByDay: DailyCount[];
  receivedLabel: string;
  statusTitle: string;
  statusEmpty: string;
  segments: Segment[];
  children?: React.ReactNode;
}) {
  const { current, previous } = delay;
  const rate = withinDayRate(current.buckets);

  return (
    <Panel className="h-auto space-y-5">
      <div className="flex items-start gap-3">
        <IconTile icon={icon} tone="brand" />
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex items-center gap-4">
          <Ring
            value={rate ?? 0}
            tone={rate === null ? "neutral" : rateTone(rate)}
            label={`Réponses en moins de 24 h : ${rate ?? 0} %`}
          >
            <span className="text-lg font-semibold text-slate-900 tabular-nums">
              {rate === null ? "—" : `${rate} %`}
            </span>
          </Ring>
          <p className="text-sm text-slate-600">
            {rate === null
              ? "Aucune réponse sur cette période."
              : `des demandes ont reçu une réponse en moins de 24 h`}
          </p>
        </div>
        <MiniStat
          label="Délai de réponse habituel"
          value={formatDuration(current.medianMinutes)}
          hint={
            current.answered === 0
              ? undefined
              : `en moyenne ${formatDuration(current.meanMinutes)} · ${current.answered} ${pluralize(current.answered, "réponse", "réponses")}`
          }
          trend={delayTrend(current.medianMinutes, previous.medianMinutes, days)}
        />
      </div>

      {current.answered > 0 && (
        <SubSection title="Répartition des délais de réponse">
          <BucketBars buckets={current.buckets} />
        </SubSection>
      )}

      <SubSection title={statusTitle}>
        <SegmentedBar segments={segments} emptyLabel={statusEmpty} />
      </SubSection>

      <SubSection title={`${receivedLabel} sur ${days} jours`}>
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[13rem_minmax(0,1fr)]">
          <MiniStat
            label="Total"
            value={received.current}
            trend={countTrend(received.current, received.previous, days)}
          />
          <Sparkline values={receivedByDay.map((day) => day.count)} label={`${receivedLabel} par jour`} />
        </div>
      </SubSection>

      {children}
    </Panel>
  );
}
