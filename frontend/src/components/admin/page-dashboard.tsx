"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

interface PageDashboardProps {
  pageName: string;
  pageDescription?: string;
  sectionName?: string;
  children: React.ReactNode;
  breadcrumbExtra?: string;
}

/** Generic outer shell for all page dashboards. Renders a breadcrumb header
 *  and wraps the active section content. */
export function PageDashboard({
  pageName,
  pageDescription,
  sectionName,
  children,
  breadcrumbExtra,
}: PageDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb + page header */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1.5">
          <span className="text-slate-600 font-semibold">{pageName}</span>
          {sectionName && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-amber-600 font-semibold">{sectionName}</span>
            </>
          )}
          {breadcrumbExtra && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span>{breadcrumbExtra}</span>
            </>
          )}
        </div>
        {pageDescription && (
          <p className="text-sm text-slate-500">{pageDescription}</p>
        )}
      </div>

      {/* Section content */}
      <div>{children}</div>
    </div>
  );
}
