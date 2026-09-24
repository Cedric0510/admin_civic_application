import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = { title: "Mot de passe oublié — City-Co" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Mot de passe oublié ?"
      description="Saisissez l'adresse e-mail de votre compte : nous vous enverrons un lien pour en choisir un nouveau."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
