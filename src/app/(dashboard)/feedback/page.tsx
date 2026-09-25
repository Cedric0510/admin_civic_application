import { getFeedback } from "@/app/actions/feedback";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentStaff } from "@/lib/session";
import { FeedbackList } from "./feedback-list";
import { FeedbackSummaryCards } from "./feedback-summary";

export default async function FeedbackPage() {
  const [overview, staff] = await Promise.all([getFeedback(), getCurrentStaff()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retours des habitants"
        description="Les avis envoyés depuis l'application. L'adresse e-mail n'apparaît que si l'habitant accepte d'être recontacté."
      />
      <FeedbackSummaryCards summary={overview.summary} />
      <FeedbackList
        items={overview.items}
        showCommune={staff?.role === "SUPER_ADMIN"}
      />
    </div>
  );
}
