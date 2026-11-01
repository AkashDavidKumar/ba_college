"use client";

import React from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { HeroVideoManager } from "../hero-video-manager";
import { VirtualTourManager } from "../virtual-tour-manager";
import { HomepageStatisticsManager } from "../statistics-manager";
import { ComingSoonPanel } from "../coming-soon-panel";
import { GeneralSettingsTab } from "../general-settings-tab";
import { NewsEventsManager } from "../news-events-manager";
import {
  Home,
  Video,
  BarChart3,
  Newspaper,
} from "lucide-react";

const TABS = [
  { id: "hero",         label: "Hero Section",   icon: Video },
  { id: "virtual-tour", label: "Virtual Tour",   icon: Home },
  { id: "statistics",   label: "Statistics",     icon: BarChart3 },
  { id: "news-events",  label: "News & Events",  icon: Newspaper },
];

interface HomePageDashboardProps {
  nav: NavState;
  setNav: (nav: NavState) => void;
}

export function HomePageDashboard({ nav, setNav }: HomePageDashboardProps) {
  const activeSection =
    nav.section &&
    nav.section !== "announcements" &&
    nav.section !== "footer" &&
    TABS.some((t) => t.id === nav.section)
      ? nav.section
      : "hero";

  const setSection = (id: string) => setNav({ page: "home", section: id });

  return (
    <PageDashboard
      pageName="Home Page Management"
      pageDescription="Manage all content sections displayed on the public website homepage"
      sectionName={TABS.find((t) => t.id === activeSection)?.label}
    >
      {/* ── Internal Tab Bar ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSection(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-amber-400 text-amber-700 bg-amber-50/60"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-600" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section Content ──────────────────────────────── */}
      {activeSection === "hero"          && <HeroVideoManager />}
      {activeSection === "virtual-tour"  && <VirtualTourManager />}
      {activeSection === "statistics"    && <HomepageStatisticsManager />}
      {activeSection === "news-events"   && <NewsEventsManager />}
    </PageDashboard>
  );
}

