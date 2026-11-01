"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Calendar, Plus, Clock, FileText, Download, 
  ExternalLink, Trash2, Edit3, Award, AlertCircle 
} from "lucide-react";

interface ExamSchedule {
  id: string;
  title: string;
  examType: "End Semester Autonomous" | "Continuous Internal Assessment (CIA)" | "Supplementary / Arrear" | "Practical / Viva-Voce";
  degreeLevel: "UG" | "PG" | "All";
  session: "April / May 2025" | "Nov / Dec 2024" | "July 2024";
  startDate: string;
  endDate: string;
  timetablePdfUrl: string;
  status: ContentStatus;
  publishDate: string;
}

const INITIAL_EXAM_SCHEDULES: ExamSchedule[] = [
  {
    id: "exam-1",
    title: "Autonomous End-Semester Theory Examination Timetable — April 2025",
    examType: "End Semester Autonomous",
    degreeLevel: "All",
    session: "April / May 2025",
    startDate: "2025-04-16",
    endDate: "2025-05-08",
    timetablePdfUrl: "/documents/coe/Autonomous_EndSem_Timetable_April2025.pdf",
    status: "published",
    publishDate: "2025-01-10",
  },
  {
    id: "exam-2",
    title: "Continuous Internal Assessment (CIA Test II) Schedule — Even Semester",
    examType: "Continuous Internal Assessment (CIA)",
    degreeLevel: "UG",
    session: "April / May 2025",
    startDate: "2025-03-10",
    endDate: "2025-03-15",
    timetablePdfUrl: "/documents/coe/CIA_Test_2_Schedule_EvenSem_2025.pdf",
    status: "published",
    publishDate: "2025-01-08",
  },
  {
    id: "exam-3",
    title: "UG & PG Autonomous Science & Computing Practical Examination Schedule",
    examType: "Practical / Viva-Voce",
    degreeLevel: "All",
    session: "April / May 2025",
    startDate: "2025-04-02",
    endDate: "2025-04-10",
    timetablePdfUrl: "/documents/coe/Practical_Exam_Schedule_April2025.pdf",
    status: "published",
    publishDate: "2025-01-05",
  },
];

export function ExamSchedulesCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [schedules, setSchedules] = useState<ExamSchedule[]>(INITIAL_EXAM_SCHEDULES);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ExamSchedule | null>(null);

  const handleOpenEditor = (sch?: ExamSchedule) => {
    if (sch) {
      setSelectedSchedule(sch);
    } else {
      setSelectedSchedule({
        id: "exam-" + Date.now(),
        title: "",
        examType: "End Semester Autonomous",
        degreeLevel: "All",
        session: "April / May 2025",
        startDate: "2025-04-16",
        endDate: "2025-05-08",
        timetablePdfUrl: "/documents/coe/timetable.pdf",
        status: currentUser.role === "master_admin" ? "published" : "submitted",
        publishDate: new Date().toISOString().split("T")[0],
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    if (schedules.some((s) => s.id === selectedSchedule.id)) {
      setSchedules((prev) => prev.map((s) => (s.id === selectedSchedule.id ? selectedSchedule : s)));
      logAction({
        action: "UPDATE",
        module: "Examination Schedules",
        recordId: selectedSchedule.id,
        recordTitle: selectedSchedule.title,
      });
    } else {
      setSchedules((prev) => [selectedSchedule, ...prev]);
      logAction({
        action: "CREATE",
        module: "Examination Schedules",
        recordId: selectedSchedule.id,
        recordTitle: selectedSchedule.title,
      });
    }
    setIsEditorOpen(false);
    setSelectedSchedule(null);
  };

  const handleDelete = () => {
    if (!scheduleToDelete) return;
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleToDelete.id));
    logAction({
      action: "DELETE",
      module: "Examination Schedules",
      recordId: scheduleToDelete.id,
      recordTitle: scheduleToDelete.title,
    });
    setScheduleToDelete(null);
  };

  const columns: Column<ExamSchedule>[] = [
    {
      key: "title",
      header: "Examination Timetable / Schedule",
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
            {s.title}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{s.session}</div>
        </div>
      ),
    },
    {
      key: "examType",
      header: "Exam Scheme",
      sortable: true,
      render: (s) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          {s.examType}
        </span>
      ),
    },
    {
      key: "degreeLevel",
      header: "Degree Level",
      render: (s) => (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          {s.degreeLevel}
        </span>
      ),
    },
    {
      key: "startDate",
      header: "Exam Dates",
      sortable: true,
      render: (s) => (
        <div className="text-xs font-mono">
          <div className="font-bold text-slate-800 dark:text-slate-200">{s.startDate}</div>
          <div className="text-slate-400">to {s.endDate}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(s)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Timetable"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScheduleToDelete(s)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Timetable"
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
        title="Autonomous Examination Timetables & CIA Schedules"
        description="Office of the Controller of Examinations (COE) — manage end-semester exam schedules, CIA dates, and PDF notifications."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Examinations", href: "#" },
          { label: "Schedules" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Publish Exam Timetable
          </button>
        }
      />

      <DataTable
        data={schedules}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search examination schedules..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {schedules.some((s) => s.id === selectedSchedule.id) ? "Edit Timetable" : "Publish New Timetable"}
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
                  Examination Notification Title *
                </label>
                <input
                  type="text"
                  required
                  value={selectedSchedule.title}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, title: e.target.value })}
                  placeholder="e.g. Autonomous End-Semester Theory Examination Timetable — April 2025"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Type *
                  </label>
                  <select
                    value={selectedSchedule.examType}
                    onChange={(e) => setSelectedSchedule({ ...selectedSchedule, examType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="End Semester Autonomous">End Semester Autonomous</option>
                    <option value="Continuous Internal Assessment (CIA)">Continuous Internal Assessment (CIA)</option>
                    <option value="Supplementary / Arrear">Supplementary / Arrear Exam</option>
                    <option value="Practical / Viva-Voce">Practical / Viva-Voce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Level *
                  </label>
                  <select
                    value={selectedSchedule.degreeLevel}
                    onChange={(e) => setSelectedSchedule({ ...selectedSchedule, degreeLevel: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="All">All UG & PG</option>
                    <option value="UG">UG Only</option>
                    <option value="PG">PG Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Exam Session *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedSchedule.session}
                    onChange={(e) => setSelectedSchedule({ ...selectedSchedule, session: e.target.value as any })}
                    placeholder="April / May 2025"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedSchedule.startDate}
                    onChange={(e) => setSelectedSchedule({ ...selectedSchedule, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedSchedule.endDate}
                    onChange={(e) => setSelectedSchedule({ ...selectedSchedule, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Timetable PDF Document URL *
                </label>
                <input
                  type="text"
                  required
                  value={selectedSchedule.timetablePdfUrl}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, timetablePdfUrl: e.target.value })}
                  placeholder="/documents/coe/Autonomous_EndSem_Timetable_April2025.pdf"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
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
                  Save Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!scheduleToDelete}
        onClose={() => setScheduleToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Examination Timetable"
        description={`Are you sure you want to delete "${scheduleToDelete?.title}"?`}
        confirmText="Delete Timetable"
        variant="danger"
      />
    </div>
  );
}
