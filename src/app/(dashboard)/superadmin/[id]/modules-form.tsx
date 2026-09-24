"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setCommuneModules } from "@/app/actions/superadmin";
import { Switch } from "@/components/ui/switch";
import {
  canEnableModule,
  isModuleEnabled,
  moduleLabel,
  MODULES,
  toggleModule,
} from "@/lib/modules";
import type { AppModule } from "@/lib/types";

export function ModulesForm({
  communeId,
  initialDisabled,
}: {
  communeId: string;
  initialDisabled: AppModule[];
}) {
  const [disabled, setDisabled] = useState<AppModule[]>(initialDisabled);
  const [pending, startTransition] = useTransition();

  function change(key: AppModule, enabled: boolean) {
    const previous = disabled;
    const next = toggleModule(previous, key, enabled);
    setDisabled(next);
    startTransition(async () => {
      try {
        await setCommuneModules(communeId, next);
        toast.success(
          enabled
            ? `« ${moduleLabel(key)} » activé.`
            : `« ${moduleLabel(key)} » désactivé.`,
        );
      } catch (error) {
        setDisabled(previous);
        toast.error(
          error instanceof Error ? error.message : "Une erreur est survenue.",
        );
      }
    });
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {MODULES.map((module) => {
        const enabled = isModuleEnabled(disabled, module.key);
        const blocked = !enabled && !canEnableModule(disabled, module.key);
        return (
          <li
            key={module.key}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0">
              <p className="font-medium text-slate-900">{module.label}</p>
              <p className="text-sm text-slate-500">
                {module.description}
                {blocked && module.requires && (
                  <>
                    {" "}
                    <span className="text-amber-600">
                      Nécessite « {moduleLabel(module.requires)} ».
                    </span>
                  </>
                )}
              </p>
            </div>
            <Switch
              aria-label={module.label}
              checked={enabled}
              disabled={pending || blocked}
              onCheckedChange={(checked) => change(module.key, checked)}
            />
          </li>
        );
      })}
    </ul>
  );
}
