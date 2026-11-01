"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  X, Save, Eye, Send, FileText, Image as ImageIcon,
  Search, Settings, Plus, Trash2, GripVertical, Upload,
  Clock, AlertCircle, CheckCircle2, RotateCcw,
  ImagePlus, Video,
  Star, Calendar, Users, Trophy, Mic, Lightbulb, Activity,
  BarChart2, Zap, BookOpen, Award, Layers, Tag, Globe, Hash,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type HomepageSection = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
};

type SectionStatus = "published" | "draft" | "scheduled";
type EditorTab = "content" | "media" | "seo" | "settings";

type StatItem = { id: string; label: string; value: string; icon: string };
type GalleryImage = { id: string; url: string; alt: string };
type FacilityCard = { id: string; title: string; description: string; imageUrl: string };
type DepartmentCard = { id: string; name: string; imageUrl: string; link: string; sortOrder: number };

type SectionData = {
  mainHeading?: string;
  subHeading?: string;
  description?: string;
  ctaBtnText?: string;
  ctaBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  heroImageUrl?: string;
  bgVideoUrl?: string;
  badgeCallout?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  statistics?: StatItem[];
  newsCount?: number;
  featuredNewsIds?: string[];
  displayMode?: string;
  visionContent?: string;
  missionContent?: string;
  historyContent?: string;
  galleryImages?: GalleryImage[];
  departmentCards?: DepartmentCard[];
  facilityCards?: FacilityCard[];
  [key: string]: any;
};

type SEOData = {
  seoTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;
};

type SettingsData = {
  status: SectionStatus;
  scheduledAt: string;
  sortOrder: number;
  isVisible: boolean;
};

// ─── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Star, Calendar, Users, Trophy, Mic, Lightbulb, Activity, BarChart2,
  Zap, BookOpen, Award, Layers, Tag, Globe, Hash,
};
const ICON_OPTIONS = Object.keys(ICON_MAP);

// ─── Default factories ─────────────────────────────────────────────────────────

function defaultSectionData(id: string): SectionData {
  switch (id) {
    case "hero":
      return {
        mainHeading: "Bishop Ambrose College",
        subHeading: "Autonomous Institution · Affiliated to Bharathiar University",
        description: "Co-Education. Empowering students through quality education, character, and service since 1994.",
        ctaBtnText: "Apply Now",
        ctaBtnLink: "/admissions",
        secondaryBtnText: "Explore Courses",
        secondaryBtnLink: "/departments",
        heroImageUrl: "",
        bgVideoUrl: "",
        badgeCallout: "Admissions Open 2026-27",
      };
    case "why-choose":
      return {
        sectionTitle: "Four Decades of Excellence",
        sectionDescription: "A legacy of academic brilliance, values, and holistic development.",
        statistics: [
          { id: "s1", label: "Years of Excellence", value: "30+", icon: "Star" },
          { id: "s2", label: "Students Enrolled", value: "3,500+", icon: "Users" },
          { id: "s3", label: "Programmes Offered", value: "13", icon: "BookOpen" },
          { id: "s4", label: "Placement Rate", value: "85%+", icon: "Award" },
        ],
      };
    case "news-events":
      return {
        sectionTitle: "News & Upcoming Events",
        sectionDescription: "Stay updated with the latest happenings at BAC.",
        newsCount: 6,
        featuredNewsIds: [],
        displayMode: "grid",
      };
    case "about":
      return {
        sectionTitle: "College Legacy & Vision",
        visionContent: "To be a premier institution of higher education committed to academic excellence and holistic development.",
        missionContent: "Providing quality education rooted in Christian values, fostering critical thinking and community service.",
        historyContent: "Founded in 1994 by the Diocese of Coimbatore, BAC has grown into a fully autonomous institution affiliated to Bharathiar University.",
        galleryImages: [],
      };
    case "departments":
      return {
        sectionTitle: "Academic Departments",
        departmentCards: [
          { id: "d1", name: "Computer Science", imageUrl: "", link: "/departments/cs", sortOrder: 1 },
          { id: "d2", name: "Commerce", imageUrl: "", link: "/departments/commerce", sortOrder: 2 },
          { id: "d3", name: "Mathematics", imageUrl: "", link: "/departments/maths", sortOrder: 3 },
        ],
      };
    case "facilities":
      return {
        sectionTitle: "Campus Infrastructure Highlights",
        sectionDescription: "World-class facilities to support learning and growth.",
        galleryImages: [],
        facilityCards: [
          { id: "f1", title: "Smart Classrooms", description: "Tech-enabled interactive learning spaces", imageUrl: "" },
          { id: "f2", title: "Computing Labs", description: "State-of-the-art computing infrastructure", imageUrl: "" },
          { id: "f3", title: "Sports Grounds", description: "Multi-sport facilities for athletics", imageUrl: "" },
        ],
      };
    default:
      return { sectionTitle: "", sectionDescription: "" };
  }
}

function defaultSEO(name: string): SEOData {
  return {
    seoTitle: `${name} | Bishop Ambrose College`,
    metaDescription: `Discover the ${name} section at Bishop Ambrose College, Coimbatore.`,
    keywords: "Bishop Ambrose College, BAC, Coimbatore, education",
    ogImageUrl: "",
  };
}

function defaultSettings(order: number, enabled: boolean): SettingsData {
  return {
    status: enabled ? "published" : "draft",
    scheduledAt: "",
    sortOrder: order,
    isVisible: enabled,
  };
}

// ─── Shared UI helpers ─────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
      {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}

function StyledInput({
  value, onChange, placeholder, type = "text", className,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-slate-700 dark:focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all",
        className
      )}
    />
  );
}

function StyledTextarea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-slate-700 dark:focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 resize-none transition-all"
    />
  );
}

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

function UploadZone({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center space-y-2 hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
          <Upload className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-xs text-slate-500 font-medium">Drop file here or <span className="text-slate-900 dark:text-white font-bold underline">browse</span></p>
        <p className="text-[10px] text-slate-400">Supports JPG, PNG, WebP · max 5 MB</p>
      </div>
      {value && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">{value}</span>
          <button onClick={() => onChange("")} className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <StyledInput value={value} onChange={onChange} placeholder="Or paste image URL…" />
    </div>
  );
}

// ─── Section-specific content editors ─────────────────────────────────────────

function HeroContentEditor({ data, setData }: { data: SectionData; setData: (d: SectionData) => void }) {
  const u = (k: string, v: any) => setData({ ...data, [k]: v });
  return (
    <div className="space-y-5">
      <SectionDivider label="Messaging" />
      <FieldGroup label="Badge Callout"><StyledInput value={data.badgeCallout || ""} onChange={(v) => u("badgeCallout", v)} placeholder="e.g. Admissions Open 2026-27" /></FieldGroup>
      <FieldGroup label="Main Heading" required><StyledInput value={data.mainHeading || ""} onChange={(v) => u("mainHeading", v)} placeholder="e.g. Bishop Ambrose College" /></FieldGroup>
      <FieldGroup label="Sub Heading"><StyledInput value={data.subHeading || ""} onChange={(v) => u("subHeading", v)} placeholder="e.g. Autonomous Institution…" /></FieldGroup>
      <FieldGroup label="Description">
        <StyledTextarea value={data.description || ""} onChange={(v) => u("description", v)} placeholder="Brief description below the headline…" rows={3} />
      </FieldGroup>
      <SectionDivider label="Call-to-Action Buttons" />
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Primary Button Text" required><StyledInput value={data.ctaBtnText || ""} onChange={(v) => u("ctaBtnText", v)} placeholder="Apply Now" /></FieldGroup>
        <FieldGroup label="Primary Button Link"><StyledInput value={data.ctaBtnLink || ""} onChange={(v) => u("ctaBtnLink", v)} placeholder="/admissions" /></FieldGroup>
        <FieldGroup label="Secondary Button Text"><StyledInput value={data.secondaryBtnText || ""} onChange={(v) => u("secondaryBtnText", v)} placeholder="Explore Courses" /></FieldGroup>
        <FieldGroup label="Secondary Button Link"><StyledInput value={data.secondaryBtnLink || ""} onChange={(v) => u("secondaryBtnLink", v)} placeholder="/departments" /></FieldGroup>
      </div>
    </div>
  );
}

function StatsContentEditor({ data, setData }: { data: SectionData; setData: (d: SectionData) => void }) {
  const u = (k: string, v: any) => setData({ ...data, [k]: v });
  const stats: StatItem[] = data.statistics || [];

  const addStat = () => u("statistics", [...stats, { id: `s${Date.now()}`, label: "", value: "", icon: "Star" }]);
  const updateStat = (id: string, field: keyof StatItem, val: string) =>
    u("statistics", stats.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  const deleteStat = (id: string) => u("statistics", stats.filter((s) => s.id !== id));

  return (
    <div className="space-y-5">
      <SectionDivider label="Section Header" />
      <FieldGroup label="Section Title" required><StyledInput value={data.sectionTitle || ""} onChange={(v) => u("sectionTitle", v)} placeholder="Four Decades of Excellence" /></FieldGroup>
      <FieldGroup label="Section Description"><StyledTextarea value={data.sectionDescription || ""} onChange={(v) => u("sectionDescription", v)} /></FieldGroup>
      <SectionDivider label="Statistics Repeater" />
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{stat.label || "New Statistic"}</span>
              </div>
              <button onClick={() => deleteStat(stat.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Label"><StyledInput value={stat.label} onChange={(v) => updateStat(stat.id, "label", v)} placeholder="Years of Excellence" /></FieldGroup>
              <FieldGroup label="Value"><StyledInput value={stat.value} onChange={(v) => updateStat(stat.id, "value", v)} placeholder="30+" /></FieldGroup>
            </div>
            <FieldGroup label="Icon">
              <select
                value={stat.icon}
                onChange={(e) => updateStat(stat.id, "icon", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none"
              >
                {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </FieldGroup>
          </div>
        ))}
        <button
          onClick={addStat}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Statistic
        </button>
      </div>
    </div>
  );
}

function NewsContentEditor({ data, setData }: { data: SectionData; setData: (d: SectionData) => void }) {
  const u = (k: string, v: any) => setData({ ...data, [k]: v });
  return (
    <div className="space-y-5">
      <SectionDivider label="Section Header" />
      <FieldGroup label="Section Title" required><StyledInput value={data.sectionTitle || ""} onChange={(v) => u("sectionTitle", v)} placeholder="News & Upcoming Events" /></FieldGroup>
      <FieldGroup label="Section Description"><StyledTextarea value={data.sectionDescription || ""} onChange={(v) => u("sectionDescription", v)} /></FieldGroup>
      <SectionDivider label="Display Settings" />
      <FieldGroup label="Number of Items to Display">
        <select
          value={data.newsCount || 6}
          onChange={(e) => u("newsCount", Number(e.target.value))}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none"
        >
          {[3, 4, 6, 8, 10, 12].map((n) => <option key={n} value={n}>{n} items</option>)}
        </select>
      </FieldGroup>
      <FieldGroup label="Display Mode">
        <div className="flex gap-2">
          {["grid", "list", "carousel"].map((mode) => (
            <button
              key={mode}
              onClick={() => u("displayMode", mode)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border",
                data.displayMode === mode
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

function VisionContentEditor({ data, setData }: { data: SectionData; setData: (d: SectionData) => void }) {
  const u = (k: string, v: any) => setData({ ...data, [k]: v });
  return (
    <div className="space-y-5">
      <SectionDivider label="Section Header" />
      <FieldGroup label="Section Title"><StyledInput value={data.sectionTitle || ""} onChange={(v) => u("sectionTitle", v)} placeholder="College Legacy & Vision" /></FieldGroup>
      <SectionDivider label="Content" />
      <FieldGroup label="Vision Statement" required><StyledTextarea value={data.visionContent || ""} onChange={(v) => u("visionContent", v)} rows={4} placeholder="Our vision…" /></FieldGroup>
      <FieldGroup label="Mission Statement"><StyledTextarea value={data.missionContent || ""} onChange={(v) => u("missionContent", v)} rows={4} placeholder="Our mission…" /></FieldGroup>
      <FieldGroup label="History / About"><StyledTextarea value={data.historyContent || ""} onChange={(v) => u("historyContent", v)} rows={4} placeholder="Founded in…" /></FieldGroup>
    </div>
  );
}

function DepartmentsContentEditor({ data, setData }: { data: SectionData; setData: (d: SectionData) => void }) {
  const u = (k: string, v: any) => setData({ ...data, [k]: v });
  const cards: DepartmentCard[] = data.departmentCards || [];
  const addCard = () => u("departmentCards", [...cards, { id: `d${Date.now()}`, name: "", imageUrl: "", link: "", sortOrder: cards.length + 1 }]);
  const updateCard = (id: string, field: keyof DepartmentCard, val: any) =>
    u("departmentCards", cards.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  const deleteCard = (id: string) => u("departmentCards", cards.filter((c) => c.id !== id));

  return (
    <div className="space-y-5">
      <SectionDivider label="Section Header" />
      <FieldGroup label="Section Title"><StyledInput value={data.sectionTitle || ""} onChange={(v) => u("sectionTitle", v)} placeholder="Academic Departments" /></FieldGroup>
      <SectionDivider label="Department Cards" />
      <div className="space-y-3">
        {cards.map((card) => (
          <div key={card.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{card.name || "New Department"}</span>
              <button onClick={() => deleteCard(card.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Department Name"><StyledInput value={card.name} onChange={(v) => updateCard(card.id, "name", v)} placeholder="Computer Science" /></FieldGroup>
              <FieldGroup label="Page Link"><StyledInput value={card.link} onChange={(v) => updateCard(card.id, "link", v)} placeholder="/departments/cs" /></FieldGroup>
              <FieldGroup label="Sort Order"><StyledInput type="number" value={String(card.sortOrder)} onChange={(v) => updateCard(card.id, "sortOrder", Number(v))} /></FieldGroup>
            </div>
            <FieldGroup label="Department Image URL"><StyledInput value={card.imageUrl} onChange={(v) => updateCard(card.id, "imageUrl", v)} placeholder="https://…" /></FieldGroup>
          </div>
        ))}
        <button
          onClick={addCard}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Department Card
        </button>
      </div>
    </div>
  );
}

function FacilitiesContentEditor({ data, setData }: { data: SectionData; setData: (d: SectionData) => void }) {
  const u = (k: string, v: any) => setData({ ...data, [k]: v });
  const cards: FacilityCard[] = data.facilityCards || [];
  const addCard = () => u("facilityCards", [...cards, { id: `f${Date.now()}`, title: "", description: "", imageUrl: "" }]);
  const updateCard = (id: string, field: keyof FacilityCard, val: string) =>
    u("facilityCards", cards.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  const deleteCard = (id: string) => u("facilityCards", cards.filter((c) => c.id !== id));

  return (
    <div className="space-y-5">
      <SectionDivider label="Section Header" />
      <FieldGroup label="Section Title"><StyledInput value={data.sectionTitle || ""} onChange={(v) => u("sectionTitle", v)} placeholder="Campus Infrastructure Highlights" /></FieldGroup>
      <FieldGroup label="Section Description"><StyledTextarea value={data.sectionDescription || ""} onChange={(v) => u("sectionDescription", v)} /></FieldGroup>
      <SectionDivider label="Facility Cards" />
      <div className="space-y-3">
        {cards.map((card) => (
          <div key={card.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{card.title || "New Facility"}</span>
              <button onClick={() => deleteCard(card.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <FieldGroup label="Title"><StyledInput value={card.title} onChange={(v) => updateCard(card.id, "title", v)} placeholder="Smart Classrooms" /></FieldGroup>
            <FieldGroup label="Description"><StyledTextarea value={card.description} onChange={(v) => updateCard(card.id, "description", v)} rows={2} /></FieldGroup>
            <FieldGroup label="Image URL"><StyledInput value={card.imageUrl} onChange={(v) => updateCard(card.id, "imageUrl", v)} placeholder="https://…" /></FieldGroup>
          </div>
        ))}
        <button
          onClick={addCard}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Facility Card
        </button>
      </div>
    </div>
  );
}

function GenericContentEditor({ data, setData }: { data: SectionData; setData: (d: SectionData) => void }) {
  const u = (k: string, v: any) => setData({ ...data, [k]: v });
  return (
    <div className="space-y-5">
      <SectionDivider label="Section Header" />
      <FieldGroup label="Section Title"><StyledInput value={data.sectionTitle || ""} onChange={(v) => u("sectionTitle", v)} placeholder="Section Title" /></FieldGroup>
      <FieldGroup label="Section Description"><StyledTextarea value={data.sectionDescription || ""} onChange={(v) => u("sectionDescription", v)} /></FieldGroup>
    </div>
  );
}

// ─── Media Tab ─────────────────────────────────────────────────────────────────

function MediaTab({ sectionId, data, setData }: { sectionId: string; data: SectionData; setData: (d: SectionData) => void }) {
  const u = (k: string, v: any) => setData({ ...data, [k]: v });
  const gallery: GalleryImage[] = data.galleryImages || [];
  const addImg = () => u("galleryImages", [...gallery, { id: `g${Date.now()}`, url: "", alt: "" }]);
  const updateImg = (id: string, field: keyof GalleryImage, val: string) =>
    u("galleryImages", gallery.map((g) => (g.id === id ? { ...g, [field]: val } : g)));
  const deleteImg = (id: string) => u("galleryImages", gallery.filter((g) => g.id !== id));

  return (
    <div className="space-y-6">
      {sectionId === "hero" && (
        <>
          <UploadZone label="Hero Banner Image" value={data.heroImageUrl || ""} onChange={(v) => u("heroImageUrl", v)} />
          <div className="space-y-2">
            <FieldLabel>Background Video URL</FieldLabel>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-slate-400 shrink-0" />
              <StyledInput value={data.bgVideoUrl || ""} onChange={(v) => u("bgVideoUrl", v)} placeholder="https://www.youtube.com/embed/…" />
            </div>
            <p className="text-[10px] text-slate-400">Accepts YouTube embed URLs or direct MP4 video links.</p>
          </div>
        </>
      )}
      {["about", "facilities"].includes(sectionId) && (
        <>
          <SectionDivider label="Gallery Images" />
          <div className="space-y-3">
            {gallery.map((img) => (
              <div key={img.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                {img.url ? (
                  <img src={img.url} alt={img.alt} className="w-16 h-12 rounded-lg object-cover shrink-0 border border-slate-200" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 space-y-2 min-w-0">
                  <StyledInput value={img.url} onChange={(v) => updateImg(img.id, "url", v)} placeholder="Image URL…" />
                  <StyledInput value={img.alt} onChange={(v) => updateImg(img.id, "alt", v)} placeholder="Alt text…" />
                </div>
                <button onClick={() => deleteImg(img.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={addImg}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
            >
              <ImagePlus className="w-4 h-4" /> Add Gallery Image
            </button>
          </div>
        </>
      )}
      {!["hero", "about", "facilities"].includes(sectionId) && (
        <div className="py-12 text-center text-slate-400">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-xs font-medium">No media uploads required for this section.</p>
        </div>
      )}
    </div>
  );
}

// ─── SEO Tab ───────────────────────────────────────────────────────────────────

function SEOTab({ seo, setSEO }: { seo: SEOData; setSEO: (d: SEOData) => void }) {
  const u = (k: keyof SEOData, v: string) => setSEO({ ...seo, [k]: v });
  const descLength = seo.metaDescription.length;
  return (
    <div className="space-y-5">
      <SectionDivider label="Search Engine Optimization" />
      <FieldGroup label="SEO Title">
        <StyledInput value={seo.seoTitle} onChange={(v) => u("seoTitle", v)} placeholder="Page title for search engines" />
        <p className="text-[10px] text-slate-400 mt-1">{seo.seoTitle.length}/60 characters recommended</p>
      </FieldGroup>
      <FieldGroup label="Meta Description">
        <StyledTextarea value={seo.metaDescription} onChange={(v) => u("metaDescription", v)} rows={3} placeholder="Brief description for search engine snippets…" />
        <p className={cn("text-[10px] mt-1", descLength > 160 ? "text-rose-500 font-semibold" : "text-slate-400")}>{descLength}/160 characters recommended</p>
      </FieldGroup>
      <FieldGroup label="Keywords">
        <StyledInput value={seo.keywords} onChange={(v) => u("keywords", v)} placeholder="keyword1, keyword2, keyword3…" />
      </FieldGroup>
      <SectionDivider label="Open Graph" />
      <UploadZone label="OG / Social Share Image" value={seo.ogImageUrl} onChange={(v) => u("ogImageUrl", v)} />
    </div>
  );
}

// ─── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({ settings, setSettings }: { settings: SettingsData; setSettings: (d: SettingsData) => void }) {
  const u = (k: keyof SettingsData, v: any) => setSettings({ ...settings, [k]: v });
  return (
    <div className="space-y-5">
      <SectionDivider label="Publish Settings" />
      <FieldGroup label="Status">
        <div className="flex gap-2">
          {(["published", "draft", "scheduled"] as SectionStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => u("status", s)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border",
                settings.status === s
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FieldGroup>
      {settings.status === "scheduled" && (
        <FieldGroup label="Schedule Publish Date & Time">
          <StyledInput type="datetime-local" value={settings.scheduledAt} onChange={(v) => u("scheduledAt", v)} />
        </FieldGroup>
      )}
      <SectionDivider label="Visibility & Order" />
      <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40">
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Section Visibility</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Show or hide this section on the public homepage</p>
        </div>
        <button
          onClick={() => u("isVisible", !settings.isVisible)}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0",
            settings.isVisible ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-200 dark:bg-slate-700"
          )}
          aria-label="Toggle visibility"
        >
          <span className={cn("absolute top-0.5 w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow-sm transition-all duration-200", settings.isVisible ? "left-5" : "left-0.5")} />
        </button>
      </div>
      <FieldGroup label="Display Order">
        <StyledInput type="number" value={String(settings.sortOrder)} onChange={(v) => u("sortOrder", Number(v))} placeholder="1" />
        <p className="text-[10px] text-slate-400 mt-1">Lower numbers appear first on the page.</p>
      </FieldGroup>
    </div>
  );
}

// ─── Main Panel Component ──────────────────────────────────────────────────────

type HomepageSectionEditorProps = {
  section: HomepageSection | null;
  onClose: () => void;
  onSave: (section: HomepageSection, sectionData: SectionData, seo: SEOData, settings: SettingsData) => void;
};

export function HomepageSectionEditor({ section, onClose, onSave }: HomepageSectionEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<EditorTab>("content");
  const [sectionData, setSectionData] = useState<SectionData>({});
  const [seoData, setSeoData] = useState<SEOData>(defaultSEO(""));
  const [settingsData, setSettingsData] = useState<SettingsData>(defaultSettings(1, true));
  const [autoSaveMsg, setAutoSaveMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Load / reset when section changes
  useEffect(() => {
    if (!section) { setIsVisible(false); return; }
    const storageKey = `bac_hp_section_${section.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setSectionData(p.content || defaultSectionData(section.id));
        setSeoData(p.seo || defaultSEO(section.name));
        setSettingsData(p.settings || defaultSettings(section.order, section.enabled));
      } catch {
        setSectionData(defaultSectionData(section.id));
        setSeoData(defaultSEO(section.name));
        setSettingsData(defaultSettings(section.order, section.enabled));
      }
    } else {
      setSectionData(defaultSectionData(section.id));
      setSeoData(defaultSEO(section.name));
      setSettingsData(defaultSettings(section.order, section.enabled));
    }
    setErrors([]);
    setActiveTab("content");
    requestAnimationFrame(() => setIsVisible(true));
  }, [section?.id]);

  // Auto-save every 30 s
  useEffect(() => {
    if (!section) return;
    const timer = setInterval(() => {
      localStorage.setItem(`bac_hp_section_${section.id}`, JSON.stringify({ content: sectionData, seo: seoData, settings: settingsData }));
      setAutoSaveMsg("Draft saved successfully");
      const t = setTimeout(() => setAutoSaveMsg(null), 3000);
      return () => clearTimeout(t);
    }, 30000);
    return () => clearInterval(timer);
  }, [section, sectionData, seoData, settingsData]);

  const validate = useCallback((): boolean => {
    if (!section) return false;
    const errs: string[] = [];
    if (section.id === "hero" && !sectionData.mainHeading?.trim()) errs.push("Main Heading is required.");
    if (section.id === "why-choose" && !sectionData.sectionTitle?.trim()) errs.push("Section Title is required.");
    if (section.id === "about" && !sectionData.visionContent?.trim()) errs.push("Vision Statement is required.");
    if (seoData.metaDescription.length > 160) errs.push("Meta Description exceeds 160 characters.");
    setErrors(errs);
    return errs.length === 0;
  }, [section, sectionData, seoData]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSaveDraft = () => {
    if (!section) return;
    const draft = { ...settingsData, status: "draft" as SectionStatus };
    localStorage.setItem(`bac_hp_section_${section.id}`, JSON.stringify({ content: sectionData, seo: seoData, settings: draft }));
    setSettingsData(draft);
    setAutoSaveMsg("Draft saved successfully");
    toast({ title: "Draft Saved", description: `${section.name} saved as draft.` });
    setTimeout(() => setAutoSaveMsg(null), 3000);
  };

  const handlePublish = async () => {
    if (!validate() || !section) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    const published = { ...settingsData, status: "published" as SectionStatus };
    setSettingsData(published);
    localStorage.setItem(`bac_hp_section_${section.id}`, JSON.stringify({ content: sectionData, seo: seoData, settings: published }));
    onSave(section, sectionData, seoData, published);
    toast({ title: "Changes Published", description: `${section.name} is now live on the homepage.` });
    setIsSaving(false);
    handleClose();
  };

  const TABS: { id: EditorTab; label: string; icon: React.ElementType }[] = [
    { id: "content", label: "Content", icon: FileText },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "seo", label: "SEO", icon: Search },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (!section) return null;

  const lastUpdated = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const renderContent = () => {
    if (activeTab === "content") {
      switch (section.id) {
        case "hero": return <HeroContentEditor data={sectionData} setData={setSectionData} />;
        case "why-choose": return <StatsContentEditor data={sectionData} setData={setSectionData} />;
        case "news-events": return <NewsContentEditor data={sectionData} setData={setSectionData} />;
        case "about": return <VisionContentEditor data={sectionData} setData={setSectionData} />;
        case "departments": return <DepartmentsContentEditor data={sectionData} setData={setSectionData} />;
        case "facilities": return <FacilitiesContentEditor data={sectionData} setData={setSectionData} />;
        default: return <GenericContentEditor data={sectionData} setData={setSectionData} />;
      }
    }
    if (activeTab === "media") return <MediaTab sectionId={section.id} data={sectionData} setData={setSectionData} />;
    if (activeTab === "seo") return <SEOTab seo={seoData} setSEO={setSeoData} />;
    if (activeTab === "settings") return <SettingsTab settings={settingsData} setSettings={setSettingsData} />;
    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={cn(
          "fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Slide Panel */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[560px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-out",
          isVisible ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${section.name}`}
      >
        {/* Header */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{section.name}</h2>
                <StatusBadge status={settingsData.status} />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" /> Last updated: {lastUpdated}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Auto-save indicator */}
          {autoSaveMsg && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {autoSaveMsg}
            </div>
          )}

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                {errors.map((e, i) => <p key={i} className="text-xs text-rose-700 dark:text-rose-300 font-medium">{e}</p>)}
              </div>
            </div>
          )}

          {/* Tab bar */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    active
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderContent()}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </a>
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><RotateCcw className="w-3.5 h-3.5 animate-spin" /> Publishing…</>
              ) : (
                <><Send className="w-3.5 h-3.5" /> Publish Changes</>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
