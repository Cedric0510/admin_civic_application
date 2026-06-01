"use client";

import { deleteArticle } from "@/app/actions/articles";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type Article = {
  id: string;
  title: string;
  published_at: string;
  image_url: string | null;
};

export function ArticlesTable({ articles }: { articles: Article[] }) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeletingId(null);
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
      <p className="text-center text-gray-500 py-12 text-sm">
        Aucun article publié.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Date de publication</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.id}>
            <TableCell className="font-medium">{article.title}</TableCell>
            <TableCell className="text-gray-500 text-sm">
              {new Date(article.published_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Link
                  href={`/articles/${article.id}/edit`}
                  className={buttonVariants({ variant: "ghost", size: "icon" })}
                >
                  <Pencil size={16} />
                </Link>

                <Dialog
                  open={deletingId === article.id}
                  onOpenChange={(open) =>
                    setDeletingId(open ? article.id : null)
                  }
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(article.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Supprimer l&apos;article ?</DialogTitle>
                      <DialogDescription>
                        &quot;{article.title}&quot; sera définitivement
                        supprimé. Cette action est irréversible.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeletingId(null)}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={pending}
                        onClick={() => handleDelete(article.id)}
                      >
                        Supprimer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
