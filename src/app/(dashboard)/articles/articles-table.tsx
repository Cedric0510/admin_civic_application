"use client";

import { deleteArticle } from "@/app/actions/articles";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";
import { ConfirmDeleteButton, IconLink } from "@/components/layout/row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Newspaper, Pencil } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import type { Article } from "@/lib/types";

export function ArticlesTable({
  articles,
}: {
  articles: Pick<Article, "id" | "title" | "category" | "publishedAt">[];
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteArticle(id);
        toast.success("Article supprimé.");
      } catch {
        toast.error("Erreur lors de la suppression.");
      }
    });
  }

  if (articles.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        title="Aucun article publié"
        description="Publiez une première actualité pour informer les habitants."
        action={
          <Link href="/articles/new" className={buttonVariants()}>
            Nouvel article
          </Link>
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Publié le</TableHead>
          <TableHead className="w-28 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.id}>
            <TableCell className="font-medium">{article.title}</TableCell>
            <TableCell>
              {article.category ? (
                <Badge variant="outline">{article.category}</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <IconLink
                  href={`/articles/${article.id}/edit`}
                  label={`Modifier ${article.title}`}
                  icon={Pencil}
                />
                <ConfirmDeleteButton
                  label={`Supprimer ${article.title}`}
                  title="Supprimer l'article ?"
                  description={`« ${article.title} » sera définitivement supprimé. Cette action est irréversible.`}
                  pending={pending}
                  onConfirm={() => handleDelete(article.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
