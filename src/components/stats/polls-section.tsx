import type { PollParticipation } from "@/lib/types";
import { pluralize } from "@/lib/stats-format";
import { Badge } from "@/components/ui/badge";
import { MeterBar } from "./meter-bar";
import { StatsSection } from "./stats-section";

function Participation({ poll }: { poll: PollParticipation }) {
  if (poll.participationRate === null) {
    return (
      <p className="text-sm text-gray-500">
        Personne ne peut encore voter dans la commune.
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-2xl font-bold text-gray-900">
          {poll.participationRate} %
        </p>
        <p className="text-sm text-gray-500">
          {poll.votes} {pluralize(poll.votes, "vote", "votes")} sur{" "}
          {poll.eligibleVoters}{" "}
          {pluralize(poll.eligibleVoters, "habitant", "habitants")} pouvant
          voter
        </p>
      </div>
      <MeterBar
        value={poll.participationRate}
        label={`Participation au sondage : ${poll.question}`}
        className="bg-green-500"
      />
    </div>
  );
}

export function PollsSection({ polls }: { polls: PollParticipation[] }) {
  return (
    <StatsSection
      title="Sondages"
      description="Part des habitants pouvant voter (arrivés depuis plus d'une semaine) qui ont répondu."
    >
      {polls.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          Aucun sondage pour le moment.
        </div>
      ) : (
        <ul className="space-y-3">
          {polls.map((poll) => (
            <li
              key={poll.id}
              className="space-y-3 rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-gray-900">{poll.question}</p>
                <Badge variant={poll.isActive ? "secondary" : "outline"}>
                  {poll.isActive ? "Actif" : "Clos"}
                </Badge>
              </div>
              <Participation poll={poll} />
            </li>
          ))}
        </ul>
      )}
    </StatsSection>
  );
}
