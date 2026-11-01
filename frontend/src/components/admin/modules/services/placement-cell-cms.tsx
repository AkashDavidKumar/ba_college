"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Briefcase, Plus, TrendingUp, Building, DollarSign, 
  Trash2, Edit3, Award, Users, CheckCircle 
} from "lucide-react";

interface PlacementRecruiter {
  id: string;
  companyName: string;
  industry: "IT & Software" | "Banking & FinTech" | "Consulting & Analytics" | "E-Commerce & Retail" | "Manufacturing";
  highestPackage: string; // e.g. "₹8.50 LPA"
  averagePackage: string; // e.g. "₹4.20 LPA"
  studentsPlacedThisYear: number;
  driveDate?: string;
  logoUrl?: string;
  status: ContentStatus;
}

const INITIAL_RECRUITERS: PlacementRecruiter[] = [
  {
    id: "rec-1",
    companyName: "Tata Consultancy Services (TCS)",
    industry: "IT & Software",
    highestPackage: "₹7.20 LPA",
    averagePackage: "₹4.00 LPA",
    studentsPlacedThisYear: 42,
    driveDate: "2024-11-12",
    logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80",
    status: "published",
  },
  {
    id: "rec-2",
    companyName: "Infosys Limited",
    industry: "IT & Software",
    highestPackage: "₹6.50 LPA",
    averagePackage: "₹3.80 LPA",
    studentsPlacedThisYear: 38,
    driveDate: "2024-11-25",
    logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80",
    status: "published",
  },
  {
    id: "rec-3",
    companyName: "HCL Technologies",
    industry: "IT & Software",
    highestPackage: "₹5.50 LPA",
    averagePackage: "₹3.60 LPA",
    studentsPlacedThisYear: 28,
    driveDate: "2024-12-04",
    logoUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=200&q=80",
    status: "published",
  },
  {
    id: "rec-4",
    companyName: "South Indian Bank (SIB)",
    industry: "Banking & FinTech",
    highestPackage: "₹6.00 LPA",
    averagePackage: "₹4.50 LPA",
    studentsPlacedThisYear: 18,
    driveDate: "2024-12-18",
    logoUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=200&q=80",
    status: "published",
  },
  {
    id: "rec-5",
    companyName: "Wipro Technologies",
    industry: "IT & Software",
    highestPackage: "₹6.50 LPA",
    averagePackage: "₹3.80 LPA",
    studentsPlacedThisYear: 31,
    driveDate: "2025-01-08",
    logoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80",
    status: "published",
  },
];

export function PlacementCellCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [recruiters, setRecruiters] = useState<PlacementRecruiter[]>(INITIAL_RECRUITERS);
  const [selectedRecruiter, setSelectedRecruiter] = useState<PlacementRecruiter | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [recruiterToDelete, setRecruiterToDelete] = useState<PlacementRecruiter | null>(null);

  const stats = {
    totalPlaced: recruiters.reduce((sum, r) => sum + r.studentsPlacedThisYear, 0),
    topPackage: "₹8.50 LPA",
    companiesVisited: recruiters.length + 15,
  };

  const handleOpenEditor = (rec?: PlacementRecruiter) => {
    if (rec) {
      setSelectedRecruiter(rec);
    } else {
      setSelectedRecruiter({
        id: "rec-" + Date.now(),
        companyName: "",
        industry: "IT & Software",
        highestPackage: "₹6.00 LPA",
        averagePackage: "₹3.80 LPA",
        studentsPlacedThisYear: 10,
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecruiter) return;

    if (recruiters.some((r) => r.id === selectedRecruiter.id)) {
      setRecruiters((prev) => prev.map((r) => (r.id === selectedRecruiter.id ? selectedRecruiter : r)));
      logAction({
        action: "UPDATE",
        module: "Training & Placement Cell",
        recordId: selectedRecruiter.id,
        recordTitle: selectedRecruiter.companyName,
      });
    } else {
      setRecruiters((prev) => [selectedRecruiter, ...prev]);
      logAction({
        action: "CREATE",
        module: "Training & Placement Cell",
        recordId: selectedRecruiter.id,
        recordTitle: selectedRecruiter.companyName,
      });
    }
    setIsEditorOpen(false);
    setSelectedRecruiter(null);
  };

  const handleDelete = () => {
    if (!recruiterToDelete) return;
    setRecruiters((prev) => prev.filter((r) => r.id !== recruiterToDelete.id));
    logAction({
      action: "DELETE",
      module: "Training & Placement Cell",
      recordId: recruiterToDelete.id,
      recordTitle: recruiterToDelete.companyName,
    });
    setRecruiterToDelete(null);
  };

  const columns: Column<PlacementRecruiter>[] = [
    {
      key: "companyName",
      header: "Corporate Recruiter",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center font-bold text-amber-700 dark:text-amber-300 text-xs shrink-0">
            {r.companyName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{r.companyName}</div>
            <div className="text-xs text-slate-500">{r.industry}</div>
          </div>
        </div>
      ),
    },
    {
      key: "highestPackage",
      header: "Package CTC",
      render: (r) => (
        <div className="text-xs">
          <div className="font-bold text-emerald-600 dark:text-emerald-400">Max: {r.highestPackage}</div>
          <div className="text-slate-500">Avg: {r.averagePackage}</div>
        </div>
      ),
    },
    {
      key: "studentsPlacedThisYear",
      header: "Offers Made",
      sortable: true,
      render: (r) => (
        <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
          {r.studentsPlacedThisYear} Students
        </span>
      ),
    },
    {
      key: "driveDate",
      header: "Campus Drive Date",
      sortable: true,
      render: (r) => <span className="text-xs font-mono text-slate-500">{r.driveDate || "Scheduled"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(r)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Recruiter"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRecruiterToDelete(r)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Recruiter"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training & Placement Cell (Corporate Relations)"
        description="Manage corporate recruitment partners, CTC salary packages, annual placement offers, and on-campus drive schedules."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Services", href: "#" },
          { label: "Placements" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Placement Partner
          </button>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Offers (2024–25)</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalPlaced}+ Offers</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Highest CTC Package</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.topPackage}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">MNC Recruitment Partners</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.companiesVisited}+ Companies</div>
          </div>
        </div>
      </div>

      <DataTable
        data={recruiters}
        columns={columns}
        searchKey="companyName"
        searchPlaceholder="Search recruiters by company or sector..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {recruiters.some((r) => r.id === selectedRecruiter.id) ? "Edit Recruiter" : "Add Recruitment Partner"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedRecruiter.companyName}
                    onChange={(e) => setSelectedRecruiter({ ...selectedRecruiter, companyName: e.target.value })}
                    placeholder="e.g. Tata Consultancy Services (TCS)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry Sector *
                  </label>
                  <select
                    value={selectedRecruiter.industry}
                    onChange={(e) => setSelectedRecruiter({ ...selectedRecruiter, industry: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="IT & Software">IT & Software</option>
                    <option value="Banking & FinTech">Banking & FinTech</option>
                    <option value="Consulting & Analytics">Consulting & Analytics</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Manufacturing">Manufacturing & Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Highest CTC Offered *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedRecruiter.highestPackage}
                    onChange={(e) => setSelectedRecruiter({ ...selectedRecruiter, highestPackage: e.target.value })}
                    placeholder="e.g. ₹7.20 LPA"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Average Package
                  </label>
                  <input
                    type="text"
                    value={selectedRecruiter.averagePackage}
                    onChange={(e) => setSelectedRecruiter({ ...selectedRecruiter, averagePackage: e.target.value })}
                    placeholder="e.g. ₹4.00 LPA"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Students Placed Count *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedRecruiter.studentsPlacedThisYear}
                    onChange={(e) => setSelectedRecruiter({ ...selectedRecruiter, studentsPlacedThisYear: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campus Drive Date
                </label>
                <input
                  type="date"
                  value={selectedRecruiter.driveDate || ""}
                  onChange={(e) => setSelectedRecruiter({ ...selectedRecruiter, driveDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
                >
                  Save Recruiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!recruiterToDelete}
        onClose={() => setRecruiterToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Recruiter"
        description={`Are you sure you want to delete ${recruiterToDelete?.companyName}?`}
        confirmText="Delete Recruiter"
        variant="danger"
      />
    </div>
  );
}
