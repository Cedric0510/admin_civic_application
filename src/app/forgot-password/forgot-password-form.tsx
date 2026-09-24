"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";
import { AuthAlert, AuthCard } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => ({
      ...(await requestPasswordReset(formData)),
      email: String(formData.get("email") ?? ""),
    }),
    null,
  );

  if (state && "sent" in state) {
    return (
      <AuthCard>
        <div className="space-y-4 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <MailCheck size={24} aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Vérifiez votre boîte mail
            </h2>
            <p className="text-sm text-slate-500">
              Si cette adresse correspond à un compte, un e-mail contenant un
              lien de réinitialisation vient d&apos;être envoyé. Il est valable
              1 heure. Pensez à regarder vos courriers indésirables.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <form action={formAction}>
      <AuthCard>
        <div className="space-y-1.5">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state?.email}
            className="h-11"
          />
        </div>

        {state && "error" in state && (
          <AuthAlert tone="error">{state.error}</AuthAlert>
        )}

        <Button
          type="submit"
          className="h-11 w-full text-base"
          disabled={pending}
        >
          {pending ? "Envoi…" : "Envoyer le lien"}
        </Button>

        <p className="text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </AuthCard>
    </form>
  );
}
