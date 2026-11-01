"use client";

import React from "react";
import {
  Megaphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  Plus,
  ArrowRight,
  TrendingUp,
  Eye,
  MousePointer,
  Sparkles,
} from "lucide-react";
import { AdvertisementStats, Advertisement } from "@/types/advertisement";

interface AdvertisementDashboardProps {
  stats: AdvertisementStats;
  recentAds: Advertisement[];
  onAddNew: () => void;
  onViewAll: () => void;
  onFilterStatus: (status: string) => void;
}

export function AdvertisementDashboard({
  stats,
  recentAds,
  onAddNew,
  onViewAll,
  onFilterStatus,
}: AdvertisementDashboardProps) {
  const statCards = [
    {
      id: "total",
      label: "Total Advertisements",
      value: stats.total,
      icon: Megaphone,
      color: "from-blue-600 to-indigo-600",
      lightBg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-800/60",
      textColor: "text-blue-700 dark:text-blue-400",
      onClick: () => onFilterStatus("all"),
    },
    {
      id: "active",
      label: "Active Advertisements",
      value: stats.active,
      icon: CheckCircle2,
      color: "from-emerald-600 to-teal-600",
      lightBg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800/60",
      textColor: "text-emerald-700 dark:text-emerald-400",
      onClick: () => onFilterStatus("active"),
    },
    {
      id: "scheduled",
      label: "Scheduled Advertisements",
      value: stats.scheduled,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800/60",
      textColor: "text-amber-700 dark:text-amber-400",
      onClick: () => onFilterStatus("scheduled"),
    },
    {
      id: "expired",
      label: "Expired Advertisements",
      value: stats.expired,
      icon: AlertCircle,
      color: "from-rose-600 to-pink-600",
      lightBg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800/60",
      textColor: "text-rose-700 dark:text-rose-400",
      onClick: () => onFilterStatus("expired"),
    },
    {
      id: "draft",
      label: "Draft Advertisements",
      value: stats.draft,
      icon: FileEdit,
      color: "from-slate-600 to-slate-800",
      lightBg: "bg-slate-100 dark:bg-slate-800/60",
      border: "border-slate-200 dark:border-slate-700",
      textColor: "text-slate-700 dark:text-slate-300",
      onClick: () => onFilterStatus("draft"),
    },
  ];

  const totalImpressions = recentAds.reduce((sum, ad) => sum + (ad.impressionCount || 0), 0);
  const totalClicks = recentAds.reduce((sum, ad) => sum + (ad.clickCount || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={card.onClick}
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${card.border} shadow-xs hover:shadow-md transition-all text-left group cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${card.lightBg} ${card.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-amber-600 transition-colors">
                  Filter
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {card.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Analytics Insights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-md border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            <span>Total Ad Impressions</span>
          </div>
          <p className="text-3xl font-black text-white">{totalImpressions.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total views recorded across active popups</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-md border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <MousePointer className="w-4 h-4" />
            <span>Total Ad Clicks</span>
          </div>
          <p className="text-3xl font-black text-white">{totalClicks.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Visitor clicks redirecting to destination URLs</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-md border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Click-Through Rate (CTR)</span>
          </div>
          <p className="text-3xl font-black text-white">{ctr}%</p>
          <p className="text-xs text-slate-400">Average engagement performance ratio</p>
        </div>
      </div>

      {/* Recent Advertisements & Quick Launch Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Recent Advertisement Campaigns</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overview of recent popup campaigns configured on the college portal
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Advertisement</span>
            </button>
            <button
              onClick={onViewAll}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentAds.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Megaphone className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No advertisements found</p>
            <p className="text-xs text-slate-500 mt-1">Get started by creating your first website advertisement campaign.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {recentAds.slice(0, 3).map((ad) => (
              <div
                key={ad.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="relative aspect-16/9 rounded-lg overflow-hidden bg-slate-900">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    <span
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                        ad.status === "active"
                          ? "bg-emerald-500 text-white"
                          : ad.status === "scheduled"
                          ? "bg-amber-500 text-slate-950"
                          : ad.status === "expired"
                          ? "bg-rose-500 text-white"
                          : "bg-slate-600 text-white"
                      }`}
                    >
                      {ad.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{ad.title}</h4>
                  {ad.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{ad.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Duration: <strong>{ad.displayDuration}s</strong></span>
                  <span>Priority: <strong>#{ad.priority}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
