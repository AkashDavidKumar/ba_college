"use client";

import React from "react";
import { Construction, ArrowRight } from "lucide-react";

interface ComingSoonPanelProps {
  pageName: string;
  sectionName: string;
  description?: string;
  features?: string[];
  icon?: React.ElementType;
}

export function ComingSoonPanel({
  pageName,
  sectionName,
  description,
  features = [],
  icon: Icon = Construction,
}: ComingSoonPanelProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      {/* Decorative background */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-amber-200/50">
          <Icon className="w-12 h-12 text-amber-600" />
        </div>
        {/* Ping pulse */}
        <div className="absolute inset-0 rounded-3xl bg-amber-300/30 animate-ping" style={{ animationDuration: "2s" }} />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Coming Soon
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        {sectionName}
      </h2>
      <p className="text-sm text-slate-500 mb-1 font-medium">
        Part of <span className="text-slate-700 font-semibold">{pageName}</span>
      </p>

      {description && (
        <p className="text-sm text-slate-400 max-w-md mt-3 leading-relaxed">
          {description}
        </p>
      )}

      {features.length > 0 && (
        <div className="mt-6 w-full max-w-sm space-y-2 text-left">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">
            Planned Features
          </p>
          {features.map((f) => (
            <div
              key={f}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs"
            >
              <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-sm text-slate-600">{f}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 px-5 py-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 max-w-xs">
        This module is being built. Your existing data is safe and will be accessible here once ready.
      </div>
    </div>
  );
}
