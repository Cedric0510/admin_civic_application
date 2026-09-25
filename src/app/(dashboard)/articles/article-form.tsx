"use client";

import { createArticle, updateArticle } from "@/app/actions/articles";
import { uploadImage } from "@/app/actions/uploads";
import { Field } from "@/components/layout/field";
import { FormActions } from "@/components/layout/form-actions";
import { ImageUploadField } from "@/components/layout/image-upload-field";
import { Input } from "@/components/ui/input";
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
    <form action={handleSubmit} className="space-y-5">
      <Field label="Titre" id="title">
        <Input name="title" defaultValue={article?.title} required />
      </Field>

      <Field label="Contenu" id="content">
        <Textarea
          name="content"
          rows={10}
          defaultValue={article?.content}
          required
        />
      </Field>

      <Field
        label="Catégorie"
        id="category"
        hint="Facultative : elle permet aux habitants de filtrer les actualités."
      >
        <Input
          name="category"
          defaultValue={article?.category ?? ""}
          placeholder="ex. Info générale, Travaux, Événement, Alerte…"
        />
      </Field>

      <ImageUploadField
        label="Image (facultative)"
        currentUrl={article?.imageUrl}
        currentAlt="Image actuelle de l'article"
      />

      <FormActions
        pending={pending}
        submitLabel={article ? "Enregistrer" : "Publier"}
        pendingLabel="Sauvegarde…"
        onCancel={() => history.back()}
      />
    </form>
  );
}
