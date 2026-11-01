"use client";

import React, { useState } from "react";
import { useCMSStore, ContactEnquiry } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  MessageSquare, Mail, Phone, Clock, CheckCircle, 
  User, Send, Trash2, Eye, Filter 
} from "lucide-react";

export function EnquiriesCMS() {
  const { enquiries, updateEnquiryStatus, currentUser, logAction } = useCMSStore();
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [replyText, setReplyText] = useState("");
  const [internalNote, setInternalNote] = useState("");

  const filtered = enquiries.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  });

  const handleOpenDetail = (enq: ContactEnquiry) => {
    setSelectedEnquiry(enq);
    setInternalNote(enq.notes || "");
    if (enq.status === "unread") {
      updateEnquiryStatus(enq.id, "read");
    }
    setIsDetailOpen(true);
  };

  const handleSaveNotes = () => {
    if (!selectedEnquiry) return;
    updateEnquiryStatus(selectedEnquiry.id, selectedEnquiry.status, internalNote);
    setSelectedEnquiry({ ...selectedEnquiry, notes: internalNote });
  };

  const handleMarkResolved = () => {
    if (!selectedEnquiry) return;
    updateEnquiryStatus(selectedEnquiry.id, "resolved", internalNote);
    setSelectedEnquiry({ ...selectedEnquiry, status: "resolved", notes: internalNote });
  };

  const columns: Column<ContactEnquiry>[] = [
    {
      key: "name",
      header: "Enquirer & Category",
      sortable: true,
      render: (e) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            {e.status === "unread" && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
            {e.name}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <span className="font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded text-[10px]">
              {e.category}
            </span>
            <span>•</span>
            <span>{e.submittedAt}</span>
          </div>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject & Message",
      render: (e) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">{e.subject}</div>
          <div className="text-xs text-slate-500 line-clamp-1">{e.message}</div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contact",
      render: (e) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            {e.email}
          </div>
          {e.phone && (
            <div className="text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              {e.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (e) => {
        const sMap: Record<string, { label: string; color: string; bg: string }> = {
          unread: { label: "Unread", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/50" },
          read: { label: "Read", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950/50" },
          in_progress: { label: "In Progress", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-950/50" },
          resolved: { label: "Resolved", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
        };
        const s = sMap[e.status] || sMap.unread;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
            {s.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (e) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenDetail(e)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Open Enquiry"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Public Enquiries & Helpdesk Messages"
        description="Review incoming general website inquiries, course admission questions, and public messages with tracking status."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Services", href: "#" },
          { label: "Enquiries" },
        ]}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {["all", "unread", "read", "in_progress", "resolved"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
              statusFilter === s
                ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {s === "all" ? "All Messages" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search enquiries by name, subject or email..."
        pageSize={8}
      />

      {/* Detail Modal */}
      {isDetailOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Enquiry from {selectedEnquiry.name}
                  </h3>
                  <p className="text-xs text-slate-500">Submitted: {selectedEnquiry.submittedAt}</p>
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
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-amber-600">{selectedEnquiry.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="font-semibold text-blue-600 hover:underline">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedEnquiry.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedEnquiry.subject}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Message Content
                </label>
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Administrative Notes & Resolution Status
                </label>
                <textarea
                  rows={3}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Record call back details, officer assignment, or resolution notes..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                  >
                    Save Notes
                  </button>
                  {selectedEnquiry.status !== "resolved" && (
                    <button
                      onClick={handleMarkResolved}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
