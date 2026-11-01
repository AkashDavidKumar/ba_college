"use client";

import React, { useState, useEffect } from "react";
import { useSiteData, HomepageStatistics, HomepageStat, defaultHomepageStatistics } from "@/lib/site-context";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Plus,
  Trash2,
  Loader2,
  GripVertical,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export function HomepageStatisticsManager() {
  const { data, updateStatistics } = useSiteData();
  const { toast } = useToast();

  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [badgeText, setBadgeText] = useState("WHY CHOOSE OUR COLLEGE");
  const [heading, setHeading] = useState("Building Academic Excellence & Global Trust");
  const [description, setDescription] = useState(
    "Empowering thousands of students through world-class faculty, cutting-edge facilities, and exceptional career outcomes."
  );
  const [stats, setStats] = useState<HomepageStat[]>(defaultHomepageStatistics.statistics);

  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sync state from context when data loads
  useEffect(() => {
    if (data?.statistics) {
      setSectionEnabled(data.statistics.sectionEnabled !== false);
      setBadgeText(data.statistics.badgeText || "WHY CHOOSE OUR COLLEGE");
      setHeading(data.statistics.heading || "Building Academic Excellence & Global Trust");
      setDescription(data.statistics.description ?? "");
      if (Array.isArray(data.statistics.statistics) && data.statistics.statistics.length > 0) {
        const sorted = [...data.statistics.statistics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setStats(sorted);
      } else {
        setStats(defaultHomepageStatistics.statistics);
      }
    }
  }, [data?.statistics]);

  // Handle saving to MongoDB
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const payload: HomepageStatistics = {
      sectionEnabled,
      badgeText: badgeText.trim() || "WHY CHOOSE OUR COLLEGE",
      heading: heading.trim() || "Building Academic Excellence & Global Trust",
      description: description.trim(),
      statistics: stats.map((s, idx) => ({
        ...s,
        order: idx + 1,
        value: Number(s.value) || 0
      }))
    };

    try {
      const ok = await updateStatistics(payload);
      if (ok) {
        toast({
          title: "Statistics Saved",
          description: "Homepage statistics and key numbers have been updated live on the public website."
        });
      } else {
        throw new Error("Failed to save statistics");
      }
    } catch (err) {
      toast({
        title: "Save Failed",
        description: "Could not save statistics. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleConfirmReset = async () => {
    setShowResetDialog(false);
    setIsSaving(true);
    try {
      const ok = await updateStatistics(defaultHomepageStatistics);
      if (ok) {
        setSectionEnabled(defaultHomepageStatistics.sectionEnabled);
        setBadgeText(defaultHomepageStatistics.badgeText);
        setHeading(defaultHomepageStatistics.heading);
        setDescription(defaultHomepageStatistics.description);
        setStats(defaultHomepageStatistics.statistics);
        toast({
          title: "Reset to Default",
          description: "Homepage statistics have been restored to the default 5 college figures."
        });
      } else {
        throw new Error("Reset failed");
      }
    } catch (err) {
      toast({
        title: "Reset Failed",
        description: "Could not reset statistics to default.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Stat item field changes
  const updateStatField = (index: number, field: keyof HomepageStat, value: any) => {
    setStats((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Add new stat
  const handleAddStat = () => {
    const newStat: HomepageStat = {
      id: `stat-${Date.now()}`,
      value: 100,
      label: "New Key Achievement",
      prefix: "",
      suffix: "+",
      order: stats.length + 1,
      visible: true
    };
    setStats((prev) => [...prev, newStat]);
    toast({
      title: "New Statistic Added",
      description: "Fill in the value and label, then click Save Changes."
    });
  };

  // Delete stat
  const handleDeleteStat = (index: number) => {
    if (stats.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one statistic card. You can toggle visibility instead.",
        variant: "destructive"
      });
      return;
    }
    setStats((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Toggle visible
  const handleToggleVisible = (index: number) => {
    setStats((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], visible: !updated[index].visible };
      return updated;
    });
  };

  // Drag and drop handlers
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

    const updated = [...stats];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    // Reassign order
    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    setStats(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-8">
      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
        {/* Header with Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Homepage Statistics / Key Numbers Management
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Manage the &ldquo;WHY CHOOSE OUR COLLEGE&rdquo; key numbers, labels, prefix/suffix, visibility, and display order.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowResetDialog(true)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
              title="Reset to college default statistics"
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
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Section 1: Section Settings */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
              Section Settings
            </h4>

            {/* Enable/Disable Toggle */}
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <span className="text-xs font-semibold text-slate-700">
                {sectionEnabled ? "Section Enabled" : "Section Disabled"}
              </span>
              <div
                onClick={() => setSectionEnabled(!sectionEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  sectionEnabled ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    sectionEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Section Badge / Pill Text
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. WHY CHOOSE OUR COLLEGE"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Main Heading Title
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Building Academic Excellence & Global Trust"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Description / Subtitle
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description text displayed below the main heading on the homepage..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Statistics Table / Cards */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
                Statistic Cards ({stats.length})
              </h4>
              <p className="text-[11px] text-slate-400 pl-3 pt-0.5">
                Drag using the grip icon to reorder. Changes take effect on the live website after clicking Save Changes.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddStat}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add Statistic
            </button>
          </div>

          {/* Draggable List */}
          <div className="space-y-2.5">
            {stats.map((stat, index) => {
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;

              return (
                <div
                  key={stat.id || index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex flex-col lg:flex-row items-start lg:items-center gap-3 p-4 rounded-xl border transition-all ${
                    !stat.visible
                      ? "bg-slate-50/70 border-slate-200 opacity-60"
                      : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm"
                  } ${isDragging ? "opacity-30 border-dashed border-amber-500 scale-[0.99]" : ""} ${
                    isOver ? "border-amber-500 bg-amber-50/40" : ""
                  }`}
                >
                  {/* Drag Handle & Order Badge */}
                  <div className="flex items-center gap-2 self-stretch lg:self-auto shrink-0 justify-between lg:justify-start">
                    <div
                      className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center border border-slate-200">
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 lg:hidden">
                      Statistic #{index + 1}
                    </span>
                  </div>

                  {/* Value Input */}
                  <div className="w-full lg:w-36 shrink-0">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Value / Number
                    </label>
                    <input
                      type="number"
                      value={stat.value}
                      onChange={(e) => updateStatField(index, "value", e.target.value)}
                      placeholder="e.g. 42"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-serif font-bold text-slate-900 focus:outline-none focus:border-amber-400 bg-white"
                    />
                  </div>

                  {/* Label Input */}
                  <div className="w-full lg:flex-1 min-w-[160px]">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Label / Title
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateStatField(index, "label", e.target.value)}
                      placeholder="e.g. Years of Excellence"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-amber-400 bg-white"
                    />
                  </div>

                  {/* Prefix Input */}
                  <div className="w-full lg:w-24 shrink-0">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Prefix
                    </label>
                    <input
                      type="text"
                      value={stat.prefix || ""}
                      onChange={(e) => updateStatField(index, "prefix", e.target.value)}
                      placeholder="e.g. $"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:border-amber-400 bg-white"
                    />
                  </div>

                  {/* Suffix Input */}
                  <div className="w-full lg:w-24 shrink-0">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={stat.suffix || ""}
                      onChange={(e) => updateStatField(index, "suffix", e.target.value)}
                      placeholder="e.g. + or %"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center font-bold text-amber-600 focus:outline-none focus:border-amber-400 bg-white"
                    />
                  </div>

                  {/* Visibility Toggle & Delete */}
                  <div className="flex items-center gap-2 self-end lg:self-auto shrink-0 pt-2 lg:pt-5">
                    {/* Toggle Visible */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(index)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                        stat.visible
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                      title={stat.visible ? "Card is visible on homepage" : "Card is hidden from homepage"}
                    >
                      {stat.visible ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteStat(index)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors"
                      title="Delete this statistic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Guidance Alert */}
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 mt-3">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pro-tip for Administrators:</span> Large numbers like{" "}
              <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-800">20000</code> or{" "}
              <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-800">1200</code> are automatically formatted with comma separators (e.g., <strong>20,000+</strong> and <strong>1,200+</strong>) on the public website with smooth rolling counters!
            </div>
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
                Reset Homepage Statistics to Default?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will revert all cards, numbers, labels, badges, and headings back to the original 5 college statistics:
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left text-xs space-y-1 font-mono text-slate-700">
                <div>• 42 — Years of Excellence</div>
                <div>• 20,000+ — Students Enrolled</div>
                <div>• 500+ — Faculty Members</div>
                <div>• 95% — Placement Rate</div>
                <div>• 1,200+ — Research Publications</div>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold pt-1">
                Any newly added statistics or custom numbers will be replaced.
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
