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
  agent: { name: string } | null;
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
  name: string;
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

export type CommuneLegal = {
  communeName: string;
  legalNotice: string;
  privacyPolicy: string;
  legalNoticeIsCustom: boolean;
  privacyPolicyIsCustom: boolean;
};

export type CitySettings = {
  village_name: string;
  postal_code: string;
  legal: CommuneLegal;
};

export type FeedbackKind = "PROBLEME" | "IDEE" | "AUTRE";

export type FeedbackItem = {
  id: string;
  kind: FeedbackKind;
  rating: number;
  message: string;
  createdAt: string;
  communeName: string;
  contactEmail: string | null;
};

export type FeedbackOverview = {
  summary: {
    total: number;
    average: number | null;
    byKind: Record<FeedbackKind, number>;
  };
  items: FeedbackItem[];
};

export type AppModule =
  | "ARTICLES"
  | "POLLS"
  | "SERVICES"
  | "APPOINTMENTS"
  | "COMMERCES"
  | "REPORTS"
  | "WEATHER";

export type Commune = {
  id: string;
  name: string;
  slug: string;
  postalCode: string | null;
  createdAt: string;
  suspendedAt: string | null;
  disabledModules: AppModule[];
};

export type StaffRole = "AGENT" | "ADMINISTRATEUR" | "SUPER_ADMIN";

export type StaffMember = {
  id: string;
  name: string;
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

export type LinkedAccount = { id: string; email: string };

export type CommerceManager = LinkedAccount & { isChief: boolean };

export type CommerceInvitation = {
  id: string;
  email: string;
  sentAt: string;
  expiresAt: string;
};

export type AddManagerResult =
  | { status: "linked"; manager: LinkedAccount }
  | { status: "invited"; invitation: CommerceInvitation };

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

export type StatsPeriodDays = 7 | 30 | 90;

export type Trend = { current: number; previous: number };

export type DailyCount = { date: string; count: number };

export type DelayStats = {
  answered: number;
  medianMinutes: number | null;
  meanMinutes: number | null;
  buckets: number[];
};

export type DelayTrend = { current: DelayStats; previous: DelayStats };

export type CitizenStats = {
  total: number;
  commercants: number;
  arrivals: Trend;
  arrivalsByDay: DailyCount[];
};

export type ArticleStats = {
  published: number;
  reads: Trend;
  readsByDay: DailyCount[];
  mostRead: { id: string; title: string; reads: number }[];
};

export type PollParticipation = {
  id: string;
  question: string;
  isActive: boolean;
  closesAt: string | null;
  votes: number;
  eligibleVoters: number;
  participationRate: number | null;
};

export type AppointmentStats = {
  pending: number;
  oldestPendingSince: string | null;
  received: Trend;
  receivedByDay: DailyCount[];
  outcomes: { pending: number; confirmed: number; cancelled: number };
  responseDelay: DelayTrend;
};

export type ReportStats = {
  backlog: {
    new: number;
    inProgress: number;
    oldestNewSince: string | null;
  };
  received: Trend;
  receivedByDay: DailyCount[];
  byStatus: { new: number; inProgress: number; treated: number };
  byCategory: { category: ReportCategory; count: number }[];
  responseDelay: DelayTrend;
};

export type StatsOverview = {
  period: { days: StatsPeriodDays; from: string; to: string };
  scope: "commune" | "agent";
  appointments?: AppointmentStats;
  reports?: ReportStats;
  citizens?: CitizenStats;
  articles?: ArticleStats;
  polls?: PollParticipation[];
};
