import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ArticlesTable } from "./articles-table";
import { getArticles } from "@/app/actions/articles";

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actualités"
        description="Les articles publiés s'affichent sur l'accueil de l'application des habitants."
        actions={
          <Link href="/articles/new" className={buttonVariants({ size: "lg" })}>
            <Plus size={16} aria-hidden="true" />
            Nouvel article
          </Link>
        }
      />
      <Panel padded={false}>
        <ArticlesTable articles={articles} />
      </Panel>
    </div>
  );
}
