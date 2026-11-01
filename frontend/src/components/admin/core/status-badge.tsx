"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, XCircle, FileEdit, Archive } from "lucide-react";

export type BadgeStatus = "published" | "draft" | "submitted" | "under_review" | "approved" | "rejected" | "archived" | "active" | "deactivated" | "new" | "shortlisted" | "pending";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = (status || "").toLowerCase() as BadgeStatus;

  const config: Record<string, { label: string; icon: React.ElementType; style: string }> = {
    published: { label: "Published", icon: CheckCircle2, style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    active: { label: "Active", icon: CheckCircle2, style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    approved: { label: "Approved", icon: CheckCircle2, style: "bg-teal-50 text-teal-700 border-teal-200" },
    shortlisted: { label: "Shortlisted", icon: CheckCircle2, style: "bg-sky-50 text-sky-700 border-sky-200" },
    draft: { label: "Draft", icon: FileEdit, style: "bg-slate-100 text-slate-700 border-slate-200" },
    submitted: { label: "Submitted", icon: Clock, style: "bg-amber-50 text-amber-700 border-amber-200" },
    under_review: { label: "Under Review", icon: Clock, style: "bg-amber-50 text-amber-700 border-amber-200" },
    pending: { label: "Pending", icon: Clock, style: "bg-amber-50 text-amber-700 border-amber-200" },
    new: { label: "New", icon: AlertCircle, style: "bg-blue-50 text-blue-700 border-blue-200" },
    rejected: { label: "Rejected", icon: XCircle, style: "bg-rose-50 text-rose-700 border-rose-200" },
    deactivated: { label: "Deactivated", icon: XCircle, style: "bg-rose-50 text-rose-700 border-rose-200" },
    archived: { label: "Archived", icon: Archive, style: "bg-slate-100 text-slate-500 border-slate-200" },
  };

  const current = config[s] || { label: status, icon: Clock, style: "bg-slate-100 text-slate-700 border-slate-200" };
  const Icon = current.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
        current.style,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}
