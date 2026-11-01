"use client";

import React, { useState, useMemo } from "react";
import { useCMSStore, AdmissionApplication } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  GraduationCap, CheckCircle, XCircle, Clock, Eye, 
  Download, Filter, MessageSquare, Phone, Mail, Award, CheckCircle2, UserCheck, AlertCircle
} from "lucide-react";

export function ApplicationsCMS() {
  const { applications, updateApplicationStatus, canAccessDepartment, currentUser, logAction } = useCMSStore();
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newRemark, setNewRemark] = useState("");
  const [actionConfirm, setActionConfirm] = useState<{
    app: AdmissionApplication;
    newStatus: AdmissionApplication["status"];
  } | null>(null);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (!canAccessDepartment(app.departmentSlug)) return false;
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      return true;
    });
  }, [applications, canAccessDepartment, statusFilter]);

  const stats = useMemo(() => {
    const total = applications.length;
    const underReview = applications.filter((a) => a.status === "under_review" || a.status === "new").length;
    const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
    const approved = applications.filter((a) => a.status === "approved").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    return { total, underReview, shortlisted, approved, rejected };
  }, [applications]);

  const handleStatusChange = (app: AdmissionApplication, status: AdmissionApplication["status"]) => {
    setActionConfirm({ app, newStatus: status });
  };

  const confirmStatusChange = () => {
    if (!actionConfirm) return;
    updateApplicationStatus(actionConfirm.app.id, actionConfirm.newStatus);
    setActionConfirm(null);
    if (selectedApp && selectedApp.id === actionConfirm.app.id) {
      setSelectedApp({ ...selectedApp, status: actionConfirm.newStatus });
    }
  };

  const handleAddRemark = () => {
    if (!selectedApp || !newRemark.trim()) return;
    const updatedRemarks = [
      ...(selectedApp.remarks || []),
      {
        author: currentUser.name,
        text: newRemark.trim(),
        date: new Date().toLocaleString("en-IN"),
      },
    ];
    // In store or local update
    const updated = { ...selectedApp, remarks: updatedRemarks };
    setSelectedApp(updated);
    setNewRemark("");
    logAction({
      action: "UPDATE",
      module: "Admissions Pipeline",
      recordId: selectedApp.id,
      recordTitle: `Added remark to application ${selectedApp.appNumber}`,
    });
  };

  const exportCSV = () => {
    const headers = ["App No", "Student Name", "Course", "Department", "Marks %", "Email", "Phone", "Status", "Date"];
    const rows = filteredApps.map((a) => [
      a.appNumber,
      `"${a.studentName}"`,
      `"${a.appliedCourse}"`,
      a.departmentSlug,
      a.marksPercentage,
      a.email,
      a.phone,
      a.status,
      a.submittedAt,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BAC_Admissions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<AdmissionApplication>[] = [
    {
      key: "appNumber",
      header: "Application No.",
      sortable: true,
      render: (a) => (
        <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
          {a.appNumber}
        </span>
      ),
    },
    {
      key: "studentName",
      header: "Candidate Name",
      sortable: true,
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">{a.studentName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>{a.gender}</span>
            <span>•</span>
            <span>DOB: {a.dob}</span>
          </div>
        </div>
      ),
    },
    {
      key: "appliedCourse",
      header: "Course Applied",
      sortable: true,
      render: (a) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{a.appliedCourse}</div>
          <div className="text-xs text-slate-500 capitalize">{a.departmentSlug.replace("-", " ")}</div>
        </div>
      ),
    },
    {
      key: "marksPercentage",
      header: "Qualifying Score",
      sortable: true,
      render: (a) => (
        <div className="flex items-center gap-1.5">
          <span className={`font-bold text-sm ${a.marksPercentage >= 80 ? "text-emerald-600 dark:text-emerald-400" : a.marksPercentage >= 60 ? "text-blue-600 dark:text-blue-400" : "text-amber-600"}`}>
            {a.marksPercentage}%
          </span>
          <span className="text-[11px] text-slate-400">({a.qualifyingExam})</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Application Status",
      sortable: true,
      render: (a) => {
        const statusMap: Record<string, { label: string; color: string; bg: string }> = {
          new: { label: "New App", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950/50" },
          under_review: { label: "Under Review", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/50" },
          shortlisted: { label: "Shortlisted", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-950/50" },
          approved: { label: "Admitted", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
          rejected: { label: "Rejected", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/50" },
        };
        const s = statusMap[a.status] || statusMap.new;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.color} border border-current/10`}>
            {s.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedApp(a);
              setIsDetailOpen(true);
            }}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="View Full Application"
          >
            <Eye className="w-4 h-4" />
          </button>
          {a.status !== "approved" && (
            <button
              onClick={() => handleStatusChange(a, "approved")}
              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
              title="Grant Provisional Admission"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {a.status !== "rejected" && (
            <button
              onClick={() => handleStatusChange(a, "rejected")}
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
              title="Reject Application"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Applications & Candidate Pipeline"
        description="Review incoming student enrollment applications, score verifications, interview call notes, and seat allocations."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Admissions", href: "#" },
          { label: "Applications" },
        ]}
        actions={
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        }
      />

      {/* KPI Funnel Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "all"
              ? "bg-slate-900 text-white border-slate-900 shadow-md dark:bg-amber-600 dark:border-amber-600"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          }`}
        >
          <div className="text-xs font-semibold opacity-70">Total Submissions</div>
          <div className="text-2xl font-black mt-1">{stats.total}</div>
        </button>

        <button
          onClick={() => setStatusFilter("under_review")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "under_review"
              ? "bg-amber-600 text-white border-amber-600 shadow-md"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          }`}
        >
          <div className="text-xs font-semibold opacity-70">Under Review</div>
          <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400 group-hover:text-white">
            {stats.underReview}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("shortlisted")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "shortlisted"
              ? "bg-purple-600 text-white border-purple-600 shadow-md"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          }`}
        >
          <div className="text-xs font-semibold opacity-70">Shortlisted for Interview</div>
          <div className="text-2xl font-black mt-1 text-purple-600 dark:text-purple-400">
            {stats.shortlisted}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("approved")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "approved"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          }`}
        >
          <div className="text-xs font-semibold opacity-70">Admitted (Seats Locked)</div>
          <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
            {stats.approved}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("rejected")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "rejected"
              ? "bg-rose-600 text-white border-rose-600 shadow-md"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          }`}
        >
          <div className="text-xs font-semibold opacity-70">Rejected / Ineligible</div>
          <div className="text-2xl font-black mt-1 text-rose-600 dark:text-rose-400">
            {stats.rejected}
          </div>
        </button>
      </div>

      <DataTable
        data={filteredApps}
        columns={columns}
        searchKey="studentName"
        searchPlaceholder="Search candidates by name, app no, course, or city..."
        pageSize={10}
      />

      {/* Candidate Dossier Modal */}
      {isDetailOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg border border-amber-200 dark:border-amber-800/60">
                    {selectedApp.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedApp.studentName}
                      <span className="text-xs font-mono font-normal text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                        {selectedApp.appNumber}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">Submitted on {selectedApp.submittedAt}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {/* Status Action Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Current Status:</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 rounded">
                    {selectedApp.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedApp, "under_review")}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 transition-colors"
                  >
                    Mark Reviewing
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApp, "shortlisted")}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 hover:bg-purple-200 transition-colors"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApp, "approved")}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Admit Student
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApp, "rejected")}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Academic Qualifications
                  </h4>
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Degree Applied:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedApp.appliedCourse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Qualifying Exam:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedApp.qualifyingExam}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Aggregate Percentage:</span>
                      <span className="font-bold text-emerald-600">{selectedApp.marksPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Previous School / College:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedApp.schoolName}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contact & Personal Info
                  </h4>
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Candidate Email:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedApp.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Candidate Phone:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedApp.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Parent / Guardian:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedApp.parentName} ({selectedApp.parentPhone})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Address:</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-right">{selectedApp.address}, {selectedApp.city}, {selectedApp.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks History & Note Adding */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  Admission Committee Remarks & Interview Notes
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedApp.remarks && selectedApp.remarks.length > 0 ? (
                    selectedApp.remarks.map((r, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{r.author}</span>
                          <span>{r.date}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{r.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No committee remarks entered yet.</div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    placeholder="Add interview feedback, verification notes, or condition..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    onKeyDown={(e) => e.key === "Enter" && handleAddRemark()}
                  />
                  <button
                    onClick={handleAddRemark}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Add Remark
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!actionConfirm}
        onClose={() => setActionConfirm(null)}
        onConfirm={confirmStatusChange}
        title="Update Admission Status"
        description={`Are you sure you want to update ${actionConfirm?.app.studentName}'s application (${actionConfirm?.app.appNumber}) status to "${actionConfirm?.newStatus.toUpperCase()}"?`}
        confirmText="Confirm Status Update"
        variant={actionConfirm?.newStatus === "approved" ? "primary" : actionConfirm?.newStatus === "rejected" ? "danger" : "primary"}
      />
    </div>
  );
}
