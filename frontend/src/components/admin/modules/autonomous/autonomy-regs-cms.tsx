"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  FileCheck2, Plus, Download, Trash2, Edit3, 
  ShieldCheck, Landmark, CheckCircle 
} from "lucide-react";

interface AutonomyOrder {
  id: string;
  orderNumber: string;
  issuingAuthority: "UGC New Delhi" | "Bharathiar University" | "Govt of Tamil Nadu" | "Autonomous Governance";
  title: string;
  validityPeriod: string;
  effectiveFrom: string;
  fileUrl: string;
  fileSize: string;
  status: ContentStatus;
}

const INITIAL_AUTONOMY_ORDERS: AutonomyOrder[] = [
  {
    id: "ao-1",
    orderNumber: "UGC/F.22-1/2024(AC)",
    issuingAuthority: "UGC New Delhi",
    title: "UGC Notification Conferring Fresh Autonomous Status to Bishop Ambrose College",
    validityPeriod: "2024–2025 to 2033–2034 (10 Years)",
    effectiveFrom: "2024-06-01",
    fileUrl: "/documents/autonomous/UGC_Fresh_Autonomy_Order_2024.pdf",
    fileSize: "2.4 MB",
    status: "published",
  },
  {
    id: "ao-2",
    orderNumber: "BU/R/A1-A/2024/7821",
    issuingAuthority: "Bharathiar University",
    title: "Bharathiar University Syndicate Resolution on Autonomous Affiliation",
    validityPeriod: "Permanent Affiliation",
    effectiveFrom: "2024-06-15",
    fileUrl: "/documents/autonomous/BU_Syndicate_Autonomy_Order_2024.pdf",
    fileSize: "1.8 MB",
    status: "published",
  },
  {
    id: "ao-3",
    orderNumber: "BAC/AUT/HB-2024/01",
    issuingAuthority: "Autonomous Governance",
    title: "Bishop Ambrose College Autonomous Rules, Regulations & OBE Handbook 2024",
    validityPeriod: "Regulation 2024",
    effectiveFrom: "2024-07-01",
    fileUrl: "/documents/autonomous/Autonomous_Rules_Regulations_Handbook_2024.pdf",
    fileSize: "5.6 MB",
    status: "published",
  },
];

export function AutonomyRegsCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [orders, setOrders] = useState<AutonomyOrder[]>(INITIAL_AUTONOMY_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<AutonomyOrder | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<AutonomyOrder | null>(null);

  const handleOpenEditor = (ord?: AutonomyOrder) => {
    if (ord) {
      setSelectedOrder(ord);
    } else {
      setSelectedOrder({
        id: "ao-" + Date.now(),
        orderNumber: "",
        issuingAuthority: "UGC New Delhi",
        title: "",
        validityPeriod: "2024–2034",
        effectiveFrom: new Date().toISOString().split("T")[0],
        fileUrl: "/documents/autonomous/order.pdf",
        fileSize: "2.0 MB",
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (orders.some((o) => o.id === selectedOrder.id)) {
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? selectedOrder : o)));
      logAction({
        action: "UPDATE",
        module: "UGC Autonomy Statutory Orders",
        recordId: selectedOrder.id,
        recordTitle: selectedOrder.title,
      });
    } else {
      setOrders((prev) => [selectedOrder, ...prev]);
      logAction({
        action: "CREATE",
        module: "UGC Autonomy Statutory Orders",
        recordId: selectedOrder.id,
        recordTitle: selectedOrder.title,
      });
    }
    setIsEditorOpen(false);
    setSelectedOrder(null);
  };

  const handleDelete = () => {
    if (!orderToDelete) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
    logAction({
      action: "DELETE",
      module: "UGC Autonomy Statutory Orders",
      recordId: orderToDelete.id,
      recordTitle: orderToDelete.title,
    });
    setOrderToDelete(null);
  };

  const columns: Column<AutonomyOrder>[] = [
    {
      key: "title",
      header: "Statutory Autonomy Order / Handbook",
      sortable: true,
      render: (o) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {o.title}
          </div>
          <div className="text-xs text-amber-600 font-mono mt-0.5">{o.orderNumber}</div>
        </div>
      ),
    },
    {
      key: "issuingAuthority",
      header: "Issuing Authority",
      sortable: true,
      render: (o) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {o.issuingAuthority}
        </span>
      ),
    },
    {
      key: "validityPeriod",
      header: "Tenure / Period",
      render: (o) => <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{o.validityPeriod}</span>,
    },
    {
      key: "effectiveFrom",
      header: "Effective Date",
      sortable: true,
      render: (o) => <span className="text-xs font-mono text-slate-500">{o.effectiveFrom}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (o) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(o)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Order"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setOrderToDelete(o)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Order"
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
        title="UGC Autonomy Orders & University Affiliation Orders"
        description="Public statutory repository for UGC Autonomy notifications, Bharathiar University resolutions, and autonomy handbooks."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Autonomous", href: "#" },
          { label: "Orders & Handbook" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Upload Autonomy Order
          </button>
        }
      />

      <DataTable
        data={orders}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search autonomy orders or handbook..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {orders.some((o) => o.id === selectedOrder.id) ? "Edit Autonomy Order" : "Upload Autonomy Order"}
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
                  Order / Handbook Title *
                </label>
                <input
                  type="text"
                  required
                  value={selectedOrder.title}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, title: e.target.value })}
                  placeholder="e.g. UGC Notification Conferring Fresh Autonomous Status"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedOrder.orderNumber}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, orderNumber: e.target.value })}
                    placeholder="e.g. UGC/F.22-1/2024(AC)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Issuing Authority *
                  </label>
                  <select
                    value={selectedOrder.issuingAuthority}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, issuingAuthority: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="UGC New Delhi">UGC New Delhi</option>
                    <option value="Bharathiar University">Bharathiar University</option>
                    <option value="Govt of Tamil Nadu">Govt of Tamil Nadu (DOTE/TNDCE)</option>
                    <option value="Autonomous Governance">Autonomous Governance Handbook</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Validity Period *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedOrder.validityPeriod}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, validityPeriod: e.target.value })}
                    placeholder="e.g. 2024–2034 (10 Years)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Effective From Date
                  </label>
                  <input
                    type="date"
                    value={selectedOrder.effectiveFrom}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, effectiveFrom: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PDF File URL *
                </label>
                <input
                  type="text"
                  required
                  value={selectedOrder.fileUrl}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, fileUrl: e.target.value })}
                  placeholder="/documents/autonomous/order.pdf"
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
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Autonomy Order"
        description={`Are you sure you want to delete ${orderToDelete?.title}?`}
        confirmText="Delete Order"
        variant="danger"
      />
    </div>
  );
}
