"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  BookOpen, Plus, Search, ExternalLink, Trash2, 
  Edit3, Globe, Database, BookMarked, Users 
} from "lucide-react";

interface LibraryResource {
  id: string;
  category: "E-Journals" | "DELNET & N-LIST" | "Print Books" | "Digital Thesis" | "Institutional Repository";
  title: string;
  publisherOrProvider: string;
  totalVolume: string; // e.g., "6,000+ e-journals", "35,000 Books"
  accessUrl?: string;
  credentialsNotes?: string;
  status: ContentStatus;
}

const INITIAL_LIBRARY_RESOURCES: LibraryResource[] = [
  {
    id: "lib-1",
    category: "DELNET & N-LIST",
    title: "INFLIBNET N-LIST Consortium (E-ShodhSindhu)",
    publisherOrProvider: "UGC-INFLIBNET Centre",
    totalVolume: "6,000+ e-journals & 1,99,500+ e-books",
    accessUrl: "https://nlist.inflibnet.ac.in/",
    credentialsNotes: "College institutional login credentials provided to all students & faculty.",
    status: "published",
  },
  {
    id: "lib-2",
    category: "DELNET & N-LIST",
    title: "DELNET Developing Library Network (Inter-Library Loan)",
    publisherOrProvider: "DELNET New Delhi",
    totalVolume: "3.5 Crore+ Union Catalogued Records",
    accessUrl: "http://www.delnet.in/",
    credentialsNotes: "Access available across all campus computing terminals and Digital Library.",
    status: "published",
  },
  {
    id: "lib-3",
    category: "Print Books",
    title: "Central Reference & Lending Library Book Collection",
    publisherOrProvider: "St. Ambrose Central Library (Automated via AutoLib / Koha OPAC)",
    totalVolume: "38,500 Volumes & 120 Subscribed Print Journals",
    accessUrl: "http://opac.bac.edu.in:8080",
    credentialsNotes: "Barcoded open access lending system with RFID gates.",
    status: "published",
  },
  {
    id: "lib-4",
    category: "Digital Thesis",
    title: "National Digital Library of India (NDLI) Institutional Club",
    publisherOrProvider: "IIT Kharagpur / MoE",
    totalVolume: "7.2 Crore+ Digital Educational Resources",
    accessUrl: "https://ndl.iitkgp.ac.in/",
    credentialsNotes: "BAC NDLI Club Registration Code: TNCOEBAC01",
    status: "published",
  },
];

export function LibraryCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [resources, setResources] = useState<LibraryResource[]>(INITIAL_LIBRARY_RESOURCES);
  const [selectedRes, setSelectedRes] = useState<LibraryResource | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [resToDelete, setResToDelete] = useState<LibraryResource | null>(null);

  const handleOpenEditor = (res?: LibraryResource) => {
    if (res) {
      setSelectedRes(res);
    } else {
      setSelectedRes({
        id: "lib-" + Date.now(),
        category: "E-Journals",
        title: "",
        publisherOrProvider: "",
        totalVolume: "",
        accessUrl: "",
        credentialsNotes: "",
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes) return;

    if (resources.some((r) => r.id === selectedRes.id)) {
      setResources((prev) => prev.map((r) => (r.id === selectedRes.id ? selectedRes : r)));
      logAction({
        action: "UPDATE",
        module: "Library & E-Resources",
        recordId: selectedRes.id,
        recordTitle: selectedRes.title,
      });
    } else {
      setResources((prev) => [selectedRes, ...prev]);
      logAction({
        action: "CREATE",
        module: "Library & E-Resources",
        recordId: selectedRes.id,
        recordTitle: selectedRes.title,
      });
    }
    setIsEditorOpen(false);
    setSelectedRes(null);
  };

  const handleDelete = () => {
    if (!resToDelete) return;
    setResources((prev) => prev.filter((r) => r.id !== resToDelete.id));
    logAction({
      action: "DELETE",
      module: "Library & E-Resources",
      recordId: resToDelete.id,
      recordTitle: resToDelete.title,
    });
    setResToDelete(null);
  };

  const columns: Column<LibraryResource>[] = [
    {
      key: "title",
      header: "Resource / Database Name",
      sortable: true,
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <BookMarked className="w-4 h-4 text-amber-500 shrink-0" />
            {r.title}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{r.publisherOrProvider}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (r) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          {r.category}
        </span>
      ),
    },
    {
      key: "totalVolume",
      header: "Collection Size",
      sortable: true,
      render: (r) => (
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {r.totalVolume}
        </span>
      ),
    },
    {
      key: "accessUrl",
      header: "Access Portal",
      render: (r) => (
        r.accessUrl ? (
          <a
            href={r.accessUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-amber-600 hover:underline flex items-center gap-1 font-mono"
          >
            Portal Link <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-xs text-slate-400">On-Campus Only</span>
        )
      ),
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
            title="Edit Resource"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setResToDelete(r)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Resource"
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
        title="Central Library & Digital E-Resources"
        description="Manage N-LIST consortia, DELNET access, OPAC catalog links, digital thesis collections, and print volumes."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Services", href: "#" },
          { label: "Library" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Library Resource
          </button>
        }
      />

      <DataTable
        data={resources}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search library databases and resources..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {resources.some((r) => r.id === selectedRes.id) ? "Edit Library Resource" : "Add Library Resource"}
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
                  Resource / Database Title *
                </label>
                <input
                  type="text"
                  required
                  value={selectedRes.title}
                  onChange={(e) => setSelectedRes({ ...selectedRes, title: e.target.value })}
                  placeholder="e.g. INFLIBNET N-LIST Consortium"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resource Category *
                  </label>
                  <select
                    value={selectedRes.category}
                    onChange={(e) => setSelectedRes({ ...selectedRes, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="DELNET & N-LIST">DELNET & N-LIST Consortium</option>
                    <option value="E-Journals">E-Journals Database</option>
                    <option value="Print Books">Print Book Catalog / OPAC</option>
                    <option value="Digital Thesis">Digital Thesis & Dissertations</option>
                    <option value="Institutional Repository">Institutional Repository</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Publisher / Provider *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedRes.publisherOrProvider}
                    onChange={(e) => setSelectedRes({ ...selectedRes, publisherOrProvider: e.target.value })}
                    placeholder="e.g. UGC-INFLIBNET Centre"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Volume / Holdings Size *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedRes.totalVolume}
                    onChange={(e) => setSelectedRes({ ...selectedRes, totalVolume: e.target.value })}
                    placeholder="e.g. 6,000+ e-journals & 1,99,500+ e-books"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Access Portal URL
                  </label>
                  <input
                    type="text"
                    value={selectedRes.accessUrl || ""}
                    onChange={(e) => setSelectedRes({ ...selectedRes, accessUrl: e.target.value })}
                    placeholder="https://nlist.inflibnet.ac.in/"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Access Instructions & Credentials Notes
                </label>
                <textarea
                  rows={3}
                  value={selectedRes.credentialsNotes || ""}
                  onChange={(e) => setSelectedRes({ ...selectedRes, credentialsNotes: e.target.value })}
                  placeholder="How students can login, institutional membership ID, or physical terminal guidelines..."
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
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!resToDelete}
        onClose={() => setResToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Library Resource"
        description={`Are you sure you want to delete ${resToDelete?.title}?`}
        confirmText="Delete Resource"
        variant="danger"
      />
    </div>
  );
}
