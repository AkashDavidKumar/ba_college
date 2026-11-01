"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Award, Plus, Medal, Star, CheckCircle, 
  ExternalLink, Trash2, Edit3, ShieldCheck, GraduationCap 
} from "lucide-react";

interface CollegeAchievement {
  id: string;
  title: string;
  category: "University Rank" | "Faculty Award" | "Research Grant" | "Patent" | "National Competition";
  recipientName: string;
  recipientType: "Student" | "Faculty" | "Department" | "Institution";
  department: string;
  year: string;
  description: string;
  awardingBody: string;
  certificateUrl?: string;
  status: ContentStatus;
}

const INITIAL_ACHIEVEMENTS: CollegeAchievement[] = [
  {
    id: "ach-1",
    title: "1st University Gold Medal Rank — B.Sc. Computer Science",
    category: "University Rank",
    recipientName: "K. Sneha",
    recipientType: "Student",
    department: "Computer Science",
    year: "2024",
    description: "Secured First Rank & Gold Medal across all affiliated colleges of Bharathiar University.",
    awardingBody: "Bharathiar University 39th Convocation",
    certificateUrl: "/documents/ranks/Sneha_GoldMedal_BU.pdf",
    status: "published",
  },
  {
    id: "ach-2",
    title: "National Best Teacher Award in Higher Education 2024",
    category: "Faculty Award",
    recipientName: "Dr. K. Senthil Kumar (HOD, CS)",
    recipientType: "Faculty",
    department: "Computer Science",
    year: "2024",
    description: "Honored with the National Educational Excellence Award for contributions to Cloud AI pedagogy.",
    awardingBody: "Council for Educational Research & Training, New Delhi",
    status: "published",
  },
  {
    id: "ach-3",
    title: "Government Patent Granted: Smart Autonomous IoT Agri-Sensor",
    category: "Patent",
    recipientName: "Dr. K. Senthil Kumar & Student Research Cell",
    recipientType: "Faculty",
    department: "Computer Science",
    year: "2024",
    description: "Indian Patent Office published and granted design patent No: 389211-001.",
    awardingBody: "Indian Patent Office (Govt. of India)",
    status: "published",
  },
  {
    id: "ach-4",
    title: "3rd University Rank — M.Com Corporate Finance",
    category: "University Rank",
    recipientName: "P. Vignesh",
    recipientType: "Student",
    department: "Commerce",
    year: "2024",
    description: "Rank holder in Master of Commerce university examinations with 89.4% aggregate.",
    awardingBody: "Bharathiar University",
    status: "published",
  },
];

export function AchievementsCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [achievements, setAchievements] = useState<CollegeAchievement[]>(INITIAL_ACHIEVEMENTS);
  const [selectedAch, setSelectedAch] = useState<CollegeAchievement | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [achToDelete, setAchToDelete] = useState<CollegeAchievement | null>(null);

  const handleOpenEditor = (ach?: CollegeAchievement) => {
    if (ach) {
      setSelectedAch(ach);
    } else {
      setSelectedAch({
        id: "ach-" + Date.now(),
        title: "",
        category: "University Rank",
        recipientName: "",
        recipientType: "Student",
        department: "Computer Science",
        year: "2024",
        description: "",
        awardingBody: "Bharathiar University",
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAch) return;

    if (achievements.some((a) => a.id === selectedAch.id)) {
      setAchievements((prev) => prev.map((a) => (a.id === selectedAch.id ? selectedAch : a)));
      logAction({
        action: "UPDATE",
        module: "Institutional Achievements",
        recordId: selectedAch.id,
        recordTitle: selectedAch.title,
      });
    } else {
      setAchievements((prev) => [selectedAch, ...prev]);
      logAction({
        action: "CREATE",
        module: "Institutional Achievements",
        recordId: selectedAch.id,
        recordTitle: selectedAch.title,
      });
    }
    setIsEditorOpen(false);
    setSelectedAch(null);
  };

  const handleDelete = () => {
    if (!achToDelete) return;
    setAchievements((prev) => prev.filter((a) => a.id !== achToDelete.id));
    logAction({
      action: "DELETE",
      module: "Institutional Achievements",
      recordId: achToDelete.id,
      recordTitle: achToDelete.title,
    });
    setAchToDelete(null);
  };

  const columns: Column<CollegeAchievement>[] = [
    {
      key: "title",
      header: "Achievement / Distinction",
      sortable: true,
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            {a.title}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{a.awardingBody}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (a) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          {a.category}
        </span>
      ),
    },
    {
      key: "recipientName",
      header: "Recipient & Dept",
      sortable: true,
      render: (a) => (
        <div className="text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-200">{a.recipientName}</div>
          <div className="text-slate-500 flex items-center gap-1">
            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">
              {a.recipientType}
            </span>
            <span>•</span>
            <span>{a.department}</span>
          </div>
        </div>
      ),
    },
    {
      key: "year",
      header: "Year",
      sortable: true,
      render: (a) => <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">{a.year}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(a)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Achievement"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAchToDelete(a)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Achievement"
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
        title="Institutional & Academic Achievements"
        description="Showcase university ranks, gold medals, government research grants, patents, and faculty excellence awards."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Content", href: "#" },
          { label: "Achievements" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Achievement Record
          </button>
        }
      />

      <DataTable
        data={achievements}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search awards, rank holders, patents..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedAch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {achievements.some((a) => a.id === selectedAch.id) ? "Edit Achievement" : "Add Distinction / Award"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Achievement Title *
                </label>
                <input
                  type="text"
                  required
                  value={selectedAch.title}
                  onChange={(e) => setSelectedAch({ ...selectedAch, title: e.target.value })}
                  placeholder="e.g. 1st University Gold Medal Rank — B.Sc. Computer Science"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={selectedAch.category}
                    onChange={(e) => setSelectedAch({ ...selectedAch, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="University Rank">University Rank / Gold Medal</option>
                    <option value="Faculty Award">Faculty Excellence Award</option>
                    <option value="Research Grant">Government Research Grant</option>
                    <option value="Patent">Patent / Intellectual Property</option>
                    <option value="National Competition">National Level Competition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recipient Type
                  </label>
                  <select
                    value={selectedAch.recipientType}
                    onChange={(e) => setSelectedAch({ ...selectedAch, recipientType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Student">Student Winner</option>
                    <option value="Faculty">Faculty Scholar</option>
                    <option value="Department">Department Honor</option>
                    <option value="Institution">College / Institutional Award</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recipient Name(s) *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedAch.recipientName}
                    onChange={(e) => setSelectedAch({ ...selectedAch, recipientName: e.target.value })}
                    placeholder="e.g. K. Sneha or Dr. K. Senthil Kumar"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedAch.year}
                    onChange={(e) => setSelectedAch({ ...selectedAch, year: e.target.value })}
                    placeholder="2024"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={selectedAch.department}
                    onChange={(e) => setSelectedAch({ ...selectedAch, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Awarding Body / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedAch.awardingBody}
                    onChange={(e) => setSelectedAch({ ...selectedAch, awardingBody: e.target.value })}
                    placeholder="e.g. Bharathiar University"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Citation
                </label>
                <textarea
                  rows={3}
                  value={selectedAch.description}
                  onChange={(e) => setSelectedAch({ ...selectedAch, description: e.target.value })}
                  placeholder="Details of the medal, patent application number, or award citation..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
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
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!achToDelete}
        onClose={() => setAchToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Achievement"
        description={`Are you sure you want to delete ${achToDelete?.title}?`}
        confirmText="Delete Record"
        variant="danger"
      />
    </div>
  );
}
