"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
  className?: string;
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search records...",
  filterKey,
  filterOptions = [],
  filterLabel = "Filter",
  bulkActions,
  onRowClick,
  pageSize = 10,
  emptyTitle = "No records found",
  emptyDescription = "There are no matching items to display.",
  emptyActionLabel,
  onEmptyAction,
}: {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterKey?: string;
  filterOptions?: { label: string; value: string }[];
  filterLabel?: string;
  bulkActions?: {
    label: string;
    icon?: React.ElementType;
    onClick: (selected: T[]) => void;
    variant?: "danger" | "primary";
  }[];
  onRowClick?: (item: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterVal, setFilterVal] = useState("all");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 1. Filter & Search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        if (searchKey) {
          const val = String(item[searchKey] || "").toLowerCase();
          if (!val.includes(query)) return false;
        } else {
          // Search across all string values
          const hasMatch = Object.values(item).some((v) =>
            typeof v === "string" ? v.toLowerCase().includes(query) : false
          );
          if (!hasMatch) return false;
        }
      }

      // Dropdown Filter
      if (filterKey && filterVal !== "all") {
        if (String(item[filterKey]) !== filterVal) return false;
      }

      return true;
    });
  }, [data, search, searchKey, filterKey, filterVal]);

  // 2. Sort
  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const res = aVal > bVal ? 1 : -1;
      return sortDir === "asc" ? res : -res;
    });
  }, [filteredData, sortCol, sortDir]);

  // 3. Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (colKey: string) => {
    if (sortCol === colKey) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortCol(null);
        setSortDir("asc");
      }
    } else {
      setSortCol(colKey);
      setSortDir("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map((d, i) => d.id || String(i)));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedItems = useMemo(() => {
    return data.filter((d, i) => selectedIds.has(d.id || String(i)));
  }, [data, selectedIds]);

  // 4. CSV Export
  const handleExportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map((c) => c.header).join(",");
    const rows = sortedData.map((row) =>
      columns
        .map((c) => {
          const val = row[c.key];
          return typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val ?? "";
        })
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search & Filter */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:border-slate-800 focus:outline-none transition-colors"
            />
          </div>

          {filterKey && filterOptions.length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={filterVal}
                onChange={(e) => {
                  setFilterVal(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:border-slate-800 focus:outline-none"
              >
                <option value="all">All {filterLabel}</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Bulk Actions & Export */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {bulkActions && selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs text-slate-500 font-semibold">{selectedIds.size} selected:</span>
              {bulkActions.map((b, idx) => (
                <button
                  key={idx}
                  onClick={() => b.onClick(selectedItems)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer",
                    b.variant === "danger"
                      ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  )}
                >
                  {b.icon && <b.icon className="w-3.5 h-3.5" />}
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleExportCSV}
            title="Export to CSV"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-xs font-medium flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      {paginatedData.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {bulkActions && (
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={cn(
                      "p-3.5 whitespace-nowrap",
                      col.sortable && "cursor-pointer select-none hover:text-slate-800",
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span>
                          {sortCol === col.key ? (
                            sortDir === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-900" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-900" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedData.map((row, idx) => {
                const rowId = row.id || String(idx);
                const isSelected = selectedIds.has(rowId);
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors",
                      isSelected && "bg-slate-50/90",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {bulkActions && (
                      <td
                        className="p-3.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(rowId)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-0"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={cn("p-3.5 align-middle", col.className)}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {sortedData.length > 0 && (
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-slate-800">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </strong>{" "}
            of <strong className="text-slate-800">{sortedData.length}</strong> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
