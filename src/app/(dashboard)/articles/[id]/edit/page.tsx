import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArticleForm } from "../../article-form";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select()
    .eq("id", id)
    .single();

  if (!article) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;article</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ArticleForm article={article} />
      </div>
    </div>
  );
}
