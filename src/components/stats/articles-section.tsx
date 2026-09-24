import { Eye, Newspaper } from "lucide-react";
import type { ArticleStats } from "@/lib/types";
import { countTrend, formatNumber, pluralize } from "@/lib/stats-format";
import { DailyBars } from "./daily-bars";
import { StatCard } from "./stat-card";
import { ChartCard, StatsSection } from "./stats-section";

export function ArticlesSection({
  articles,
  days,
}: {
  articles: ArticleStats;
  days: number;
}) {
  return (
    <StatsSection
      title="Actualités"
      description="Une lecture correspond à un article ouvert dans l'application."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={Newspaper}
          accent="blue"
          label="Actualités publiées"
          value={articles.published}
        />
        <StatCard
          icon={Eye}
          accent="green"
          label={`Lectures (${days} j)`}
          value={articles.reads.current}
          trend={countTrend(
            articles.reads.current,
            articles.reads.previous,
            days,
          )}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Lectures par jour">
          <DailyBars
            series={articles.readsByDay}
            label="Lectures d'articles"
            emptyLabel="Aucune lecture sur cette période"
            barClassName="bg-green-500"
          />
        </ChartCard>
        <ChartCard title="Articles les plus lus">
          {articles.mostRead.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucune lecture enregistrée sur cette période.
            </p>
          ) : (
            <ol className="space-y-2.5">
              {articles.mostRead.map((article, index) => (
                <li
                  key={article.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="w-4 text-right font-medium text-gray-400">
                      {index + 1}
                    </span>
                    <span className="truncate text-gray-900">
                      {article.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-gray-500">
                    {formatNumber(article.reads)}{" "}
                    {pluralize(article.reads, "lecture", "lectures")}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </ChartCard>
      </div>
    </StatsSection>
  );
}
