"use client";

import { createArticle, updateArticle } from "@/app/actions/articles";
import { uploadImage } from "@/app/actions/uploads";
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
        const imageFile = formData.get("image_file") as File | null;
        formData.delete("image_file");
        // Pas de nouveau fichier choisi : on ne fixe pas image_url du tout —
        // civic_api (PATCH) laisse alors la valeur existante inchangée.
        if (imageFile && imageFile.size > 0) {
          const url = await uploadImage(imageFile);
          formData.set("image_url", url);
        }

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
        <Label htmlFor="image_file">Image (optionnel)</Label>
        {article?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu d'une image hébergée par civic_api, pas d'optimisation Next.js nécessaire ici.
          <img
            src={article.imageUrl}
            alt=""
            className="mb-2 h-24 w-auto rounded-md object-cover"
          />
        )}
        <Input
          id="image_file"
          name="image_file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
        <p className="text-xs text-gray-500">
          {article?.imageUrl
            ? "Laisser vide pour conserver l'image actuelle."
            : "JPEG, PNG ou WebP, 5 Mo maximum."}
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
