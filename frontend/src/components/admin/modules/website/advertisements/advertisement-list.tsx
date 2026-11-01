"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Megaphone,
  RefreshCw,
} from "lucide-react";
import { Advertisement, AdvertisementStatus } from "@/types/advertisement";
import { cn } from "@/lib/utils";

interface AdvertisementListProps {
  advertisements: Advertisement[];
  isLoading: boolean;
  onAddNew: () => void;
  onEdit: (ad: Advertisement) => void;
  onPreview: (ad: Advertisement) => void;
  onToggleStatus: (ad: Advertisement) => void;
  onDeleteRequest: (ad: Advertisement) => void;
  onRefresh: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function AdvertisementList({
  advertisements,
  isLoading,
  onAddNew,
  onEdit,
  onPreview,
  onToggleStatus,
  onDeleteRequest,
  onRefresh,
  canEdit,
  canDelete,
}: AdvertisementListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter advertisements
  const filtered = advertisements.filter((ad) => {
    const matchesSearch =
      search.trim() === "" ||
      ad.title.toLowerCase().includes(search.toLowerCase()) ||
      (ad.description && ad.description.toLowerCase().includes(search.toLowerCase())) ||
      (ad.displayPosition && ad.displayPosition.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;

    const matchesDate =
      !dateFilter ||
      ad.startDate.startsWith(dateFilter) ||
      ad.endDate.startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination math
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAds = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: AdvertisementStatus) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Active
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" />
            Expired
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Draft
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700">
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
      {/* Header controls & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search advertisements by title, position..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-hidden cursor-pointer text-xs"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="text-slate-400 hover:text-slate-600 text-xs ml-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Refresh List"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Add Advertisement Button */}
          {canEdit && (
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Advertisement</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Fetching advertisement records...</p>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
          <Megaphone className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No advertisements match your criteria</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, status filters, or create a new campaign.
            </p>
          </div>
          {canEdit && (
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700 transition-all cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Advertisement</span>
            </button>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Banner</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Schedule Dates</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedAds.map((ad) => (
                <tr
                  key={ad.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Thumbnail Image */}
                  <td className="py-3 px-4">
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0">
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                  </td>

                  {/* Title & Info */}
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {ad.title}
                    </p>
                    {ad.destinationUrl ? (
                      <a
                        href={ad.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span className="truncate max-w-[180px]">{ad.destinationUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400">No URL link configured</span>
                    )}
                  </td>

                  {/* Display Position */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {ad.displayPosition === "popup_overlay" ? "Popup Overlay" : ad.displayPosition}
                    </span>
                  </td>

                  {/* Start & End Dates */}
                  <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <div>Start: <strong className="text-slate-800 dark:text-slate-200">{ad.startDate.replace("T", " ")}</strong></div>
                    <div>End: <strong className="text-slate-800 dark:text-slate-200">{ad.endDate.replace("T", " ")}</strong></div>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      {ad.displayDuration}s
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 text-center">
                    <span className="font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                      #{ad.priority}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    {getStatusBadge(ad.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Preview Action */}
                      <button
                        onClick={() => onPreview(ad)}
                        title="Live Preview"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Action */}
                      {canEdit && (
                        <button
                          onClick={() => onEdit(ad)}
                          title="Edit Advertisement"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Activate / Deactivate Toggle */}
                      {canEdit && (
                        <button
                          onClick={() => onToggleStatus(ad)}
                          title={ad.status === "active" ? "Deactivate Ad" : "Activate Ad"}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors cursor-pointer",
                            ad.status === "active"
                              ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Action */}
                      {canDelete && (
                        <button
                          onClick={() => onDeleteRequest(ad)}
                          title="Delete Advertisement"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong>{startIndex + 1}</strong> to{" "}
            <strong>{Math.min(startIndex + itemsPerPage, filtered.length)}</strong> of{" "}
            <strong>{filtered.length}</strong> advertisements
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-3 py-1 text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
