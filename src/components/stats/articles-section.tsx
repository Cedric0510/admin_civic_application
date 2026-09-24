import type { ArticleStats } from "@/lib/types";
import { countTrend, formatNumber, pluralize } from "@/lib/stats-format";
import { DailyBars } from "./daily-bars";
import { MiniStat } from "./kpi-card";
import { Panel, StatsSection } from "./stats-section";

export function ArticlesSection({
  articles,
  days,
}: {
  articles: ArticleStats;
  days: number;
}) {
  const topReads = Math.max(1, ...articles.mostRead.map((article) => article.reads));

  return (
    <StatsSection
      title="Actualités"
      description="Une lecture correspond à un article ouvert dans l'application."
    >
      <Panel>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <div className="space-y-6">
            <MiniStat
              label={`Lectures sur ${days} jours`}
              value={articles.reads.current}
              unit={pluralize(articles.reads.current, "lecture", "lectures")}
              trend={countTrend(
                articles.reads.current,
                articles.reads.previous,
                days,
              )}
            />
            <MiniStat
              label="Actualités publiées"
              value={articles.published}
              unit={pluralize(articles.published, "article", "articles")}
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-slate-600">
              Lectures par jour
            </p>
            <DailyBars
              series={articles.readsByDay}
              label="Lectures d'articles"
              emptyLabel="Aucune lecture sur cette période"
              tone="good"
            />
          </div>
        </div>
      </Panel>

      <Panel title="Articles les plus lus">
        {articles.mostRead.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucune lecture enregistrée sur cette période.
          </p>
        ) : (
          <ol className="space-y-3">
            {articles.mostRead.map((article, index) => (
              <li key={article.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium text-slate-900">
                      {article.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-slate-500 tabular-nums">
                    {formatNumber(article.reads)}{" "}
                    {pluralize(article.reads, "lecture", "lectures")}
                  </span>
                </div>
                <div className="ml-9 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(article.reads / topReads) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </StatsSection>
  );
}
