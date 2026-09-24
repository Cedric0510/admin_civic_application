import { CalendarCheck, Landmark, Megaphone, Newspaper } from "lucide-react";

const highlights = [
  { icon: Newspaper, text: "Publiez vos actualités et sondez vos habitants" },
  {
    icon: CalendarCheck,
    text: "Recevez les demandes de rendez-vous sur vos créneaux",
  },
  { icon: Megaphone, text: "Suivez les signalements jusqu'à leur résolution" },
];

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-10 size-96 rounded-full bg-brand-300/20 blur-3xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <Landmark size={22} aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight">City-Co</span>
        </div>

        <div className="relative space-y-8">
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Le quotidien de votre commune, au même endroit.
          </h2>
          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-brand-50/90">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10">
                  <Icon size={18} aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-brand-200/80">
          Espace réservé aux agents et administrateurs de mairie.
        </p>
      </aside>

      <main className="flex items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 lg:hidden">
              <Landmark size={22} aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

export function AuthAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
          : "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
      }
    >
      {children}
    </p>
  );
}
