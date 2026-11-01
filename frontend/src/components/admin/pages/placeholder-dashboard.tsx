"use client";

import React from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { ComingSoonPanel } from "../coming-soon-panel";
import { Settings, BarChart3, Search } from "lucide-react";

// Config for placeholder sections that are still pending implementation
const PLACEHOLDER_CONFIG: Record<
  string,
  {
    pageName: string;
    pageDescription: string;
    sectionLabel: string;
    description: string;
    features: string[];
    icon: React.ElementType;
  }
> = {
  // ── Site Settings sub-pages ────────────────────────────────────────────────
  "site-settings:seo": {
    pageName: "Site Settings",
    pageDescription: "General configuration, SEO, analytics, and maintenance",
    sectionLabel: "SEO Settings",
    description:
      "Configure per-page SEO metadata including titles, descriptions, and Open Graph images.",
    features: [
      "Page title & meta description",
      "Keywords configuration",
      "Open Graph (OG) image",
      "URL slug management",
      "Sitemap generation",
    ],
    icon: Search,
  },
  "site-settings:analytics": {
    pageName: "Site Settings",
    pageDescription: "General configuration, SEO, analytics, and maintenance",
    sectionLabel: "Analytics",
    description:
      "Integrate Google Analytics, Facebook Pixel, and other tracking codes.",
    features: [
      "Google Analytics 4 ID",
      "Facebook Pixel integration",
      "Custom head / body scripts",
      "Traffic dashboard (coming)",
    ],
    icon: BarChart3,
  },
  "site-settings:maintenance": {
    pageName: "Site Settings",
    pageDescription: "General configuration, SEO, analytics, and maintenance",
    sectionLabel: "Maintenance Mode",
    description:
      "Enable maintenance mode to show a holding page during updates.",
    features: [
      "Enable / disable maintenance",
      "Custom maintenance message",
      "Allow admin bypass",
      "Set scheduled return time",
    ],
    icon: Settings,
  },
};

interface PlaceholderDashboardProps {
  nav: NavState;
}

export function PlaceholderDashboard({ nav }: PlaceholderDashboardProps) {
  const key = `${nav.page}:${nav.section}`;
  const cfg = PLACEHOLDER_CONFIG[key];

  if (!cfg) {
    return (
      <PageDashboard pageName={nav.page} pageDescription="" sectionName={nav.section}>
        <ComingSoonPanel
          pageName={nav.page}
          sectionName={nav.section || nav.page}
          description="This section is under construction."
          icon={Settings}
        />
      </PageDashboard>
    );
  }

  return (
    <PageDashboard
      pageName={cfg.pageName}
      pageDescription={cfg.pageDescription}
      sectionName={cfg.sectionLabel}
    >
      <ComingSoonPanel
        pageName={cfg.pageName}
        sectionName={cfg.sectionLabel}
        description={cfg.description}
        features={cfg.features}
        icon={cfg.icon}
      />
    </PageDashboard>
  );
}
