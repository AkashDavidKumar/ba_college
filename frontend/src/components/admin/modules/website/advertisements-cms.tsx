"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCMSStore } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Megaphone,
  LayoutDashboard,
  ListFilter,
  Plus,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Advertisement, AdvertisementStats, CreateAdvertisementDto } from "@/types/advertisement";
import { advertisementService } from "@/lib/api/advertisement-service";
import { AdvertisementDashboard } from "./advertisements/advertisement-dashboard";
import { AdvertisementList } from "./advertisements/advertisement-list";
import { AdvertisementForm } from "./advertisements/advertisement-form";
import { AdvertisementPreviewModal } from "./advertisements/advertisement-preview-modal";

export function AdvertisementsCMS() {
  const { currentUser } = useCMSStore();
  const { toast } = useToast();

  // Role permissions
  const role = currentUser?.role || "staff";
  const canEdit = ["master_admin", "sub_admin", "content_editor"].includes(role);
  const canDelete = ["master_admin", "sub_admin"].includes(role);

  // Active view state: "dashboard" | "list" | "add" | "edit"
  const [activeTab, setActiveTab] = useState<"dashboard" | "list" | "add" | "edit">("dashboard");

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [stats, setStats] = useState<AdvertisementStats>({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    draft: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Editing & Deleting & Preview states
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deletingAd, setDeletingAd] = useState<Advertisement | null>(null);
  const [previewAd, setPreviewAd] = useState<Partial<Advertisement> | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await advertisementService.getAdvertisements();
      const currentStats = await advertisementService.getStats();
      setAdvertisements(data);
      setStats(currentStats);
    } catch (err) {
      toast({
        title: "Error Loading Advertisements",
        description: "Failed to fetch advertisement records.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleAddNew = () => {
    setEditingAd(null);
    setActiveTab("add");
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setActiveTab("edit");
  };

  const handlePreview = (ad: Partial<Advertisement>) => {
    setPreviewAd(ad);
    setIsPreviewOpen(true);
  };

  const handleSaveForm = async (dto: CreateAdvertisementDto, isDraft: boolean) => {
    try {
      if (editingAd) {
        await advertisementService.updateAdvertisement(editingAd.id, dto);
        toast({
          title: "Advertisement Updated",
          description: `Campaign '${dto.title}' has been successfully updated.`,
        });
      } else {
        await advertisementService.createAdvertisement(dto, currentUser?.name || "Admin");
        toast({
          title: isDraft ? "Draft Saved" : "Advertisement Published",
          description: `Campaign '${dto.title}' has been ${isDraft ? "saved as a draft" : "published"}.`,
        });
      }
      setEditingAd(null);
      setActiveTab("list");
      await loadData();
    } catch (err: any) {
      toast({
        title: "Operation Failed",
        description: err.message || "Failed to save advertisement.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (ad: Advertisement) => {
    const nextStatus = ad.status === "active" ? "inactive" : "active";
    try {
      await advertisementService.updateStatus(ad.id, nextStatus);
      toast({
        title: "Status Changed",
        description: `Advertisement status changed to ${nextStatus.toUpperCase()}.`,
      });
      await loadData();
    } catch (err) {
      toast({
        title: "Status Update Failed",
        description: "Could not update advertisement status.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAd) return;
    try {
      await advertisementService.deleteAdvertisement(deletingAd.id);
      toast({
        title: "Advertisement Deleted",
        description: `Campaign '${deletingAd.title}' has been removed.`,
      });
      setDeletingAd(null);
      await loadData();
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: "Could not delete advertisement.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Advertisement System Management"
        subtitle="Configure website popup overlays, promotional banners, timing countdowns, display schedules, and click performance."
        badge={`${stats.active} Active Popups`}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => {} },
          { label: "Website" },
          { label: "Advertisements" },
        ]}
        action={
          activeTab === "list" || activeTab === "dashboard"
            ? canEdit
              ? {
                  label: "Add Advertisement",
                  icon: Plus,
                  onClick: handleAddNew,
                }
              : undefined
            : {
                label: "Back to List",
                icon: ArrowLeft,
                variant: "secondary",
                onClick: () => {
                  setEditingAd(null);
                  setActiveTab("list");
                },
              }
        }
      />

      {/* Sub Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-[#009688] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-[#009688] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Advertisement List ({advertisements.length})</span>
          </button>

          {(activeTab === "add" || activeTab === "edit") && (
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-xs">
              <Megaphone className="w-4 h-4" />
              <span>{activeTab === "add" ? "New Advertisement" : "Edit Advertisement"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Tab Content Views */}
      {activeTab === "dashboard" && (
        <AdvertisementDashboard
          stats={stats}
          recentAds={advertisements}
          onAddNew={handleAddNew}
          onViewAll={() => setActiveTab("list")}
          onFilterStatus={() => setActiveTab("list")}
        />
      )}

      {activeTab === "list" && (
        <AdvertisementList
          advertisements={advertisements}
          isLoading={isLoading}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onToggleStatus={handleToggleStatus}
          onDeleteRequest={(ad) => setDeletingAd(ad)}
          onRefresh={loadData}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      {(activeTab === "add" || activeTab === "edit") && (
        <AdvertisementForm
          initialData={editingAd}
          onSave={handleSaveForm}
          onCancel={() => {
            setEditingAd(null);
            setActiveTab("list");
          }}
          onPreview={handlePreview}
        />
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationDialog
        open={Boolean(deletingAd)}
        onClose={() => setDeletingAd(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Advertisement?"
        description={`Are you sure you want to delete '${deletingAd?.title}'? This action cannot be undone.`}
        confirmLabel="Delete Campaign"
        confirmVariant="danger"
      />

      {/* Advertisement Live Preview Modal */}
      <AdvertisementPreviewModal
        ad={previewAd}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
