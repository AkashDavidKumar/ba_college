"use client";

import React, { useState, useMemo } from "react";
import { useCMSStore, CollegeNotice, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Bell, Plus, AlertCircle, FileText, Download, 
  ExternalLink, Trash2, Edit3, Filter, CheckCircle 
} from "lucide-react";

export function NoticesCMS() {
  const { notices, saveNotice, deleteNotice, canAccessDepartment, currentUser } = useCMSStore();
  const [selectedNotice, setSelectedNotice] = useState<CollegeNotice | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<CollegeNotice | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      if (n.departmentId && n.departmentId !== "all" && !canAccessDepartment(n.departmentId)) {
        return false;
      }
      if (priorityFilter !== "all" && n.priority !== priorityFilter) {
        return false;
      }
      return true;
    });
  }, [notices, canAccessDepartment, priorityFilter]);

  const handleOpenEditor = (notice?: CollegeNotice) => {
    if (notice) {
      setSelectedNotice(notice);
    } else {
      setSelectedNotice({
        id: "not-" + Date.now(),
        title: "",
        content: "",
        departmentId: currentUser.departmentId || "all",
        category: "General",
        priority: "Medium",
        publishDate: new Date().toISOString().split("T")[0],
        targetAudience: "All",
        authorName: currentUser.name,
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotice) return;

    const isNew = !notices.some((n) => n.id === selectedNotice.id);
    saveNotice(selectedNotice, isNew);
    setIsEditorOpen(false);
    setSelectedNotice(null);
  };

  const handleDelete = () => {
    if (!noticeToDelete) return;
    deleteNotice(noticeToDelete.id);
    setNoticeToDelete(null);
  };

  const columns: Column<CollegeNotice>[] = [
    {
      key: "title",
      header: "Notice & Circular Title",
      sortable: true,
      render: (n) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            {n.priority === "High" && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="High Priority" />
            )}
            {n.title}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{n.content}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (n) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {n.category}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (n) => {
        const pMap: Record<string, string> = {
          High: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
          Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
          Low: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
        };
        return (
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${pMap[n.priority] || pMap.Medium}`}>
            {n.priority}
          </span>
        );
      },
    },
    {
      key: "targetAudience",
      header: "Audience",
      render: (n) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {n.targetAudience}
        </span>
      ),
    },
    {
      key: "publishDate",
      header: "Date",
      sortable: true,
      render: (n) => <span className="text-xs font-mono text-slate-500">{n.publishDate}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (n) => <StatusBadge status={n.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (n) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(n)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Notice"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setNoticeToDelete(n)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Notice"
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
        title="Official Circulars & Notice Board"
        description="Broadcast administrative orders, examination schedules, fee reminders, and urgent holiday announcements."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Content", href: "#" },
          { label: "Notices" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Issue New Circular
          </button>
        }
      />

      {/* Priority quick filters */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {["all", "High", "Medium", "Low"].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              priorityFilter === p
                ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {p === "all" ? "All Priorities" : `${p} Priority`}
          </button>
        ))}
      </div>

      <DataTable
        data={filteredNotices}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search notices and circulars..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {notices.some((n) => n.id === selectedNotice.id) ? "Edit Circular / Notice" : "Issue New Circular"}
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
                  Circular Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={selectedNotice.title}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, title: e.target.value })}
                  placeholder="e.g. End Semester Autonomous Examination Timetable — April 2025"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={selectedNotice.category}
                    onChange={(e) => setSelectedNotice({ ...selectedNotice, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="General">General Circular</option>
                    <option value="Examination">Examination Order</option>
                    <option value="Academic">Academic Schedule</option>
                    <option value="Admissions">Admissions</option>
                    <option value="Fee">Fee Payment</option>
                    <option value="Holiday">Holiday Declaration</option>
                    <option value="Emergency">Emergency Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority *
                  </label>
                  <select
                    value={selectedNotice.priority}
                    onChange={(e) => setSelectedNotice({ ...selectedNotice, priority: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="High">High (Flashing Banner)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="Low">Low (Informational)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={selectedNotice.targetAudience}
                    onChange={(e) => setSelectedNotice({ ...selectedNotice, targetAudience: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="All">All Campus</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                    <option value="Staff">Non-Teaching Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Circular Content & Instructions *
                </label>
                <textarea
                  required
                  rows={4}
                  value={selectedNotice.content}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, content: e.target.value })}
                  placeholder="Enter full text of the circular, dates, payment deadlines, office room numbers..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PDF Attachment URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={selectedNotice.attachmentUrl || ""}
                    onChange={(e) => setSelectedNotice({ ...selectedNotice, attachmentUrl: e.target.value })}
                    placeholder="/documents/circulars/Exam_Timetable_April_2025.pdf"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry / Archive Date
                  </label>
                  <input
                    type="date"
                    value={selectedNotice.expiryDate || ""}
                    onChange={(e) => setSelectedNotice({ ...selectedNotice, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
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
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!noticeToDelete}
        onClose={() => setNoticeToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Notice / Circular"
        description={`Are you sure you want to delete "${noticeToDelete?.title}"?`}
        confirmText="Delete Notice"
        variant="danger"
      />
    </div>
  );
}
