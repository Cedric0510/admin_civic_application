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
import type { Poll, PollOption } from "@/lib/types";

type PollWithOptions = Poll & { poll_options: PollOption[] };

export function PollsTable({ polls }: { polls: PollWithOptions[] }) {
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
          <TableHead>Votes totaux</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="w-28 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {polls.map((poll) => {
          const totalVotes = poll.poll_options.reduce(
            (sum, o) => sum + o.vote_count,
            0,
          );
          return (
            <TableRow key={poll.id}>
              <TableCell className="font-medium">{poll.question}</TableCell>
              <TableCell className="text-gray-500">{totalVotes}</TableCell>
              <TableCell>
                <Badge variant={poll.is_active ? "default" : "secondary"}>
                  {poll.is_active ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-2">
                  <Switch
                    checked={poll.is_active}
                    disabled={pending}
                    onCheckedChange={() =>
                      handleToggle(poll.id, poll.is_active)
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
