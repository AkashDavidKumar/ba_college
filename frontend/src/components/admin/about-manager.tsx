"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useSiteData,
  AboutPageData,
  AboutPageSection,
  defaultAboutPageData,
} from "@/lib/site-context";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Plus,
  Trash2,
  Loader2,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  EyeOff,
  GripVertical,
  AlertTriangle,
} from "lucide-react";

export function AboutPageManager() {
  const { data, updateAboutPage } = useSiteData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hero State
  const [heroEnabled, setHeroEnabled] = useState(true);
  const [heroBadge, setHeroBadge] = useState("ABOUT BAC");
  const [heroHeading, setHeroHeading] = useState(
    "A globally connected university shaping tomorrow's leaders"
  );
  const [heroDescription, setHeroDescription] = useState(
    "Founded in 1984, BAC Global University blends the rigor of a research institution with the warmth of a close-knit campus community — preparing 20,000+ students to lead with excellence, empathy, and impact."
  );

  // Legacy Section State
  const [legacyEnabled, setLegacyEnabled] = useState(true);
  const [legacyAccent, setLegacyAccent] = useState("OUR STORY & FOUNDATION");
  const [legacyHeading, setLegacyHeading] = useState(
    "A Legacy of Innovation and Excellence"
  );
  const [paragraphs, setParagraphs] = useState<string[]>([
    "What began as a small engineering college in 1984 has grown into one of Asia's most respected research universities. BAC was founded on a simple conviction: that an education rooted in critical inquiry, hands-on research, and global exposure could transform not just individual lives but entire communities. Four decades later, that conviction has produced 85,000+ alumni across 80 countries, three campuses, and a research portfolio that ranks among the world's best.",
    "Today, BAC is recognised by QS, THE, and the world's leading accreditation bodies. We are a member of the Association of Pacific Rim Universities, and our partnerships span Stanford, MIT, Oxford, Cambridge, NUS, and ETH Zurich — giving every BAC student the opportunity to learn from and contribute to the global academic community.",
    "Through state-of-the-art research facilities, world-class faculty, and industry-connected programs, BAC empowers students to solve real-world problems and shape the future with intellectual curiosity and ethical leadership.",
  ]);

  // Campus Image State
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80"
  );
  const [imageAltText, setImageAltText] = useState(
    "BAC University Knowledge City Campus"
  );
  const [imageCaption, setImageCaption] = useState(
    "200 acres of learning & discovery"
  );
  const [imageBadge, setImageBadge] = useState("Knowledge City Campus");

  // Additional Dynamic Sections
  const [additionalSections, setAdditionalSections] = useState<
    AboutPageSection[]
  >(defaultAboutPageData.additionalSections || []);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingSectionIndex, setUploadingSectionIndex] = useState<number | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sync state from context data
  useEffect(() => {
    if (data?.aboutPage) {
      const ap = data.aboutPage;
      setHeroEnabled(ap.hero?.enabled !== false);
      setHeroBadge(ap.hero?.badgeText ?? "ABOUT BAC");
      setHeroHeading(
        ap.hero?.heading ??
          "A globally connected university shaping tomorrow's leaders"
      );
      setHeroDescription(ap.hero?.description ?? "");

      setLegacyEnabled(ap.legacy?.enabled !== false);
      setLegacyAccent(ap.legacy?.accentLabel ?? "OUR STORY & FOUNDATION");
      setLegacyHeading(
        ap.legacy?.heading ?? "A Legacy of Innovation and Excellence"
      );
      setParagraphs(
        Array.isArray(ap.legacy?.paragraphs) && ap.legacy.paragraphs.length > 0
          ? ap.legacy.paragraphs
          : defaultAboutPageData.legacy.paragraphs
      );

      setImageUrl(
        ap.legacy?.image?.url ?? defaultAboutPageData.legacy.image.url
      );
      setImageAltText(
        ap.legacy?.image?.altText ?? defaultAboutPageData.legacy.image.altText
      );
      setImageCaption(
        ap.legacy?.image?.caption ?? defaultAboutPageData.legacy.image.caption ?? ""
      );
      setImageBadge(
        ap.legacy?.image?.badge ?? defaultAboutPageData.legacy.image.badge ?? ""
      );

      if (Array.isArray(ap.additionalSections)) {
        const sorted = [...ap.additionalSections].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        setAdditionalSections(sorted);
      }
    }
  }, [data?.aboutPage]);

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Format",
        description: "Please upload a JPEG, PNG, WEBP, GIF, or SVG image.",
        variant: "destructive",
      });
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/about/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      const resData = await res.json();
      setImageUrl(resData.url);
      if (!imageAltText) {
        setImageAltText(file.name.replace(/\.[^/.]+$/, ""));
      }
      toast({
        title: "Image Uploaded",
        description: "Campus image uploaded successfully. Click Save Changes to publish.",
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Section Image Upload Handler
  const handleSectionImageUpload = async (index: number, file: File) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Format",
        description: "Please upload a JPEG, PNG, WEBP, GIF, or SVG image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingSectionIndex(index);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/about/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      const resData = await res.json();
      handleUpdateSection(index, "image", resData.url);
      toast({
        title: "Section Image Uploaded",
        description: "Image uploaded successfully. Click Save Changes to publish.",
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploadingSectionIndex(null);
    }
  };

  // Paragraph Handlers
  const handleParagraphChange = (index: number, val: string) => {
    setParagraphs((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleAddParagraph = () => {
    setParagraphs((prev) => [...prev, ""]);
  };

  const handleRemoveParagraph = (index: number) => {
    if (paragraphs.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must maintain at least one story paragraph.",
        variant: "destructive",
      });
      return;
    }
    setParagraphs((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Additional Sections Handlers
  const handleAddSection = () => {
    const newSec: AboutPageSection = {
      id: `sec-${Date.now()}`,
      title: "New About Section",
      subtitle: "Section Category",
      content:
        "Provide in-depth content regarding university history, leadership message, awards, infrastructure, or accreditations.",
      image: "",
      enabled: true,
      order: additionalSections.length + 1,
    };
    setAdditionalSections((prev) => [...prev, newSec]);
    toast({
      title: "Section Added",
      description: "New custom section created. Fill out details and save.",
    });
  };

  const handleUpdateSection = (
    index: number,
    field: keyof AboutPageSection,
    value: any
  ) => {
    setAdditionalSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteSection = (index: number) => {
    setAdditionalSections((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleSection = (index: number) => {
    setAdditionalSections((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        enabled: !updated[index].enabled,
      };
      return updated;
    });
  };

  // Drag and Drop Handlers for Sections
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...additionalSections];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setAdditionalSections(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Save Changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const payload: AboutPageData = {
      hero: {
        enabled: heroEnabled,
        badgeText: heroBadge.trim() || "ABOUT BAC",
        heading:
          heroHeading.trim() ||
          "A globally connected university shaping tomorrow's leaders",
        description: heroDescription.trim(),
      },
      legacy: {
        enabled: legacyEnabled,
        accentLabel: legacyAccent.trim(),
        heading:
          legacyHeading.trim() || "A Legacy of Innovation and Excellence",
        paragraphs: paragraphs.filter((p) => p.trim().length > 0),
        image: {
          url: imageUrl.trim(),
          altText: imageAltText.trim() || "BAC University Campus",
          caption: imageCaption.trim(),
          badge: imageBadge.trim(),
        },
      },
      additionalSections: additionalSections.map((s, idx) => ({
        ...s,
        order: idx + 1,
      })),
      updatedAt: new Date().toISOString(),
    };

    try {
      const ok = await updateAboutPage(payload);
      if (ok) {
        toast({
          title: "About Page Saved",
          description:
            "All About page content, hero texts, legacy paragraphs, and images are updated live.",
        });
      } else {
        throw new Error("Save failed");
      }
    } catch (err) {
      toast({
        title: "Save Failed",
        description: "Could not save About page settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to Default
  const handleConfirmReset = async () => {
    setShowResetDialog(false);
    setIsSaving(true);
    try {
      const ok = await updateAboutPage(defaultAboutPageData);
      if (ok) {
        setHeroEnabled(defaultAboutPageData.hero.enabled);
        setHeroBadge(defaultAboutPageData.hero.badgeText);
        setHeroHeading(defaultAboutPageData.hero.heading);
        setHeroDescription(defaultAboutPageData.hero.description);

        setLegacyEnabled(defaultAboutPageData.legacy.enabled);
        setLegacyAccent(defaultAboutPageData.legacy.accentLabel || "");
        setLegacyHeading(defaultAboutPageData.legacy.heading);
        setParagraphs(defaultAboutPageData.legacy.paragraphs);

        setImageUrl(defaultAboutPageData.legacy.image.url);
        setImageAltText(defaultAboutPageData.legacy.image.altText);
        setImageCaption(defaultAboutPageData.legacy.image.caption || "");
        setImageBadge(defaultAboutPageData.legacy.image.badge || "");

        setAdditionalSections(defaultAboutPageData.additionalSections || []);

        toast({
          title: "Reset to Default",
          description: "About page has been restored to default template content.",
        });
      } else {
        throw new Error("Reset failed");
      }
    } catch (err) {
      toast({
        title: "Reset Failed",
        description: "Could not reset About page settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Management Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
        {/* Header with Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="font-serif text-lg font-bold text-slate-900">
                About Page Management
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Manage the About page hero headlines, legacy story paragraphs, campus photos, and custom sections.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowResetDialog(true)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
              title="Reset About page to default template"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset to Default
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-amber-100 disabled:text-slate-400 text-xs font-bold text-slate-950 transition-all shadow-sm"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* 1. ABOUT PAGE HERO */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
              About Page Hero
            </h4>

            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <span className="text-xs font-semibold text-slate-700">
                {heroEnabled ? "Hero Enabled" : "Hero Disabled"}
              </span>
              <div
                onClick={() => setHeroEnabled(!heroEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  heroEnabled ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    heroEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Badge Text
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                placeholder="e.g. ABOUT BAC"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Main Heading
              </label>
              <input
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                placeholder="e.g. A globally connected university shaping tomorrow's leaders"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Hero Description
              </label>
              <textarea
                rows={3}
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                placeholder="Founded in 1984, BAC Global University blends the rigor of a research institution..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* 2. LEGACY / INTRODUCTION SECTION */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
              Legacy / Introduction Section
            </h4>

            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <span className="text-xs font-semibold text-slate-700">
                {legacyEnabled ? "Section Enabled" : "Section Disabled"}
              </span>
              <div
                onClick={() => setLegacyEnabled(!legacyEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  legacyEnabled ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    legacyEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Small Accent / Label
              </label>
              <input
                type="text"
                value={legacyAccent}
                onChange={(e) => setLegacyAccent(e.target.value)}
                placeholder="e.g. OUR STORY & FOUNDATION"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={legacyHeading}
                onChange={(e) => setLegacyHeading(e.target.value)}
                placeholder="e.g. A Legacy of Innovation and Excellence"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>
          </div>

          {/* Paragraphs List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Story Paragraphs ({paragraphs.length})
              </label>
              <button
                type="button"
                onClick={handleAddParagraph}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Paragraph
              </button>
            </div>

            {paragraphs.map((p, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0 mt-2 border border-slate-200">
                  {idx + 1}
                </div>
                <textarea
                  rows={3}
                  value={p}
                  onChange={(e) => handleParagraphChange(idx, e.target.value)}
                  placeholder={`Paragraph ${idx + 1}...`}
                  className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 leading-relaxed"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveParagraph(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                  title="Remove this paragraph"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CAMPUS IMAGE MANAGEMENT */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
          <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
            Campus Image
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Image Preview Box */}
            <div className="lg:col-span-1 space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Current Image Preview
              </label>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] group shadow-inner">
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={imageAltText || "Campus Preview"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white text-slate-900 rounded-xl shadow-md hover:bg-amber-400 transition-colors font-bold text-xs flex items-center gap-1.5"
                      >
                        <Upload className="w-4 h-4" /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="p-2 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-colors font-bold text-xs flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <ImageIcon className="w-10 h-10 mb-2 stroke-1" />
                    <span className="text-xs font-medium">No image set</span>
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload & Metadata Fields */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image URL or upload a file (e.g. /uploads/about-campus.jpg)"
                  className="flex-1 w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0 w-full sm:w-auto"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? "Uploading..." : "Upload New Image"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                    placeholder="e.g. BAC University Campus"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Image Badge Text
                  </label>
                  <input
                    type="text"
                    value={imageBadge}
                    onChange={(e) => setImageBadge(e.target.value)}
                    placeholder="e.g. Knowledge City Campus"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Image Subtitle / Caption
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="e.g. 200 acres of learning & discovery"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. ADDITIONAL ABOUT PAGE SECTIONS */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
                Custom About Sections ({additionalSections.length})
              </h4>
              <p className="text-[11px] text-slate-400 pl-3 pt-0.5">
                Add sections such as Principal Message, Vision & Mission, History, Awards, or Leadership. Drag to reorder.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSection}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add About Section
            </button>
          </div>

          <div className="space-y-3">
            {additionalSections.map((sec, index) => {
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;

              return (
                <div
                  key={sec.id || index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    !sec.enabled
                      ? "bg-slate-50/70 border-slate-200 opacity-60"
                      : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm"
                  } ${
                    isDragging
                      ? "opacity-30 border-dashed border-amber-500 scale-[0.99]"
                      : ""
                  } ${isOver ? "border-amber-500 bg-amber-50/40" : ""}`}
                >
                  {/* Top Bar: Drag, Title, Toggles */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Drag to reorder section"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center border border-slate-200">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {sec.title || `Section #${index + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSection(index)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                          sec.enabled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {sec.enabled ? (
                          <>
                            <Eye className="w-3 h-3" /> Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Hidden
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSection(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Section Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) =>
                          handleUpdateSection(index, "title", e.target.value)
                        }
                        placeholder="e.g. Vision & Mission"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Category / Subtitle
                      </label>
                      <input
                        type="text"
                        value={sec.subtitle || ""}
                        onChange={(e) =>
                          handleUpdateSection(index, "subtitle", e.target.value)
                        }
                        placeholder="e.g. Institutional Benchmarks"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Content / Description
                      </label>
                      <textarea
                        rows={2}
                        value={sec.content}
                        onChange={(e) =>
                          handleUpdateSection(index, "content", e.target.value)
                        }
                        placeholder="Section content description..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Author Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={sec.author || ""}
                        onChange={(e) =>
                          handleUpdateSection(index, "author", e.target.value)
                        }
                        placeholder="e.g. Dr. Eleanor Vance, Ph.D."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Author Role / Subtitle (Optional)
                      </label>
                      <input
                        type="text"
                        value={sec.role || ""}
                        onChange={(e) =>
                          handleUpdateSection(index, "role", e.target.value)
                        }
                        placeholder="e.g. Principal & Vice-Chancellor"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white"
                      />
                    </div>

                    {/* Section Image Option */}
                    <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Section Image / Photo (Optional)
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Thumbnail Preview */}
                        {sec.image ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 group shadow-xs">
                            <img
                              src={sec.image}
                              alt={sec.title || "Section preview"}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateSection(index, "image", "")}
                              className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove section image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <ImageIcon className="w-5 h-5 stroke-1" />
                          </div>
                        )}

                        {/* Image URL Input */}
                        <input
                          type="text"
                          value={sec.image || ""}
                          onChange={(e) =>
                            handleUpdateSection(index, "image", e.target.value)
                          }
                          placeholder="Image URL or upload a file (e.g. /uploads/principal.jpg)"
                          className="flex-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white"
                        />

                        {/* Hidden File Input */}
                        <input
                          id={`section-file-input-${index}`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSectionImageUpload(index, file);
                            e.target.value = "";
                          }}
                        />

                        {/* Upload Button */}
                        <button
                          type="button"
                          disabled={uploadingSectionIndex === index}
                          onClick={() => {
                            document
                              .getElementById(`section-file-input-${index}`)
                              ?.click();
                          }}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto shadow-xs"
                        >
                          {uploadingSectionIndex === index ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          {uploadingSectionIndex === index
                            ? "Uploading..."
                            : "Upload Image"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Reset to Default */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h4 className="font-serif text-lg font-bold text-slate-900">
                Reset About Page to Default?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will revert all About page hero titles, descriptions, legacy story paragraphs, and the default campus image back to the original BAC University template:
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left text-xs space-y-1 font-mono text-slate-700">
                <div>• Badge: ABOUT BAC</div>
                <div>• Heading: A globally connected university...</div>
                <div>• Legacy: A Legacy of Innovation and Excellence</div>
                <div>• Photo: Knowledge City Campus</div>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold pt-1">
                Any custom paragraphs or newly added sections will be reset.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Yes, Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
