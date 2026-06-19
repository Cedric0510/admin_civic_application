"use client";

import { createArticle, updateArticle } from "@/app/actions/articles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { Article } from "@/lib/types";

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (article) {
          await updateArticle(article.id, formData);
        } else {
          await createArticle(formData);
        }
        toast.success(
          article ? "Article mis à jour." : "Article créé avec succès.",
        );
        router.push("/articles");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          name="title"
          defaultValue={article?.title}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="content">Contenu</Label>
        <Textarea
          id="content"
          name="content"
          rows={10}
          defaultValue={article?.content}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="image_url">URL de l&apos;image (optionnel)</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          pattern="https?://.*"
          defaultValue={article?.image_url ?? ""}
          placeholder="https://exemple.com/image.jpg"
          title="Collez une URL commençant par http:// ou https://"
        />
        <p className="text-xs text-gray-500">
          Collez uniquement une URL publique. Les images encodées en base64 ne
          sont pas acceptées.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Sauvegarde…" : article ? "Enregistrer" : "Publier"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
