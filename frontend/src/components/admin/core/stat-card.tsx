"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color,
  variant,
  onClick,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType | React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color?: "blue" | "emerald" | "amber" | "violet" | "rose" | "teal" | "gold" | "purple" | "default";
  variant?: "blue" | "emerald" | "amber" | "violet" | "rose" | "teal" | "gold" | "purple" | "default";
  onClick?: () => void;
  className?: string;
}) {
  const activeColor = color || (variant === "purple" ? "violet" : variant === "default" ? "teal" : variant) || "blue";

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    teal: "bg-teal-50 text-[#009688] border-teal-100",
    gold: "bg-amber-50 text-amber-700 border-amber-200",
    default: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const Component = Icon as React.ElementType;
    return <Component className="w-5 h-5" />;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all",
        onClick && "cursor-pointer hover:border-[#009688]/40 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-serif">{value}</h3>
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border shrink-0", colorMap[activeColor] || colorMap.blue)}>
          {renderIcon()}
        </div>
      </div>

      {(subtitle || trendLabel) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trendLabel && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-bold",
                trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-600"
              )}
            >
              {trend === "up" && <ArrowUpRight className="w-3.5 h-3.5" />}
              {trend === "down" && <ArrowDownRight className="w-3.5 h-3.5" />}
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
