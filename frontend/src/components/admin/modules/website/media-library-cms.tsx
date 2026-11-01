"use client";

import React, { useState } from "react";
import { useCMSStore, MediaAsset } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Copy,
  Trash2,
  Search,
  CheckCircle2,
  ExternalLink,
  Plus,
} from "lucide-react";

export function MediaLibraryCMS() {
  const { mediaAssets, saveMediaAsset, deleteMediaAsset } = useCMSStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"all" | "image" | "video" | "document">("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    fileName: "",
    fileType: "image" as "image" | "video" | "document",
    url: "",
    category: "Campus Life",
    altText: "",
  });

  const filtered = mediaAssets.filter((item) => {
    const matchesTab = activeTab === "all" || item.fileType === activeTab;
    const matchesQuery =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.fileName.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: "Asset URL copied to clipboard." });
  };

  const handleSaveUpload = () => {
    if (!uploadForm.title.trim() || !uploadForm.url.trim()) {
      toast({ title: "Validation Error", description: "Title and URL are required.", variant: "destructive" });
      return;
    }
    saveMediaAsset({
      ...uploadForm,
      size: "1.5 MB",
      mimeType: uploadForm.fileType === "image" ? "image/jpeg" : uploadForm.fileType === "video" ? "video/mp4" : "application/pdf",
    }, true);
    toast({ title: "Uploaded", description: `Asset '${uploadForm.title}' added to library.` });
    setModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Centralized Media Library"
        subtitle="Upload, search, organize, and copy URLs for all images, videos, and graphic assets used across Bishop Ambrose College."
        badge={`${mediaAssets.length} Assets`}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => {} },
          { label: "Website" },
          { label: "Media Library" },
        ]}
        action={{
          label: "Upload Asset",
          icon: Upload,
          onClick: () => setModalOpen(true),
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
            placeholder="Search assets by title or tag..."
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
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Upload campus photos, auditorium videos, or certificates to make them available across the CMS.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#009688] text-white rounded-xl text-xs font-bold hover:bg-[#00796b]"
          >
            Upload First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-video bg-slate-100 overflow-hidden flex items-center justify-center">
                {asset.fileType === "image" ? (
                  <img
                    src={asset.url}
                    alt={asset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                    {asset.fileType === "video" ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold uppercase backdrop-blur-xs">
                  {asset.fileType}
                </span>
              </div>

              <div className="p-3.5 space-y-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 truncate" title={asset.title}>
                    {asset.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{asset.fileName}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{asset.size}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyUrl(asset.url)}
                      title="Copy URL"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(asset.id)}
                      title="Delete Asset"
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 font-serif">Upload Asset to Media Library</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Laboratory Students"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Asset URL / File Source *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... or /uploads/..."
                  value={uploadForm.url}
                  onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value, fileName: e.target.value.split("/").pop() || "asset.jpg" })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Asset Type
                  </label>
                  <select
                    value={uploadForm.fileType}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="image">Image (JPG, PNG)</option>
                    <option value="video">Video (MP4, YouTube)</option>
                    <option value="document">Document (PDF)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option>Campus Life</option>
                    <option>Academics</option>
                    <option>Cultural Events</option>
                    <option>Sports & Athletics</option>
                    <option>Infrastructure</option>
                  </select>
                </div>
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
                onClick={handleSaveUpload}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#009688] hover:bg-[#00796b] shadow-xs cursor-pointer"
              >
                Upload Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMediaAsset(deleteId);
            toast({ title: "Deleted", description: "Media asset removed." });
          }
        }}
        title="Delete Media Asset"
        description="Are you sure you want to delete this media asset? Any pages embedding this asset URL may need to be updated."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
