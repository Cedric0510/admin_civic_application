"use client";

import { RefreshCw, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-surface px-6">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
          <ServerCrash size={26} aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Le serveur ne répond pas
          </h1>
          <p className="text-sm text-slate-500">
            Rien n&apos;est perdu : la connexion est peut-être interrompue un
            court instant. Réessayez dans quelques secondes.
          </p>
        </div>
        <Button onClick={reset} className="h-10 gap-2 px-4">
          <RefreshCw size={16} aria-hidden="true" />
          Réessayer
        </Button>
      </div>
    </div>
  );
}
