"use client";

import React, { useState } from "react";
import { useCMSStore, AuditLogEntry } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { PageHeader } from "@/components/admin/core/page-header";
import { 
  History, Filter, Download, User, Activity, 
  Calendar, Layers, ShieldCheck, Database 
} from "lucide-react";

export function AuditLogsCMS() {
  const { auditLogs } = useCMSStore();
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const modules = Array.from(new Set(auditLogs.map((l) => l.module)));

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== "all" && log.action !== actionFilter) return false;
    if (moduleFilter !== "all" && log.module !== moduleFilter) return false;
    return true;
  });

  const exportAuditCSV = () => {
    const headers = ["Timestamp", "User", "Role", "Action", "Module", "Record Title", "Record ID"];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      `"${l.module}"`,
      `"${l.recordTitle}"`,
      l.recordId,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BAC_Audit_Trail_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actionStyles: Record<string, { bg: string; text: string }> = {
    CREATE: { bg: "bg-emerald-50 dark:bg-emerald-950/60", text: "text-emerald-700 dark:text-emerald-300" },
    UPDATE: { bg: "bg-blue-50 dark:bg-blue-950/60", text: "text-blue-700 dark:text-blue-300" },
    DELETE: { bg: "bg-rose-50 dark:bg-rose-950/60", text: "text-rose-700 dark:text-rose-300" },
    PUBLISH: { bg: "bg-purple-50 dark:bg-purple-950/60", text: "text-purple-700 dark:text-purple-300" },
    APPROVE: { bg: "bg-emerald-50 dark:bg-emerald-950/60", text: "text-emerald-700 dark:text-emerald-300" },
    REJECT: { bg: "bg-rose-50 dark:bg-rose-950/60", text: "text-rose-700 dark:text-rose-300" },
    LOGIN: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300" },
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      sortable: true,
      render: (l) => <span className="text-xs font-mono text-slate-500">{l.timestamp}</span>,
    },
    {
      key: "userName",
      header: "Administrator",
      sortable: true,
      render: (l) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-900 dark:text-white">{l.userName}</div>
          <div className="text-slate-400 capitalize">{l.userRole.replace("_", " ")}</div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Operation",
      sortable: true,
      render: (l) => {
        const s = actionStyles[l.action] || actionStyles.UPDATE;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-bold ${s.bg} ${s.text} border border-current/10`}>
            {l.action}
          </span>
        );
      },
    },
    {
      key: "module",
      header: "Target Module",
      sortable: true,
      render: (l) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          {l.module}
        </span>
      ),
    },
    {
      key: "recordTitle",
      header: "Affected Entity",
      render: (l) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{l.recordTitle}</div>
          <div className="text-slate-400 font-mono text-[10px]">ID: {l.recordId}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Security & Audit Log Stream"
        description="Tamper-evident audit trail capturing every administrative modification, page publish, approval, deletion, and user event."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "System", href: "#" },
          { label: "Audit Logs" },
        ]}
        actions={
          <button
            onClick={exportAuditCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Audit Trail (CSV)
          </button>
        }
      />

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Filter className="w-4 h-4 text-amber-500" />
          Filter Action:
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {["all", "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "PUBLISH"].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                actionFilter === act
                  ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              {act === "all" ? "All Actions" : act}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        searchKey="recordTitle"
        searchPlaceholder="Search audit logs by entity title or user..."
        pageSize={12}
      />
    </div>
  );
}
