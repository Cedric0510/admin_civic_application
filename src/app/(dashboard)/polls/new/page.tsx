import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { NewPollForm } from "../new-poll-form";

export default function NewPollPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Nouveau sondage" backHref="/polls" backLabel="Sondages" />
      <Panel>
        <NewPollForm />
      </Panel>
    </div>
  );
}
