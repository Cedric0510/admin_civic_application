import { ArticleForm } from "../article-form";

export default function NewArticlePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Nouvel article</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ArticleForm />
      </div>
    </div>
  );
}
