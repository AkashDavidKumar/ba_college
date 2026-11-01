"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  ShieldCheck, Plus, FileText, CheckCircle, Download, 
  ExternalLink, Trash2, Edit3, Award, Calendar, Layers 
} from "lucide-react";

interface IQACItem {
  id: string;
  category: "Committee" | "Minutes & ATR" | "Quality Initiatives" | "Best Practices" | "Policies";
  title: string;
  academicYear: string;
  description: string;
  documentUrl?: string;
  coordinator: string;
  date: string;
  status: ContentStatus;
}

const INITIAL_IQAC: IQACItem[] = [
  {
    id: "iqac-1",
    category: "Minutes & ATR",
    title: "IQAC Executive Committee Meeting Minutes & Action Taken Report — Q3 2024",
    academicYear: "2024–2025",
    description: "Resolutions on OBE curriculum revision, faculty national grant submissions, and digital LMS roll-out.",
    documentUrl: "/documents/iqac/IQAC_Minutes_ATR_Q3_2024.pdf",
    coordinator: "Dr. K. Senthil Kumar (IQAC Coordinator)",
    date: "2024-11-15",
    status: "published",
  },
  {
    id: "iqac-2",
    category: "Committee",
    title: "Internal Quality Assurance Cell (IQAC) Composition 2024–2026",
    academicYear: "2024–2026",
    description: "Chairperson (Principal), Coordinator, 8 Faculty Members, 2 Management Representatives, 1 Alumni, 1 Industrialist, 1 Student.",
    documentUrl: "/documents/iqac/IQAC_Committee_Members_2024_26.pdf",
    coordinator: "Rev. Fr. Principal (Chairperson)",
    date: "2024-06-10",
    status: "published",
  },
  {
    id: "iqac-3",
    category: "Quality Initiatives",
    title: "Faculty Development Programme on Outcome-Based Education (OBE) & Bloom's Taxonomy",
    academicYear: "2024–2025",
    description: "5-Day National FDP with resource persons from NITTTR Chennai for all teaching faculty.",
    coordinator: "IQAC Quality Wing",
    date: "2024-08-20",
    status: "published",
  },
  {
    id: "iqac-4",
    category: "Best Practices",
    title: "Institutional Best Practice 1: 'Green Ambrose — Eco-Conscious Solar Powered Campus'",
    academicYear: "2024–2025",
    description: "50 kW Rooftop Solar Grid, rainwater harvesting tanks, zero single-use plastic policy, and botanical medicinal garden.",
    documentUrl: "/documents/iqac/Best_Practice_1_Green_Ambrose.pdf",
    coordinator: "Campus Eco Club & IQAC",
    date: "2024-09-01",
    status: "published",
  },
  {
    id: "iqac-5",
    category: "Best Practices",
    title: "Institutional Best Practice 2: 'Ambrose Care — Rural Community Outreach & Skill Empowerment'",
    academicYear: "2024–2025",
    description: "Free IT literacy, digital banking education, and competitive exam coaching for underprivileged youth in adopted villages.",
    documentUrl: "/documents/iqac/Best_Practice_2_Ambrose_Care.pdf",
    coordinator: "NSS & AICUF Units",
    date: "2024-09-01",
    status: "published",
  },
];

export function IQACCoreCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [items, setItems] = useState<IQACItem[]>(INITIAL_IQAC);
  const [selectedItem, setSelectedItem] = useState<IQACItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IQACItem | null>(null);

  const handleOpenEditor = (item?: IQACItem) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem({
        id: "iqac-" + Date.now(),
        category: "Minutes & ATR",
        title: "",
        academicYear: "2024–2025",
        description: "",
        coordinator: "Dr. K. Senthil Kumar (IQAC Coordinator)",
        date: new Date().toISOString().split("T")[0],
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (items.some((i) => i.id === selectedItem.id)) {
      setItems((prev) => prev.map((i) => (i.id === selectedItem.id ? selectedItem : i)));
      logAction({
        action: "UPDATE",
        module: "IQAC Quality Assurance",
        recordId: selectedItem.id,
        recordTitle: selectedItem.title,
      });
    } else {
      setItems((prev) => [selectedItem, ...prev]);
      logAction({
        action: "CREATE",
        module: "IQAC Quality Assurance",
        recordId: selectedItem.id,
        recordTitle: selectedItem.title,
      });
    }
    setIsEditorOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    logAction({
      action: "DELETE",
      module: "IQAC Quality Assurance",
      recordId: itemToDelete.id,
      recordTitle: itemToDelete.title,
    });
    setItemToDelete(null);
  };

  const columns: Column<IQACItem>[] = [
    {
      key: "title",
      header: "Quality Initiative / Document Title",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            {item.title}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (item) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          {item.category}
        </span>
      ),
    },
    {
      key: "academicYear",
      header: "Academic Year",
      sortable: true,
      render: (item) => <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{item.academicYear}</span>,
    },
    {
      key: "coordinator",
      header: "Lead Coordinator",
      render: (item) => <span className="text-xs text-slate-600 dark:text-slate-400">{item.coordinator}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(item)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit IQAC Record"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setItemToDelete(item)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Record"
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
        title="Internal Quality Assurance Cell (IQAC)"
        description="Oversee IQAC composition, meeting minutes, Action Taken Reports (ATR), quality initiatives, and institutional best practices."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "IQAC", href: "#" },
          { label: "Quality Assurance" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add IQAC Record
          </button>
        }
      />

      <DataTable
        data={items}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search IQAC minutes, initiatives, or best practices..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {items.some((i) => i.id === selectedItem.id) ? "Edit IQAC Record" : "Add IQAC Record"}
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
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={selectedItem.title}
                  onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                  placeholder="e.g. IQAC Minutes & ATR Q3 2024"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    IQAC Category *
                  </label>
                  <select
                    value={selectedItem.category}
                    onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Minutes & ATR">Meeting Minutes & ATR</option>
                    <option value="Committee">Committee Composition</option>
                    <option value="Quality Initiatives">Quality Enhancement Initiatives</option>
                    <option value="Best Practices">Institutional Best Practices</option>
                    <option value="Policies">Quality & Academic Policies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedItem.academicYear}
                    onChange={(e) => setSelectedItem({ ...selectedItem, academicYear: e.target.value })}
                    placeholder="2024–2025"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Executive Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  value={selectedItem.description}
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                  placeholder="Key resolutions, targets achieved, or practice methodology..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Coordinator / Presenter
                  </label>
                  <input
                    type="text"
                    value={selectedItem.coordinator}
                    onChange={(e) => setSelectedItem({ ...selectedItem, coordinator: e.target.value })}
                    placeholder="Dr. K. Senthil Kumar (IQAC Coordinator)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document PDF URL
                  </label>
                  <input
                    type="text"
                    value={selectedItem.documentUrl || ""}
                    onChange={(e) => setSelectedItem({ ...selectedItem, documentUrl: e.target.value })}
                    placeholder="/documents/iqac/minutes.pdf"
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
                  Save IQAC Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete IQAC Record"
        description={`Are you sure you want to delete ${itemToDelete?.title}?`}
        confirmText="Delete Record"
        variant="danger"
      />
    </div>
  );
}
