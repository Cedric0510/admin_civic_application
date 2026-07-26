import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ArticlesTable } from "./articles-table";
import { getArticles } from "@/app/actions/articles";

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Actualités</h1>
        <Link href="/articles/new" className={buttonVariants()}>
            <Plus size={16} />
            Nouvel article
          </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <ArticlesTable articles={articles} />
      </div>
    </div>
  );
}
