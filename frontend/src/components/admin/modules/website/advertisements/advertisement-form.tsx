"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  Link,
  Eye,
  Save,
  X,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileEdit,
} from "lucide-react";
import { Advertisement, CreateAdvertisementDto } from "@/types/advertisement";
import { cn } from "@/lib/utils";

interface AdvertisementFormProps {
  initialData?: Advertisement | null;
  onSave: (data: CreateAdvertisementDto, isDraft: boolean) => Promise<void>;
  onCancel: () => void;
  onPreview: (adData: Partial<Advertisement>) => void;
}

const PRESET_IMAGES = [
  {
    title: "Campus & Admissions",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Tech Event & Summit",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Scholarship & Excellence",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Cultural Fest & Arts",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  },
];

export function AdvertisementForm({
  initialData,
  onSave,
  onCancel,
  onPreview,
}: AdvertisementFormProps) {
  const isEdit = Boolean(initialData);

  // Form State
  const [formData, setFormData] = useState<CreateAdvertisementDto>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    imageAltText: initialData?.imageAltText || "",
    destinationUrl: initialData?.destinationUrl || "",
    openInNewTab: initialData?.openInNewTab ?? true,
    startDate: initialData?.startDate || new Date().toISOString().slice(0, 16),
    endDate:
      initialData?.endDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    displayDuration: initialData?.displayDuration || 10,
    displayFrequency: initialData?.displayFrequency || "once_per_session",
    displayPosition: initialData?.displayPosition || "popup_overlay",
    priority: initialData?.priority || 1,
    status: initialData?.status || "active",
  });

  // Validation Error State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        imageUrl: initialData.imageUrl,
        imageAltText: initialData.imageAltText || "",
        destinationUrl: initialData.destinationUrl || "",
        openInNewTab: initialData.openInNewTab,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        displayDuration: initialData.displayDuration,
        displayFrequency: initialData.displayFrequency,
        displayPosition: initialData.displayPosition,
        priority: initialData.priority,
        status: initialData.status,
      });
    }
  }, [initialData]);

  // Validation logic
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) {
      errs.title = "Advertisement title is required.";
    }

    if (!formData.imageUrl.trim()) {
      errs.imageUrl = "Advertisement image URL or banner file is required.";
    } else {
      // Validate image URL format or valid protocol/data uri
      const validExtension = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(formData.imageUrl);
      const isHttpOrData = /^https?:\/\//i.test(formData.imageUrl) || /^data:image\//i.test(formData.imageUrl);
      if (!isHttpOrData && !validExtension) {
        errs.imageUrl = "Please enter a valid image URL ending with .jpg, .png, .webp, .gif, or .svg";
      }
    }

    if (!formData.startDate) {
      errs.startDate = "Start date and time is required.";
    }

    if (!formData.endDate) {
      errs.endDate = "End date and time is required.";
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      errs.endDate = "End date must be after the start date.";
    }

    if (!formData.displayDuration || formData.displayDuration <= 0) {
      errs.displayDuration = "Duration must be at least 1 second.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Drag and Drop Image File
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: "Unsupported file type. Allowed: JPG, PNG, WEBP, GIF, SVG.",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: event.target?.result as string,
        }));
        setErrors((prev) => ({ ...prev, imageUrl: "" }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const finalDto = {
        ...formData,
        status: isDraft ? "draft" : formData.status,
      };
      await onSave(finalDto, isDraft);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerPreview = () => {
    onPreview({
      ...formData,
      id: initialData?.id || "preview-temp-id",
    });
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e, false)}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6"
    >
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-600" />
            <span>{isEdit ? "Edit Advertisement" : "Create New Advertisement"}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure advertisement details, popup duration, schedules, and destination link
          </p>
        </div>

        <button
          type="button"
          onClick={handleTriggerPreview}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4 text-amber-500" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column — Title, Description & Links */}
        <div className="space-y-4">
          {/* Advertisement Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Advertisement Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Admissions 2026-27 Open — Apply Now"
              className={cn(
                "w-full text-xs px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all",
                errors.title
                  ? "border-rose-400 focus:ring-rose-500"
                  : "border-slate-200 dark:border-slate-700 focus:ring-amber-500"
              )}
            />
            {errors.title && <p className="text-[11px] text-rose-500 font-medium">{errors.title}</p>}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Description / Subtitle <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Provide brief details or highlights for visitors..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Destination URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Destination URL <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.destinationUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, destinationUrl: e.target.value }))}
                placeholder="https://admissions.bishopambrose.edu.in or /events"
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Open Link Target & Alt Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Open Link Target
              </label>
              <select
                value={formData.openInNewTab ? "new_tab" : "same_tab"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, openInNewTab: e.target.value === "new_tab" }))
                }
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="new_tab">Open in New Tab (_blank)</option>
                <option value="same_tab">Open in Same Tab (_self)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Image Alt Text
              </label>
              <input
                type="text"
                value={formData.imageAltText}
                onChange={(e) => setFormData((prev) => ({ ...prev, imageAltText: e.target.value }))}
                placeholder="Banner description for accessibility"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column — Image Upload & Image Preview */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Advertisement Banner Image <span className="text-rose-500">*</span>
            </label>

            {/* Image Upload Drag and Drop box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center min-h-[140px]",
                isDragOver
                  ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                  : errors.imageUrl
                  ? "border-rose-300 dark:border-rose-800 bg-rose-50/30"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
              )}
            >
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Drag & drop banner image here, or{" "}
                <label className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                  browse file
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, WEBP, GIF, SVG (Max 5MB)</p>
            </div>
            {errors.imageUrl && <p className="text-[11px] text-rose-500 font-medium">{errors.imageUrl}</p>}
          </div>

          {/* Image URL Manual Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Or Paste Hosted Image URL
            </label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, imageUrl: e.target.value }));
                setErrors((prev) => ({ ...prev, imageUrl: "" }));
              }}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Preset Images Quick Picks */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">Quick Select Sample Banners:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, imageUrl: preset.url }));
                    setErrors((prev) => ({ ...prev, imageUrl: "" }));
                  }}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500 overflow-hidden text-left bg-slate-900 group cursor-pointer"
                >
                  <img src={preset.url} alt={preset.title} className="w-full h-8 object-cover rounded-xs" />
                  <p className="text-[9px] font-bold text-slate-300 truncate mt-0.5 px-0.5">{preset.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Image Preview Box */}
          {formData.imageUrl && (
            <div className="space-y-1 pt-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Image Preview:</span>
              <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() =>
                    setErrors((prev) => ({ ...prev, imageUrl: "Image failed to load from URL." }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2 — Schedules, Duration, Frequency & Status Settings */}
      <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Timing, Priority & Status Rules</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date & Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Start Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              className={cn(
                "w-full text-xs px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden cursor-pointer",
                errors.startDate ? "border-rose-400" : "border-slate-200 dark:border-slate-700"
              )}
            />
            {errors.startDate && <p className="text-[11px] text-rose-500">{errors.startDate}</p>}
          </div>

          {/* End Date & Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              End Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              className={cn(
                "w-full text-xs px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden cursor-pointer",
                errors.endDate ? "border-rose-400" : "border-slate-200 dark:border-slate-700"
              )}
            />
            {errors.endDate && <p className="text-[11px] text-rose-500">{errors.endDate}</p>}
          </div>

          {/* Display Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Duration (Seconds) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={formData.displayDuration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  displayDuration: parseInt(e.target.value, 10) || 10,
                }))
              }
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
            />
            {errors.displayDuration && (
              <p className="text-[11px] text-rose-500">{errors.displayDuration}</p>
            )}
          </div>

          {/* Display Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Display Priority (1 = Highest)
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value, 10) }))
              }
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
            >
              <option value={1}>Priority 1 (Highest)</option>
              <option value={2}>Priority 2</option>
              <option value={3}>Priority 3</option>
              <option value={4}>Priority 4</option>
              <option value={5}>Priority 5 (Standard)</option>
              <option value={10}>Priority 10 (Lowest)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Display Frequency */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Display Frequency
            </label>
            <select
              value={formData.displayFrequency}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  displayFrequency: e.target.value as any,
                }))
              }
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
            >
              <option value="once_per_session">Once Per Session (Recommended)</option>
              <option value="every_visit">Every Visit / Reload</option>
            </select>
          </div>

          {/* Display Position */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Display Position
            </label>
            <select
              value={formData.displayPosition}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  displayPosition: e.target.value as any,
                }))
              }
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
            >
              <option value="popup_overlay">Popup Overlay (Modal)</option>
              <option value="homepage_banner">Homepage Top Banner</option>
              <option value="sidebar_banner">Sidebar Banner</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Campaign Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value as any }))
              }
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Save as Draft */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <FileEdit className="w-4 h-4" />
            <span>Save as Draft</span>
          </button>

          {/* Publish / Save */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isEdit ? "Update Advertisement" : "Publish Advertisement"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
