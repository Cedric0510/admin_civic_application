import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

  return (
    <AuthShell
      title="Bon retour"
      description="Connectez-vous pour accéder à l'espace de votre mairie."
    >
      <LoginForm passwordChanged={reset === "1"} />
    </AuthShell>
  );
}
