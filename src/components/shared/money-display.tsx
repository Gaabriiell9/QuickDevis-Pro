"use client";

import { cn } from "@/lib/utils/cn";

interface MoneyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  colored?: boolean;
  size?: "sm" | "md" | "lg";
}

export function MoneyDisplay({
  amount,
  currency = "EUR",
  className,
  colored,
  size = "md",
}: MoneyDisplayProps) {
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg font-semibold",
        colored && amount > 0 && "text-emerald-600",
        colored && amount < 0 && "text-red-600",
        className
      )}
    >
      {formatted}
    </span>
  );
}
