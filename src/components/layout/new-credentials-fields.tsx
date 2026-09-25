"use client";

import { useState } from "react";
import { Field } from "@/components/layout/field";
import { Input } from "@/components/ui/input";
import {
  confirmationName,
  EMAIL_MISMATCH,
  emailsDiffer,
  PASSWORD_MISMATCH,
  passwordsDiffer,
  type CredentialFieldNames,
} from "@/lib/credentials";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

export function NewCredentialsFields({
  names,
  emailPlaceholder,
}: {
  names: CredentialFieldNames;
  emailPlaceholder?: string;
}) {
  const [email, setEmail] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  return (
    <>
      <Field label="Email *" id={names.email}>
        <Input
          name={names.email}
          type="email"
          autoComplete="off"
          placeholder={emailPlaceholder}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field
        label="Confirmer l'email *"
        id={confirmationName(names.email)}
        error={
          emailConfirmation && emailsDiffer(email, emailConfirmation)
            ? EMAIL_MISMATCH
            : undefined
        }
      >
        <Input
          name={confirmationName(names.email)}
          type="email"
          autoComplete="off"
          required
          value={emailConfirmation}
          onChange={(event) => setEmailConfirmation(event.target.value)}
        />
      </Field>

      <Field
        label="Mot de passe *"
        id={names.password}
        hint={`${MIN_PASSWORD_LENGTH} caractères minimum.`}
      >
        <Input
          name={names.password}
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      <Field
        label="Confirmer le mot de passe *"
        id={confirmationName(names.password)}
        error={
          passwordConfirmation &&
          passwordsDiffer(password, passwordConfirmation)
            ? PASSWORD_MISMATCH
            : undefined
        }
      >
        <Input
          name={confirmationName(names.password)}
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
        />
      </Field>
    </>
  );
}
