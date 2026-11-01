"use client";

import React from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { IqacManager } from "../iqac-manager";

const SECTION_LABELS: Record<string, string> = {
  "iqac-overview": "About IQAC",
  committee: "Committee Members",
  aqar: "AQAR Reports",
  ssr: "SSR Reports",
  minutes: "Minutes of Meeting",
  "academic-calendar": "Academic Calendar",
  policies: "Policies & Downloads",
};

interface IqacDashboardProps {
  nav: NavState;
}

export function IqacDashboard({ nav }: IqacDashboardProps) {
  const label = SECTION_LABELS[nav.section] ?? "IQAC";

  return (
    <PageDashboard
      pageName="IQAC"
      pageDescription="Internal Quality Assurance Cell — manage NAAC, AQAR, SSR, and quality compliance documents"
      sectionName={label}
    >
      <IqacManager />
    </PageDashboard>
  );
}
