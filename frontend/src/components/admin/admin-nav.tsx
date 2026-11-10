"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Globe, GraduationCap, ClipboardList, Star, Newspaper,
  ShieldCheck, FileText, Building, BookOpen, Building2, Briefcase, Heart,
  MessageSquare, Shield, Settings, Home, Menu, Image, FolderOpen, Search,
  Users, Calendar, Bell, Award, Trophy, Palette, Activity, CheckCircle2,
  Clock, BarChart2, CheckSquare, Lightbulb, Link, UserCheck, Mail, Lock,
  Info, X, ChevronDown, LogOut, Tag, Mic, Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCMSStore } from "@/lib/cms-store";

// ─── Types ───────────────────────────────────────────────────────────────────

export type NavState = {
  group?: string;
  page: string;
  section: string;
};

export type NavSubItem = { id: string; label: string; icon: React.ElementType };
export type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: NavSubItem[];
};
type NavGroup = {
  id: string; label: string; icon: React.ElementType;
  single?: boolean; visibleTo: string[]; items: NavItem[];
};

// ─── Role Resolver ────────────────────────────────────────────────────────────

export function getRoleId(roleStr: string): string {
  const r = (roleStr || "").toLowerCase();
  if (r === "master admin") return "master_admin";
  if (r.includes("sub admin")) return "sub_admin";
  if (r.startsWith("hod") || r.includes("head of dept")) return "hod";
  if (r.includes("club head")) return "club_head";
  if (r.includes("content editor")) return "content_editor";
  return "staff";
}

// ─── Navigation Groups ────────────────────────────────────────────────────────

const ALL  = ["master_admin","sub_admin","hod","club_head","content_editor","staff"];
const PLUS = ["master_admin","sub_admin","hod","content_editor"];
const MID  = ["master_admin","sub_admin","content_editor"];
const TOP  = ["master_admin","sub_admin"];

const NAV_GROUPS: NavGroup[] = [
  {
    id: "dashboard", label: "Dashboard", icon: LayoutDashboard,
    single: true, visibleTo: ALL,
    items: [{ id: "overview", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    id: "website", label: "Website", icon: Globe,
    visibleTo: [...TOP, "content_editor", "hod", "club_head"],
    items: [
      { id: "home",          label: "Homepage",         icon: Home },
      { id: "news-events",   label: "News & Events",    icon: Newspaper },
      { id: "advertisements",label: "Advertisements",   icon: Megaphone },
      { id: "pages",         label: "Pages",            icon: FileText },
      { id: "menus",         label: "Menu Builder",     icon: Menu },
      { id: "media",         label: "Media Library",    icon: Image },
      { id: "forms",         label: "Forms & Inquiries",icon: ClipboardList },
      { id: "documents",     label: "Documents",        icon: FolderOpen },
      { id: "seo",           label: "SEO",              icon: Search },
      { id: "site-settings", label: "Website Settings", icon: Settings },
    ],
  },
  {
    id: "academic", label: "Academic", icon: GraduationCap,
    visibleTo: PLUS,
    items: [
      { id: "departments",       label: "Departments",       icon: Building2 },
      { id: "courses",           label: "Courses",           icon: BookOpen },
      { id: "faculty",           label: "Faculty & Staff",   icon: Users },
      { id: "academic-calendar", label: "Academic Calendar", icon: Calendar },
      { id: "curriculum",        label: "Curriculum",        icon: FileText },
    ],
  },
  {
    id: "admissions", label: "Admissions", icon: ClipboardList,
    visibleTo: MID,
    items: [
      { id: "admissions",      label: "Applications",    icon: ClipboardList },
      { id: "admission-info",  label: "Admission Info",  icon: Info },
      { id: "admission-forms", label: "Admission Forms", icon: FileText },
      { id: "scholarships",    label: "Scholarships",    icon: Award },
    ],
  },
  {
    id: "student-life", label: "Student Life", icon: Star,
    visibleTo: [...PLUS, "club_head"],
    items: [
      { id: "clubs",                label: "Clubs",              icon: Users },
      { id: "associations",         label: "Associations",       icon: Users },
      { id: "sports",               label: "Sports",             icon: Trophy },
      { id: "fine-arts",            label: "Fine Arts",          icon: Palette },
      { id: "student-activities",   label: "Student Activities", icon: Activity },
      { id: "student-achievements", label: "Achievements",       icon: Award },
    ],
  },
  {
    id: "content", label: "Content", icon: Newspaper,
    visibleTo: [...PLUS, "club_head"],
    items: [
      { id: "events",        label: "Events",        icon: Calendar },
      { id: "news",          label: "News",          icon: Newspaper },
      { id: "announcements", label: "Announcements", icon: Bell },
      { id: "notices",       label: "Notices",       icon: FileText },
      { id: "achievements",  label: "Achievements",  icon: Award },
    ],
  },
  {
    id: "iqac", label: "IQAC & Accreditation", icon: ShieldCheck,
    visibleTo: TOP,
    items: [
      { id: "iqac",           label: "IQAC",                icon: ShieldCheck },
      { id: "aqar",           label: "AQAR",                icon: BarChart2 },
      { id: "ssr",            label: "SSR",                 icon: CheckSquare },
      { id: "quality-init",   label: "Quality Initiatives", icon: Lightbulb },
      { id: "best-practices", label: "Best Practices",      icon: CheckCircle2 },
      { id: "iqac-docs",      label: "Documents",           icon: FolderOpen },
    ],
  },
  {
    id: "examination", label: "Examination", icon: FileText,
    visibleTo: MID,
    items: [
      { id: "exam-notifications", label: "Notifications", icon: Bell },
      { id: "timetable",          label: "Timetable",     icon: Clock },
      { id: "results",            label: "Results",       icon: BarChart2 },
      { id: "circulars",          label: "Circulars",     icon: FileText },
      { id: "exam-regulations",   label: "Regulations",   icon: Shield },
    ],
  },
  {
    id: "autonomous", label: "Autonomous", icon: Building,
    visibleTo: TOP,
    items: [
      { id: "autonomous-regs",  label: "Regulations",      icon: FileText },
      { id: "academic-council", label: "Academic Council", icon: Users },
      { id: "board-of-studies", label: "Board of Studies", icon: GraduationCap },
      { id: "auto-docs",        label: "Documents",        icon: FolderOpen },
    ],
  },
  {
    id: "library", label: "Library", icon: BookOpen,
    visibleTo: MID,
    items: [
      { id: "library-info",    label: "Library Info",    icon: Info },
      { id: "digital-library", label: "Digital Library", icon: Globe },
      { id: "e-resources",     label: "E-Resources",     icon: Link },
      { id: "library-docs",    label: "Documents",       icon: FolderOpen },
    ],
  },
  {
    id: "facilities", label: "Facilities", icon: Building2,
    visibleTo: MID,
    items: [
      { id: "facilities", label: "Infrastructure", icon: Building2 },
      { id: "gallery",    label: "Gallery",        icon: Image },
    ],
  },
  {
    id: "placement", label: "Placement", icon: Briefcase,
    visibleTo: MID,
    items: [
      { id: "placements",      label: "Placement Cell",   icon: Briefcase },
      { id: "companies",       label: "Companies",        icon: Building },
      { id: "drives",          label: "Placement Drives", icon: Calendar },
      { id: "placement-stats", label: "Statistics",       icon: BarChart2 },
    ],
  },
  {
    id: "alumni", label: "Alumni", icon: Heart,
    visibleTo: MID,
    items: [
      { id: "alumni",           label: "Registrations",    icon: UserCheck },
      { id: "alumni-directory", label: "Alumni Directory", icon: Users },
      { id: "alumni-events",    label: "Alumni Events",    icon: Calendar },
    ],
  },
  {
    id: "communication", label: "Communication", icon: MessageSquare,
    visibleTo: TOP,
    items: [
      { id: "contact",            label: "Contact Enquiries", icon: Mail },
      { id: "admin-notifications",label: "Notifications",     icon: Bell },
    ],
  },
  {
    id: "administration", label: "Administration", icon: Shield,
    visibleTo: ["master_admin"],
    items: [
      { id: "users",       label: "Users",       icon: Users },
      { id: "roles",       label: "Roles",       icon: Shield },
      { id: "permissions", label: "Permissions", icon: Lock },
      { id: "approvals",   label: "Approvals",   icon: CheckCircle2 },
      { id: "audit-logs",  label: "Audit Logs",  icon: ClipboardList },
    ],
  },
  {
    id: "settings", label: "Settings", icon: Settings,
    single: true, visibleTo: TOP,
    items: [{ id: "settings", label: "Settings", icon: Settings }],
  },
];

// ─── AdminNav Props ───────────────────────────────────────────────────────────

interface AdminNavProps {
  nav: NavState;
  setNav: (nav: NavState) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminNav({ nav, setNav, mobileOpen, setMobileOpen }: AdminNavProps) {
  const navigate = useNavigate();
  const { currentUser } = useCMSStore();

  const roleId = currentUser.role;
  const userProfile = {
    name: currentUser.name,
    role: currentUser.role === "master_admin" 
      ? "Master Admin" 
      : currentUser.role === "hod"
      ? `HOD (${currentUser.departmentId?.replace("-", " ")})`
      : currentUser.role === "club_head"
      ? `Club Head (${currentUser.clubId?.replace("-", " ")})`
      : currentUser.role === "sub_admin"
      ? "Sub Admin"
      : currentUser.role === "content_editor"
      ? "Content Editor"
      : "Staff",
    initials: currentUser.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase(),
  };

  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [openSubMenus, setOpenSubMenus] = useState<Set<string>>(new Set(["news-events"]));

  // ── Auto-open the group that contains the active page ────────────────────
  useEffect(() => {
    const active = NAV_GROUPS.find(g =>
      g.items.some(i => 
        i.id === nav.page || 
        (i.id === "news-events" && (nav.page === "news-events" || nav.page.startsWith("ne-") || (nav.section && nav.section.startsWith("ne-")))) ||
        i.children?.some(c => c.id === nav.page || c.id === nav.section)
      )
    );
    if (active) {
      setOpenGroups(prev => new Set([...prev, active.id]));
    }
  }, [nav.page, nav.section]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleGroup = (id: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const goTo = (group: NavGroup, item: NavItem) => {
    const isNE = item.id === "news-events";
    setNav({ 
      group: group.id, 
      page: item.id, 
      section: isNE ? "ne-dashboard" : (item.children ? "ne-dashboard" : "") 
    });
    setOpenGroups(prev => new Set([...prev, group.id]));
    if (item.children) {
      setOpenSubMenus(prev => new Set([...prev, item.id]));
    }
    setMobileOpen(false);
  };

  const goToSubItem = (group: NavGroup, parentItem: NavItem, childItem: NavSubItem) => {
    setNav({ group: group.id, page: parentItem.id, section: childItem.id });
    setOpenGroups(prev => new Set([...prev, group.id]));
    setOpenSubMenus(prev => new Set([...prev, parentItem.id]));
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {
      // Ignore network errors on logout
    }
    localStorage.removeItem("bac_admin_user");
    navigate("/admin/login");
  };

  const visibleGroups = NAV_GROUPS.filter(g => g.visibleTo.includes(roleId));

  // ── Sidebar content shared between desktop and mobile ────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#009688] flex items-center justify-center shrink-0">
            <GraduationCap className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white leading-tight tracking-wide">BAC Admin</p>
            <p className="text-[9px] text-slate-400 tracking-widest uppercase">Portal</p>
          </div>
        </div>
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className="px-3 py-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-slate-800/60">
          <div className="w-8 h-8 rounded-full bg-[#009688] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userProfile.initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{userProfile.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{userProfile.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {visibleGroups.map(group => {
          const isGroupActive = group.items.some(i => 
            i.id === nav.page || 
            (i.id === "news-events" && (nav.page === "news-events" || nav.page.startsWith("ne-") || (nav.section && nav.section.startsWith("ne-")))) ||
            i.children?.some(c => c.id === nav.page || c.id === nav.section)
          );
          const isOpen = openGroups.has(group.id);

          // ── Single item (Dashboard, Settings) ─────────────────────
          if (group.single) {
            const item = group.items[0];
            const isActive = nav.page === item.id;
            const Icon = item.icon;
            return (
              <button
                key={group.id}
                onClick={() => goTo(group, item)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  isActive
                    ? "bg-[#009688] text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
              </button>
            );
          }

          // ── Collapsible group ──────────────────────────────────────
          const GroupIcon = group.icon;
          return (
            <div key={group.id}>
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer",
                  isGroupActive ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isOpen ? "rotate-0" : "-rotate-90")} />
              </button>

              {isOpen && (
                <div className="ml-2 mt-0.5 mb-1 pl-3 border-l border-slate-700/60 space-y-0.5">
                  {group.items.map(item => {
                    if (item.children && item.children.length > 0) {
                      const isSubOpen = openSubMenus.has(item.id);
                      const isParentActive = nav.page === item.id || item.children.some(c => c.id === nav.page || c.id === nav.section);
                      const ItemIcon = item.icon;

                      return (
                        <div key={item.id} className="space-y-0.5">
                          <button
                            onClick={() => {
                              toggleSubMenu(item.id);
                              if (!isParentActive) {
                                goTo(group, item);
                              }
                            }}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                              isParentActive
                                ? "bg-[#009688]/20 text-cyan-300 font-semibold"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )}
                          >
                            <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                              className={cn(
                                "w-3 h-3 text-slate-400 transition-transform duration-200",
                                isSubOpen ? "rotate-0" : "-rotate-90"
                              )}
                            />
                          </button>

                          {isSubOpen && (
                            <div className="ml-2.5 pl-2.5 border-l border-slate-700/50 space-y-0.5 my-0.5">
                              {item.children.map(child => {
                                const isChildActive =
                                  (nav.page === item.id && (nav.section === child.id || (!nav.section && child.id === "ne-dashboard"))) ||
                                  nav.page === child.id;
                                const ChildIcon = child.icon;

                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => goToSubItem(group, item, child)}
                                    className={cn(
                                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer",
                                      isChildActive
                                        ? "bg-[#009688] text-white shadow-xs font-semibold"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                                    )}
                                  >
                                    <ChildIcon className="w-3 h-3 shrink-0" />
                                    <span className="flex-1 text-left truncate">{child.label}</span>
                                    {isChildActive && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    const isNewsEventsActive = item.id === "news-events" && (
                      nav.page === "news-events" ||
                      nav.page.startsWith("ne-") ||
                      (nav.section && nav.section.startsWith("ne-"))
                    );
                    const isActive = nav.page === item.id || isNewsEventsActive;
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => goTo(group, item)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                          isActive
                            ? "bg-[#009688] text-white shadow-sm"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                        )}
                      >
                        <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#0f1e35] border-r border-slate-800/80 h-full shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex flex-col w-64 bg-[#0f1e35] h-full shadow-2xl transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
