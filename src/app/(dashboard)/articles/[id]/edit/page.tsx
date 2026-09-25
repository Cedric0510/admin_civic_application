import { notFound } from "next/navigation";
import { getArticle } from "@/app/actions/articles";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ArticleForm } from "../../article-form";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Modifier l'article"
        backHref="/articles"
        backLabel="Actualités"
      />
      <Panel>
        <ArticleForm article={article} />
      </Panel>
    </div>
  );
}
