"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth";
import { AuthAlert, AuthCard } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await resetPassword(formData);
      return result ?? null;
    },
    null,
  );

  return (
    <form action={formAction}>
      <AuthCard>
        <input type="hidden" name="token" value={token} />

        <div className="space-y-1.5">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            className="h-11"
          />
          <p className="text-xs text-slate-500">
            {MIN_PASSWORD_LENGTH} caractères minimum.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmation">Confirmer le mot de passe</Label>
          <Input
            id="confirmation"
            name="confirmation"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            className="h-11"
          />
        </div>

        {state?.error && <AuthAlert tone="error">{state.error}</AuthAlert>}

        <Button
          type="submit"
          className="h-11 w-full text-base"
          disabled={pending}
        >
          {pending ? "Enregistrement…" : "Enregistrer le mot de passe"}
        </Button>

        <p className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Demander un nouveau lien
          </Link>
        </p>
      </AuthCard>
    </form>
  );
}
