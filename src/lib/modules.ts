import type { AppModule } from "@/lib/types";

export type ModuleInfo = {
  key: AppModule;
  label: string;
  description: string;
  requires?: AppModule;
};

export const MODULES: ModuleInfo[] = [
  {
    key: "ARTICLES",
    label: "Actualités",
    description: "Articles publiés aux habitants et lus dans l'application.",
  },
  {
    key: "POLLS",
    label: "Sondages",
    description: "Consultations et votes des habitants.",
  },
  {
    key: "SERVICES",
    label: "Services",
    description: "Annuaire des services municipaux et de leurs contacts.",
  },
  {
    key: "APPOINTMENTS",
    label: "Rendez-vous et agenda",
    description: "Prise de rendez-vous sur les créneaux libres des agents.",
    requires: "SERVICES",
  },
  {
    key: "COMMERCES",
    label: "Commerçants",
    description: "Annuaire des commerces, gérés par leurs propriétaires.",
  },
  {
    key: "REPORTS",
    label: "Signalements",
    description: "Signalements de problèmes par les habitants.",
  },
  {
    key: "WEATHER",
    label: "Météo",
    description: "Météo du jour et prévisions dans l'application.",
  },
];

export function moduleLabel(key: AppModule): string {
  return MODULES.find((info) => info.key === key)?.label ?? key;
}

export function isModuleEnabled(
  disabled: readonly AppModule[] | undefined,
  key: AppModule,
): boolean {
  return !disabled?.includes(key);
}

export function canEnableModule(
  disabled: readonly AppModule[],
  key: AppModule,
): boolean {
  const requirement = MODULES.find((info) => info.key === key)?.requires;
  return !requirement || isModuleEnabled(disabled, requirement);
}

export function toggleModule(
  disabled: readonly AppModule[],
  key: AppModule,
  enabled: boolean,
): AppModule[] {
  const next = new Set(disabled);
  if (enabled) {
    if (canEnableModule(disabled, key)) next.delete(key);
  } else {
    next.add(key);
    for (const info of MODULES) {
      if (info.requires === key) next.add(info.key);
    }
  }
  return MODULES.map((info) => info.key).filter((candidate) =>
    next.has(candidate),
  );
}
