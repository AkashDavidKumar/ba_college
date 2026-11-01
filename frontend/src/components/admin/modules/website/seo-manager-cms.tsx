"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/admin/core/page-header";
import { useCMSStore } from "@/lib/cms-store";
import { useToast } from "@/hooks/use-toast";
import { Search, Globe, Save, Sparkles, CheckCircle2, Shield, Eye } from "lucide-react";

type PageSEOConfig = {
  pageId: string;
  pageName: string;
  url: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robotsIndex: boolean;
};

const DEFAULT_SEO_CONFIGS: PageSEOConfig[] = [
  {
    pageId: "home",
    pageName: "Homepage",
    url: "https://bishopambrosecollege.edu.in/",
    metaTitle: "Bishop Ambrose College, Coimbatore | Autonomous Institution",
    metaDescription: "Bishop Ambrose College, Coimbatore is an Autonomous, Co-Educational institution affiliated to Bharathiar University offering premier undergraduate programmes since 1994.",
    ogTitle: "Bishop Ambrose College — Excellence in Education",
    ogDescription: "Affiliated to Bharathiar University · Autonomous Institution in Coimbatore.",
    ogImage: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    robotsIndex: true,
  },
  {
    pageId: "about",
    pageName: "About Us",
    url: "https://bishopambrosecollege.edu.in/about",
    metaTitle: "About Bishop Ambrose College | History, Governance & Leadership",
    metaDescription: "Learn about the heritage of Bishop Ambrose College, Diocese of Coimbatore, Secretary and Principal messages, and institutional organogram.",
    ogTitle: "About Bishop Ambrose College",
    ogDescription: "Heritage, Governance and Leadership since 1994.",
    ogImage: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    robotsIndex: true,
  },
  {
    pageId: "academic",
    pageName: "Academic Programmes",
    url: "https://bishopambrosecollege.edu.in/academic",
    metaTitle: "Courses Offered & Academic Departments | Bishop Ambrose College",
    metaDescription: "Explore 13 undergraduate degree programmes in Computer Science, Commerce, Mathematics, and Humanities with CBCS curriculum.",
    ogTitle: "Academic Programmes — Bishop Ambrose College",
    ogDescription: "Undergraduate degrees in Science, Commerce & Arts.",
    ogImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    robotsIndex: true,
  },
  {
    pageId: "admissions",
    pageName: "Admissions 2026-27",
    url: "https://bishopambrosecollege.edu.in/admissions",
    metaTitle: "Admissions 2026-27 | Bishop Ambrose College Coimbatore",
    metaDescription: "Apply online for 2026-27 undergraduate admissions. Check eligibility criteria, fee structure, and scholarship guidelines.",
    ogTitle: "Apply for 2026-27 Admissions — Bishop Ambrose College",
    ogDescription: "Online Application Portal for UG Courses.",
    ogImage: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    robotsIndex: true,
  },
];

export function SeoManagerCMS() {
  const { toast } = useToast();
  const [seoConfigs, setSeoConfigs] = useState<PageSEOConfig[]>(DEFAULT_SEO_CONFIGS);
  const [selectedPage, setSelectedPage] = useState<string>("home");

  const current = seoConfigs.find((s) => s.pageId === selectedPage) || seoConfigs[0];

  const handleUpdateCurrent = (field: keyof PageSEOConfig, value: any) => {
    setSeoConfigs((prev) =>
      prev.map((c) => (c.pageId === selectedPage ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = () => {
    toast({
      title: "SEO Settings Saved",
      description: `Meta tags and Open Graph metadata updated for '${current.pageName}'.`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="SEO & Open Graph Meta Manager"
        subtitle="Optimize Google search snippets, social media Open Graph cards, canonical URLs, and crawler indexing for all public pages."
        badge="Search Optimization"
        breadcrumbs={[
          { label: "Dashboard", onClick: () => {} },
          { label: "Website" },
          { label: "SEO" },
        ]}
        action={{
          label: "Save SEO Metadata",
          icon: Save,
          onClick: handleSave,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Page Selector */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 px-2">
            Select Public Page
          </h3>
          {seoConfigs.map((page) => {
            const active = selectedPage === page.pageId;
            return (
              <button
                key={page.pageId}
                onClick={() => setSelectedPage(page.pageId)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left font-semibold text-xs transition-all cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div>
                  <p className="font-bold">{page.pageName}</p>
                  <p className={`text-[10px] truncate max-w-[200px] font-mono ${active ? "text-slate-300" : "text-slate-400"}`}>
                    {page.url}
                  </p>
                </div>
                {page.robotsIndex && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${active ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                    Index
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Meta Settings Form & Live Snippet Preview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Form */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-serif">
                Meta Settings for: {current.pageName}
              </h3>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Meta Title *
                </label>
                <span className={`text-[10px] font-mono ${current.metaTitle.length > 60 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                  {current.metaTitle.length} / 60 chars recommended
                </span>
              </div>
              <input
                type="text"
                value={current.metaTitle}
                onChange={(e) => handleUpdateCurrent("metaTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Meta Description *
                </label>
                <span className={`text-[10px] font-mono ${current.metaDescription.length > 160 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                  {current.metaDescription.length} / 160 chars recommended
                </span>
              </div>
              <textarea
                rows={3}
                value={current.metaDescription}
                onChange={(e) => handleUpdateCurrent("metaDescription", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-slate-800 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Open Graph Title
                </label>
                <input
                  type="text"
                  value={current.ogTitle}
                  onChange={(e) => handleUpdateCurrent("ogTitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Open Graph Image URL
                </label>
                <input
                  type="text"
                  value={current.ogImage}
                  onChange={(e) => handleUpdateCurrent("ogImage", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-slate-800 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="robotsIndex"
                checked={current.robotsIndex}
                onChange={(e) => handleUpdateCurrent("robotsIndex", e.target.checked)}
                className="rounded border-slate-300 text-slate-900"
              />
              <label htmlFor="robotsIndex" className="text-xs text-slate-700 cursor-pointer">
                Allow search engines to index this page (robots: index, follow)
              </label>
            </div>
          </div>

          {/* Live Google Search Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Live Google SERP Snippet Preview
            </h4>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1 max-w-xl">
              <p className="text-[11px] text-slate-500 font-mono truncate">{current.url}</p>
              <h5 className="text-base text-blue-700 hover:underline font-medium cursor-pointer line-clamp-1">
                {current.metaTitle || "Page Title"}
              </h5>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {current.metaDescription || "No meta description configured for this page."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SeoManagerCMS as SEOManagerCMS };
