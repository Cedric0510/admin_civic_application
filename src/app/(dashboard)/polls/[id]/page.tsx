import { notFound } from "next/navigation";
import { getPoll } from "@/app/actions/polls";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";

export default async function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const poll = await getPoll(id);

  if (!poll) notFound();

  const options = [...(poll.options ?? [])].sort(
    (a, b) => b.voteCount - a.voteCount,
  );
  const totalVotes = options.reduce((sum, o) => sum + o.voteCount, 0);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Résultats du sondage"
        backHref="/polls"
        backLabel="Sondages"
      />

      <Panel>
        <div className="space-y-5">
          <div>
            <p className="text-lg font-semibold text-foreground">
              {poll.question}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalVotes} vote{totalVotes !== 1 ? "s" : ""} au total
            </p>
          </div>

          <ul className="space-y-4">
            {options.map((option) => {
              const pct =
                totalVotes > 0
                  ? Math.round((option.voteCount / totalVotes) * 100)
                  : 0;
              return (
                <li key={option.id} className="space-y-1.5">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-medium">{option.optionText}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {option.voteCount} vote{option.voteCount !== 1 ? "s" : ""} ({pct}%)
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={`${pct} % des votes`}
                    className="h-2.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
