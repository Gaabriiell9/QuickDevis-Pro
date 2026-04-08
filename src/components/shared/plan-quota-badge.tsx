"use client";

import { cn } from "@/lib/utils";

interface PlanQuotaBadgeProps {
  used: number;
  limit: number;
  label: string;
}

export function PlanQuotaBadge({ used, limit, label }: PlanQuotaBadgeProps) {
  const pct = Math.min((used / limit) * 100, 100);
  const isNearLimit = used >= limit - 1;
  const isAtLimit = used >= limit;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
      <span className={cn("font-medium", isAtLimit ? "text-red-600" : isNearLimit ? "text-amber-600" : "text-slate-600")}>
        {used} / {limit} {label}
      </span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn("h-full rounded-full transition-all", isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-indigo-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
