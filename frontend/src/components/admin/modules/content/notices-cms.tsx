"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { noticeService } from "@/lib/api/notice-service";
import type { Notice, NoticeMetrics } from "@/types/notice";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Bell, Plus, AlertCircle, FileText, Download, 
  Trash2, Edit3, CheckCircle, XCircle, Clock, 
  Send, Pin, RefreshCw, Eye, WifiOff
} from "lucide-react";

export function NoticesCMS() {
  const { canAccessDepartment, currentUser } = useCMSStore();
  
  const [liveNotices, setLiveNotices] = useState<Notice[]>([]);
  const [localDrafts, setLocalDrafts] = useState<Notice[]>([]);
  const [metrics, setMetrics] = useState<NoticeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [selectedNotice, setSelectedNotice] = useState<Partial<Notice> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  
  // Rejection modal state
  const [rejectingNotice, setRejectingNotice] = useState<Notice | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const isGlobalAdmin = currentUser.role === "master_admin" || currentUser.role === "sub_admin" || (currentUser.role as string) === "ADMIN";

  // Account-isolated draft key
  const accountKey = currentUser?.id || currentUser?.email || "anonymous";
  const draftsStorageKey = `bac_cms_drafts_${accountKey}`;

  // Helper to load drafts strictly isolated to current account
  const loadAccountDrafts = useCallback((key: string): Notice[] => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }, []);

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [listRes, metricsRes] = await Promise.all([
        noticeService.listAdminNotices(),
        noticeService.getAdminMetrics(),
      ]);

      if (listRes && listRes.data) {
        setLiveNotices(listRes.data);
        setIsOffline(false);
      }
      if (metricsRes && metricsRes.metrics) {
        setMetrics(metricsRes.metrics);
      }
    } catch (err: any) {
      console.warn("API notice fetch failed, operating in account-isolated offline mode:", err);
      setIsOffline(true);
      setApiError(err?.message || "Server unreachable. Operating in offline mode.");
      // Strictly avoid displaying stale or cross-account server records as verified
      setLiveNotices([]);
      setMetrics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Account switch & permission change lifecycle:
  // Purge in-memory state, load account-specific drafts, and trigger fresh fetch
  useEffect(() => {
    setLiveNotices([]);
    setMetrics(null);
    setApiError(null);
    setIsOffline(false);

    const userDrafts = loadAccountDrafts(draftsStorageKey);
    setLocalDrafts(userDrafts);

    fetchNotices();
  }, [draftsStorageKey, currentUser?.id, currentUser?.email, currentUser?.role, fetchNotices, loadAccountDrafts]);

  // Combined notices: live API data if available, supplemented by account-isolated drafts
  const displayNotices = useMemo(() => {
    if (isOffline) {
      // In offline mode: ONLY display unverified local drafts for this account
      return localDrafts;
    }
    // When online: display verified server notices, plus any unsynchronized local drafts
    return [...localDrafts, ...liveNotices];
  }, [isOffline, localDrafts, liveNotices]);

  const filteredNotices = useMemo(() => {
    return displayNotices.filter((n) => {
      if (n.departmentId && n.departmentId !== "all" && !canAccessDepartment(n.departmentId)) {
        return false;
      }
      if (priorityFilter !== "all" && n.priority !== priorityFilter) {
        return false;
      }
      if (statusFilter !== "all" && n.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [displayNotices, canAccessDepartment, priorityFilter, statusFilter]);

  const handleOpenEditor = (notice?: Notice) => {
    if (notice) {
      setSelectedNotice(notice);
    } else {
      setSelectedNotice({
        title: "",
        content: "",
        departmentId: currentUser.departmentId || null,
        category: "General",
        noticeType: "Circular",
        priority: "Medium",
        targetAudience: "All",
        status: isOffline ? "draft" : (isGlobalAdmin ? "published" : "draft"),
        publishAt: new Date().toISOString().split("T")[0],
        isPinned: false,
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotice || !selectedNotice.title || !selectedNotice.content) return;

    const isNew = !selectedNotice.id && !selectedNotice._id;
    const isLocalDraft = !!(selectedNotice as any).isLocalDraft;

    // When offline, governance actions (publishing/approving) cannot be performed
    if (isOffline && selectedNotice.status !== "draft") {
      alert("Publishing cannot be performed offline. Notice will be saved safely as an offline draft.");
      selectedNotice.status = "draft";
    }

    // Try server save if online and not explicitly an offline-only draft
    if (!isOffline) {
      try {
        if (isNew || isLocalDraft) {
          await noticeService.createNotice({
            title: selectedNotice.title,
            content: selectedNotice.content,
            summary: selectedNotice.summary || selectedNotice.content.slice(0, 190),
            category: selectedNotice.category || "General",
            noticeType: selectedNotice.noticeType || "Circular",
            priority: selectedNotice.priority || "Medium",
            targetAudience: selectedNotice.targetAudience || "All",
            departmentId: selectedNotice.departmentId || null,
            status: selectedNotice.status as any,
            publishAt: selectedNotice.publishAt,
            expiresAt: selectedNotice.expiresAt || null,
            isPinned: !!selectedNotice.isPinned,
            attachmentUrl: selectedNotice.attachmentUrl || null,
            attachmentName: selectedNotice.attachmentName || null,
          });
          setActionSuccess("Notice created and synchronized with server.");

          if (isLocalDraft) {
            const updated = localDrafts.filter((d) => d.id !== selectedNotice.id);
            setLocalDrafts(updated);
            try {
              localStorage.setItem(draftsStorageKey, JSON.stringify(updated));
            } catch {}
          }
        } else {
          const noticeId = String(selectedNotice.id || selectedNotice._id);
          await noticeService.updateNotice(noticeId, {
            title: selectedNotice.title,
            content: selectedNotice.content,
            summary: selectedNotice.summary,
            category: selectedNotice.category,
            noticeType: selectedNotice.noticeType,
            priority: selectedNotice.priority,
            targetAudience: selectedNotice.targetAudience,
            departmentId: selectedNotice.departmentId,
            status: selectedNotice.status,
            publishAt: selectedNotice.publishAt,
            expiresAt: selectedNotice.expiresAt,
            isPinned: selectedNotice.isPinned,
            attachmentUrl: selectedNotice.attachmentUrl,
            attachmentName: selectedNotice.attachmentName,
          });
          setActionSuccess("Notice updated and synchronized with server.");
        }

        setIsEditorOpen(false);
        setSelectedNotice(null);
        await fetchNotices();
        return;
      } catch (err: any) {
        console.warn("Server save failed, falling back to account offline draft:", err);
        setIsOffline(true);
      }
    }

    // Safe offline draft editing path: save exclusively in account-isolated storage
    const draftId = selectedNotice.id || `local-draft-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newDraftNotice: Notice = {
      id: draftId,
      _id: draftId,
      title: selectedNotice.title,
      slug: `draft-${Date.now()}`,
      content: selectedNotice.content,
      summary: selectedNotice.summary || selectedNotice.content.slice(0, 190),
      category: (selectedNotice.category as any) || "General",
      noticeType: (selectedNotice.noticeType as any) || "Circular",
      priority: (selectedNotice.priority as any) || "Medium",
      targetAudience: (selectedNotice.targetAudience as any) || "All",
      departmentId: selectedNotice.departmentId || currentUser.departmentId || null,
      status: "draft",
      publishAt: selectedNotice.publishAt || nowIso.split("T")[0],
      expiresAt: selectedNotice.expiresAt || undefined,
      isPinned: false,
      attachmentUrl: selectedNotice.attachmentUrl || undefined,
      attachmentName: selectedNotice.attachmentName || undefined,
      viewsCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      author: {
        userId: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        departmentId: currentUser.departmentId,
      },
      ...({ isLocalDraft: true } as any),
    };

    const existingIndex = localDrafts.findIndex((d) => d.id === draftId);
    let updatedDrafts: Notice[];
    if (existingIndex >= 0) {
      updatedDrafts = localDrafts.map((d, i) => (i === existingIndex ? newDraftNotice : d));
    } else {
      updatedDrafts = [newDraftNotice, ...localDrafts];
    }

    setLocalDrafts(updatedDrafts);
    try {
      localStorage.setItem(draftsStorageKey, JSON.stringify(updatedDrafts));
    } catch {}

    setIsEditorOpen(false);
    setSelectedNotice(null);
    setActionSuccess("Draft saved safely to your account local drafts (Offline Mode).");
  };

  const handleSubmitForReview = async (notice: Notice) => {
    if (isOffline || (notice as any).isLocalDraft) {
      alert("Governance submission requires verified server connectivity. Please connect to the server before submitting drafts for review.");
      return;
    }
    try {
      const noticeId = String(notice.id || notice._id);
      await noticeService.submitNotice(noticeId);
      setActionSuccess(`Notice "${notice.title}" submitted for review.`);
      await fetchNotices();
    } catch (err: any) {
      alert(err?.message || "Failed to submit notice for review.");
    }
  };

  const handleApprove = async (notice: Notice) => {
    if (isOffline || (notice as any).isLocalDraft) {
      alert("Governance actions (approvals) cannot be performed offline. Verified server connectivity is required.");
      return;
    }
    try {
      const noticeId = String(notice.id || notice._id);
      await noticeService.approveNotice(noticeId);
      setActionSuccess(`Notice "${notice.title}" approved successfully.`);
      await fetchNotices();
    } catch (err: any) {
      alert(err?.message || "Failed to approve notice.");
    }
  };

  const handleOpenRejectModal = (notice: Notice) => {
    if (isOffline || (notice as any).isLocalDraft) {
      alert("Governance actions (rejections) cannot be performed offline. Verified server connectivity is required.");
      return;
    }
    setRejectingNotice(notice);
    setRejectionReason("");
    setRejectionError(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectingNotice) return;
    if (isOffline || (rejectingNotice as any)?.isLocalDraft) {
      setRejectionError("Governance actions (rejections) cannot be performed offline. Verified server connectivity is required.");
      return;
    }
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      setRejectionError("Please provide a rejection reason of at least 5 characters.");
      return;
    }

    try {
      const noticeId = String(rejectingNotice.id || rejectingNotice._id);
      await noticeService.rejectNotice(noticeId, rejectionReason.trim());
      setActionSuccess(`Notice rejected.`);
      setRejectingNotice(null);
      setRejectionReason("");
      await fetchNotices();
    } catch (err: any) {
      setRejectionError(err?.message || "Failed to reject notice.");
    }
  };

  const handlePublish = async (notice: Notice) => {
    if (isOffline || (notice as any).isLocalDraft) {
      alert("Publishing cannot be performed offline. Verified server connectivity is required.");
      return;
    }
    try {
      const noticeId = String(notice.id || notice._id);
      await noticeService.publishNotice(noticeId);
      setActionSuccess(`Notice published successfully.`);
      await fetchNotices();
    } catch (err: any) {
      alert(err?.message || "Failed to publish notice.");
    }
  };

  const handleTogglePin = async (notice: Notice) => {
    if (isOffline || (notice as any).isLocalDraft) {
      alert("Live announcement pin settings cannot be modified offline. Verified server connectivity is required.");
      return;
    }
    try {
      const noticeId = String(notice.id || notice._id);
      await noticeService.patchNotice(noticeId, { isPinned: !notice.isPinned });
      setActionSuccess(`Pin status updated.`);
      await fetchNotices();
    } catch (err: any) {
      alert(err?.message || "Failed to toggle pin.");
    }
  };

  const handleDelete = async () => {
    if (!noticeToDelete) return;

    if ((noticeToDelete as any).isLocalDraft) {
      const updated = localDrafts.filter((d) => d.id !== noticeToDelete.id);
      setLocalDrafts(updated);
      try {
        localStorage.setItem(draftsStorageKey, JSON.stringify(updated));
      } catch {}
      setActionSuccess("Local offline draft removed.");
      setNoticeToDelete(null);
      return;
    }

    if (isOffline) {
      alert("Deleting or archiving server notices cannot be performed offline. Verified server connectivity is required.");
      setNoticeToDelete(null);
      return;
    }

    try {
      const noticeId = String(noticeToDelete.id || (noticeToDelete as any)._id);
      await noticeService.deleteNotice(noticeId);
      setActionSuccess("Notice deleted/archived successfully.");
      setNoticeToDelete(null);
      await fetchNotices();
    } catch (err: any) {
      alert(err?.message || "Failed to delete notice from server.");
      setNoticeToDelete(null);
    }
  };

  const columns: Column<Notice>[] = [
    {
      key: "title",
      header: "Circular & Notice Title",
      sortable: true,
      render: (n) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            {n.isPinned && (
              <span className="p-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" title="Pinned Announcement">
                <Pin className="w-3.5 h-3.5" />
              </span>
            )}
            {n.priority === "High" && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="High Priority" />
            )}
            <span>{n.title}</span>
            {(n as any).isLocalDraft && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Local Draft
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{n.content}</div>
          {n.rejectionReason && n.status === "rejected" && (
            <div className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900 inline-block">
              Rejection: {n.rejectionReason}
            </div>
          )}
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
      key: "publishAt",
      header: "Publish Date",
      sortable: true,
      render: (n) => <span className="text-xs font-mono text-slate-500">{String(n.publishAt).split("T")[0]}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (n) => {
        if ((n as any).isLocalDraft) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" title="Unverified Local Draft — Offline Only">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              Offline Draft
            </span>
          );
        }
        return <StatusBadge status={n.status as ContentStatus} />;
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (n) => {
        const isAuthor = String(n.author?.userId) === String(currentUser.id);
        const canReview = !isAuthor && (isGlobalAdmin || currentUser.role === "hod");
        const isDraftLocal = !!(n as any).isLocalDraft;

        return (
          <div className="flex items-center justify-end gap-1">
            {/* Quick Toggle Pin (Server only) */}
            {!isDraftLocal && !isOffline && (
              <button
                onClick={() => handleTogglePin(n)}
                className={`p-1.5 rounded transition-colors ${
                  n.isPinned
                    ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={n.isPinned ? "Unpin notice" : "Pin notice to top"}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Submit for review button (draft or rejected, Server only) */}
            {(n.status === "draft" || n.status === "rejected") && !isDraftLocal && !isOffline && (
              <button
                onClick={() => handleSubmitForReview(n)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                title="Submit for Approval"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Approve Button (Server only) */}
            {n.status === "pending" && canReview && !isDraftLocal && !isOffline && (
              <button
                onClick={() => handleApprove(n)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                title="Approve Notice"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Reject Button (Server only) */}
            {n.status === "pending" && canReview && !isDraftLocal && !isOffline && (
              <button
                onClick={() => handleOpenRejectModal(n)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                title="Reject Notice"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Publish Button (Server only) */}
            {n.status === "approved" && (isGlobalAdmin || currentUser.permissions?.includes("notices:publish")) && !isDraftLocal && !isOffline && (
              <button
                onClick={() => handlePublish(n)}
                className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition-colors"
                title="Publish Now"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Edit Button (Available online and for local drafts) */}
            <button
              onClick={() => handleOpenEditor(n)}
              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Edit Notice"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* Delete Button (Deletes local draft or deletes server record if online) */}
            <button
              onClick={() => setNoticeToDelete(n)}
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
              title={isDraftLocal ? "Remove Local Draft" : "Delete or Archive Notice"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotices()}
              className="p-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh notices"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => handleOpenEditor()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Issue New Circular
            </button>
          </div>
        }
      />

      {/* Offline Mode Warning Banner */}
      {isOffline && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 rounded-xl text-sm font-medium flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Offline Storage Mode — Account Isolated</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Viewing unsynchronized local drafts for <span className="font-semibold">{currentUser.name}</span> ({currentUser.email}). Server verification is currently unavailable. Governance actions (review submission, approval, rejection, publishing) are disabled offline.
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchNotices()}
            className="self-start md:self-auto px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Retry Server
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {/* 1. Dashboard Metrics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total Notices", value: metrics?.total ?? displayNotices.length, color: "text-slate-900 dark:text-white" },
          { label: "Published", value: metrics?.published ?? displayNotices.filter((n) => n.status === "published" && !(n as any).isLocalDraft).length, color: "text-emerald-600" },
          { label: "Pending Review", value: metrics?.pending ?? displayNotices.filter((n) => n.status === "pending" && !(n as any).isLocalDraft).length, color: "text-amber-600" },
          { label: "Drafts", value: (metrics?.draft ?? 0) + localDrafts.length, color: "text-blue-600" },
          { label: "Scheduled", value: metrics?.scheduled ?? displayNotices.filter((n) => n.status === "scheduled" && !(n as any).isLocalDraft).length, color: "text-purple-600" },
          { label: "Archived", value: metrics?.archived ?? displayNotices.filter((n) => n.status === "archived" && !(n as any).isLocalDraft).length, color: "text-slate-500" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.label}</div>
            <div className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* 2. Priority & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Priority quick filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1">Priority:</span>
          {["all", "High", "Medium", "Low"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                priorityFilter === p
                  ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {p === "all" ? "All Priorities" : `${p} Priority`}
            </button>
          ))}
        </div>

        {/* Status quick filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1">Status:</span>
          {["all", "published", "pending", "draft", "scheduled", "rejected", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                statusFilter === st
                  ? "bg-amber-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Data Table */}
      <DataTable
        data={filteredNotices}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search notices, examination orders, circular subjects..."
        pageSize={10}
      />

      {/* 4. Editor Modal */}
      {isEditorOpen && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedNotice.id || selectedNotice._id ? "Edit Circular / Notice" : "Issue New Circular"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {isOffline && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-lg text-xs font-semibold">
                  Note: Offline mode is active. This notice will be saved exclusively in your account local drafts.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Circular Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={selectedNotice.title || ""}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, title: e.target.value })}
                  placeholder="e.g. End Semester Autonomous Examination Timetable — April 2026"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={selectedNotice.category || "General"}
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
                    value={selectedNotice.priority || "Medium"}
                    onChange={(e) => setSelectedNotice({ ...selectedNotice, priority: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="High">High (Flashing Indicator)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="Low">Low (Informational)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={selectedNotice.targetAudience || "All"}
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
                  value={selectedNotice.content || ""}
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
                    placeholder="https://example.com/circular.pdf"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={selectedNotice.publishAt ? String(selectedNotice.publishAt).split("T")[0] : ""}
                    onChange={(e) => setSelectedNotice({ ...selectedNotice, publishAt: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry / Auto-Archive Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={selectedNotice.expiresAt ? String(selectedNotice.expiresAt).split("T")[0] : ""}
                    onChange={(e) => setSelectedNotice({ ...selectedNotice, expiresAt: e.target.value || null })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selectedNotice.isPinned}
                      onChange={(e) => setSelectedNotice({ ...selectedNotice, isPinned: e.target.checked })}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    Pin to Top (Announcement Banner)
                  </label>
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
                  Save Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Rejection Reason Modal */}
      {rejectingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reject Notice Submission
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide an actionable rejection reason for &ldquo;{rejectingNotice.title}&rdquo;. The author will see this note to correct the submission.
            </p>

            {rejectionError && (
              <div className="text-xs text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/40 p-2 rounded border border-rose-200 dark:border-rose-900">
                {rejectionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rejection Reason *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setRejectionError(null);
                }}
                placeholder="e.g. Please verify fee due date with accounts cell and attach signed order."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingNotice(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!noticeToDelete}
        onClose={() => setNoticeToDelete(null)}
        onConfirm={handleDelete}
        title="Delete / Archive Notice"
        description={`Are you sure you want to delete "${noticeToDelete?.title}"?`}
        confirmText="Confirm Delete"
        variant="danger"
      />
    </div>
  );
}