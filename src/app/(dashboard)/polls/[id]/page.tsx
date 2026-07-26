import { notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getPoll } from "@/app/actions/polls";

export default async function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const poll = await getPoll(id);

  if (!poll) notFound();

  const options = poll.options ?? [];
  const totalVotes = options.reduce((sum, o) => sum + o.voteCount, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/polls"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Résultats du sondage
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <p className="font-semibold text-gray-900 text-lg">{poll.question}</p>
        <p className="text-sm text-gray-500">{totalVotes} vote{totalVotes !== 1 ? "s" : ""} au total</p>

        <div className="space-y-4">
          {[...options]
            .sort((a, b) => b.voteCount - a.voteCount)
            .map((option) => {
              const pct =
                totalVotes > 0
                  ? Math.round((option.voteCount / totalVotes) * 100)
                  : 0;
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{option.optionText}</span>
                    <span className="text-gray-500">
                      {option.voteCount} vote{option.voteCount !== 1 ? "s" : ""} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
