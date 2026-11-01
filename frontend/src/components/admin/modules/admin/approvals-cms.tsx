"use client";

import React, { useState } from "react";
import { useCMSStore, ApprovalItem } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  CheckCircle2, XCircle, Clock, AlertCircle, Eye, 
  FileCheck, User, MessageSquare, ExternalLink 
} from "lucide-react";

export function ApprovalsCMS() {
  const { approvals, approveItem, rejectItem, currentUser } = useCMSStore();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<ApprovalItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approveModal, setApproveModal] = useState<ApprovalItem | null>(null);

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const historyApprovals = approvals.filter((a) => a.status !== "pending");

  const handleApprove = () => {
    if (!approveModal) return;
    approveItem(approveModal.id);
    setApproveModal(null);
    if (selectedApproval && selectedApproval.id === approveModal.id) {
      setSelectedApproval({ ...selectedApproval, status: "approved" });
    }
  };

  const handleReject = () => {
    if (!rejectionModal || !rejectionReason.trim()) return;
    rejectItem(rejectionModal.id, rejectionReason.trim());
    setRejectionModal(null);
    setRejectionReason("");
    if (selectedApproval && selectedApproval.id === rejectionModal.id) {
      setSelectedApproval({ ...selectedApproval, status: "rejected", rejectionReason: rejectionReason.trim() });
    }
  };

  const columns: Column<ApprovalItem>[] = [
    {
      key: "title",
      header: "Submitted Content & Type",
      sortable: true,
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">{a.title}</div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <span className="uppercase font-bold text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/60">
              {a.entityType}
            </span>
            {a.departmentId && <span className="capitalize">Dept: {a.departmentId.replace("-", " ")}</span>}
            {a.clubId && <span className="capitalize">Club: {a.clubId.replace("-", " ")}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "authorName",
      header: "Author / Submitter",
      sortable: true,
      render: (a) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200">{a.authorName}</div>
          <div className="text-slate-500 capitalize">{a.authorRole.replace("_", " ")}</div>
        </div>
      ),
    },
    {
      key: "submittedAt",
      header: "Submitted Time",
      sortable: true,
      render: (a) => <span className="text-xs font-mono text-slate-500">{a.submittedAt}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (a) => {
        const sMap: Record<string, { label: string; color: string; bg: string }> = {
          pending: { label: "Needs Review", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/50" },
          approved: { label: "Approved & Live", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
          rejected: { label: "Rejected", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/50" },
        };
        const s = sMap[a.status] || sMap.pending;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
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
              setSelectedApproval(a);
              setIsDetailOpen(true);
            }}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Preview Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {a.status === "pending" && (
            <>
              <button
                onClick={() => setApproveModal(a)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded transition-colors"
                title="Approve and Publish"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRejectionModal(a)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
                title="Reject with Note"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centralized Publishing & Approvals Queue"
        description="Master Admin approval workflow — review, approve, or reject draft pages, event postings, and notices submitted by HODs and Content Editors."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "System", href: "#" },
          { label: "Approvals" },
        ]}
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Pending Review</div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{pendingApprovals.length} Submissions</div>
          </div>
          <Clock className="w-8 h-8 text-amber-500 opacity-80" />
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Approved & Published</div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {approvals.filter((a) => a.status === "approved").length} Items
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Approval Cycles</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{approvals.length} Processed</div>
          </div>
          <FileCheck className="w-8 h-8 text-slate-400 opacity-80" />
        </div>
      </div>

      <DataTable
        data={approvals}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search approvals by title or submitter..."
        pageSize={8}
      />

      {/* Preview Dossier Modal */}
      {isDetailOpen && selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedApproval.title}
                  </h3>
                  <p className="text-xs text-slate-500">Submitted by {selectedApproval.authorName} ({selectedApproval.authorRole})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Content Entity:</span>
                  <span className="font-bold uppercase text-amber-600">{selectedApproval.entityType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submission Date:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedApproval.submittedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approval State:</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{selectedApproval.status}</span>
                </div>
                {selectedApproval.rejectionReason && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                    <span className="font-bold block mb-1">Rejection Note:</span>
                    <p className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg">{selectedApproval.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                {selectedApproval.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setApproveModal(selectedApproval);
                        setIsDetailOpen(false);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Approve & Publish
                    </button>
                    <button
                      onClick={() => {
                        setRejectionModal(selectedApproval);
                        setIsDetailOpen(false);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Reject with Reason
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation */}
      <ConfirmationDialog
        isOpen={!!approveModal}
        onClose={() => setApproveModal(null)}
        onConfirm={handleApprove}
        title="Approve Content for Live Website"
        description={`Are you sure you want to approve "${approveModal?.title}"? It will become immediately visible to the public.`}
        confirmText="Approve & Publish"
        variant="primary"
      />

      {/* Rejection Modal with Required Reason */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              Reject Submission
            </h3>
            <p className="text-xs text-slate-500">
              Provide constructive feedback to {rejectionModal.authorName} on why this content requires revisions before publication.
            </p>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain the required revisions (e.g., attach updated syllabus PDF, clarify dates)..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectionModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim()}
                onClick={handleReject}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
