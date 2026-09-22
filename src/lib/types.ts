// Champs en camelCase : ce type reflète maintenant la réponse JSON de
// civic_api (Prisma), plus les anciennes colonnes snake_case de Supabase.
export type Article = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string;
};

export type Poll = {
  id: string;
  question: string;
  isActive: boolean;
  createdAt: string;
  options: PollOption[];
};

export type PollOption = {
  id: string;
  pollId: string;
  optionText: string;
  voteCount: number;
};

// citizen/service en relations imbriquées (GET /appointments côté staff) :
// plus de name/email en texte libre, ni de service en chaîne.
export type Appointment = {
  id: string;
  date: string;
  message: string | null;
  createdAt: string;
  citizen: { email: string };
  service: { name: string };
};

export type Service = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  phone: string | null;
  address: string | null;
  hours: string | null;
};

// id supprimé : c'était l'ancien identifiant Supabase de la ligne unique
// "settings" (toujours 1), sans équivalent côté civic_api (Commune.id est
// un UUID, non exposé ici puisque non utilisé par le formulaire).
export type CitySettings = {
  village_name: string;
};

export type Commune = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type StaffRole = "AGENT" | "ADMINISTRATEUR" | "SUPER_ADMIN";

export type StaffMember = {
  id: string;
  email: string;
  role: StaffRole;
  createdAt: string;
};

// notes : annonce publique tenue à jour par le commerçant/la mairie (congés,
// promotion du moment...) -- cf. docs/ROADMAP.md Décision 6.
export type Commerce = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  hours: string | null;
  imageUrl: string | null;
  notes: string | null;
};

// Signalements citoyens, version simplifiée de la bêta (cf. docs/ROADMAP.md
// Décision 6) : pas de carte, pas de priorité/affectation. createdAt fait
// office d'horodatage du signalement.
export type ReportCategory =
  | "VOIRIE"
  | "ECLAIRAGE"
  | "PROPRETE"
  | "ESPACES_VERTS"
  | "AUTRE";

export type ReportStatus = "NOUVEAU" | "EN_COURS" | "TRAITE";

export type Report = {
  id: string;
  address: string;
  category: ReportCategory;
  description: string;
  imageUrl: string | null;
  status: ReportStatus;
  createdAt: string;
  citizen: { email: string };
};
