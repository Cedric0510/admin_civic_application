import { cn } from "@/lib/utils";

export function StatsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
        className,
      )}
    >
      {title && (
        <p className="mb-4 text-sm font-medium text-slate-600">{title}</p>
      )}
      {children}
    </div>
  );
}
