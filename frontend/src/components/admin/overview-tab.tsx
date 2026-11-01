"use client";

import React, { useEffect, useState } from "react";
import {
  Building2, BookOpen, Users, Calendar, FileText, ClipboardList,
  Heart, FolderOpen, Image, CheckCircle2, Mail, TrendingUp,
  TrendingDown, ArrowUpRight, Plus, Activity, Bell, Award,
  AlertTriangle, GraduationCap, Briefcase, BarChart2,
} from "lucide-react";
import { NavState } from "./admin-nav";
import { cn } from "@/lib/utils";

// ─── Live date hook ───────────────────────────────────────────────────────────

function useLiveDateTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function getGreeting(now: Date) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  icon: React.ElementType;
  title: string;
  value: string | number;
  sub: string;
  trend?: "up" | "down" | "warn" | "info";
  color: string;
  iconBg: string;
  onClick?: () => void;
};

function StatCard({ icon: Icon, title, value, sub, trend, color, iconBg, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-0.5">{value}</p>
      <p className="text-xs text-slate-500 font-medium mb-2">{title}</p>
      <div className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
        trend === "up"   && "bg-emerald-50 text-emerald-600",
        trend === "down" && "bg-rose-50 text-rose-600",
        trend === "warn" && "bg-amber-50 text-amber-600",
        trend === "info" && "bg-blue-50 text-blue-600",
        !trend           && "bg-slate-50 text-slate-500",
      )}>
        {trend === "up"   && <TrendingUp className="w-2.5 h-2.5" />}
        {trend === "down" && <TrendingDown className="w-2.5 h-2.5" />}
        {trend === "warn" && <AlertTriangle className="w-2.5 h-2.5" />}
        {sub}
      </div>
    </button>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

type BarItem = { label: string; value: number; color: string };

function MiniBarChart({ items }: { items: BarItem[] }) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.label}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium">{item.label}</span>
            <span className="font-bold text-slate-800">{item.value}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────

function DonutChart({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cum = 0;
  const r = 15.9;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 36 36" className="w-24 h-24">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circ;
        const offset = circ * 0.25 - cum * circ;
        cum += pct;
        return (
          <circle
            key={i} cx="18" cy="18" r={r} fill="none"
            stroke={seg.color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

// ─── Activity item ────────────────────────────────────────────────────────────

const ACTIVITY = [
  { icon: GraduationCap, iconBg:"bg-blue-100 text-blue-600",  user:"Dr. K. Suresh", action:"created an event", target:"National Cyber Conclave", module:"Events",  time:"2 min ago",  status:"Pending Approval" },
  { icon: FileText,      iconBg:"bg-amber-100 text-amber-600", user:"Commerce HOD",  action:"submitted a notice", target:"Mid-term Exam Schedule", module:"Notices",  time:"18 min ago", status:"Under Review" },
  { icon: Users,         iconBg:"bg-purple-100 text-purple-600",user:"Admin",       action:"created user",  target:"Ms. Priya (Content Editor)", module:"Users",  time:"1 hr ago",   status:"Active" },
  { icon: Heart,         iconBg:"bg-pink-100 text-pink-600",   user:"System",       action:"received alumni registration", target:"Rajan Kumar — B.Com 2021", module:"Alumni",  time:"2 hrs ago",  status:"New" },
  { icon: ClipboardList, iconBg:"bg-teal-100 text-teal-600",   user:"System",       action:"received admission application", target:"Application #1047", module:"Admissions", time:"3 hrs ago",  status:"New" },
  { icon: CheckCircle2,  iconBg:"bg-emerald-100 text-emerald-600", user:"Admin",    action:"approved event", target:"Alumni Meet 2026", module:"Events",  time:"5 hrs ago",  status:"Published" },
];

// ─── Pending approvals ────────────────────────────────────────────────────────

const PENDING = [
  { id:"EVT-042", title:"National Cyber Conclave",   dept:"Computer Science", type:"Event",    date:"Today",    urgent:true },
  { id:"PGE-018", title:"Research Centre Page",      dept:"Admin",            type:"Page",     date:"Yesterday",urgent:false },
  { id:"NTC-031", title:"Mid-term Exam Notice",      dept:"Commerce",         type:"Notice",   date:"Yesterday",urgent:false },
  { id:"EVT-041", title:"BBA Industry Visit",        dept:"BBA",              type:"Event",    date:"2 days ago",urgent:false },
];

// ─── Upcoming events ──────────────────────────────────────────────────────────

const UPCOMING = [
  { name:"National Cyber Conclave",    dept:"Computer Science", date:"Oct 12",  venue:"Main Auditorium", category:"Academic" },
  { name:"Kaleidoscope Cultural Fest", dept:"Cultural Club",    date:"Oct 18",  venue:"College Grounds", category:"Cultural" },
  { name:"Alumni Meet 2026",           dept:"Alumni Cell",      date:"Nov 5",   venue:"Seminar Hall",    category:"Alumni" },
  { name:"UGC Sponsored Workshop",     dept:"BBA",              date:"Nov 14",  venue:"Seminar Hall",    category:"Academic" },
];

// ─── Quick actions ────────────────────────────────────────────────────────────

type QuickAction = { label: string; icon: React.ElementType; color: string; bg: string; page: string; group: string };

const QUICK_ACTIONS: QuickAction[] = [
  { label:"Create Page",     icon:FileText,     color:"text-blue-600",  bg:"bg-blue-50 hover:bg-blue-100",  page:"pages",      group:"website" },
  { label:"Create Event",    icon:Calendar,     color:"text-teal-600",  bg:"bg-teal-50 hover:bg-teal-100",  page:"events",     group:"content" },
  { label:"Create Notice",   icon:Bell,         color:"text-amber-600", bg:"bg-amber-50 hover:bg-amber-100",page:"notices",    group:"content" },
  { label:"Add Department",  icon:Building2,    color:"text-violet-600",bg:"bg-violet-50 hover:bg-violet-100",page:"departments",group:"academic" },
  { label:"Add Course",      icon:BookOpen,     color:"text-sky-600",   bg:"bg-sky-50 hover:bg-sky-100",    page:"courses",    group:"academic" },
  { label:"Add Faculty",     icon:Users,        color:"text-indigo-600",bg:"bg-indigo-50 hover:bg-indigo-100",page:"faculty",  group:"academic" },
  { label:"Upload Document", icon:FolderOpen,   color:"text-orange-600",bg:"bg-orange-50 hover:bg-orange-100",page:"documents",group:"website" },
  { label:"View Admissions", icon:ClipboardList,color:"text-rose-600",  bg:"bg-rose-50 hover:bg-rose-100",  page:"admissions", group:"admissions" },
  { label:"View Alumni",     icon:Heart,        color:"text-pink-600",  bg:"bg-pink-50 hover:bg-pink-100",  page:"alumni",     group:"alumni" },
  { label:"View Gallery",    icon:Image,        color:"text-emerald-600",bg:"bg-emerald-50 hover:bg-emerald-100",page:"gallery",group:"facilities" },
];

// ─── Department activity ──────────────────────────────────────────────────────

const DEPT_ACTIVITY = [
  { name:"Computer Science", events:4, notices:2, updates:12, last:"2 hrs ago",  active:true },
  { name:"Commerce",         events:2, notices:3, updates:8,  last:"4 hrs ago",  active:true },
  { name:"Biotechnology",    events:3, notices:2, updates:7,  last:"6 hrs ago",  active:true },
  { name:"Management (BBA)", events:1, notices:1, updates:5,  last:"Yesterday",  active:false },
  { name:"English",          events:1, notices:2, updates:4,  last:"Yesterday",  active:false },
];

// ─── Overview Tab ─────────────────────────────────────────────────────────────

interface OverviewTabProps {
  setActiveTab: (tab: string) => void;
  nav?: NavState;
  setNav?: (nav: NavState) => void;
}

export function OverviewTab({ setActiveTab, setNav }: OverviewTabProps) {
  const now = useLiveDateTime();
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Master Admin");
  const [approvals, setApprovals] = useState(PENDING);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bac_admin_user");
      if (stored) {
        const p = JSON.parse(stored);
        setUserName((p.name || "Admin").split(" ")[0]);
        setUserRole(p.role || "Master Admin");
      }
    } catch { /* ignore */ }
  }, []);

  const navigate = (page: string, group?: string) => {
    if (setNav) setNav({ group: group ?? "", page, section: "" });
    else setActiveTab(page);
  };

  const handleApprove = (id: string) => setApprovals(a => a.filter(x => x.id !== id));
  const handleReject  = (id: string) => setApprovals(a => a.filter(x => x.id !== id));

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">

      {/* ── Welcome Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {getGreeting(now)}, {userName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {now.toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
            &nbsp;·&nbsp;
            <span className="text-slate-600 font-medium">{userRole}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Online
          </div>
          <button
            onClick={() => navigate("events","content")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#009688] text-white text-xs font-semibold hover:bg-[#00796b] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create Event
          </button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
        <StatCard icon={Building2}    title="Departments"       value="12"    sub="+1 this year"       trend="up"   color="text-blue-600"   iconBg="bg-blue-50"    onClick={() => navigate("departments","academic")} />
        <StatCard icon={BookOpen}     title="Courses"           value="34"    sub="+3 this year"       trend="up"   color="text-violet-600" iconBg="bg-violet-50"  onClick={() => navigate("courses","academic")} />
        <StatCard icon={Users}        title="Faculty"           value="95"    sub="+7 this year"       trend="up"   color="text-indigo-600" iconBg="bg-indigo-50"  onClick={() => navigate("faculty","academic")} />
        <StatCard icon={Calendar}     title="Events"            value="28"    sub="8 upcoming"         trend="info" color="text-emerald-600"iconBg="bg-emerald-50" onClick={() => navigate("events","content")} />
        <StatCard icon={FileText}     title="Published Pages"   value="247"   sub="+12 this month"     trend="up"   color="text-sky-600"    iconBg="bg-sky-50"     onClick={() => navigate("pages","website")} />
        <StatCard icon={ClipboardList}title="Admission Apps"   value="1,047" sub="142 pending"        trend="warn" color="text-rose-600"   iconBg="bg-rose-50"    onClick={() => navigate("admissions","admissions")} />
        <StatCard icon={Heart}        title="Alumni Registered" value="612"   sub="34 new this month"  trend="up"   color="text-pink-600"   iconBg="bg-pink-50"    onClick={() => navigate("alumni","alumni")} />
        <StatCard icon={FolderOpen}   title="Documents"         value="184"   sub="+18 this month"     trend="up"   color="text-orange-600" iconBg="bg-orange-50"  onClick={() => navigate("documents","website")} />
        <StatCard icon={Image}        title="Gallery Images"    value="2,340" sub="+84 this month"     trend="up"   color="text-teal-600"   iconBg="bg-teal-50"    onClick={() => navigate("gallery","facilities")} />
        <StatCard icon={CheckCircle2} title="Pending Approvals" value={approvals.length} sub="Needs attention" trend="warn" color="text-amber-600" iconBg="bg-amber-50" onClick={() => navigate("approvals","administration")} />
        <StatCard icon={Mail}         title="Unread Enquiries"  value="7"     sub="New today"          trend="warn" color="text-red-600"    iconBg="bg-red-50"     onClick={() => navigate("contact","communication")} />
        <StatCard icon={Briefcase}    title="Placed Students"   value="248"   sub="FY 2025-26"         trend="up"   color="text-cyan-600"   iconBg="bg-cyan-50"    onClick={() => navigate("placements","placement")} />
      </div>

      {/* ── Analytics Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Admissions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Admissions Overview</h2>
            <span className="text-[10px] text-teal-600 font-semibold px-2 py-0.5 bg-teal-50 rounded-full">FY 2026-27</span>
          </div>
          <div className="flex items-center gap-5">
            <DonutChart segments={[
              { value:612, color:"#009688" },
              { value:142, color:"#f59e0b" },
              { value:293, color:"#ef4444" },
            ]} />
            <div className="space-y-2 flex-1">
              {[
                { label:"Approved",  value:612, color:"bg-teal-500" },
                { label:"Pending",   value:142, color:"bg-amber-400" },
                { label:"Rejected",  value:293, color:"bg-rose-400" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 text-xs">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", s.color)} />
                  <span className="text-slate-600 flex-1">{s.label}</span>
                  <span className="font-bold text-slate-800">{s.value}</span>
                </div>
              ))}
              <div className="pt-1 border-t border-slate-100 flex items-center gap-2 text-xs">
                <span className="text-slate-500 flex-1">Total</span>
                <span className="font-bold text-slate-800">1,047</span>
              </div>
            </div>
          </div>
        </div>

        {/* Events by category */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Events by Category</h2>
            <span className="text-[10px] text-blue-600 font-semibold px-2 py-0.5 bg-blue-50 rounded-full">This Semester</span>
          </div>
          <MiniBarChart items={[
            { label:"Academic",   value:12, color:"#3b82f6" },
            { label:"Cultural",   value:8,  color:"#8b5cf6" },
            { label:"Sports",     value:6,  color:"#10b981" },
            { label:"Department", value:5,  color:"#f59e0b" },
            { label:"Alumni",     value:4,  color:"#ec4899" },
          ]} />
        </div>

        {/* Content status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Content Status</h2>
            <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 rounded-full">All Pages</span>
          </div>
          <MiniBarChart items={[
            { label:"Published", value:247, color:"#009688" },
            { label:"Draft",     value:38,  color:"#94a3b8" },
            { label:"Pending",   value:14,  color:"#f59e0b" },
            { label:"Rejected",  value:5,   color:"#ef4444" },
          ]} />
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Content Items</span>
            <span className="font-bold text-slate-800">304</span>
          </div>
        </div>
      </div>

      {/* ── Activity + Pending Approvals ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Recent Activity</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
              <Activity className="w-3 h-3" /> Live
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs", a.iconBg)}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700">
                      <span className="font-semibold text-slate-800">{a.user}</span>
                      {" "}{a.action}{" "}
                      <span className="font-medium text-slate-700">"{a.target}"</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">{a.time}</span>
                      <span className="text-[10px] text-slate-300">·</span>
                      <span className="text-[10px] text-slate-400">{a.module}</span>
                      <span className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                        a.status === "Pending Approval" && "bg-amber-50 text-amber-600",
                        a.status === "Published"        && "bg-emerald-50 text-emerald-600",
                        a.status === "Active"           && "bg-blue-50 text-blue-600",
                        a.status === "Under Review"     && "bg-violet-50 text-violet-600",
                        a.status === "New"              && "bg-teal-50 text-teal-600",
                      )}>{a.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-slate-100">
            <button className="text-xs text-teal-600 hover:text-teal-700 font-semibold">View full audit log →</button>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Pending Approvals</h2>
            {approvals.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {approvals.length}
              </span>
            )}
          </div>

          {approvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No pending approvals.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {approvals.map(p => (
                <div key={p.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      {p.urgent && (
                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full mb-1 uppercase tracking-wide">Urgent</span>
                      )}
                      <p className="text-xs font-semibold text-slate-800 truncate">{p.title}</p>
                      <p className="text-[10px] text-slate-400">{p.dept} · {p.type} · {p.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleApprove(p.id)} className="flex-1 py-1.5 rounded-lg bg-teal-600 text-white text-[10px] font-bold hover:bg-teal-700 transition-colors">Approve</button>
                    <button onClick={() => handleReject(p.id)} className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[10px] font-bold hover:bg-slate-50 transition-colors">Reject</button>
                    <button className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[10px] hover:bg-slate-50 transition-colors">View</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-3 border-t border-slate-100">
            <button onClick={() => navigate("approvals","administration")} className="text-xs text-teal-600 hover:text-teal-700 font-semibold">Approval Center →</button>
          </div>
        </div>
      </div>

      {/* ── Upcoming Events + Quick Actions ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Upcoming Events */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Upcoming Events</h2>
            <button onClick={() => navigate("events","content")} className="text-xs text-teal-600 hover:text-teal-700 font-semibold">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {UPCOMING.map((e, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] text-slate-500 font-semibold uppercase leading-none">{e.date.split(" ")[0]}</span>
                  <span className="text-sm font-bold text-slate-800 leading-none">{e.date.split(" ")[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{e.name}</p>
                  <p className="text-[10px] text-slate-400">{e.dept} · {e.venue}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                  e.category === "Academic"  && "bg-blue-50 text-blue-600",
                  e.category === "Cultural"  && "bg-purple-50 text-purple-600",
                  e.category === "Sports"    && "bg-emerald-50 text-emerald-600",
                  e.category === "Alumni"    && "bg-pink-50 text-pink-600",
                )}>{e.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.page, action.group)}
                  className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors text-center", action.bg)}
                >
                  <Icon className={cn("w-4 h-4", action.color)} />
                  <span className="text-[10px] font-semibold text-slate-700 leading-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Department Activity ──────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Department Activity</h2>
          <button onClick={() => navigate("departments","academic")} className="text-xs text-teal-600 hover:text-teal-700 font-semibold">View Departments</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["Department","Events","Notices","Updates","Status","Last Activity"].map(col => (
                  <th key={col} className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DEPT_ACTIVITY.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#009688]/10 flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5 text-[#009688]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-medium">{d.events}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-medium">{d.notices}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-medium">{d.updates}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      d.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    )}>{d.active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-slate-400">{d.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
