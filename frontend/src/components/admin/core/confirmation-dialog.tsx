"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfirmationDialog({
  open,
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  confirmText,
  confirmVariant,
  variant,
  requiresReason = false,
  reasonPlaceholder = "Please state the reason for this action...",
}: {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmText?: string;
  confirmVariant?: "danger" | "primary" | "success";
  variant?: string;
  requiresReason?: boolean;
  reasonPlaceholder?: string;
}) {
  const [reason, setReason] = useState("");

  const isVisible = open !== undefined ? open : (isOpen ?? false);
  if (!isVisible) return null;

  const resolvedLabel = confirmLabel || confirmText || "Confirm";
  const resolvedVariant = (variant as "danger" | "primary" | "success") || confirmVariant || "danger";

  const handleConfirm = () => {
    onConfirm(requiresReason ? reason : undefined);
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                resolvedVariant === "danger" && "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
                resolvedVariant === "primary" && "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
                resolvedVariant === "success" && "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {resolvedVariant === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reason Input (Optional/Conditional) */}
        {requiresReason && (
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reason / Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={requiresReason && !reason.trim()}
            onClick={handleConfirm}
            className={cn(
              "px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50",
              resolvedVariant === "danger" && "bg-rose-600 hover:bg-rose-700",
              resolvedVariant === "primary" && "bg-amber-600 hover:bg-amber-700",
              resolvedVariant === "success" && "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {resolvedLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
