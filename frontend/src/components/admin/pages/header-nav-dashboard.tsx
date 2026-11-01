"use client";

import React from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { GeneralSettingsTab } from "../general-settings-tab";
import { ComingSoonPanel } from "../coming-soon-panel";
import { Link2, Navigation, MousePointerClick, Smartphone, Zap } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  logo: "Logo & College Name",
  "main-nav": "Main Navigation",
  "apply-button": "Apply Now Button",
  "mobile-menu": "Mobile Menu",
  "quick-links": "Quick Links",
};

interface HeaderNavDashboardProps {
  nav: NavState;
}

export function HeaderNavDashboard({ nav }: HeaderNavDashboardProps) {
  const label = SECTION_LABELS[nav.section] ?? "Header & Navigation";

  return (
    <PageDashboard
      pageName="Header & Navigation"
      pageDescription="Control the site header, logo, navigation menu, and apply button"
      sectionName={label}
    >
      {/* Logo & College Name — handled in GeneralSettingsTab */}
      {(nav.section === "logo" || !nav.section) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-amber-600" />
              Logo & College Name
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload logo image, set college name lines displayed in the header.
            </p>
          </div>
          <div className="p-6">
            <GeneralSettingsTab />
          </div>
        </div>
      )}

      {nav.section === "main-nav" && (
        <ComingSoonPanel
          pageName="Header & Navigation"
          sectionName="Main Navigation Builder"
          description="Manage navigation menu items, order, visibility, and dropdown structures."
          features={[
            "Show / hide individual nav links",
            "Rename navigation labels",
            "Reorder menu items via drag-and-drop",
            "Create multi-level dropdown menus",
            "Add external links to navigation",
            "Mobile menu configuration",
          ]}
          icon={Navigation}
        />
      )}

      {nav.section === "apply-button" && (
        <ComingSoonPanel
          pageName="Header & Navigation"
          sectionName="Apply Now Button"
          description="Configure the Apply Now CTA button in the header — label, link, color, and visibility."
          features={[
            "Change button label text",
            "Set destination URL",
            "Enable / disable on mobile",
            "Choose button color scheme",
          ]}
          icon={MousePointerClick}
        />
      )}

      {nav.section === "mobile-menu" && (
        <ComingSoonPanel
          pageName="Header & Navigation"
          sectionName="Mobile Menu Settings"
          description="Configure the mobile hamburger menu behavior and displayed links."
          features={[
            "Show / hide mobile nav items",
            "Mobile quick-access shortcuts",
            "Mobile CTA button config",
          ]}
          icon={Smartphone}
        />
      )}

      {nav.section === "quick-links" && (
        <ComingSoonPanel
          pageName="Header & Navigation"
          sectionName="Quick Links"
          description="Manage the quick links shown in the top bar or header utility bar."
          features={[
            "Add / remove quick links",
            "ERP portal link",
            "Student / Faculty login shortcuts",
          ]}
          icon={Zap}
        />
      )}
    </PageDashboard>
  );
}
