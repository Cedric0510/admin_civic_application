"use client";

import { setServiceAgents } from "@/app/actions/services";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ServiceAgent, StaffRole } from "@/lib/types";

const ROLE_LABELS: Record<StaffRole, string> = {
  AGENT: "Agent",
  ADMINISTRATEUR: "Administrateur",
  SUPER_ADMIN: "Super administrateur",
};

export function ServiceAgentsSection({
  serviceId,
  affiliated,
  candidates,
}: {
  serviceId: string;
  affiliated: ServiceAgent[];
  candidates: ServiceAgent[] | null;
}) {
  const [selected, setSelected] = useState(
    () => new Set(affiliated.map((agent) => agent.id)),
  );
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await setServiceAgents(serviceId, [...selected]);
        toast.success("Agents du service mis à jour.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-4">
      <div>
        <Label>Agents qui reçoivent sur ce service</Label>
        <p className="mt-1 text-xs text-gray-500">
          Les citoyens ne peuvent réserver que sur les créneaux libres de ces
          agents (voir{" "}
          <Link href="/agenda" className="underline">
            l&apos;agenda
          </Link>
          ). Sans agent, aucun rendez-vous n&apos;est proposé.
        </p>
      </div>

      {candidates === null ? (
        affiliated.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun agent affilié.</p>
        ) : (
          <ul className="space-y-1 text-sm text-gray-700">
            {affiliated.map((agent) => (
              <li key={agent.id}>{agent.name}</li>
            ))}
          </ul>
        )
      ) : (
        <>
          {candidates.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun agent dans cette commune.
            </p>
          ) : (
            <ul className="space-y-2">
              {candidates.map((member) => (
                <li key={member.id}>
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selected.has(member.id)}
                      onChange={() => toggle(member.id)}
                    />
                    <span>{member.name}</span>
                    <span className="text-xs text-gray-400">
                      {ROLE_LABELS[member.role]}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={handleSave}
          >
            {pending ? "Enregistrement…" : "Enregistrer les agents"}
          </Button>
        </>
      )}
    </div>
  );
}
