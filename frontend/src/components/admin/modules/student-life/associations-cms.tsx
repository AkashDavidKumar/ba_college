"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Briefcase, Plus, Users, Calendar, Award, 
  Trash2, Edit3, ExternalLink 
} from "lucide-react";

interface DepartmentAssociation {
  id: string;
  name: string;
  departmentId: string;
  facultyPresident: string;
  studentSecretaries: string;
  annualSymposium: string;
  eventsCount: number;
  status: ContentStatus;
  lastMeetingDate: string;
}

const INITIAL_ASSOCIATIONS: DepartmentAssociation[] = [
  {
    id: "assoc-1",
    name: "CYBERNAUTS — Computer Science Association",
    departmentId: "computer-science",
    facultyPresident: "Dr. K. Senthil Kumar",
    studentSecretaries: "Rahul M. (III B.Sc CS), Sneha R. (II M.Sc CS)",
    annualSymposium: "TECHNOFEST '25 — National Level IT Symposium",
    eventsCount: 12,
    status: "published",
    lastMeetingDate: "2025-01-08",
  },
  {
    id: "assoc-2",
    name: "COMMERCE NEXUS — Commerce Association",
    departmentId: "commerce",
    facultyPresident: "Dr. M. Joseph Raj",
    studentSecretaries: "Vignesh K. (III B.Com), Divya S. (II M.Com)",
    annualSymposium: "COM-EXCEL '25 — Inter-Collegiate Business Conclave",
    eventsCount: 9,
    status: "published",
    lastMeetingDate: "2025-01-05",
  },
  {
    id: "assoc-3",
    name: "LITERATI — English Literary Association",
    departmentId: "english",
    facultyPresident: "Dr. S. Anitha",
    studentSecretaries: "Maria Prince (III B.A. Eng)",
    annualSymposium: "PEGASUS '25 — Literary Fest & Drama Extravaganza",
    eventsCount: 8,
    status: "published",
    lastMeetingDate: "2024-12-18",
  },
  {
    id: "assoc-4",
    name: "MANAGIX — Management Association",
    departmentId: "management",
    facultyPresident: "Mr. R. Vijay Anand",
    studentSecretaries: "Karthik P. (III BBA)",
    annualSymposium: "CHIEFTAIN '25 — Corporate Strategy Summit",
    eventsCount: 7,
    status: "published",
    lastMeetingDate: "2024-12-20",
  },
];

export function AssociationsCMS() {
  const { canAccessDepartment, currentUser, logAction } = useCMSStore();
  const [associations, setAssociations] = useState<DepartmentAssociation[]>(INITIAL_ASSOCIATIONS);
  const [selectedAssoc, setSelectedAssoc] = useState<DepartmentAssociation | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [assocToDelete, setAssocToDelete] = useState<DepartmentAssociation | null>(null);

  const filtered = associations.filter((a) => canAccessDepartment(a.departmentId));

  const handleOpenEditor = (assoc?: DepartmentAssociation) => {
    if (assoc) {
      setSelectedAssoc(assoc);
    } else {
      setSelectedAssoc({
        id: "assoc-" + Date.now(),
        name: "",
        departmentId: currentUser.departmentId || "computer-science",
        facultyPresident: currentUser.name,
        studentSecretaries: "",
        annualSymposium: "",
        eventsCount: 0,
        status: currentUser.role === "master_admin" ? "published" : "submitted",
        lastMeetingDate: new Date().toISOString().split("T")[0],
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssoc) return;

    if (associations.some((a) => a.id === selectedAssoc.id)) {
      setAssociations((prev) => prev.map((a) => (a.id === selectedAssoc.id ? selectedAssoc : a)));
      logAction({
        action: "UPDATE",
        module: "Department Associations",
        recordId: selectedAssoc.id,
        recordTitle: selectedAssoc.name,
      });
    } else {
      setAssociations((prev) => [selectedAssoc, ...prev]);
      logAction({
        action: "CREATE",
        module: "Department Associations",
        recordId: selectedAssoc.id,
        recordTitle: selectedAssoc.name,
      });
    }
    setIsEditorOpen(false);
    setSelectedAssoc(null);
  };

  const handleDelete = () => {
    if (!assocToDelete) return;
    setAssociations((prev) => prev.filter((a) => a.id !== assocToDelete.id));
    logAction({
      action: "DELETE",
      module: "Department Associations",
      recordId: assocToDelete.id,
      recordTitle: assocToDelete.name,
    });
    setAssocToDelete(null);
  };

  const columns: Column<DepartmentAssociation>[] = [
    {
      key: "name",
      header: "Association Name",
      sortable: true,
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">{a.name}</div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{a.annualSymposium}</div>
        </div>
      ),
    },
    {
      key: "departmentId",
      header: "Department",
      sortable: true,
      render: (a) => (
        <span className="capitalize text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {a.departmentId.replace("-", " ")}
        </span>
      ),
    },
    {
      key: "facultyPresident",
      header: "Faculty President & Office Bearers",
      render: (a) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200">{a.facultyPresident}</div>
          <div className="text-slate-500">{a.studentSecretaries}</div>
        </div>
      ),
    },
    {
      key: "eventsCount",
      header: "Yearly Events",
      sortable: true,
      render: (a) => (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {a.eventsCount} Events Held
        </span>
      ),
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
            title="Edit Association"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAssocToDelete(a)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Association"
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
        title="Department Academic Associations"
        description="Manage departmental student associations, office bearers, technical symposiums, and guest lecture series."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Student Life", href: "#" },
          { label: "Associations" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Association
          </button>
        }
      />

      <DataTable
        data={filtered}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search academic associations..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedAssoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {associations.some((a) => a.id === selectedAssoc.id) ? "Edit Department Association" : "Add Association"}
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
                  Association Name *
                </label>
                <input
                  type="text"
                  required
                  value={selectedAssoc.name}
                  onChange={(e) => setSelectedAssoc({ ...selectedAssoc, name: e.target.value })}
                  placeholder="e.g. CYBERNAUTS — Computer Science Association"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Symposium / Signature Event Title
                </label>
                <input
                  type="text"
                  value={selectedAssoc.annualSymposium}
                  onChange={(e) => setSelectedAssoc({ ...selectedAssoc, annualSymposium: e.target.value })}
                  placeholder="e.g. TECHNOFEST '25 — National Level IT Symposium"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty In-Charge / President *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedAssoc.facultyPresident}
                    onChange={(e) => setSelectedAssoc({ ...selectedAssoc, facultyPresident: e.target.value })}
                    placeholder="Prof. Name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Office Bearers / Secretaries
                  </label>
                  <input
                    type="text"
                    value={selectedAssoc.studentSecretaries}
                    onChange={(e) => setSelectedAssoc({ ...selectedAssoc, studentSecretaries: e.target.value })}
                    placeholder="Student Name (Year & Dept)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Events Conducted Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedAssoc.eventsCount}
                    onChange={(e) => setSelectedAssoc({ ...selectedAssoc, eventsCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Last Executive Meeting Date
                  </label>
                  <input
                    type="date"
                    value={selectedAssoc.lastMeetingDate}
                    onChange={(e) => setSelectedAssoc({ ...selectedAssoc, lastMeetingDate: e.target.value })}
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
                  Save Association
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!assocToDelete}
        onClose={() => setAssocToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Association"
        description={`Are you sure you want to delete ${assocToDelete?.name}?`}
        confirmText="Delete Association"
        variant="danger"
      />
    </div>
  );
}
