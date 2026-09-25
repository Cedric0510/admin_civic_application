export const EMAIL_MISMATCH =
  "Les deux adresses e-mail ne sont pas identiques.";
export const PASSWORD_MISMATCH =
  "Les deux mots de passe ne sont pas identiques.";

const sameEmail = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

export function emailsDiffer(email: string, confirmation: string): boolean {
  return !sameEmail(email, confirmation);
}

export function passwordsDiffer(
  password: string,
  confirmation: string,
): boolean {
  return password !== confirmation;
}

export type CredentialFieldNames = { email: string; password: string };

export const STAFF_CREDENTIAL_FIELDS: CredentialFieldNames = {
  email: "email",
  password: "password",
};

export const COMMUNE_ADMIN_CREDENTIAL_FIELDS: CredentialFieldNames = {
  email: "adminEmail",
  password: "adminPassword",
};

export function confirmationName(name: string): string {
  return `${name}Confirmation`;
}

export function newCredentialsError(
  formData: FormData,
  names: CredentialFieldNames,
): string | null {
  const read = (name: string) => String(formData.get(name) ?? "");
  if (emailsDiffer(read(names.email), read(confirmationName(names.email)))) {
    return EMAIL_MISMATCH;
  }
  if (
    passwordsDiffer(
      read(names.password),
      read(confirmationName(names.password)),
    )
  ) {
    return PASSWORD_MISMATCH;
  }
  return null;
}
