"use client";

import React from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { AdmissionsTab } from "../admissions-tab";

const SECTION_LABELS: Record<string, string> = {
  applications: "Applications",
  eligibility: "Eligibility Criteria",
  "fee-structure": "Fee Structure",
  scholarships: "Scholarships",
};

interface AdmissionsDashboardProps {
  nav: NavState;
}

export function AdmissionsDashboard({ nav }: AdmissionsDashboardProps) {
  const label = SECTION_LABELS[nav.section] ?? "Admissions";

  return (
    <PageDashboard
      pageName="Admissions"
      pageDescription="Manage admissions applications, eligibility rules, fee structure, and scholarship information"
      sectionName={label}
    >
      <AdmissionsTab />
    </PageDashboard>
  );
}
