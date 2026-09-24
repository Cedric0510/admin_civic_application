import { useId } from "react";
import { cn } from "@/lib/utils";
import { toneText, type Tone } from "./tone";

const WIDTH = 120;
const HEIGHT = 36;
const PADDING = 3;

export function sparklinePath(values: number[]): { line: string; area: string } {
  const highest = Math.max(...values, 0);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? WIDTH / 2 : (index / (values.length - 1)) * WIDTH;
    const y =
      highest === 0
        ? HEIGHT - PADDING
        : HEIGHT - PADDING - (value / highest) * (HEIGHT - 2 * PADDING);
    return { x, y };
  });
  const line = points
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  return { line, area: `${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z` };
}

export function Sparkline({
  values,
  label,
  tone = "brand",
}: {
  values: number[];
  label: string;
  tone?: Tone;
}) {
  const gradientId = useId();
  if (values.length === 0) return null;

  const { line, area } = sparklinePath(values);
  const flat = Math.max(...values) === 0;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={cn("h-10 w-full", toneText[flat ? "neutral" : tone])}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
