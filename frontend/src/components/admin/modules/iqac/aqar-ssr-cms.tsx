"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  FileCheck, Plus, Download, ExternalLink, Trash2, 
  Edit3, Shield, Award, Layers, CheckCircle2 
} from "lucide-react";

interface AccreditationDoc {
  id: string;
  category: "NAAC SSR" | "NAAC AQAR" | "NIRF Data" | "ISO Certificate" | "AISHE Report";
  title: string;
  criterionNumber?: string; // e.g., "Criterion I - Curricular Aspects"
  academicYear: string;
  fileSize: string;
  fileUrl: string;
  submissionDate: string;
  status: ContentStatus;
}

const INITIAL_ACCREDITATION_DOCS: AccreditationDoc[] = [
  {
    id: "acc-1",
    category: "NAAC AQAR",
    title: "Annual Quality Assurance Report (AQAR) 2023–2024",
    academicYear: "2023–2024",
    fileSize: "4.8 MB",
    fileUrl: "/documents/naac/AQAR_2023_2024_Final.pdf",
    submissionDate: "2024-12-10",
    status: "published",
  },
  {
    id: "acc-2",
    category: "NAAC SSR",
    title: "Criterion I — Curricular Aspects & OBE Implementation",
    criterionNumber: "Criterion 1",
    academicYear: "Cycle 2",
    fileSize: "12.4 MB",
    fileUrl: "/documents/naac/SSR_Criterion_1_Curriculum.pdf",
    submissionDate: "2024-08-15",
    status: "published",
  },
  {
    id: "acc-3",
    category: "NAAC SSR",
    title: "Criterion II — Teaching-Learning and Evaluation",
    criterionNumber: "Criterion 2",
    academicYear: "Cycle 2",
    fileSize: "18.2 MB",
    fileUrl: "/documents/naac/SSR_Criterion_2_Teaching_Learning.pdf",
    submissionDate: "2024-08-15",
    status: "published",
  },
  {
    id: "acc-4",
    category: "NIRF Data",
    title: "National Institutional Ranking Framework (NIRF) 2025 Data Submission",
    academicYear: "2024–2025",
    fileSize: "2.1 MB",
    fileUrl: "/documents/nirf/NIRF_2025_Bishop_Ambrose_College.pdf",
    submissionDate: "2025-01-08",
    status: "published",
  },
  {
    id: "acc-5",
    category: "ISO Certificate",
    title: "ISO 9001:2015 Quality Management System Certification",
    academicYear: "2023–2026",
    fileSize: "1.2 MB",
    fileUrl: "/documents/iso/ISO_9001_2015_Certificate.pdf",
    submissionDate: "2023-09-01",
    status: "published",
  },
];

export function AQARSSRCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [docs, setDocs] = useState<AccreditationDoc[]>(INITIAL_ACCREDITATION_DOCS);
  const [selectedDoc, setSelectedDoc] = useState<AccreditationDoc | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<AccreditationDoc | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredDocs = docs.filter((d) => {
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
    return true;
  });

  const handleOpenEditor = (doc?: AccreditationDoc) => {
    if (doc) {
      setSelectedDoc(doc);
    } else {
      setSelectedDoc({
        id: "acc-" + Date.now(),
        category: "NAAC AQAR",
        title: "",
        academicYear: "2024–2025",
        fileSize: "2.5 MB",
        fileUrl: "/documents/naac/report.pdf",
        submissionDate: new Date().toISOString().split("T")[0],
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    if (docs.some((d) => d.id === selectedDoc.id)) {
      setDocs((prev) => prev.map((d) => (d.id === selectedDoc.id ? selectedDoc : d)));
      logAction({
        action: "UPDATE",
        module: "NAAC SSR & AQAR Reports",
        recordId: selectedDoc.id,
        recordTitle: selectedDoc.title,
      });
    } else {
      setDocs((prev) => [selectedDoc, ...prev]);
      logAction({
        action: "CREATE",
        module: "NAAC SSR & AQAR Reports",
        recordId: selectedDoc.id,
        recordTitle: selectedDoc.title,
      });
    }
    setIsEditorOpen(false);
    setSelectedDoc(null);
  };

  const handleDelete = () => {
    if (!docToDelete) return;
    setDocs((prev) => prev.filter((d) => d.id !== docToDelete.id));
    logAction({
      action: "DELETE",
      module: "NAAC SSR & AQAR Reports",
      recordId: docToDelete.id,
      recordTitle: docToDelete.title,
    });
    setDocToDelete(null);
  };

  const columns: Column<AccreditationDoc>[] = [
    {
      key: "title",
      header: "Accreditation Report / SSR Criterion",
      sortable: true,
      render: (d) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {d.title}
          </div>
          {d.criterionNumber && (
            <div className="text-xs text-amber-600 font-medium mt-0.5">{d.criterionNumber}</div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Framework",
      sortable: true,
      render: (d) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {d.category}
        </span>
      ),
    },
    {
      key: "academicYear",
      header: "Period / Year",
      sortable: true,
      render: (d) => <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{d.academicYear}</span>,
    },
    {
      key: "fileSize",
      header: "File Size",
      render: (d) => <span className="text-xs text-slate-500 font-mono">{d.fileSize}</span>,
    },
    {
      key: "submissionDate",
      header: "Submitted",
      sortable: true,
      render: (d) => <span className="text-xs font-mono text-slate-500">{d.submissionDate}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(d)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Report"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDocToDelete(d)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Report"
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
        title="NAAC SSR, AQAR & NIRF Statutory Repository"
        description="Public repository for NAAC Self Study Reports (SSR Criteria 1–7), Annual Quality Assurance Reports (AQAR), and NIRF submissions."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "IQAC", href: "#" },
          { label: "AQAR & SSR" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Upload Accreditation Document
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {["all", "NAAC SSR", "NAAC AQAR", "NIRF Data", "ISO Certificate", "AISHE Report"].map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              categoryFilter === c
                ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {c === "all" ? "All Documents" : c}
          </button>
        ))}
      </div>

      <DataTable
        data={filteredDocs}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search AQAR, SSR criterion, or NIRF reports..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {docs.some((d) => d.id === selectedDoc.id) ? "Edit Accreditation File" : "Upload Accreditation Document"}
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
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={selectedDoc.title}
                  onChange={(e) => setSelectedDoc({ ...selectedDoc, title: e.target.value })}
                  placeholder="e.g. Annual Quality Assurance Report (AQAR) 2023–2024"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Framework / Type *
                  </label>
                  <select
                    value={selectedDoc.category}
                    onChange={(e) => setSelectedDoc({ ...selectedDoc, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="NAAC AQAR">NAAC AQAR</option>
                    <option value="NAAC SSR">NAAC SSR (Self Study Report)</option>
                    <option value="NIRF Data">NIRF Data Submission</option>
                    <option value="ISO Certificate">ISO 9001:2015 Certification</option>
                    <option value="AISHE Report">AISHE Ministry Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SSR Criterion (If applicable)
                  </label>
                  <input
                    type="text"
                    value={selectedDoc.criterionNumber || ""}
                    onChange={(e) => setSelectedDoc({ ...selectedDoc, criterionNumber: e.target.value })}
                    placeholder="e.g. Criterion 1 - Curricular Aspects"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year / Period *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedDoc.academicYear}
                    onChange={(e) => setSelectedDoc({ ...selectedDoc, academicYear: e.target.value })}
                    placeholder="2023–2024"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={selectedDoc.fileSize}
                    onChange={(e) => setSelectedDoc({ ...selectedDoc, fileSize: e.target.value })}
                    placeholder="4.8 MB"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PDF Document Link / URL *
                </label>
                <input
                  type="text"
                  required
                  value={selectedDoc.fileUrl}
                  onChange={(e) => setSelectedDoc({ ...selectedDoc, fileUrl: e.target.value })}
                  placeholder="/documents/naac/AQAR_2023_2024_Final.pdf"
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
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Accreditation Document"
        description={`Are you sure you want to delete ${docToDelete?.title}?`}
        confirmText="Delete Document"
        variant="danger"
      />
    </div>
  );
}
