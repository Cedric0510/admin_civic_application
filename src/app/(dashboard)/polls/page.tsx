import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { PollsTable } from "./polls-table";
import { getPolls } from "@/app/actions/polls";

export default async function PollsPage() {
  const polls = await getPolls();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sondages"
        description="Consultez les habitants : chaque compte vote une seule fois par sondage."
        actions={
          <Link href="/polls/new" className={buttonVariants({ size: "lg" })}>
            <Plus size={16} aria-hidden="true" />
            Nouveau sondage
          </Link>
        }
      />
      <Panel padded={false}>
        <PollsTable polls={polls} />
      </Panel>
    </div>
  );
}
