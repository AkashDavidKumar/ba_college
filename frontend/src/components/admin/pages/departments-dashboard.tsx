"use client";

import React from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import { DepartmentsTab } from "../departments-tab";

interface DepartmentsDashboardProps {
  nav: NavState;
}

export function DepartmentsDashboard({ nav }: DepartmentsDashboardProps) {
  // DepartmentsTab already contains full add/edit/delete functionality.
  // The nav.section holds the dept slug (e.g. "dept-bca") or "dept-add".
  // We pass it down so DepartmentsTab could optionally auto-focus a dept,
  // but for now DepartmentsTab is already self-contained.
  const label =
    nav.section === "dept-add"
      ? "Add Department"
      : nav.section
          .replace("dept-", "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()) || "All Departments";

  return (
    <PageDashboard
      pageName="Departments"
      pageDescription="Manage academic departments, programs, faculty, labs, and department content"
      sectionName={label}
    >
      <DepartmentsTab />
    </PageDashboard>
  );
}
