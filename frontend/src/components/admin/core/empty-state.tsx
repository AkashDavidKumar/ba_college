"use client";

import React from "react";
import { FolderOpen, Plus } from "lucide-react";

export function EmptyState({
  icon: Icon = FolderOpen,
  title = "No records found",
  description = "Get started by adding a new item or adjusting your filters.",
  actionLabel,
  onAction,
}: {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-200">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 font-serif">{title}</h3>
      <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2.5 rounded-xl bg-[#009688] hover:bg-[#00796b] text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
