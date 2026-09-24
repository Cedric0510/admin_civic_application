// Champs en camelCase : ce type reflète maintenant la réponse JSON de
// civic_api (Prisma), plus les anciennes colonnes snake_case de Supabase.
export type Article = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  imageUrl: string | null;
  publishedAt: string;
};

// opensAt/closesAt facultatifs, fixés à la création (pas d'édition en V1) ;
// isVotable est calculé côté civic_api (isActive + fenêtre de dates), pas
// stocké -- ne jamais le recalculer côté client.
export type Poll = {
  id: string;
  question: string;
  isActive: boolean;
  opensAt: string | null;
  closesAt: string | null;
  isVotable: boolean;
  createdAt: string;
  options: PollOption[];
};

export type PollOption = {
  id: string;
  pollId: string;
  optionText: string;
  voteCount: number;
};

export type AppointmentStatus = "DEMANDE" | "CONFIRME" | "ANNULE";

// citizen/service/agent en relations imbriquées (GET /appointments côté
// staff). agent est null pour un rendez-vous antérieur à l'agenda ou dont
// l'agent a été supprimé.
export type Appointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  message: string | null;
  status: AppointmentStatus;
  createdAt: string;
  citizen: { email: string };
  service: { name: string };
  agent: { email: string } | null;
};

export type Service = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  hours: string | null;
  imageUrl: string | null;
  appointmentDurationMinutes: number;
};

export type ServiceAgent = {
  id: string;
  email: string;
  role: StaffRole;
};

export type WorkingHoursRange = {
  weekday: number;
  startHour: number;
  endHour: number;
};

export type AvailabilityState = "DISPONIBLE" | "INDISPONIBLE";
export type AvailabilityScope = "WEEK" | "DAY" | "HALF_DAY" | "HOUR";
export type DayPeriod = "MORNING" | "AFTERNOON";

export type AgendaRule = {
  date: string;
  fromHour: number;
  toHour: number;
  state: AvailabilityState;
};

export type AgendaWeek = {
  staffMemberId: string;
  weekStart: string;
  workingHours: WorkingHoursRange[];
  days: {
    date: string;
    hours: { hour: number; available: boolean; overridden: boolean }[];
  }[];
  rules: AgendaRule[];
  appointments: {
    id: string;
    startsAt: string;
    endsAt: string;
    status: AppointmentStatus;
    serviceName: string;
    citizenEmail: string;
  }[];
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
// promotion du moment...).
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

// Signalements citoyens, version simplifiée : pas de carte, pas de
// priorité/affectation. createdAt fait office d'horodatage du signalement.
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
