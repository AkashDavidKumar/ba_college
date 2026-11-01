"use client";

import React from "react";
import { PageHeader } from "@/components/admin/core/page-header";
import { 
  ShieldCheck, Check, X, Lock, Users, 
  Crown, Briefcase, Award, Sparkles, FileEdit, UserCheck 
} from "lucide-react";

interface RolePermissionMatrix {
  module: string;
  masterAdmin: boolean;
  subAdmin: boolean;
  hod: boolean;
  clubHead: boolean;
  contentEditor: boolean;
  staff: boolean;
}

const PERMISSION_MATRIX: RolePermissionMatrix[] = [
  { module: "Website Homepage & Live Visual Layout", masterAdmin: true, subAdmin: true, hod: false, clubHead: false, contentEditor: false, staff: false },
  { module: "Custom Modular Page Builder", masterAdmin: true, subAdmin: true, hod: false, clubHead: false, contentEditor: true, staff: false },
  { module: "Navigation Menu & Hierarchy Manager", masterAdmin: true, subAdmin: true, hod: false, clubHead: false, contentEditor: false, staff: false },
  { module: "SEO & OpenGraph Metadata Suite", masterAdmin: true, subAdmin: true, hod: false, clubHead: false, contentEditor: true, staff: false },
  { module: "Media Asset Library & CDN Files", masterAdmin: true, subAdmin: true, hod: true, clubHead: true, contentEditor: true, staff: true },
  { module: "Institutional Document Center (PDFs)", masterAdmin: true, subAdmin: true, hod: true, clubHead: false, contentEditor: true, staff: false },
  { module: "Department Profiles & Vision/Mission", masterAdmin: true, subAdmin: true, hod: true, clubHead: false, contentEditor: false, staff: false },
  { module: "Courses & Intake Seat Matrix", masterAdmin: true, subAdmin: true, hod: true, clubHead: false, contentEditor: false, staff: false },
  { module: "Curriculum & OBE Course Syllabi", masterAdmin: true, subAdmin: true, hod: true, clubHead: false, contentEditor: false, staff: false },
  { module: "Faculty Profiles & Designation Registry", masterAdmin: true, subAdmin: true, hod: true, clubHead: false, contentEditor: false, staff: false },
  { module: "Admission Applications Pipeline & Review", masterAdmin: true, subAdmin: true, hod: true, clubHead: false, contentEditor: false, staff: false },
  { module: "Scholarships & Financial Aid Grants", masterAdmin: true, subAdmin: true, hod: false, clubHead: false, contentEditor: false, staff: false },
  { module: "Student Clubs & Extracurricular Activities", masterAdmin: true, subAdmin: true, hod: false, clubHead: true, contentEditor: false, staff: false },
  { module: "Campus Events & Conference Publishing", masterAdmin: true, subAdmin: true, hod: true, clubHead: true, contentEditor: true, staff: false },
  { module: "Press Releases & News Bulletins", masterAdmin: true, subAdmin: true, hod: true, clubHead: false, contentEditor: true, staff: false },
  { module: "Official Circulars & Urgent Notices", masterAdmin: true, subAdmin: true, hod: true, clubHead: false, contentEditor: false, staff: false },
  { module: "IQAC Quality Assurance & AQAR Reports", masterAdmin: true, subAdmin: true, hod: false, clubHead: false, contentEditor: false, staff: false },
  { module: "COE Autonomous Exam Schedules & Results", masterAdmin: true, subAdmin: true, hod: false, clubHead: false, contentEditor: false, staff: false },
  { module: "Autonomous Statutory Councils (BOS/Council)", masterAdmin: true, subAdmin: true, hod: true, clubHead: false, contentEditor: false, staff: false },
  { module: "Placement Cell & Corporate Recruiters", masterAdmin: true, subAdmin: true, hod: false, clubHead: false, contentEditor: false, staff: false },
  { module: "Alumni Directory & Verification", masterAdmin: true, subAdmin: true, hod: false, clubHead: false, contentEditor: false, staff: false },
  { module: "User Management & Role Permissions", masterAdmin: true, subAdmin: false, hod: false, clubHead: false, contentEditor: false, staff: false },
  { module: "Publishing Approvals & Audit Trail", masterAdmin: true, subAdmin: true, hod: false, clubHead: false, contentEditor: false, staff: false },
];

export function RolesPermsCMS() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Role-Based Access Control (RBAC) & Capabilities"
        description="Comprehensive matrix of administrative security roles, departmental scoping, and granular action privileges across the college portal."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "System", href: "#" },
          { label: "Permissions" },
        ]}
      />

      {/* Role Definitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Master Administrator</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Ultimate portal authority. Can provision users, approve or reject pending submissions, direct-publish content, modify global site layout, and audit all activity.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Head of Department (HOD)</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Scoped strictly to their assigned academic department (e.g. Computer Science). Can manage department faculty, courses, syllabi, and student applications.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Club Head / Coordinator</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Scoped to their assigned student club (e.g. Cultural Club, NSS). Can post club activities, manage member rosters, and submit trophies for publication.
          </p>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Granular Privilege Matrix</h3>
          <p className="text-xs text-slate-500">Overview of functional module access by administrative role</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Module / Feature Area</th>
                <th className="py-3 px-3 text-center">Master Admin</th>
                <th className="py-3 px-3 text-center">Sub Admin</th>
                <th className="py-3 px-3 text-center">HOD (Scoped)</th>
                <th className="py-3 px-3 text-center">Club Head</th>
                <th className="py-3 px-3 text-center">Content Editor</th>
                <th className="py-3 px-3 text-center">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PERMISSION_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{row.module}</td>
                  <td className="py-3 px-3 text-center">
                    {row.masterAdmin ? <Check className="w-4 h-4 text-emerald-600 inline" /> : <X className="w-4 h-4 text-slate-300 inline" />}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.subAdmin ? <Check className="w-4 h-4 text-emerald-600 inline" /> : <X className="w-4 h-4 text-slate-300 inline" />}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.hod ? <Check className="w-4 h-4 text-amber-600 inline" /> : <X className="w-4 h-4 text-slate-300 inline" />}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.clubHead ? <Check className="w-4 h-4 text-blue-600 inline" /> : <X className="w-4 h-4 text-slate-300 inline" />}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.contentEditor ? <Check className="w-4 h-4 text-emerald-600 inline" /> : <X className="w-4 h-4 text-slate-300 inline" />}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.staff ? <Check className="w-4 h-4 text-slate-600 inline" /> : <X className="w-4 h-4 text-slate-300 inline" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
