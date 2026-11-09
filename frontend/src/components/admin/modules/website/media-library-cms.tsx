"use client";

import React, { useState } from "react";
import { useCMSStore, MediaAsset } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { isSafeMediaUrl } from "@/lib/navigation-security";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Copy,
  Trash2,
  Edit,
  Search,
  Plus,
  ExternalLink,
  Tag,
  Folder,
} from "lucide-react";

export function MediaLibraryCMS() {
  const { mediaAssets, saveMediaAsset, deleteMediaAsset, currentUser } = useCMSStore();
  const { toast } = useToast();

  const canManageMedia =
    currentUser.role === "master_admin" ||
    currentUser.role === "sub_admin" ||
    currentUser.role === "hod" ||
    currentUser.role === "club_head" ||
    currentUser.permissions?.includes("media:manage") ||
    currentUser.permissions?.includes("media:create") ||
    currentUser.permissions?.includes("all") ||
    currentUser.permissions?.includes("*");

  const [activeTab, setActiveTab] = useState<"all" | "image" | "video" | "document" | "audio">("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    altText: "",
    description: "",
    fileType: "image" as "image" | "video" | "document" | "audio" | "other",
    url: "",
    thumbnailUrl: "",
    category: "Campus Life",
    tags: "",
  });

  const filtered = mediaAssets.filter((item) => {
    const assetType = item.mediaType || item.fileType;
    const matchesTab = activeTab === "all" || assetType === activeTab;
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.altText && item.altText.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.folder && item.folder.toLowerCase().includes(q)) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesTab && matchesQuery;
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: "External media URL copied to clipboard." });
  };

  const handleOpenCreate = () => {
    setEditingAsset(null);
    setForm({
      title: "",
      altText: "",
      description: "",
      fileType: "image",
      url: "",
      thumbnailUrl: "",
      category: "Campus Life",
      tags: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (asset: MediaAsset) => {
    setEditingAsset(asset);
    setForm({
      title: asset.title,
      altText: asset.altText || "",
      description: asset.description || "",
      fileType: (asset.mediaType || asset.fileType || "image") as any,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl || "",
      category: asset.folder || asset.category || "Campus Life",
      tags: (asset.tags || []).join(", "),
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast({ title: "Validation Error", description: "Asset title is required.", variant: "destructive" });
      return;
    }
    if (!form.url.trim()) {
      toast({ title: "Validation Error", description: "External media URL is required.", variant: "destructive" });
      return;
    }
    if (!isSafeMediaUrl(form.url)) {
      toast({
        title: "Security Validation Error",
        description: "Media URL must be a valid external HTTPS URL (or HTTP for verified institutional domains: bac.edu.in, b-u.ac.in). Dangerous schemes are prohibited.",
        variant: "destructive",
      });
      return;
    }
    if (form.thumbnailUrl && !isSafeMediaUrl(form.thumbnailUrl)) {
      toast({
        title: "Security Validation Error",
        description: "Thumbnail URL must be a valid external HTTPS URL (or HTTP for verified institutional domains: bac.edu.in, b-u.ac.in).",
        variant: "destructive",
      });
      return;
    }

    const tagArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingAsset) {
      saveMediaAsset(
        {
          id: editingAsset.id,
          title: form.title.trim(),
          altText: form.altText.trim() || form.title.trim(),
          description: form.description.trim(),
          fileType: form.fileType,
          mediaType: form.fileType,
          url: form.url.trim(),
          thumbnailUrl: form.thumbnailUrl.trim() || undefined,
          category: form.category,
          folder: form.category,
          tags: tagArray,
        },
        false
      );
      toast({ title: "Media Updated", description: `Updated '${form.title}'.` });
    } else {
      saveMediaAsset(
        {
          title: form.title.trim(),
          altText: form.altText.trim() || form.title.trim(),
          description: form.description.trim(),
          fileType: form.fileType,
          mediaType: form.fileType,
          url: form.url.trim(),
          thumbnailUrl: form.thumbnailUrl.trim() || undefined,
          category: form.category,
          folder: form.category,
          tags: tagArray,
          mimeType:
            form.fileType === "image"
              ? "image/jpeg"
              : form.fileType === "video"
              ? "video/mp4"
              : "application/pdf",
        },
        true
      );
      toast({ title: "Media Registered", description: `External media '${form.title}' added to library.` });
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Centralized Media Library"
        subtitle="Register external URLs, search, organize, and copy URLs for all images, videos, and graphic assets used across Bishop Ambrose College."
        badge={`${mediaAssets.length} Assets`}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => {} },
          { label: "Website" },
          { label: "Media Library" },
        ]}
        action={{
          label: "Register External Media",
          icon: Plus,
          onClick: handleOpenCreate,
        }}
      />

      {/* Filter and search bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "all", label: "All Media", icon: ImageIcon },
            { id: "image", label: "Images", icon: ImageIcon },
            { id: "video", label: "Videos", icon: Video },
            { id: "document", label: "Documents", icon: FileText },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === t.id ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search assets by title, category, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
          />
        </div>
      </div>

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">No media assets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Register external URLs for campus photos, videos, or documents to make them available across the CMS.
          </p>
          {canManageMedia && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-[#009688] text-white rounded-xl text-xs font-bold hover:bg-[#00796b] cursor-pointer"
            >
              Register First Media Asset
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((asset) => {
            const assetType = asset.mediaType || asset.fileType;
            return (
              <div
                key={asset.id}
                className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-slate-100 overflow-hidden flex items-center justify-center">
                  {assetType === "image" ? (
                    <img
                      src={asset.url}
                      alt={asset.altText || asset.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                        const parent = (e.currentTarget as HTMLElement).parentElement;
                        if (parent) {
                          const fallback = document.createElement("div");
                          fallback.className = "text-[11px] text-slate-400 p-2 text-center";
                          fallback.textContent = "External image unavailable";
                          parent.appendChild(fallback);
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                      {assetType === "video" ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold uppercase backdrop-blur-xs">
                    {assetType}
                  </span>
                  {asset.status === "archived" && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-bold uppercase">
                      Archived
                    </span>
                  )}
                </div>

                <div className="p-3.5 space-y-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 truncate" title={asset.title}>
                      {asset.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{asset.url}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[100px]">
                      {asset.folder || asset.category || "General"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyUrl(asset.url)}
                        title="Copy External URL"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {canManageMedia && (
                        <button
                          onClick={() => handleOpenEdit(asset)}
                          title="Edit Metadata"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canManageMedia && (
                        <button
                          onClick={() => setDeleteId(asset.id)}
                          title="Remove Asset"
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration & Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 font-serif">
              {editingAsset ? "Edit Media Asset Metadata" : "Register External Media URL"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campus Quadrangle & Academic Blocks"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Alt Text (Accessibility) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Students in front of main academic building"
                  value={form.altText}
                  onChange={(e) => setForm({ ...form, altText: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Externally Hosted Media URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/images/campus.jpg"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Media Type
                  </label>
                  <select
                    value={form.fileType}
                    onChange={(e) => setForm({ ...form, fileType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="image">Image (JPG, PNG, WebP)</option>
                    <option value="video">Video (MP4, YouTube)</option>
                    <option value="document">Document (PDF)</option>
                    <option value="audio">Audio (MP3, WAV)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category / Folder
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option>Campus Life</option>
                    <option>Academics</option>
                    <option>Cultural Events</option>
                    <option>Sports & Athletics</option>
                    <option>Infrastructure</option>
                    <option>Faculty</option>
                    <option>General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="campus, students, lab, 2026"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#009688] hover:bg-[#00796b] shadow-xs cursor-pointer"
              >
                {editingAsset ? "Save Changes" : "Register Media Asset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Archival Confirmation Modal */}
      <ConfirmationDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMediaAsset(deleteId);
            toast({ title: "Deleted", description: "Media asset reference removed." });
          }
        }}
        title="Remove Media Asset"
        description="Are you sure you want to remove this media reference? If this media URL is currently used by published pages, deletion may be blocked or safely soft-archived."
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </div>
  );
}
