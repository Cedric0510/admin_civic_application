import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ArticleForm } from "../article-form";

export default function NewArticlePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Nouvel article" backHref="/articles" backLabel="Actualités" />
      <Panel>
        <ArticleForm />
      </Panel>
    </div>
  );
}
