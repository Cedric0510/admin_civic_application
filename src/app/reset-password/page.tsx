import Link from "next/link";
import { AuthAlert, AuthCard, AuthShell } from "@/components/auth-shell";
import { buttonVariants } from "@/components/ui/button";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Nouveau mot de passe — City-Co",
  referrer: "no-referrer" as const,
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Nouveau mot de passe"
      description="Choisissez le mot de passe que vous utiliserez pour vous connecter."
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <AuthCard>
          <AuthAlert tone="error">
            Ce lien est incomplet. Utilisez le lien reçu par e-mail, ou
            demandez-en un nouveau.
          </AuthAlert>
          <Link
            href="/forgot-password"
            className={buttonVariants({ className: "h-11 w-full text-base" })}
          >
            Demander un nouveau lien
          </Link>
        </AuthCard>
      )}
    </AuthShell>
  );
}
