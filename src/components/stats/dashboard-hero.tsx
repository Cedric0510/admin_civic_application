export function DashboardHero({
  greeting,
  dateLabel,
  summary,
  context,
  children,
}: {
  greeting: string;
  dateLabel: string;
  summary: string;
  context: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-6 text-white shadow-lg sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-brand-300/20 blur-3xl"
      />
      <div className="relative space-y-5">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-brand-100">
            {dateLabel}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}
          </h1>
          <p className="max-w-2xl text-base text-brand-50/90">{summary}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-brand-100">{context}</p>
          {children}
        </div>
      </div>
    </header>
  );
}
