import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: poll } = await supabase
    .from("polls")
    .select("*, poll_options(*)")
    .eq("id", id)
    .single();

  if (!poll) notFound();

  const totalVotes = poll.poll_options.reduce(
    (sum: number, o: { vote_count: number }) => sum + o.vote_count,
    0,
  );

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
          {poll.poll_options
            .sort(
              (a: { vote_count: number }, b: { vote_count: number }) =>
                b.vote_count - a.vote_count,
            )
            .map((option: { id: string; option_text: string; vote_count: number }) => {
              const pct =
                totalVotes > 0
                  ? Math.round((option.vote_count / totalVotes) * 100)
                  : 0;
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{option.option_text}</span>
                    <span className="text-gray-500">
                      {option.vote_count} vote{option.vote_count !== 1 ? "s" : ""} ({pct}%)
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
