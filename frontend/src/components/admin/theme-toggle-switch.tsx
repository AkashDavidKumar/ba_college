"use client";

import React from "react";
import { useTheme } from "@/lib/theme-context";
import { Palette, Check, Sparkles } from "lucide-react";

interface ThemeToggleSwitchProps {
  variant?: "topbar" | "card";
  className?: string;
}

export function ThemeToggleSwitch({ variant = "topbar", className = "" }: ThemeToggleSwitchProps) {
  const { theme, isModern, toggleTheme } = useTheme();

  if (variant === "card") {
    return (
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isModern 
          ? "bg-white border-slate-200 shadow-md" 
          : "bg-white border-slate-200 shadow-sm"
      } ${className}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isModern ? "bg-[#E85D5D] text-white" : "bg-emerald-100 text-emerald-800"
            }`}>
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Website Color Theme
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isModern 
                    ? "bg-[#E85D5D]/15 text-[#E85D5D] border border-[#E85D5D]/30" 
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {isModern ? "ON · Modern Theme" : "OFF · Default Theme"}
                </span>
              </div>
              <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                {isModern
                  ? "Modern Red + Yellow theme active globally: White (60%), Black (20%), Light Red #E85D5D (12%), and Warm Yellow #F4C542 (8%)."
                  : "Classic Academic Green theme active. Switch ON to apply the modern white, black, light-red, and warm-yellow color system."}
              </p>

              {/* Color Swatches */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 mr-1">Palette:</span>
                {isModern ? (
                  <>
                    <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 inline-block shrink-0 shadow-xs" />
                      <span>White (60%)</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#111111] inline-block shrink-0 shadow-xs" />
                      <span>Black (20%)</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#E85D5D] inline-block shrink-0 shadow-xs" />
                      <span>Light Red (12%)</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#F4C542] inline-block shrink-0 shadow-xs" />
                      <span>Warm Yellow (8%)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#F5FBF6] border border-slate-300 inline-block shrink-0 shadow-xs" />
                      <span>Cream</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#1B5E20] inline-block shrink-0 shadow-xs" />
                      <span>Forest Green</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#4CAF50] inline-block shrink-0 shadow-xs" />
                      <span>Emerald</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#C8E6C9] inline-block shrink-0 shadow-xs" />
                      <span>Soft Green</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Toggle Action */}
          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            <button
              onClick={toggleTheme}
              type="button"
              role="switch"
              aria-checked={isModern}
              aria-label="Toggle Color Theme"
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isModern
                  ? "bg-[#E85D5D] focus-visible:ring-[#E85D5D]"
                  : "bg-slate-300 hover:bg-slate-400 focus-visible:ring-slate-400"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
                  isModern ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-xs font-bold text-slate-800 min-w-[50px]">
              {isModern ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Compact Topbar Pill Switch
  return (
    <div
      className={`inline-flex items-center gap-2 p-1 pl-2.5 pr-1.5 rounded-full border transition-all duration-300 ${
        isModern
          ? "bg-slate-900 border-[#E85D5D]/50 text-white shadow-xs"
          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
      } ${className}`}
      title={isModern ? "Current: Modern Red + Yellow Theme (Click to switch to Default)" : "Current: Default Academic Theme (Click to switch to Modern Theme)"}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <Palette className={`w-3.5 h-3.5 ${isModern ? "text-[#F4C542]" : "text-slate-500"}`} />
        <span className="hidden sm:inline">Theme:</span>
        <span className={`text-[11px] font-bold ${isModern ? "text-[#F4C542]" : "text-slate-600"}`}>
          {isModern ? "Red+Yellow" : "Default"}
        </span>
      </div>

      <button
        onClick={toggleTheme}
        type="button"
        role="switch"
        aria-checked={isModern}
        aria-label={`Toggle Theme (${isModern ? "ON" : "OFF"})`}
        className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out focus:outline-none ${
          isModern
            ? "bg-[#E85D5D]"
            : "bg-slate-300 hover:bg-slate-400"
        }`}
      >
        <span
          className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-300 ease-in-out text-[9px] font-black ${
            isModern ? "translate-x-6 text-[#E85D5D]" : "translate-x-0 text-slate-500"
          }`}
        >
          {isModern ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
}
