"use client";

import React from "react";
import { ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  description,
  badge,
  breadcrumbs = [],
  action,
  actions,
  secondaryAction,
  className,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  breadcrumbs?: { label: string; href?: string; onClick?: () => void }[];
  action?: {
    label: string;
    icon?: React.ElementType;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger";
  };
  actions?: React.ReactNode;
  secondaryAction?: {
    label: string;
    icon?: React.ElementType;
    onClick: () => void;
  };
  className?: string;
}) {
  const displaySubtitle = description || subtitle;

  return (
    <div className={cn("mb-6 space-y-3", className)}>
      {/* Breadcrumb Trail */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((b, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />}
                {b.onClick ? (
                  <button
                    onClick={b.onClick}
                    className={cn(
                      "hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer",
                      isLast ? "font-semibold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {b.label}
                  </button>
                ) : (
                  <span
                    className={cn(
                      isLast ? "font-semibold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {b.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                {badge}
              </span>
            )}
          </div>
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {actions}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-all cursor-pointer"
            >
              {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
              <span>{secondaryAction.label}</span>
            </button>
          )}

          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer",
                action.variant === "danger" && "bg-rose-600 hover:bg-rose-700",
                action.variant === "secondary" && "bg-slate-800 hover:bg-slate-900 text-white",
                (!action.variant || action.variant === "primary") && "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
              )}
            >
              {action.icon ? (
                <action.icon className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{action.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
