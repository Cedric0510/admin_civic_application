import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PollsTable } from "./polls-table";
import { getPolls } from "@/app/actions/polls";

export default async function PollsPage() {
  const polls = await getPolls();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sondages</h1>
        <Link href="/polls/new" className={buttonVariants()}>
            <Plus size={16} />
            Nouveau sondage
          </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <PollsTable polls={polls} />
      </div>
    </div>
  );
}
