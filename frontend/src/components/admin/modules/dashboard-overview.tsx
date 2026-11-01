"use client";

import React from "react";
import { useCMSStore } from "@/lib/cms-store";
import { StatCard } from "@/components/admin/core/stat-card";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { 
  Users, FileText, Calendar, Bell, ShieldCheck, 
  GraduationCap, Clock, CheckCircle2, ArrowRight, 
  Sparkles, Plus, ExternalLink, Globe, Landmark, BookOpen, AlertCircle
} from "lucide-react";

interface DashboardOverviewProps {
  onNavigateTab: (tabId: string) => void;
}

export function DashboardOverview({ onNavigateTab }: DashboardOverviewProps) {
  const { 
    currentUser, 
    applications, 
    approvals, 
    pages, 
    notices, 
    alumni, 
    auditLogs,
    approveItem,
    rejectItem
  } = useCMSStore();

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const newApplications = applications.filter((a) => a.status === "new" || a.status === "under_review");

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Bishop Ambrose College • Autonomous Governance
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {currentUser.role === "master_admin" && "You have full administrative authority over all 16 college modules, admissions pipelines, approvals, and live website layout."}
              {currentUser.role === "hod" && `You are managing the Department of ${currentUser.departmentId?.replace("-", " ").toUpperCase()}. All changes will sync with the public department portal.`}
              {currentUser.role === "club_head" && `You are managing the ${currentUser.clubId?.replace("-", " ").toUpperCase()} activities, member records, and achievement trophies.`}
              {currentUser.role === "content_editor" && "You have content authoring permissions across standard website pages, press news, and photo galleries."}
              {currentUser.role === "staff" && "You have contributor access to view and propose institutional announcements."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/10"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              View Public Website
            </a>
            {currentUser.role === "master_admin" && (
              <button
                onClick={() => onNavigateTab("approvals")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <Clock className="w-4 h-4" />
                Review Approvals ({pendingApprovals.length})
              </button>
            )}
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Live Pages"
          value={pages.filter((p) => p.status === "published").length}
          subtitle="Dynamic routes"
          icon={<FileText className="w-5 h-5" />}
          variant="amber"
          onClick={() => onNavigateTab("page-builder")}
        />

        <StatCard
          title="Admissions"
          value={applications.length}
          subtitle={`${newApplications.length} pending review`}
          icon={<GraduationCap className="w-5 h-5" />}
          variant="emerald"
          onClick={() => onNavigateTab("admissions-apps")}
        />

        <StatCard
          title="Pending Queue"
          value={pendingApprovals.length}
          subtitle="Needs approval"
          icon={<Clock className="w-5 h-5" />}
          variant="rose"
          onClick={() => onNavigateTab("approvals")}
        />

        <StatCard
          title="Active Notices"
          value={notices.filter((n) => n.status === "published").length}
          subtitle="Circulars broadcast"
          icon={<Bell className="w-5 h-5" />}
          variant="blue"
          onClick={() => onNavigateTab("notices")}
        />

        <StatCard
          title="Alumni Members"
          value={alumni.length}
          subtitle={`${alumni.filter((a) => a.verified).length} verified`}
          icon={<Users className="w-5 h-5" />}
          variant="purple"
          onClick={() => onNavigateTab("alumni-mgmt")}
        />

        <StatCard
          title="Audit Trail"
          value={auditLogs.length}
          subtitle="Logged events"
          icon={<ShieldCheck className="w-5 h-5" />}
          variant="default"
          onClick={() => onNavigateTab("audit-logs")}
        />
      </div>

      {/* Quick Launchpad Shortcuts */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Administrative Launchpad
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigateTab("homepage-builder")}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-left transition-all group"
          >
            <Globe className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-slate-900 dark:text-white text-xs">Edit Homepage</div>
            <div className="text-[11px] text-slate-500">Live section builder</div>
          </button>

          <button
            onClick={() => onNavigateTab("courses")}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-left transition-all group"
          >
            <BookOpen className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-slate-900 dark:text-white text-xs">Degree Courses</div>
            <div className="text-[11px] text-slate-500">UG / PG intake seats</div>
          </button>

          <button
            onClick={() => onNavigateTab("faculty")}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-left transition-all group"
          >
            <Users className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-slate-900 dark:text-white text-xs">Faculty Profiles</div>
            <div className="text-[11px] text-slate-500">Professors & HODs</div>
          </button>

          <button
            onClick={() => onNavigateTab("events")}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-left transition-all group"
          >
            <Calendar className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-slate-900 dark:text-white text-xs">Publish Event</div>
            <div className="text-[11px] text-slate-500">Seminars & fests</div>
          </button>

          <button
            onClick={() => onNavigateTab("notices")}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-left transition-all group"
          >
            <Bell className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-slate-900 dark:text-white text-xs">Issue Circular</div>
            <div className="text-[11px] text-slate-500">Campus notice board</div>
          </button>

          <button
            onClick={() => onNavigateTab("users-roles")}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-left transition-all group"
          >
            <ShieldCheck className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-slate-900 dark:text-white text-xs">Manage Users</div>
            <div className="text-[11px] text-slate-500">Roles & scoping</div>
          </button>
        </div>
      </div>

      {/* Main Grid: Approvals Queue + Recent Admissions Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approvals Review Widget */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Pending Submissions for Review
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab("approvals")}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View all ({pendingApprovals.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white text-xs line-clamp-1">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="uppercase text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/80 px-1.5 py-0.2 rounded">
                        {item.entityType}
                      </span>
                      <span>By {item.authorName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => approveItem(item.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      title="Quick Approve"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onNavigateTab("approvals")}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No pending approval requests. Everything is up to date!
              </div>
            )}
          </div>
        </div>

        {/* Admissions Review Widget */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Recent Student Applications
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab("admissions-apps")}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Applications Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-xs">
                    {app.studentName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-amber-600">{app.appNumber}</span>
                    <span>•</span>
                    <span>{app.appliedCourse}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-600">{app.marksPercentage}%</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    app.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : app.status === "rejected"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  }`}>
                    {app.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Security Audit Activity Stream */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Live System Activity & Audit Stream
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("audit-logs")}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-600 flex items-center gap-1"
          >
            Full Audit Logs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  log.action === "CREATE"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : log.action === "DELETE"
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                }`}>
                  {log.action}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{log.recordTitle}</span>
                <span className="text-slate-400 text-[11px]">in {log.module}</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px] shrink-0">
                {log.userName} • {log.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
