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
