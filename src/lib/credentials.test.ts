import { describe, expect, it } from "vitest";
import {
  COMMUNE_ADMIN_CREDENTIAL_FIELDS,
  EMAIL_MISMATCH,
  newCredentialsError,
  PASSWORD_MISMATCH,
  STAFF_CREDENTIAL_FIELDS,
} from "./credentials";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("newCredentialsError", () => {
  const valid = {
    email: "marie@bessan.fr",
    emailConfirmation: "marie@bessan.fr",
    password: "Un-mot-de-passe",
    passwordConfirmation: "Un-mot-de-passe",
  };

  it("accepts an address and a password typed twice the same way", () => {
    expect(
      newCredentialsError(form(valid), STAFF_CREDENTIAL_FIELDS),
    ).toBeNull();
  });

  it("ignores case and surrounding spaces when comparing addresses", () => {
    const data = form({ ...valid, emailConfirmation: "  Marie@Bessan.fr " });

    expect(newCredentialsError(data, STAFF_CREDENTIAL_FIELDS)).toBeNull();
  });

  it("flags two different addresses", () => {
    const data = form({ ...valid, emailConfirmation: "marie@bessa.fr" });

    expect(newCredentialsError(data, STAFF_CREDENTIAL_FIELDS)).toBe(
      EMAIL_MISMATCH,
    );
  });

  it("flags two different passwords, and never forgives a case difference", () => {
    const data = form({ ...valid, passwordConfirmation: "un-mot-de-passe" });

    expect(newCredentialsError(data, STAFF_CREDENTIAL_FIELDS)).toBe(
      PASSWORD_MISMATCH,
    );
  });

  it("treats a missing confirmation as a mismatch", () => {
    const data = form({ email: valid.email, password: valid.password });

    expect(newCredentialsError(data, STAFF_CREDENTIAL_FIELDS)).toBe(
      EMAIL_MISMATCH,
    );
  });

  it("reads the admin fields of a commune provisioning", () => {
    const data = form({
      adminEmail: "a@b.fr",
      adminEmailConfirmation: "a@b.fr",
      adminPassword: "Un-mot-de-passe",
      adminPasswordConfirmation: "Autre-chose-12",
    });

    expect(newCredentialsError(data, COMMUNE_ADMIN_CREDENTIAL_FIELDS)).toBe(
      PASSWORD_MISMATCH,
    );
  });
});
