"use client";

import { deletePoll, togglePoll } from "@/app/actions/polls";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Trash2, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Poll } from "@/lib/types";

export function PollsTable({ polls }: { polls: Poll[] }) {
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      try {
        await togglePoll(id, !current);
        toast.success(!current ? "Sondage activé." : "Sondage désactivé.");
      } catch {
        toast.error("Erreur lors de la modification.");
      }
    });
  }

  function handleDelete(id: string) {
    setDeletingId(null);
    startTransition(async () => {
      try {
        await deletePoll(id);
        toast.success("Sondage supprimé.");
      } catch {
        toast.error("Erreur lors de la suppression.");
      }
    });
  }

  if (polls.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12 text-sm">
        Aucun sondage créé.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Question</TableHead>
          <TableHead>Fenêtre</TableHead>
          <TableHead>Votes totaux</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="w-28 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce(
            (sum, o) => sum + o.voteCount,
            0,
          );
          const formatDate = (value: string) =>
            new Date(value).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          return (
            <TableRow key={poll.id}>
              <TableCell className="font-medium">{poll.question}</TableCell>
              <TableCell className="text-xs text-gray-500">
                {poll.opensAt || poll.closesAt ? (
                  <>
                    {poll.opensAt ? formatDate(poll.opensAt) : "—"}
                    {" → "}
                    {poll.closesAt ? formatDate(poll.closesAt) : "—"}
                  </>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-gray-500">{totalVotes}</TableCell>
              <TableCell>
                {!poll.isActive ? (
                  <Badge variant="secondary">Inactif</Badge>
                ) : poll.isVotable ? (
                  <Badge variant="default">Actif</Badge>
                ) : (
                  <Badge variant="outline">Hors fenêtre</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-2">
                  <Switch
                    checked={poll.isActive}
                    disabled={pending}
                    onCheckedChange={() =>
                      handleToggle(poll.id, poll.isActive)
                    }
                  />
                  <Link
                    href={`/polls/${poll.id}`}
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                  >
                    <BarChart3 size={16} />
                  </Link>
                  <Dialog
                    open={deletingId === poll.id}
                    onOpenChange={(open) =>
                      setDeletingId(open ? poll.id : null)
                    }
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingId(poll.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Supprimer le sondage ?</DialogTitle>
                        <DialogDescription>
                          Tous les votes associés seront également supprimés.
                          Cette action est irréversible.
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
                          onClick={() => handleDelete(poll.id)}
                        >
                          Supprimer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
