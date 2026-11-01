"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/admin/core/page-header";
import { StatCard } from "@/components/admin/core/stat-card";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Newspaper, Calendar, BarChart2, Users, Image, Star,
  Plus, Search, Filter, Download, Edit3, Trash2, Eye,
  ChevronLeft, ChevronRight,
  Save, X, Upload, Tag, Clock, MapPin, Link2,
  Mic, BookOpen, Trophy, Layers, Zap, Globe, Settings,
  ArrowUpRight, List, Grid, Bell, Lightbulb, Activity, Award,
} from "lucide-react";

type SubPage =
  | "ne-dashboard" | "ne-news" | "ne-events" | "ne-categories"
  | "ne-featured"  | "ne-speakers" | "ne-gallery" | "ne-registrations"
  | "ne-stats" | "ne-page-settings";

const MOCK_NEWS = [
  { id: "n1", title: "BAC Students Win State-Level Hackathon 2026", category: "Achievements", author: "Dr. Thomas Raj", date: "2026-09-20", status: "published", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=80&h=60&fit=crop" },
  { id: "n2", title: "Annual Science Exhibition Draws 2,000+ Visitors", category: "Events", author: "Prof. Mary Anita", date: "2026-09-15", status: "published", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=60&fit=crop" },
  { id: "n3", title: "New Research Lab Inaugurated by Principal", category: "Campus", author: "Admin Office", date: "2026-09-10", status: "draft", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=80&h=60&fit=crop" },
  { id: "n4", title: "BAC Secures NAAC A+ Reaccreditation", category: "Institutional", author: "IQAC Cell", date: "2026-08-30", status: "published", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=80&h=60&fit=crop" },
  { id: "n5", title: "Industry Partnership with TCS Signed for 2027", category: "Placements", author: "Placement Cell", date: "2026-08-18", status: "draft", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=80&h=60&fit=crop" },
];
const MOCK_EVENTS = [
  { id: "e1", title: "National Level Hackathon 2026", subtitle: "Code. Create. Conquer.", category: "Hackathons", date: "2026-10-15", time: "9:00 AM", venue: "IT Block Auditorium", status: "published", featured: true, participants: 500 },
  { id: "e2", title: "Ambrose Fiesta Annual Cultural Fest", subtitle: "A Celebration of Art and Culture", category: "Cultural", date: "2026-11-05", time: "10:00 AM", venue: "Main Campus Ground", status: "published", featured: false, participants: 1200 },
  { id: "e3", title: "Industry Expert Guest Lecture Series", subtitle: "Tech Trends 2027", category: "Guest Lectures", date: "2026-10-22", time: "2:00 PM", venue: "Seminar Hall Block B", status: "draft", featured: false, participants: 200 },
  { id: "e4", title: "Inter-College Sports Championship", subtitle: "Battle of the Champions", category: "Sports", date: "2026-11-20", time: "8:00 AM", venue: "College Sports Ground", status: "published", featured: false, participants: 800 },
  { id: "e5", title: "Alumni Reunion Day 2026", subtitle: "Reconnect and Celebrate", category: "Alumni Events", date: "2026-12-01", time: "10:00 AM", venue: "Main Auditorium", status: "draft", featured: false, participants: 350 },
];
const MOCK_CATEGORIES_DATA = [
  { id: "c1", name: "Workshops", iconName: "Lightbulb", count: 12, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { id: "c2", name: "Seminars", iconName: "BookOpen", count: 8, color: "bg-violet-50 text-violet-600 border-violet-100" },
  { id: "c3", name: "Hackathons", iconName: "Zap", count: 5, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { id: "c4", name: "Guest Lectures", iconName: "Mic", count: 18, color: "bg-teal-50 text-teal-600 border-teal-100" },
  { id: "c5", name: "Cultural", iconName: "Star", count: 7, color: "bg-pink-50 text-pink-600 border-pink-100" },
  { id: "c6", name: "Sports", iconName: "Trophy", count: 9, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { id: "c7", name: "Placements", iconName: "Award", count: 4, color: "bg-orange-50 text-orange-600 border-orange-100" },
  { id: "c8", name: "Conferences", iconName: "Layers", count: 6, color: "bg-rose-50 text-rose-600 border-rose-100" },
  { id: "c9", name: "Alumni Events", iconName: "Users", count: 3, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
];
const MOCK_SPEAKERS = [
  { id: "s1", name: "Dr. Priya Suresh", designation: "CTO", org: "Zoho Corporation", topic: "Future of AI in Education", order: 1, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
  { id: "s2", name: "Mr. Rajan Kumar", designation: "VP Engineering", org: "TCS Innovation Labs", topic: "Cloud-Native Development", order: 2, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { id: "s3", name: "Dr. Anitha Ramesh", designation: "Research Scientist", org: "IIT Madras", topic: "Machine Learning in Healthcare", order: 3, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
  { id: "s4", name: "Mr. Kavin Paul", designation: "Founder and CEO", org: "StartupHub India", topic: "Entrepreneurship for Gen-Z", order: 4, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" },
];
const MOCK_GALLERY = [
  { id: "g1", album: "Hackathon 2026", event: "National Hackathon", date: "2026-09-20", count: 48, thumb: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=140&fit=crop" },
  { id: "g2", album: "Ambrose Fiesta 2025", event: "Cultural Fest", date: "2025-11-10", count: 124, thumb: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=140&fit=crop" },
  { id: "g3", album: "Sports Day 2025", event: "Sports Championship", date: "2025-11-22", count: 78, thumb: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=140&fit=crop" },
  { id: "g4", album: "Science Exhibition", event: "Annual Expo", date: "2026-09-15", count: 36, thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=140&fit=crop" },
  { id: "g5", album: "Alumni Reunion 2025", event: "Alumni Day", date: "2025-12-05", count: 62, thumb: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=140&fit=crop" },
  { id: "g6", album: "Guest Lecture Series", event: "Industry Talk", date: "2026-08-20", count: 22, thumb: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=140&fit=crop" },
];
const MOCK_REGISTRATIONS = [
  { id: "r1", student: "Ajith Kumar S", event: "National Hackathon 2026", dept: "Computer Science", date: "2026-09-25", status: "approved" },
  { id: "r2", student: "Priya Devi M", event: "Ambrose Fiesta 2026", dept: "Commerce", date: "2026-09-28", status: "pending" },
  { id: "r3", student: "Ragul Prakash", event: "Industry Guest Lecture", dept: "Mathematics", date: "2026-10-01", status: "approved" },
  { id: "r4", student: "Nithya R", event: "Sports Championship", dept: "Physics", date: "2026-10-05", status: "approved" },
  { id: "r5", student: "Saravanan K", event: "Alumni Reunion Day", dept: "English", date: "2026-09-30", status: "pending" },
  { id: "r6", student: "Deepa Lakshmi", event: "National Hackathon 2026", dept: "Computer Science", date: "2026-09-26", status: "approved" },
];
const MOCK_STATS = [
  { id: "st1", title: "Events Conducted", value: 120, icon: "Calendar", order: 1, visible: true },
  { id: "st2", title: "Total Participants", value: 8500, icon: "Users", order: 2, visible: true },
  { id: "st3", title: "Competitions Held", value: 45, icon: "Trophy", order: 3, visible: true },
  { id: "st4", title: "Industry Speakers", value: 60, icon: "Mic", order: 4, visible: true },
  { id: "st5", title: "Workshops Organized", value: 38, icon: "Lightbulb", order: 5, visible: true },
];
const ICON_MAP: Record<string, React.ElementType> = {
  Calendar, Users, Trophy, Mic, Lightbulb, Activity, BarChart2,
  Star, Zap, BookOpen, Award, Layers, Tag, Globe, Settings,
};

const SUB_PAGES: { id: SubPage; label: string; icon: React.ElementType }[] = [
  { id: "ne-dashboard",     label: "Dashboard",             icon: BarChart2 },
  { id: "ne-news",          label: "News Management",       icon: Newspaper },
  { id: "ne-events",        label: "Events Management",     icon: Calendar  },
  { id: "ne-categories",    label: "Event Categories",      icon: Tag       },
  { id: "ne-featured",      label: "Featured Event",        icon: Star      },
  { id: "ne-speakers",      label: "Guest Speakers",        icon: Mic       },
  { id: "ne-gallery",       label: "Event Gallery",         icon: Image     },
  { id: "ne-registrations", label: "Registrations",         icon: Users     },
  { id: "ne-stats",         label: "Statistics & Counters", icon: Activity  },
  { id: "ne-page-settings", label: "Page Settings",         icon: Settings  },
];

function SubNav({ active, onSelect }: { active: SubPage; onSelect: (p: SubPage) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
      {SUB_PAGES.map((sp) => {
        const Icon = sp.icon;
        const isActive = active === sp.id;
        return (
          <button
            key={sp.id}
            onClick={() => onSelect(sp.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
              isActive
                ? "bg-[#009688] text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:block">{sp.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6", className)}>
      {children}
    </div>
  );
}
function TH({ label }: { label: string }) {
  return <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">{label}</th>;
}
function Btn({ icon: Icon, label, onClick, variant = "default" }: { icon: React.ElementType; label: string; onClick?: () => void; variant?: "default" | "danger" | "primary" }) {
  return (
    <button onClick={onClick} title={label} className={cn("p-1.5 rounded-lg transition-colors cursor-pointer", variant === "danger" && "text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30", variant === "primary" && "text-[#009688] hover:bg-teal-50 dark:hover:bg-teal-950/40", variant === "default" && "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800")}>
      <Icon className="w-4 h-4" />
    </button>
  );
}
function SearchBar({ placeholder, onSearch }: { placeholder?: string; onSearch?: (v: string) => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder={placeholder || "Search..."} onChange={(e) => onSearch?.(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#009688] transition-colors" />
      </div>
      <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shrink-0">
        <Filter className="w-3.5 h-3.5" /> Filter
      </button>
    </div>
  );
}
function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-serif flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
      <Icon className="w-4 h-4 text-[#009688]" /> {title}
    </h3>
  );
}
function Pager({ total, shown }: { total: number; shown: number }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
      <span className="text-xs text-slate-500">Showing {shown} of {total}</span>
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <button className="px-3 py-1.5 rounded-lg bg-[#009688] text-white text-xs font-bold">1</button>
        <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}
function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1">{label}</label>{children}</div>;
}
const iCls = "w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#009688] transition-colors";
const taCls = "w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#009688] resize-none";
const savCls = "inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-xs cursor-pointer";
const canCls = "px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer";

// ─── 1. DASHBOARD ─────────────────────────────────────────────────────────────
function NEDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="News & Events Dashboard"
        subtitle="Complete CMS overview for all news, events, registrations, guest speakers, and gallery content."
        badge="CMS Overview"
        breadcrumbs={[{ label: "Dashboard" }, { label: "Website" }, { label: "News & Events" }]}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Events"    value="47"    icon={Calendar}  color="teal"    trendLabel="+4 this month" trend="up" />
        <StatCard title="Upcoming Events" value="12"    icon={Bell}      color="amber"   trendLabel="Next: Oct 15" />
        <StatCard title="Published News"  value="28"    icon={Newspaper} color="blue"    trendLabel="+3 this week" trend="up" />
        <StatCard title="Registrations"   value="1,248" icon={Users}     color="violet"  trendLabel="+92 this week" trend="up" />
        <StatCard title="Guest Speakers"  value="24"    icon={Mic}       color="emerald" trendLabel="4 upcoming" />
        <StatCard title="Gallery Items"   value="370"   icon={Image}     color="rose"    trendLabel="6 albums" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <SectionTitle icon={Calendar} title="Recent Events" />
          <div className="space-y-3">
            {MOCK_EVENTS.slice(0, 4).map((ev) => (
              <div key={ev.id} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#009688] flex items-center justify-center shrink-0"><Calendar className="w-4 h-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{ev.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ev.date} · {ev.venue}</p>
                </div>
                <StatusBadge status={ev.status} className="shrink-0" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle icon={Newspaper} title="Recent News" />
          <div className="space-y-3">
            {MOCK_NEWS.slice(0, 4).map((n) => (
              <div key={n.id} className="flex items-start gap-3">
                <img src={n.image} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{n.category} · {n.date}</p>
                </div>
                <StatusBadge status={n.status} className="shrink-0" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle icon={Zap} title="Quick Actions" />
          <div className="space-y-1.5">
            {[
              { label: "Add News Article",     icon: Newspaper, bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" },
              { label: "Create New Event",     icon: Calendar,  bg: "bg-teal-50 dark:bg-teal-950/40 text-[#009688]" },
              { label: "Upload Gallery Album", icon: Image,     bg: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400" },
              { label: "Add Guest Speaker",    icon: Mic,       bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
              { label: "View Registrations",   icon: Users,     bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
              { label: "Update Page Settings", icon: Settings,  bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left cursor-pointer group transition-colors">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", a.bg)}><Icon className="w-4 h-4" /></div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white flex-1">{a.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#009688] transition-colors" />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={Clock} title="Upcoming Events Timeline" />
          <span className="text-xs text-[#009688] font-semibold cursor-pointer hover:underline -mt-4">View All →</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {MOCK_EVENTS.map((ev) => (
            <div key={ev.id} className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#009688]/30 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-[#009688]">{ev.category}</span>
                {ev.featured && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600">Featured</span>}
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mb-2">{ev.title}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {ev.date}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {ev.venue}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 2. NEWS MANAGEMENT ───────────────────────────────────────────────────────
function NENews() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", shortDesc: "", content: "", category: "", tags: "", publishDate: "", status: "draft" });
  const filtered = MOCK_NEWS.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.category.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="News Management" subtitle="Create, edit, and publish news articles displayed on the college website." badge="News CMS" breadcrumbs={[{ label: "Dashboard" }, { label: "News & Events" }, { label: "News" }]} action={{ label: "Add News Article", icon: Plus, onClick: () => setShowForm(true) }} />
      {showForm && (
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif">New News Article</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-4">
            <FF label="Title *"><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="News article headline..." className={iCls} /></FF>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FF label="Slug"><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="news-article-slug" className={cn(iCls, "font-mono")} /></FF>
              <FF label="Category">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={iCls}>
                  <option value="">Select category...</option>
                  <option>Achievements</option><option>Events</option><option>Campus</option><option>Institutional</option><option>Placements</option>
                </select>
              </FF>
            </div>
            <FF label="Short Description"><textarea rows={2} value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} placeholder="Brief summary..." className={taCls} /></FF>
            <FF label="Full Content"><textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Full news article content..." className={taCls} /></FF>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FF label="Tags"><input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2..." className={iCls} /></FF>
              <FF label="Publish Date"><input type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} className={iCls} /></FF>
              <FF label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={iCls}>
                  <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                </select>
              </FF>
            </div>
            <FF label="Featured Image URL">
              <div className="flex gap-2">
                <input type="text" placeholder="https://images.unsplash.com/..." className={cn(iCls, "font-mono flex-1")} />
                <button className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"><Upload className="w-3.5 h-3.5" /> Upload</button>
              </div>
            </FF>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => { toast({ title: "News Article Saved", description: `"${form.title || "Untitled"}" saved as ${form.status}.` }); setShowForm(false); }} className={savCls}><Save className="w-3.5 h-3.5" /> Save Article</button>
            <button onClick={() => setShowForm(false)} className={canCls}>Cancel</button>
          </div>
        </Card>
      )}
      <Card>
        <div className="mb-5"><SearchBar placeholder="Search news articles..." onSearch={setSearch} /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800"><tr><TH label="Article" /><TH label="Category" /><TH label="Author" /><TH label="Date" /><TH label="Status" /><TH label="Actions" /></tr></thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filtered.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={n.image} alt="" className="w-10 h-8 rounded-lg object-cover shrink-0" /><span className="font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">{n.title}</span></div></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">{n.category}</span></td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{n.author}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">{n.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={n.status} /></td>
                  <td className="px-4 py-3"><div className="flex gap-0.5"><Btn icon={Eye} label="Preview" variant="primary" /><Btn icon={Edit3} label="Edit" /><Btn icon={Trash2} label="Delete" variant="danger" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager total={MOCK_NEWS.length} shown={filtered.length} />
      </Card>
    </div>
  );
}

// ─── 3. EVENTS MANAGEMENT ─────────────────────────────────────────────────────
function NEEvents() {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "card">("list");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", description: "", category: "", date: "", time: "", venue: "", organizer: "", coordinator: "", contact: "", regLink: "", maxParticipants: "", featured: false, status: "draft" });
  const filtered = MOCK_EVENTS.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Events Management" subtitle="Create and manage all college events — workshops, seminars, cultural fests, hackathons." badge="Events CMS" breadcrumbs={[{ label: "Dashboard" }, { label: "News & Events" }, { label: "Events" }]} action={{ label: "Create Event", icon: Plus, onClick: () => setShowForm(true) }} />
      {showForm && (
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif">New Event</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><FF label="Event Title *"><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title..." className={iCls} /></FF></div>
            <FF label="Subtitle"><input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Tagline..." className={iCls} /></FF>
            <FF label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={iCls}>
                <option value="">Select category...</option>
                {MOCK_CATEGORIES_DATA.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </FF>
            <FF label="Date"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={iCls} /></FF>
            <FF label="Time"><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={iCls} /></FF>
            <FF label="Venue"><input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Auditorium..." className={iCls} /></FF>
            <FF label="Organizer"><input type="text" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} placeholder="Computer Science Dept." className={iCls} /></FF>
            <FF label="Coordinator"><input type="text" value={form.coordinator} onChange={(e) => setForm({ ...form, coordinator: e.target.value })} placeholder="Faculty name..." className={iCls} /></FF>
            <FF label="Contact"><input type="text" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+91 98765 43210" className={iCls} /></FF>
            <FF label="Max Participants"><input type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} placeholder="500" className={iCls} /></FF>
            <FF label="Reg Link"><input type="text" value={form.regLink} onChange={(e) => setForm({ ...form, regLink: e.target.value })} placeholder="https://forms.google.com/..." className={cn(iCls, "font-mono")} /></FF>
            <FF label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={iCls}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
              </select>
            </FF>
            <div className="sm:col-span-2"><FF label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed description..." className={taCls} /></FF></div>
            <div className="sm:col-span-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-slate-300" /><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mark as Featured Event</span></label></div>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => { toast({ title: "Event Saved" }); setShowForm(false); }} className={savCls}><Save className="w-3.5 h-3.5" /> Save Event</button>
            <button onClick={() => setShowForm(false)} className={canCls}>Cancel</button>
          </div>
        </Card>
      )}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <SearchBar placeholder="Search events..." onSearch={setSearch} />
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
            <button onClick={() => setView("list")} className={cn("p-1.5 rounded-lg cursor-pointer transition-colors", view === "list" ? "bg-white dark:bg-slate-700 shadow-xs text-slate-800" : "text-slate-400 hover:text-slate-600")}><List className="w-4 h-4" /></button>
            <button onClick={() => setView("card")} className={cn("p-1.5 rounded-lg cursor-pointer transition-colors", view === "card" ? "bg-white dark:bg-slate-700 shadow-xs text-slate-800" : "text-slate-400 hover:text-slate-600")}><Grid className="w-4 h-4" /></button>
          </div>
        </div>
        {view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800"><tr><TH label="Event" /><TH label="Category" /><TH label="Date" /><TH label="Venue" /><TH label="Participants" /><TH label="Status" /><TH label="Actions" /></tr></thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3"><p className="font-bold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">{ev.title}</p><p className="text-[10px] text-slate-400 mt-0.5">{ev.subtitle}</p></td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">{ev.category}</span></td>
                    <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">{ev.date}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[140px] truncate">{ev.venue}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{ev.participants.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                    <td className="px-4 py-3"><div className="flex gap-0.5"><Btn icon={Eye} label="Preview" variant="primary" /><Btn icon={Edit3} label="Edit" /><Btn icon={Trash2} label="Delete" variant="danger" /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ev) => (
              <div key={ev.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#009688]/30 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3"><span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-[#009688]">{ev.category}</span><StatusBadge status={ev.status} /></div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">{ev.title}</h4>
                <p className="text-[11px] text-slate-500 mb-3">{ev.subtitle}</p>
                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#009688]" />{ev.date} at {ev.time}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#009688]" />{ev.venue}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#009688]" />{ev.participants.toLocaleString()} participants</p>
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Btn icon={Edit3} label="Edit" /><Btn icon={Eye} label="Preview" variant="primary" /><Btn icon={Trash2} label="Delete" variant="danger" />
                  {ev.featured && <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 text-[10px] font-bold flex items-center gap-1"><Star className="w-3 h-3" />Featured</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── 4. EVENT CATEGORIES ──────────────────────────────────────────────────────
function NECategories() {
  const { toast } = useToast();
  const [cats, setCats] = useState(MOCK_CATEGORIES_DATA);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  return (
    <div className="space-y-6">
      <PageHeader title="Event Categories" subtitle="Manage categories that classify events on the college website." badge="Categories" breadcrumbs={[{ label: "Dashboard" }, { label: "News & Events" }, { label: "Categories" }]} action={{ label: "Add Category", icon: Plus, onClick: () => setShowForm(true) }} />
      {showForm && (
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">New Category</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1"><FF label="Category Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tech Fest" className={iCls} /></FF></div>
            <button onClick={() => { if (!name.trim()) return; setCats((p) => [...p, { id: `c${Date.now()}`, name, iconName: "Tag", count: 0, color: "bg-slate-100 text-slate-600 border-slate-200" }]); toast({ title: "Category Added" }); setName(""); setShowForm(false); }} className={savCls}><Save className="w-3.5 h-3.5" />Add</button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Tag;
          return (
            <Card key={cat.id} className="flex items-center gap-4 group hover:border-[#009688]/30 hover:shadow-md transition-all !p-5">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0", cat.color)}><Icon className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0"><p className="font-bold text-sm text-slate-800 dark:text-slate-200">{cat.name}</p><p className="text-xs text-slate-500 mt-0.5">{cat.count} events</p></div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Btn icon={Edit3} label="Edit" />
                <Btn icon={Trash2} label="Delete" variant="danger" onClick={() => { setCats((p) => p.filter((c) => c.id !== cat.id)); toast({ title: "Category deleted" }); }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── 5. FEATURED EVENT ────────────────────────────────────────────────────────
function NEFeaturedEvent() {
  const { toast } = useToast();
  const [form, setForm] = useState({ selectedEvent: "e1", headline: "National Level Hackathon 2026 — Code. Create. Conquer.", description: "Join 500+ students in the most anticipated tech event of the year. Build innovative solutions for real-world problems and compete for prizes worth Rs.2 Lakhs.", ctaText: "Register Now", ctaLink: "https://forms.google.com/", highlights: "Rs.2L Prize Pool, 48-Hour Hackathon, 500 Participants, Industry Mentors" });
  return (
    <div className="space-y-6">
      <PageHeader title="Featured Event CMS" subtitle="Configure the hero featured event displayed at the top of the News and Events page." badge="Featured Event" breadcrumbs={[{ label: "Dashboard" }, { label: "News & Events" }, { label: "Featured Event" }]} action={{ label: "Save & Publish", icon: Save, onClick: () => toast({ title: "Featured Event Updated" }) }} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 space-y-4">
          <SectionTitle icon={Star} title="Featured Event Configuration" />
          <FF label="Select Event *"><select value={form.selectedEvent} onChange={(e) => setForm({ ...form, selectedEvent: e.target.value })} className={iCls}>{MOCK_EVENTS.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}</select></FF>
          <FF label="Hero Headline *"><input type="text" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className={iCls} /></FF>
          <FF label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={taCls} /></FF>
          <div className="grid grid-cols-2 gap-4">
            <FF label="CTA Text"><input type="text" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className={iCls} /></FF>
            <FF label="CTA Link"><input type="text" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className={cn(iCls, "font-mono")} /></FF>
          </div>
          <FF label="Highlights (comma separated)"><input type="text" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} className={iCls} /></FF>
          <FF label="Hero Banner Image URL">
            <div className="flex gap-2">
              <input type="text" placeholder="https://images.unsplash.com/..." className={cn(iCls, "font-mono flex-1")} />
              <button className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"><Upload className="w-3.5 h-3.5" />Upload</button>
            </div>
          </FF>
        </Card>
        <Card className="lg:col-span-5">
          <SectionTitle icon={Eye} title="Live Preview" />
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#009688]/20 text-[#009688] text-[10px] font-bold border border-[#009688]/30">Featured Event</span>
            <h4 className="text-base font-bold leading-snug">{form.headline || "Event Headline"}</h4>
            <p className="text-xs text-white/70 leading-relaxed line-clamp-3">{form.description}</p>
            <div className="flex flex-wrap gap-2 pt-1">{form.highlights.split(",").filter(Boolean).map((h, i) => (<span key={i} className="px-2 py-1 rounded-lg bg-white/10 text-white text-[10px] font-semibold">{h.trim()}</span>))}</div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#009688] text-white text-xs font-bold mt-2">{form.ctaText} →</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── 6. GUEST SPEAKERS ────────────────────────────────────────────────────────
function NEGuestSpeakers() {
  const { toast } = useToast();
  const [speakers, setSpeakers] = useState(MOCK_SPEAKERS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", designation: "", org: "", bio: "", topic: "", linkedin: "", order: "" });
  return (
    <div className="space-y-6">
      <PageHeader title="Guest Speakers" subtitle="Manage industry experts and guest speakers featured on the News and Events page." badge="Speakers" breadcrumbs={[{ label: "Dashboard" }, { label: "News & Events" }, { label: "Guest Speakers" }]} action={{ label: "Add Speaker", icon: Plus, onClick: () => setShowForm(true) }} />
      {showForm && (
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add Guest Speaker</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FF label="Full Name *"><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Smith" className={iCls} /></FF>
            <FF label="Designation *"><input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="CTO, Director..." className={iCls} /></FF>
            <FF label="Organization *"><input type="text" value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} placeholder="Company or Institution" className={iCls} /></FF>
            <FF label="Talk Topic"><input type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Talk topic..." className={iCls} /></FF>
            <FF label="LinkedIn URL"><input type="text" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." className={cn(iCls, "font-mono")} /></FF>
            <FF label="Display Order"><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="1" className={iCls} /></FF>
            <div className="sm:col-span-2"><FF label="Profile Image URL"><div className="flex gap-2"><input type="text" placeholder="https://..." className={cn(iCls, "font-mono flex-1")} /><button className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"><Upload className="w-3.5 h-3.5" />Upload</button></div></FF></div>
            <div className="sm:col-span-2"><FF label="Bio"><textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Speaker bio..." className={taCls} /></FF></div>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => { toast({ title: "Speaker Saved" }); setShowForm(false); }} className={savCls}><Save className="w-3.5 h-3.5" />Save Speaker</button>
            <button onClick={() => setShowForm(false)} className={canCls}>Cancel</button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {speakers.map((sp) => (
          <Card key={sp.id} className="text-center group hover:border-[#009688]/30 hover:shadow-md transition-all !p-5">
            <div className="relative inline-block mb-3">
              <img src={sp.image} alt={sp.name} className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-[#009688]/20" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#009688] flex items-center justify-center text-white text-[10px] font-bold">#{sp.order}</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sp.name}</h4>
            <p className="text-[11px] text-[#009688] font-semibold mt-0.5">{sp.designation}</p>
            <p className="text-[11px] text-slate-500">{sp.org}</p>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{sp.topic}</p>
            <div className="flex items-center justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Btn icon={Link2} label="LinkedIn" variant="primary" />
              <Btn icon={Edit3} label="Edit" />
              <Btn icon={Trash2} label="Delete" variant="danger" onClick={() => { setSpeakers((p) => p.filter((s) => s.id !== sp.id)); toast({ title: "Speaker removed" }); }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── 7. EVENT GALLERY ─────────────────────────────────────────────────────────
function NEGallery() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const filtered = MOCK_GALLERY.filter((g) => g.album.toLowerCase().includes(search.toLowerCase()) || g.event.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Event Gallery" subtitle="Manage photo albums and media galleries displayed on the News and Events page." badge="Gallery CMS" breadcrumbs={[{ label: "Dashboard" }, { label: "News & Events" }, { label: "Event Gallery" }]} action={{ label: "Create Album", icon: Plus, onClick: () => toast({ title: "Create Album" }) }} />
      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <SearchBar placeholder="Search albums or events..." onSearch={setSearch} />
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0"><Upload className="w-3.5 h-3.5" /> Upload Media</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <div key={g.id} className="group relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-[#009688]/30 hover:shadow-md transition-all cursor-pointer">
              <div className="relative overflow-hidden h-36">
                <img src={g.thumb} alt={g.album} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3 gap-2">
                  <button onClick={() => toast({ title: "Viewing gallery" })} className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 cursor-pointer"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toast({ title: "Editing album" })} className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toast({ title: "Album deleted" })} className="p-2 rounded-xl bg-rose-500/80 text-white cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{g.album}</h4>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" />{g.event}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">{g.date}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">{g.count} items</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 8. REGISTRATIONS ─────────────────────────────────────────────────────────
function NERegistrations() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const filtered = MOCK_REGISTRATIONS.filter((r) => r.student.toLowerCase().includes(search.toLowerCase()) || r.event.toLowerCase().includes(search.toLowerCase()) || r.dept.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Registrations" subtitle="View and manage all student event registrations submitted through the website." badge="Registration CMS" breadcrumbs={[{ label: "Dashboard" }, { label: "News & Events" }, { label: "Registrations" }]} />
      <div className="flex justify-end">
        <button onClick={() => toast({ title: "Exporting CSV..." })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"><Download className="w-3.5 h-3.5" /> Export CSV</button>
      </div>
      <Card>
        <div className="mb-5"><SearchBar placeholder="Search by student, event, or department..." onSearch={setSearch} /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800"><tr><TH label="#" /><TH label="Student Name" /><TH label="Event" /><TH label="Department" /><TH label="Date" /><TH label="Status" /><TH label="Actions" /></tr></thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-mono">{i + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{r.student}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[180px] truncate">{r.event}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">{r.dept}</span></td>
                  <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3"><div className="flex gap-0.5"><Btn icon={Eye} label="View" variant="primary" /><Btn icon={Trash2} label="Delete" variant="danger" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager total={MOCK_REGISTRATIONS.length} shown={filtered.length} />
      </Card>
    </div>
  );
}

// ─── 9. STATISTICS & COUNTERS ─────────────────────────────────────────────────
function NEStats() {
  const { toast } = useToast();
  const [stats, setStats] = useState(MOCK_STATS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", value: "", icon: "Calendar" });
  return (
    <div className="space-y-6">
      <PageHeader title="Statistics & Counters" subtitle="Manage event statistics and counter numbers displayed on the News and Events page." badge="Statistics" breadcrumbs={[{ label: "Dashboard" }, { label: "News & Events" }, { label: "Statistics" }]} action={{ label: "Add Counter", icon: Plus, onClick: () => setShowForm(true) }} />
      {showForm && (
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">New Counter</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1"><FF label="Counter Title *"><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Events Conducted" className={iCls} /></FF></div>
            <FF label="Value *"><input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="120" className={iCls} /></FF>
            <FF label="Icon"><select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={iCls}>{Object.keys(ICON_MAP).map((ic) => <option key={ic}>{ic}</option>)}</select></FF>
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => { if (!form.title || !form.value) return; setStats((p) => [...p, { id: `st${Date.now()}`, title: form.title, value: parseInt(form.value) || 0, icon: form.icon, order: p.length + 1, visible: true }]); toast({ title: "Counter Added" }); setForm({ title: "", value: "", icon: "Calendar" }); setShowForm(false); }} className={savCls}><Save className="w-3.5 h-3.5" />Add Counter</button>
            <button onClick={() => setShowForm(false)} className={canCls}>Cancel</button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = ICON_MAP[stat.icon] || Calendar;
          return (
            <Card key={stat.id} className={cn("group hover:shadow-md transition-all", !stat.visible && "opacity-50")}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#009688] flex items-center justify-center border border-teal-100 dark:border-teal-900/40"><Icon className="w-5 h-5" /></div>
                <div className="flex gap-0.5">
                  <button onClick={() => setStats((p) => p.map((s) => s.id === stat.id ? { ...s, visible: !s.visible } : s))} title="Toggle Visibility" className="p-1.5 rounded-lg text-slate-400 hover:text-[#009688] hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer transition-colors"><Eye className={cn("w-4 h-4", !stat.visible && "opacity-30")} /></button>
                  <Btn icon={Edit3} label="Edit" />
                  <Btn icon={Trash2} label="Delete" variant="danger" onClick={() => { setStats((p) => p.filter((s) => s.id !== stat.id)); toast({ title: "Counter removed" }); }} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-serif">{stat.value.toLocaleString()}</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{stat.title}</p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Order #{stat.order}</span>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", stat.visible ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>{stat.visible ? "Visible" : "Hidden"}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── 10. PAGE SETTINGS ────────────────────────────────────────────────────────
function NEPageSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    heroTitle: "News & Events — Bishop Ambrose College",
    heroSubtitle: "Stay updated with the latest happenings, cultural events, workshops, and achievements at BAC.",
    metaTitle: "News & Events | Bishop Ambrose College, Coimbatore",
    metaDescription: "Explore the latest news, upcoming events, guest lectures, workshops, hackathons and cultural activities at Bishop Ambrose College.",
    ogImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    ctaText: "Register for Events", ctaLink: "#events",
    showHero: true, showStats: true, showFeatured: true, showGallery: true, robotsIndex: true,
  });
  function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
    return (
      <label className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer group">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>
        <button onClick={onChange} className={cn("w-10 h-6 rounded-full transition-colors relative shrink-0", value ? "bg-[#009688]" : "bg-slate-200 dark:bg-slate-700")}>
          <span className={cn("block absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all", value ? "left-5" : "left-1")} />
        </button>
      </label>
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Page Settings" subtitle="Control hero content, SEO metadata, CTA buttons, and section visibility for the News and Events page." badge="Page Config" breadcrumbs={[{ label: "Dashboard" }, { label: "News & Events" }, { label: "Page Settings" }]} action={{ label: "Save & Publish", icon: Save, onClick: () => toast({ title: "Page Settings Saved", description: "News and Events page settings published." }) }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <SectionTitle icon={Layers} title="Hero Section" />
            <FF label="Hero Title *"><input type="text" value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} className={iCls} /></FF>
            <FF label="Hero Subtitle"><textarea rows={2} value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} className={taCls} /></FF>
            <div className="grid grid-cols-2 gap-4">
              <FF label="CTA Text"><input type="text" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className={iCls} /></FF>
              <FF label="CTA Link"><input type="text" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className={cn(iCls, "font-mono")} /></FF>
            </div>
          </Card>
          <Card className="space-y-4">
            <SectionTitle icon={Globe} title="SEO & Open Graph" />
            <FF label="Meta Title *">
              <div className="flex items-center justify-end mb-1"><span className={cn("text-[10px] font-mono", form.metaTitle.length > 60 ? "text-amber-600 font-bold" : "text-slate-400")}>{form.metaTitle.length}/60</span></div>
              <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={iCls} />
            </FF>
            <FF label="Meta Description *">
              <div className="flex items-center justify-end mb-1"><span className={cn("text-[10px] font-mono", form.metaDescription.length > 160 ? "text-amber-600 font-bold" : "text-slate-400")}>{form.metaDescription.length}/160</span></div>
              <textarea rows={2} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className={taCls} />
            </FF>
            <FF label="Open Graph Image URL"><input type="text" value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} className={cn(iCls, "font-mono")} /></FF>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.robotsIndex} onChange={(e) => setForm({ ...form, robotsIndex: e.target.checked })} className="rounded border-slate-300" />
              <span className="text-xs text-slate-700 dark:text-slate-300">Allow search engines to index this page (robots: index, follow)</span>
            </label>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <SectionTitle icon={Eye} title="Section Visibility" />
            <Toggle label="Show Hero Banner"         value={form.showHero}     onChange={() => setForm({ ...form, showHero:     !form.showHero     })} />
            <Toggle label="Show Featured Event"      value={form.showFeatured} onChange={() => setForm({ ...form, showFeatured: !form.showFeatured })} />
            <Toggle label="Show Statistics Counters" value={form.showStats}    onChange={() => setForm({ ...form, showStats:    !form.showStats    })} />
            <Toggle label="Show Event Gallery"       value={form.showGallery}  onChange={() => setForm({ ...form, showGallery:  !form.showGallery  })} />
          </Card>
          <Card>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Google SERP Preview</h3>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="text-[10px] text-slate-500 font-mono truncate">bishopambrosecollege.edu.in/news-events</p>
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium hover:underline cursor-pointer line-clamp-1">{form.metaTitle}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{form.metaDescription}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
export interface NewsEventsCMSProps {
  activeSubPage?: string;
  onSubPageChange?: (p: SubPage) => void;
}

export function NewsEventsCMS({ activeSubPage, onSubPageChange }: NewsEventsCMSProps = {}) {
  const [internalPage, setInternalPage] = useState<SubPage>("ne-dashboard");

  const validSubPages: SubPage[] = [
    "ne-dashboard", "ne-news", "ne-events", "ne-categories",
    "ne-featured", "ne-speakers", "ne-gallery", "ne-registrations",
    "ne-stats", "ne-page-settings"
  ];

  const activePage: SubPage = (activeSubPage && validSubPages.includes(activeSubPage as SubPage))
    ? (activeSubPage as SubPage)
    : internalPage;

  const handleSelect = (p: SubPage) => {
    setInternalPage(p);
    onSubPageChange?.(p);
  };

  const renderPage = () => {
    switch (activePage) {
      case "ne-dashboard":     return <NEDashboard />;
      case "ne-news":          return <NENews />;
      case "ne-events":        return <NEEvents />;
      case "ne-categories":    return <NECategories />;
      case "ne-featured":      return <NEFeaturedEvent />;
      case "ne-speakers":      return <NEGuestSpeakers />;
      case "ne-gallery":       return <NEGallery />;
      case "ne-registrations": return <NERegistrations />;
      case "ne-stats":         return <NEStats />;
      case "ne-page-settings": return <NEPageSettings />;
      default:                 return <NEDashboard />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <SubNav active={activePage} onSelect={handleSelect} />
      {renderPage()}
    </div>
  );
}

