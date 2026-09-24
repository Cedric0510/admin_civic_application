export type Tone = "brand" | "good" | "warn" | "bad" | "neutral" | "violet";

export const toneText: Record<Tone, string> = {
  brand: "text-brand-600",
  good: "text-emerald-600",
  warn: "text-amber-500",
  bad: "text-rose-500",
  neutral: "text-slate-300",
  violet: "text-violet-500",
};

export const toneSoft: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  good: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  bad: "bg-rose-50 text-rose-700",
  neutral: "bg-slate-100 text-slate-600",
  violet: "bg-violet-50 text-violet-700",
};

export const toneSolid: Record<Tone, string> = {
  brand: "bg-brand-500",
  good: "bg-emerald-500",
  warn: "bg-amber-400",
  bad: "bg-rose-500",
  neutral: "bg-slate-300",
  violet: "bg-violet-500",
};

export const toneStrong: Record<Tone, string> = {
  brand: "bg-brand-600",
  good: "bg-emerald-600",
  warn: "bg-amber-500",
  bad: "bg-rose-600",
  neutral: "bg-slate-400",
  violet: "bg-violet-600",
};
