import type { ReactNode } from "react";

type ChipVariant = "default" | "ai" | "success" | "warning" | "error";

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  className?: string;
}

const variantStyles: Record<ChipVariant, string> = {
  default: "bg-surface-container text-on-surface-variant",
  ai: "bg-secondary/10 text-secondary",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-error-container text-on-error-container",
};

export function Chip({ children, variant = "default", className = "" }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-label-md ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
