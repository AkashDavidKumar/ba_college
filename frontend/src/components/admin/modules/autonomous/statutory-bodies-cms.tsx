"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Landmark, Plus, Users, Shield, Award, 
  Trash2, Edit3, Calendar, FileText, CheckCircle2 
} from "lucide-react";

interface StatutoryBody {
  id: string;
  bodyName: string; // e.g. "Governing Body", "Academic Council", "Board of Studies (Computer Science)", "Finance Committee"
  category: "Governing Body" | "Academic Council" | "Board of Studies" | "Finance Committee" | "Planning & Evaluation Committee";
  chairperson: string;
  membersCount: number;
  lastMeetingDate: string;
  termPeriod: string;
  minutesPdfUrl?: string;
  status: ContentStatus;
}

const INITIAL_STATUTORY_BODIES: StatutoryBody[] = [
  {
    id: "sb-1",
    bodyName: "Governing Body of Bishop Ambrose College",
    category: "Governing Body",
    chairperson: "Most Rev. Bishop of Coimbatore (President / Patron)",
    membersCount: 14,
    lastMeetingDate: "2024-11-20",
    termPeriod: "2023–2026",
    minutesPdfUrl: "/documents/autonomous/Governing_Body_Minutes_Nov2024.pdf",
    status: "published",
  },
  {
    id: "sb-2",
    bodyName: "Autonomous Academic Council",
    category: "Academic Council",
    chairperson: "Principal (Chairperson)",
    membersCount: 22,
    lastMeetingDate: "2024-10-15",
    termPeriod: "2024–2026",
    minutesPdfUrl: "/documents/autonomous/Academic_Council_Resolutions_Oct2024.pdf",
    status: "published",
  },
  {
    id: "sb-3",
    bodyName: "Board of Studies (BOS) — Computer Science & Applications",
    category: "Board of Studies",
    chairperson: "Dr. K. Senthil Kumar (HOD, CS)",
    membersCount: 8,
    lastMeetingDate: "2024-05-18",
    termPeriod: "2024–2026",
    minutesPdfUrl: "/documents/autonomous/BOS_ComputerScience_May2024.pdf",
    status: "published",
  },
  {
    id: "sb-4",
    bodyName: "Board of Studies (BOS) — Commerce & Accounting",
    category: "Board of Studies",
    chairperson: "Dr. M. Joseph Raj (HOD, Commerce)",
    membersCount: 8,
    lastMeetingDate: "2024-05-20",
    termPeriod: "2024–2026",
    minutesPdfUrl: "/documents/autonomous/BOS_Commerce_May2024.pdf",
    status: "published",
  },
  {
    id: "sb-5",
    bodyName: "Statutory Finance Committee",
    category: "Finance Committee",
    chairperson: "Principal & Management Secretary",
    membersCount: 5,
    lastMeetingDate: "2024-12-05",
    termPeriod: "2024–2025",
    minutesPdfUrl: "/documents/autonomous/Finance_Committee_Minutes_2024.pdf",
    status: "published",
  },
];

export function StatutoryBodiesCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [bodies, setBodies] = useState<StatutoryBody[]>(INITIAL_STATUTORY_BODIES);
  const [selectedBody, setSelectedBody] = useState<StatutoryBody | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [bodyToDelete, setBodyToDelete] = useState<StatutoryBody | null>(null);

  const handleOpenEditor = (body?: StatutoryBody) => {
    if (body) {
      setSelectedBody(body);
    } else {
      setSelectedBody({
        id: "sb-" + Date.now(),
        bodyName: "",
        category: "Board of Studies",
        chairperson: "",
        membersCount: 6,
        lastMeetingDate: new Date().toISOString().split("T")[0],
        termPeriod: "2024–2026",
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBody) return;

    if (bodies.some((b) => b.id === selectedBody.id)) {
      setBodies((prev) => prev.map((b) => (b.id === selectedBody.id ? selectedBody : b)));
      logAction({
        action: "UPDATE",
        module: "Autonomous Statutory Bodies",
        recordId: selectedBody.id,
        recordTitle: selectedBody.bodyName,
      });
    } else {
      setBodies((prev) => [selectedBody, ...prev]);
      logAction({
        action: "CREATE",
        module: "Autonomous Statutory Bodies",
        recordId: selectedBody.id,
        recordTitle: selectedBody.bodyName,
      });
    }
    setIsEditorOpen(false);
    setSelectedBody(null);
  };

  const handleDelete = () => {
    if (!bodyToDelete) return;
    setBodies((prev) => prev.filter((b) => b.id !== bodyToDelete.id));
    logAction({
      action: "DELETE",
      module: "Autonomous Statutory Bodies",
      recordId: bodyToDelete.id,
      recordTitle: bodyToDelete.bodyName,
    });
    setBodyToDelete(null);
  };

  const columns: Column<StatutoryBody>[] = [
    {
      key: "bodyName",
      header: "Statutory Council / Committee",
      sortable: true,
      render: (b) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Landmark className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            {b.bodyName}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Chairperson: {b.chairperson}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (b) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          {b.category}
        </span>
      ),
    },
    {
      key: "membersCount",
      header: "Composition",
      sortable: true,
      render: (b) => (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {b.membersCount} Members
        </span>
      ),
    },
    {
      key: "termPeriod",
      header: "Term Period",
      render: (b) => <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{b.termPeriod}</span>,
    },
    {
      key: "lastMeetingDate",
      header: "Last Convened",
      sortable: true,
      render: (b) => <span className="text-xs font-mono text-slate-500">{b.lastMeetingDate}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(b)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Committee"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setBodyToDelete(b)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Committee"
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
        title="Autonomous Statutory Bodies & Governance"
        description="Oversee composition, member lists, and meeting minutes of the Governing Body, Academic Council, BOS, and Finance Committee."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Autonomous", href: "#" },
          { label: "Statutory Bodies" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Statutory Body
          </button>
        }
      />

      <DataTable
        data={bodies}
        columns={columns}
        searchKey="bodyName"
        searchPlaceholder="Search statutory bodies and committees..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedBody && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {bodies.some((b) => b.id === selectedBody.id) ? "Edit Statutory Body" : "Register Statutory Body"}
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
                  Committee / Council Name *
                </label>
                <input
                  type="text"
                  required
                  value={selectedBody.bodyName}
                  onChange={(e) => setSelectedBody({ ...selectedBody, bodyName: e.target.value })}
                  placeholder="e.g. Board of Studies — Computer Science"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Statutory Category *
                  </label>
                  <select
                    value={selectedBody.category}
                    onChange={(e) => setSelectedBody({ ...selectedBody, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Governing Body">Governing Body</option>
                    <option value="Academic Council">Academic Council</option>
                    <option value="Board of Studies">Board of Studies (BOS)</option>
                    <option value="Finance Committee">Finance Committee</option>
                    <option value="Planning & Evaluation Committee">Planning & Evaluation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chairperson / President *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedBody.chairperson}
                    onChange={(e) => setSelectedBody({ ...selectedBody, chairperson: e.target.value })}
                    placeholder="e.g. Principal / HOD"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Members Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selectedBody.membersCount}
                    onChange={(e) => setSelectedBody({ ...selectedBody, membersCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Term Duration
                  </label>
                  <input
                    type="text"
                    value={selectedBody.termPeriod}
                    onChange={(e) => setSelectedBody({ ...selectedBody, termPeriod: e.target.value })}
                    placeholder="2024–2026"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Last Meeting Date
                  </label>
                  <input
                    type="date"
                    value={selectedBody.lastMeetingDate}
                    onChange={(e) => setSelectedBody({ ...selectedBody, lastMeetingDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Signed Minutes PDF Document URL
                </label>
                <input
                  type="text"
                  value={selectedBody.minutesPdfUrl || ""}
                  onChange={(e) => setSelectedBody({ ...selectedBody, minutesPdfUrl: e.target.value })}
                  placeholder="/documents/autonomous/minutes.pdf"
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
                  Save Council Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!bodyToDelete}
        onClose={() => setBodyToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Statutory Body"
        description={`Are you sure you want to delete ${bodyToDelete?.bodyName}?`}
        confirmText="Delete Record"
        variant="danger"
      />
    </div>
  );
}
