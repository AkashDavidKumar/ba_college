"use client";

import React, { useState } from "react";
import { useSiteData } from "@/lib/site-context";
import { useCMSStore } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { useToast } from "@/hooks/use-toast";
import { HomepageSectionEditor } from "./homepage-section-editor";
import type { HomepageSection as HSection } from "./homepage-section-editor";
import {
  Eye,
  Save,
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
  Layers,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

type HomepageSection = HSection;

const DEFAULT_SECTIONS: HomepageSection[] = [
  { id: "hero", name: "Hero Banner & Video Tour", description: "Main welcome banner, virtual tour CTA, and application button", enabled: true, order: 1 },
  { id: "why-choose", name: "Four Decades of Excellence (Stats)", description: "Years of excellence, enrolled students, and key institutional metrics", enabled: true, order: 2 },
  { id: "news-events", name: "News & Upcoming Events Feed", description: "Live announcements, circulars, conferences, and sports meet updates", enabled: true, order: 3 },
  { id: "about", name: "College Legacy & Vision", description: "Diocese heritage, Christian values, and accreditation badges", enabled: true, order: 4 },
  { id: "departments", name: "Academic Departments Grid", description: "Overview cards for all 13 undergraduate programmes", enabled: true, order: 5 },
  { id: "facilities", name: "Campus Infrastructure Highlights", description: "Smart classrooms, computing laboratories, and sports grounds", enabled: true, order: 6 },
  { id: "placements", name: "Placements & Corporate Partners", description: "85%+ placement record, top recruiters like TCS, Infosys, Zoho", enabled: true, order: 7 },
  { id: "student-life", name: "Student Life & Cultural Clubs", description: "Fine Arts, NSS, Sports, and Ambrose Fiesta activities", enabled: true, order: 8 },
  { id: "success-stories", name: "Alumni Testimonials & Hall of Fame", description: "Quotes from distinguished graduates leading in tech and banking", enabled: true, order: 9 },
  { id: "home-cta", name: "Admissions Call-to-Action Banner", description: "Direct link to 2026-27 online admission application", enabled: true, order: 10 },
];

export function HomepageCMS() {
  const { data, updateGeneralSettings } = useSiteData();
  const { logAction } = useCMSStore();
  const { toast } = useToast();

  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_SECTIONS);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"layout" | "hero_content" | "preview">("layout");
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);

  const [heroForm, setHeroForm] = useState({
    badge: data?.hero?.badge || "Admissions Open 2026-27",
    title: data?.hero?.title || "Bishop Ambrose College",
    subtitle: data?.hero?.subtitle || "Autonomous Institution · Affiliated to Bharathiar University · Co-Education. Empowering students through quality education, character, and service since 1994.",
    ctaText: data?.hero?.ctaText || "Apply Now",
    secondaryCtaText: data?.hero?.secondaryCtaText || "Explore Courses",
  });

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((s, i) => (s.order = i + 1));
    setSections(updated);
  };

  const handleSaveHomepage = async () => {
    try {
      await updateGeneralSettings({
        hero: {
          ...data?.hero,
          ...heroForm,
          ctaLink: "admissions",
          secondaryCtaLink: "departments",
          virtualTourUrl: "https://www.youtube.com/embed/91tSZsX0Bjg",
        },
      });
      logAction({ action: "UPDATE", module: "Homepage CMS", recordId: "homepage-config", recordTitle: "Updated homepage layout and hero content" });
      toast({ title: "Homepage CMS Updated", description: "Homepage layout and settings published to public website." });
    } catch {
      toast({ title: "Error Saving", description: "Failed to publish homepage updates.", variant: "destructive" });
    }
  };

  const handleSectionSave = (section: HomepageSection, _data: any, _seo: any, settings: any) => {
    setSections((prev) =>
      prev.map((s) => s.id === section.id ? { ...s, enabled: settings.isVisible, order: settings.sortOrder } : s)
    );
    logAction({ action: "UPDATE", module: "Homepage CMS", recordId: section.id, recordTitle: `Section updated: ${section.name}` });
  };

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Homepage CMS & Layout Builder"
          subtitle="Manage sections, visual layout, ordering, and hero messaging of the Bishop Ambrose College public homepage."
          badge="Visual CMS"
          breadcrumbs={[
            { label: "Dashboard", onClick: () => {} },
            { label: "Website" },
            { label: "Homepage" },
          ]}
          action={{ label: "Save & Publish Changes", icon: Save, onClick: handleSaveHomepage }}
        />

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { id: "layout", label: "Section Arrangement & Toggles", icon: Layers },
            { id: "hero_content", label: "Hero Banner Content", icon: LayoutTemplate },
            { id: "preview", label: "Device Layout Preview", icon: Eye },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${active ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Layout */}
        {activeTab === "layout" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-serif">Homepage Section Flow</h3>
                <p className="text-xs text-slate-500">Click any section row to open its full content editor. Use arrow controls to reorder.</p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {sections.filter((s) => s.enabled).length} of {sections.length} Visible
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 rounded-xl px-3 transition-colors group cursor-pointer"
                  onClick={() => setEditingSection(sec)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setEditingSection(sec)}
                  aria-label={`Edit ${sec.name}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2 flex-wrap">
                        {sec.name}
                        {sec.enabled ? <StatusBadge status="published" /> : <StatusBadge status="draft" />}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{sec.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block whitespace-nowrap">
                      Click to edit →
                    </span>
                    <button
                      disabled={idx === 0}
                      onClick={(e) => { e.stopPropagation(); moveSection(idx, "up"); }}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button
                      disabled={idx === sections.length - 1}
                      onClick={(e) => { e.stopPropagation(); moveSection(idx, "down"); }}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSection(sec.id); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sec.enabled ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                    >
                      {sec.enabled ? "Visible" : "Hidden"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Hero Content */}
        {activeTab === "hero_content" && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-serif">Hero Banner Messaging</h3>
              <p className="text-xs text-slate-500">Edit headlines, badge callouts, and action buttons displayed prominently at the top of the homepage.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Badge Callout</label>
                <input type="text" value={heroForm.badge} onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-800 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Main Hero Headline</label>
                <input type="text" value={heroForm.title} onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-800 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Sub-Headline Description</label>
                <textarea rows={3} value={heroForm.subtitle} onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-800 focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Primary CTA Label</label>
                  <input type="text" value={heroForm.ctaText} onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-800 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Secondary CTA Label</label>
                  <input type="text" value={heroForm.secondaryCtaText} onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-800 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Device Preview */}
        {activeTab === "preview" && (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Device Viewport:</span>
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                  <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${previewDevice === "desktop" ? "bg-slate-700 text-white" : "text-slate-400"}`}>
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button onClick={() => setPreviewDevice("tablet")} className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${previewDevice === "tablet" ? "bg-slate-700 text-white" : "text-slate-400"}`}>
                    <Tablet className="w-3.5 h-3.5" /> Tablet
                  </button>
                  <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${previewDevice === "mobile" ? "bg-slate-700 text-white" : "text-slate-400"}`}>
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>
              </div>
              <a href="/" target="_blank" rel="noreferrer" className="px-4 py-1.5 rounded-xl bg-gold text-navy text-xs font-bold hover:bg-gold-light transition-colors">
                Open Live Public Page ↗
              </a>
            </div>

            <div className="flex justify-center bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-hidden">
              <div className={`bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${previewDevice === "mobile" ? "w-[375px] min-h-[600px]" : previewDevice === "tablet" ? "w-[768px] min-h-[600px]" : "w-full min-h-[600px]"}`}>
                <div className="bg-navy p-4 text-white flex items-center justify-between text-xs">
                  <span className="font-bold font-serif">Bishop Ambrose College</span>
                  <span className="text-[10px] text-gold font-semibold">Autonomous</span>
                </div>
                <div className="bg-gradient-to-r from-navy via-navy to-navy-dark text-white p-8 space-y-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold">{heroForm.badge}</span>
                  <h3 className="text-xl font-bold font-serif">{heroForm.title}</h3>
                  <p className="text-xs text-white/80 line-clamp-2">{heroForm.subtitle}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="px-3 py-1 bg-gold text-navy rounded-lg text-[10px] font-bold">{heroForm.ctaText}</span>
                    <span className="px-3 py-1 border border-white/20 text-white rounded-lg text-[10px] font-semibold">{heroForm.secondaryCtaText}</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Sections In Order:</p>
                  {sections.filter((s) => s.enabled && s.id !== "hero").map((s, idx) => (
                    <div key={s.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{idx + 2}. {s.name}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Editor Slide Panel */}
      <HomepageSectionEditor
        section={editingSection}
        onClose={() => setEditingSection(null)}
        onSave={handleSectionSave}
      />
    </>
  );
}