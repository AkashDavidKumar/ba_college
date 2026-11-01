"use client";

import React, { useState } from "react";
import { useCMSStore, CollegeDocument } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FolderOpen,
  FileText,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Lock,
  Globe2,
} from "lucide-react";

export function DocumentCenterCMS() {
  const { documents, saveDocument, deleteDocument, currentUser } = useCMSStore();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<CollegeDocument | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CollegeDocument>>({
    title: "",
    category: "Academic",
    fileSize: "2.1 MB",
    fileFormat: "PDF",
    fileUrl: "",
    year: "2025-2026",
    isPublic: true,
  });

  const handleOpenCreate = () => {
    setFormData({
      id: "doc-" + Date.now(),
      title: "",
      category: "Academic",
      fileSize: "2.4 MB",
      fileFormat: "PDF",
      fileUrl: "",
      year: "2025-2026",
      isPublic: true,
    });
    setEditingDoc(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (doc: CollegeDocument) => {
    setFormData({ ...doc });
    setEditingDoc(doc);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title?.trim()) {
      toast({ title: "Validation Error", description: "Document title is required.", variant: "destructive" });
      return;
    }
    saveDocument(formData, !editingDoc);
    toast({
      title: editingDoc ? "Document Updated" : "Document Uploaded",
      description: `Saved '${formData.title}'.`,
    });
    setModalOpen(false);
  };

  const columns: Column<CollegeDocument>[] = [
    {
      key: "title",
      header: "Document Title & Format",
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-red-200">
            {d.fileFormat}
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs">{d.title}</div>
            <div className="text-[10px] text-slate-400">
              {d.fileSize} • Uploaded by {d.uploadedBy}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (d) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
          {d.category}
        </span>
      ),
    },
    {
      key: "year",
      header: "Academic Year",
      render: (d) => <span className="text-xs font-mono">{d.year || "—"}</span>,
    },
    {
      key: "downloadCount",
      header: "Downloads",
      sortable: true,
      render: (d) => <span className="font-semibold text-xs">{d.downloadCount}</span>,
    },
    {
      key: "isPublic",
      header: "Access",
      render: (d) =>
        d.isPublic ? (
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5" /> Public
          </span>
        ) : (
          <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Restricted
          </span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (d) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(d)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Edit Document Info"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteId(d.id)}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
            title="Delete Document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Institutional Document Repository"
        subtitle="Manage official regulations, circulars, handbooks, NIRF reports, AQAR submissions, and student forms."
        badge={`${documents.length} Files`}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => {} },
          { label: "Website" },
          { label: "Documents" },
        ]}
        action={{
          label: "Upload Document",
          icon: Upload,
          onClick: handleOpenCreate,
        }}
      />

      <DataTable
        data={documents}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search documents by title or keyword..."
        filterKey="category"
        filterLabel="Category"
        filterOptions={[
          { label: "Academic", value: "Academic" },
          { label: "Admission", value: "Admission" },
          { label: "Examination", value: "Examination" },
          { label: "IQAC", value: "IQAC" },
          { label: "NIRF", value: "NIRF" },
          { label: "Autonomous", value: "Autonomous" },
          { label: "Library", value: "Library" },
          { label: "Policies", value: "Policies" },
          { label: "Circulars", value: "Circulars" },
        ]}
        emptyTitle="No documents in this category"
        emptyDescription="Upload your first institutional PDF or form."
        emptyActionLabel="Upload PDF"
        onEmptyAction={handleOpenCreate}
      />

      {/* Upload/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 font-serif">
              {editingDoc ? "Edit Document Metadata" : "Upload Official Document"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End Semester Exam Regulations 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option>Academic</option>
                    <option>Admission</option>
                    <option>Examination</option>
                    <option>IQAC</option>
                    <option>NIRF</option>
                    <option>Autonomous</option>
                    <option>Library</option>
                    <option>Policies</option>
                    <option>Circulars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    placeholder="2025-2026"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  File Download URL / Path *
                </label>
                <input
                  type="text"
                  required
                  placeholder="/downloads/regulations.pdf"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="docPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900"
                />
                <label htmlFor="docPublic" className="text-xs text-slate-700 cursor-pointer">
                  Make publicly downloadable on BAC website
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#009688] hover:bg-[#00796b] shadow-xs cursor-pointer"
              >
                Save Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteDocument(deleteId);
            toast({ title: "Deleted", description: "Document removed from repository." });
          }
        }}
        title="Delete Document"
        description="Are you sure you want to permanently delete this document? Any links to this file on public pages will become unavailable."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
