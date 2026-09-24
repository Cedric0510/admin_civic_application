import { AuthShell } from "@/components/auth-shell";
import { LoginForm, type LoginNotice } from "./login-form";

const reasonNotices: Record<string, LoginNotice> = {
  suspended: {
    tone: "error",
    text: "L'accès de votre commune est suspendu. Contactez City-Co.",
  },
  expired: {
    tone: "info",
    text: "Votre session a expiré. Reconnectez-vous pour continuer.",
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; reason?: string }>;
}) {
  const { reset, reason } = await searchParams;
  const notice: LoginNotice | null =
    reset === "1"
      ? {
          tone: "success",
          text: "Votre mot de passe a été modifié. Connectez-vous avec le nouveau.",
        }
      : reason
        ? (reasonNotices[reason] ?? null)
        : null;

  return (
    <AuthShell
      title="Bon retour"
      description="Connectez-vous pour accéder à l'espace de votre mairie."
    >
      <LoginForm notice={notice} />
    </AuthShell>
  );
}
