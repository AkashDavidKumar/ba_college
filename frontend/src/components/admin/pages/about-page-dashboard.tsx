"use client";

import React from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { AboutPageManager } from "../about-manager";
import { ComingSoonPanel } from "../coming-soon-panel";
import { BookOpen, Award, Target, ShieldCheck } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  "about-college": "About College",
  "vision-mission": "Vision & Mission",
  "principal-message": "Principal's Message",
  history: "History & Legacy",
  achievements: "Achievements",
  accreditation: "Accreditation",
};

interface AboutPageDashboardProps {
  nav: NavState;
}

export function AboutPageDashboard({ nav }: AboutPageDashboardProps) {
  const sectionLabel = SECTION_LABELS[nav.section] ?? nav.section;

  // The AboutPageManager is a full self-contained component covering all
  // About sub-sections. We render it for all about-related sections.
  const aboutSections = [
    "about-college",
    "vision-mission",
    "principal-message",
    "history",
  ];

  return (
    <PageDashboard
      pageName="About Page"
      pageDescription="Manage the university's story, leadership messages, and institutional information"
      sectionName={sectionLabel}
    >
      {/* Main about sections — routed to full AboutPageManager */}
      {(aboutSections.includes(nav.section) || !nav.section) && (
        <AboutPageManager />
      )}

      {nav.section === "achievements" && (
        <ComingSoonPanel
          pageName="About Page"
          sectionName="Achievements"
          description="Showcase the university's awards, rankings, and milestones."
          features={[
            "Add / edit achievement cards",
            "Upload award certificates",
            "National & international rankings",
            "Alumni achievement highlights",
          ]}
          icon={Award}
        />
      )}

      {nav.section === "accreditation" && (
        <ComingSoonPanel
          pageName="About Page"
          sectionName="Accreditation"
          description="Display NAAC, NBA, and other accreditation details and documents."
          features={[
            "Accreditation badge display",
            "Upload accreditation certificates",
            "NAAC score details",
            "Validity and renewal dates",
          ]}
          icon={ShieldCheck}
        />
      )}
    </PageDashboard>
  );
}
