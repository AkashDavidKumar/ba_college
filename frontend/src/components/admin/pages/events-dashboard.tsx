"use client";

import React from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { EventsTab } from "../events-tab";

const SECTION_LABELS: Record<string, string> = {
  "upcoming-events": "Upcoming Events",
  "past-events": "Past Events",
  "event-gallery": "Event Gallery",
  news: "News & Announcements",
};

interface EventsDashboardProps {
  nav: NavState;
}

export function EventsDashboard({ nav }: EventsDashboardProps) {
  const label = SECTION_LABELS[nav.section] ?? "All Events";

  return (
    <PageDashboard
      pageName="Events & News"
      pageDescription="Create, edit, and manage university events, news articles, and announcements"
      sectionName={label}
    >
      <EventsTab />
    </PageDashboard>
  );
}
