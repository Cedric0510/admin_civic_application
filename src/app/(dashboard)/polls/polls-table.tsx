"use client";

import { deletePoll, togglePoll } from "@/app/actions/polls";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { ConfirmDeleteButton, IconLink } from "@/components/layout/row-actions";
import { StatusBadge } from "@/components/layout/status-badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Vote } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import type { Poll } from "@/lib/types";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function PollsTable({ polls }: { polls: Poll[] }) {
  const [pending, startTransition] = useTransition();

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
      <EmptyState
        icon={Vote}
        title="Aucun sondage créé"
        description="Posez une première question aux habitants de la commune."
        action={
          <Link href="/polls/new" className={buttonVariants()}>
            Nouveau sondage
          </Link>
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Question</TableHead>
          <TableHead>Fenêtre</TableHead>
          <TableHead>Votes</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="w-44 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce(
            (sum, option) => sum + option.voteCount,
            0,
          );
          return (
            <TableRow key={poll.id}>
              <TableCell
                label="Question"
                className="max-w-md whitespace-normal font-medium"
              >
                {poll.question}
              </TableCell>
              <TableCell
                label="Fenêtre"
                className="text-xs text-muted-foreground"
              >
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
              <TableCell label="Votes" className="text-muted-foreground">
                {totalVotes}
              </TableCell>
              <TableCell label="Statut">
                {!poll.isActive ? (
                  <StatusBadge tone="neutral">Inactif</StatusBadge>
                ) : poll.isVotable ? (
                  <StatusBadge tone="good">Actif</StatusBadge>
                ) : (
                  <StatusBadge tone="warn">Hors fenêtre</StatusBadge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Switch
                    checked={poll.isActive}
                    disabled={pending}
                    aria-label={`Activer ${poll.question}`}
                    onCheckedChange={() => handleToggle(poll.id, poll.isActive)}
                  />
                  <IconLink
                    href={`/polls/${poll.id}`}
                    label={`Résultats de ${poll.question}`}
                    icon={BarChart3}
                  />
                  <ConfirmDeleteButton
                    label={`Supprimer ${poll.question}`}
                    title="Supprimer le sondage ?"
                    description="Tous les votes associés seront également supprimés. Cette action est irréversible."
                    pending={pending}
                    onConfirm={() => handleDelete(poll.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
