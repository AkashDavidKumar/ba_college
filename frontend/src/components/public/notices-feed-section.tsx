"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { noticeService } from "@/lib/api/notice-service";
import type { PublicNotice, NoticeCategoryCount } from "@/types/notice";
import {
  Bell,
  Search,
  Filter,
  FileText,
  Download,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Pin,
  Clock,
  Sparkles,
  Eye,
  RefreshCw,
  X,
  ShieldCheck,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "General",
  "Examination",
  "Academic",
  "Admissions",
  "Fee",
  "Holiday",
  "Emergency",
] as const;

export function NoticesFeedSection() {
  const [notices, setNotices] = useState<PublicNotice[]>([]);
  const [pinnedNotices, setPinnedNotices] = useState<PublicNotice[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<NoticeCategoryCount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNotice, setSelectedNotice] = useState<PublicNotice | null>(null);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchPublicData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listRes, pinnedRes, catRes] = await Promise.all([
        noticeService.getPublicNotices({
          page,
          limit: 9,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
        }),
        noticeService.getPublicPinnedNotices().catch(() => ({ success: true, data: [] })),
        noticeService.getPublicCategories().catch(() => ({ success: true, data: [] })),
      ]);

      if (listRes && listRes.data) {
        setNotices(listRes.data);
        if (listRes.pagination) {
          setTotalPages(listRes.pagination.totalPages);
        }
      }
      if (pinnedRes && pinnedRes.data) {
        setPinnedNotices(pinnedRes.data);
      }
      if (catRes && catRes.data) {
        setCategoryCounts(catRes.data);
      }
    } catch (err: any) {
      console.warn("Public notices fetch failed:", err);
      setError(err?.message || "Unable to load campus notices at this time. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  const handleOpenNotice = async (notice: PublicNotice) => {
    setSelectedNotice(notice);
    // Optionally refetch single notice to trigger view count increment
    try {
      const res = await noticeService.getPublicNotice(notice.slug || notice.id);
      if (res && res.data) {
        setSelectedNotice(res.data);
      }
    } catch {
      // keep current notice
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Urgent / High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
            Standard
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Informational
          </span>
        );
    }
  };

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3">
            <Bell className="w-3.5 h-3.5" />
            Official Campus Circulars
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Notices & Circular Board
          </h2>
          <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
            Real-time official announcements, autonomous examination orders, academic timetables, and fee payment circulars from Bishop Ambrose College.
          </p>
        </div>

        {/* 1. Flash Pinned Announcements Banner */}
        {pinnedNotices.length > 0 && (
          <div className="mb-8 p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <Pin className="w-4 h-4" />
              Pinned Announcements
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pinnedNotices.map((pn) => (
                <div
                  key={pn.id}
                  onClick={() => handleOpenNotice(pn)}
                  className="p-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0">
                      <FileText className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                        {pn.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{String(pn.publishAt).split("T")[0]}</span>
                        <span>•</span>
                        <span className="font-semibold text-amber-600">{pn.category}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Controls & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const countItem = categoryCounts.find((c) => c.category === cat);
              const count = countItem ? countItem.count : null;
              const isActive = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-400"
                  }`}
                >
                  {cat} {count !== null && <span className="opacity-70 text-[10px] ml-1">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search circulars, exams, fees..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 3. Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* 4. Error State */}
        {!isLoading && error && (
          <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl max-w-xl mx-auto my-8">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">Unable to Load Circulars</h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{error}</p>
            <button
              onClick={() => fetchPublicData()}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        )}

        {/* 5. Empty State */}
        {!isLoading && !error && notices.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl mx-auto my-8">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Circulars Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              There are no active notices matching your selected category &ldquo;{selectedCategory}&rdquo; or search query.
            </p>
            {(selectedCategory !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-4 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* 6. Notices Grid */}
        {!isLoading && !error && notices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {n.category}
                    </span>
                    {getPriorityBadge(n.priority)}
                  </div>

                  <h3
                    onClick={() => handleOpenNotice(n)}
                    className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors cursor-pointer line-clamp-2"
                  >
                    {n.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {n.summary || n.content}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{String(n.publishAt).split("T")[0]}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {n.attachmentUrl && (
                      <a
                        href={n.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-amber-600 hover:text-amber-700 rounded hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        title="Download PDF attachment"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenNotice(n)}
                      className="inline-flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700"
                    >
                      <span>Read</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 7. Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        {/* 8. Notice Detail Modal */}
        <AnimatePresence>
          {selectedNotice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6"
              >
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {selectedNotice.category}
                      </span>
                      {getPriorityBadge(selectedNotice.priority)}
                    </div>
                    <h2 className="text-lg md:text-xl font-bold font-serif text-slate-900 dark:text-white">
                      {selectedNotice.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Metadata row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block text-[11px] text-slate-400">Date Issued</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {String(selectedNotice.publishAt).split("T")[0]}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">Audience</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedNotice.targetAudience}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">Department</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                      {selectedNotice.departmentId || "Campus Wide"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400">Views</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedNotice.viewsCount ?? 1}
                    </span>
                  </div>
                </div>

                {/* Full Body Content */}
                <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed py-2">
                  {selectedNotice.content}
                </div>

                {/* PDF Download attachment button */}
                {selectedNotice.attachmentUrl && (
                  <div className="mt-5 p-4 border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-amber-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Official Signed Circular Document
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {selectedNotice.attachmentName || "Download PDF circular"}
                        </div>
                      </div>
                    </div>
                    <a
                      href={selectedNotice.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Circular
                    </a>
                  </div>
                )}

                {/* Institutional verification badge */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Officially Issued — Bishop Ambrose College</span>
                  </div>
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-md font-semibold"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
