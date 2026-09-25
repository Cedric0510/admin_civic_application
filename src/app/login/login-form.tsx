"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";
import { AuthAlert, AuthCard } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LoginNotice = {
  tone: "error" | "success" | "info";
  text: string;
};

export function LoginForm({ notice }: { notice: LoginNotice | null }) {
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(
    (_: unknown, formData: FormData) => login(formData),
    null,
  );

  return (
    <form action={formAction}>
      <AuthCard>
        {notice && <AuthAlert tone={notice.tone}>{notice.text}</AuthAlert>}

        <div className="space-y-1.5">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-11"
          />
        </div>

        {state?.error && <AuthAlert tone="error">{state.error}</AuthAlert>}

        <Button
          type="submit"
          className="h-11 w-full text-base"
          disabled={pending}
        >
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </AuthCard>
    </form>
  );
}
