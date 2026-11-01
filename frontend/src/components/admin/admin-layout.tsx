"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Menu, Bell, Search, ChevronRight, X, User, LogOut,
  Settings, Sun, Moon, ExternalLink, CheckCircle2,
  Calendar, FileText, GraduationCap, Users, Shield, Sparkles, Check
} from "lucide-react";
import { NavState } from "./admin-nav";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AdminNav } from "./admin-nav";
import { useCMSStore, RoleType } from "@/lib/cms-store";
import { apiClient } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminLayoutProps = {
  children: React.ReactNode;
  nav: NavState;
  setNav: (nav: NavState) => void;
};

// ─── Page title / breadcrumb map ──────────────────────────────────────────────

const GROUP_LABELS: Record<string, string> = {
  dashboard: "Dashboard", website: "Website", academic: "Academic",
  admissions: "Admissions", "student-life": "Student Life", content: "Content",
  iqac: "IQAC & Accreditation", examination: "Examination", autonomous: "Autonomous",
  library: "Library", facilities: "Facilities", placement: "Placement",
  alumni: "Alumni", communication: "Communication", administration: "Administration",
  settings: "Settings",
};

const PAGE_TITLES: Record<string, string> = {
  overview: "Dashboard", home: "Homepage", "news-events": "News & Events",
  "ne-dashboard": "Dashboard", "ne-news": "News Management", "ne-events": "Events Management",
  "ne-categories": "Event Categories", "ne-featured": "Featured Event", "ne-speakers": "Guest Speakers",
  "ne-gallery": "Event Gallery", "ne-registrations": "Registrations", "ne-stats": "Statistics & Counters",
  "ne-page-settings": "Page Settings",
  pages: "Pages", menus: "Menu Builder",
  media: "Media Library", documents: "Documents", seo: "SEO",
  "site-settings": "Website Settings", departments: "Departments", courses: "Courses",
  faculty: "Faculty & Staff", "academic-calendar": "Academic Calendar",
  curriculum: "Curriculum", admissions: "Applications", "admissions-apps": "Applications",
  "admission-info": "Admission Info", "admission-forms": "Admission Forms", scholarships: "Scholarships",
  clubs: "Clubs", associations: "Associations", sports: "Sports",
  "fine-arts": "Fine Arts", "student-activities": "Student Activities",
  "student-achievements": "Achievements", events: "Events", news: "News",
  announcements: "Announcements", notices: "Notices", achievements: "Achievements",
  iqac: "IQAC", aqar: "AQAR", ssr: "SSR", "quality-init": "Quality Initiatives",
  "best-practices": "Best Practices", "iqac-docs": "Documents",
  "exam-notifications": "Exam Notifications", timetable: "Timetable",
  results: "Results", circulars: "Circulars", "exam-regulations": "Regulations",
  "autonomous-regs": "Regulations", "academic-council": "Academic Council",
  "board-of-studies": "Board of Studies", "auto-docs": "Documents",
  "library-info": "Library Information", "digital-library": "Digital Library",
  "e-resources": "E-Resources", "library-docs": "Documents",
  facilities: "Infrastructure", gallery: "Gallery", placements: "Placement Cell",
  companies: "Companies", drives: "Placement Drives", "placement-stats": "Statistics",
  alumni: "Registrations", "alumni-mgmt": "Alumni Directory", "alumni-directory": "Alumni Directory",
  "alumni-events": "Alumni Events", contact: "Contact Enquiries",
  "admin-notifications": "Notifications", users: "Users", "users-roles": "Users", roles: "Roles",
  permissions: "Permissions", approvals: "Approvals", "audit-logs": "Audit Logs",
  settings: "Settings",
};

export function AdminDashboardLayout({ children, nav, setNav }: AdminLayoutProps) {
  const { toast } = useToast();
  const { 
    currentUser, 
    switchUser, 
    users, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useCMSStore();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const unreadNotifs = notifications.filter(n => n.unread);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd + K for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(s => !s);
      }
      if (e.key === "Escape") { setSearchOpen(false); setNotifOpen(false); setUserMenuOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) { setTimeout(() => searchRef.current?.focus(), 50); }
  }, [searchOpen]);

  // Verify authenticated session with backend
  useEffect(() => {
    const storedUser = localStorage.getItem("bac_admin_user");
    if (!storedUser) {
      window.location.href = "/admin/login";
      return;
    }

    // Verify session active against backend
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem("bac_admin_user");
          window.location.href = "/admin/login";
        }
      })
      .catch(() => {
        // Backend unavailable
      });
  }, []);

  const pageTitle = PAGE_TITLES[nav.page] ?? nav.page;
  const groupLabel = GROUP_LABELS[nav.group ?? ""] ?? "";

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    toast({ title: "All notifications marked as read" });
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (_) {
      // Ignore network errors on logout
    }
    localStorage.removeItem("bac_admin_user");
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <AdminNav nav={nav} setNav={setNav} mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Top Header ──────────────────────────────────────────────────── */}
        <header className="flex items-center gap-3 px-4 sm:px-6 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-30 shadow-xs">

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0 flex-1">
            <span className="font-bold text-amber-600 dark:text-amber-400 hidden sm:block">BAC</span>
            {groupLabel && nav.page !== "overview" && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 hidden sm:block shrink-0" />
                <span className="text-slate-500 hidden sm:block">{groupLabel}</span>
              </>
            )}
            {nav.page !== "overview" && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                <span className={cn(
                  "truncate",
                  nav.section && PAGE_TITLES[nav.section]
                    ? "text-slate-500 font-normal hidden md:inline"
                    : "font-semibold text-slate-900 dark:text-white"
                )}>
                  {pageTitle}
                </span>
              </>
            )}
            {nav.section && PAGE_TITLES[nav.section] && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white truncate">
                  {PAGE_TITLES[nav.section]}
                </span>
              </>
            )}
            {nav.page === "overview" && (
              <span className="font-semibold text-slate-900 dark:text-white">Dashboard</span>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Role Persona Switcher Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-800 dark:text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="capitalize">{currentUser.role.replace("_", " ")}</span>
              {currentUser.departmentId && <span className="opacity-75">({currentUser.departmentId})</span>}
              {currentUser.clubId && <span className="opacity-75">({currentUser.clubId})</span>}
            </div>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 text-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:block">Search…</span>
              <kbd className="hidden md:block text-[9px] px-1 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-400">⌘K</kbd>
            </button>

            {/* View Site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Site</span>
            </a>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
                className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white font-bold flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <button onClick={handleMarkAllRead} className="text-xs text-amber-600 hover:text-amber-700 font-medium">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationRead(n.id)}
                        className={cn(
                          "flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors", 
                          n.unread && "bg-amber-50/40 dark:bg-amber-950/20"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs font-semibold text-slate-800 dark:text-slate-200 truncate", n.unread && "text-slate-900 dark:text-white font-bold")}>{n.title}</p>
                          <p className="text-xs text-slate-500 truncate">{n.description}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                        {n.unread && <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User menu & Role Switcher */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{currentUser.name}</p>
                  <p className="text-[9px] text-slate-400 leading-tight capitalize">{currentUser.role.replace("_", " ")}</p>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-amber-600 capitalize font-medium">{currentUser.role.replace("_", " ")}</p>
                    <p className="text-[10px] text-slate-400">{currentUser.email}</p>
                  </div>

                  {/* Persona Switcher Menu */}
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Switch Role Persona (Demo)
                    </div>
                    <div className="space-y-0.5">
                      {users.map((u) => {
                        const isSelected = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id);
                              setUserMenuOpen(false);
                              toast({ title: `Switched view to ${u.name} (${u.role})` });
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left",
                              isSelected 
                                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold" 
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                          >
                            <div>
                              <div className="font-semibold text-xs">{u.name}</div>
                              <div className="text-[10px] opacity-75 capitalize">
                                {u.role.replace("_", " ")} {u.departmentId ? `• ${u.departmentId}` : ""} {u.clubId ? `• ${u.clubId}` : ""}
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors">
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* ── Global Search Overlay ─────────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules, faculty, courses, applications, circulars..."
                className="w-full text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />
              <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto space-y-1 text-xs">
              {["overview", "home", "courses", "faculty", "admissions", "clubs", "events", "notices", "iqac", "exam-regulations", "statutory-bodies", "library-info", "placements", "alumni", "users", "approvals"].map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setNav({ group: "", page: id, section: "" });
                    setSearchOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <span className="capitalize">{PAGE_TITLES[id] || id}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Navigate ↵</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
