import type { PollParticipation } from "@/lib/types";
import { pluralize } from "@/lib/stats-format";
import { Badge } from "@/components/ui/badge";
import { Ring } from "./ring";
import { Panel, StatsSection } from "./stats-section";
import type { Tone } from "./tone";

function toneFor(rate: number): Tone {
  if (rate >= 50) return "good";
  if (rate >= 25) return "brand";
  return "warn";
}

function PollRow({ poll }: { poll: PollParticipation }) {
  const rate = poll.participationRate;

  return (
    <Panel>
      <div className="flex items-center gap-5">
        <Ring
          value={rate ?? 0}
          tone={rate === null ? "neutral" : toneFor(rate)}
          label={`Participation au sondage : ${poll.question}`}
        >
          <span className="text-lg font-semibold text-slate-900 tabular-nums">
            {rate === null ? "—" : `${rate} %`}
          </span>
        </Ring>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium text-slate-900">{poll.question}</p>
            <Badge variant={poll.isActive ? "secondary" : "outline"}>
              {poll.isActive ? "Actif" : "Clos"}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            {rate === null
              ? "Personne ne peut encore voter dans la commune."
              : `${poll.votes} ${pluralize(poll.votes, "vote", "votes")} sur ${poll.eligibleVoters} ${pluralize(poll.eligibleVoters, "habitant", "habitants")} pouvant voter`}
          </p>
        </div>
      </div>
    </Panel>
  );
}

export function PollsSection({ polls }: { polls: PollParticipation[] }) {
  return (
    <StatsSection
      title="Sondages"
      description="Part des habitants pouvant voter (arrivés depuis plus d'une semaine) qui ont répondu."
    >
      {polls.length === 0 ? (
        <Panel>
          <p className="text-sm text-slate-500">Aucun sondage pour le moment.</p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {polls.map((poll) => (
            <PollRow key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </StatsSection>
  );
}
