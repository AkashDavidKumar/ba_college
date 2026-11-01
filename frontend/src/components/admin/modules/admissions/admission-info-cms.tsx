"use client";

import React, { useState } from "react";
import { useCMSStore } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { 
  FileText, Calendar, DollarSign, CheckCircle, 
  HelpCircle, Settings, Save, Plus, Trash2, Edit3, Award, Users 
} from "lucide-react";

interface AdmissionSettingItem {
  id: string;
  category: "General" | "UG Eligibility" | "PG Eligibility" | "Fee Structure" | "Important Dates" | "Prospectus";
  title: string;
  description: string;
  content: string;
  lastUpdated: string;
}

const INITIAL_ADMISSION_DATA: AdmissionSettingItem[] = [
  {
    id: "adm-1",
    category: "General",
    title: "Academic Year 2025–2026 Admissions Open",
    description: "Announcement banner and main admission notification on the public portal",
    content: "Admissions are open for Undergraduate (UG) and Postgraduate (PG) degree programmes for the academic session 2025–2026. Online and offline application modes are available.",
    lastUpdated: "2025-01-10",
  },
  {
    id: "adm-2",
    category: "UG Eligibility",
    title: "Undergraduate (UG) General Eligibility Criteria",
    description: "Criteria for B.Sc. Computer Science, B.Com, BBA, B.A. English",
    content: "Candidates must have passed the Higher Secondary Examination (+2) conducted by the Government of Tamil Nadu or equivalent examination recognized by Bharathiar University with a minimum of 50% aggregate marks.",
    lastUpdated: "2025-01-10",
  },
  {
    id: "adm-3",
    category: "PG Eligibility",
    title: "Postgraduate (PG) Eligibility Criteria",
    description: "Criteria for M.Sc. Computer Science, M.Com, M.A. English",
    content: "Candidates must hold an undergraduate bachelor's degree in the relevant discipline from a recognized University with at least 55% marks in the major subjects.",
    lastUpdated: "2025-01-10",
  },
  {
    id: "adm-4",
    category: "Important Dates",
    title: "Admissions Timeline & Key Deadlines",
    description: "Application submission schedule and counseling dates",
    content: "• Online Registration Starts: May 02, 2025\n• Last Date for UG Applications: June 15, 2025\n• First Merit List Announcement: June 20, 2025\n• Counseling & Document Verification: June 25–28, 2025\n• Orientation & Classes Commence: July 07, 2025",
    lastUpdated: "2025-01-10",
  },
  {
    id: "adm-5",
    category: "Prospectus",
    title: "College Prospectus & Application Brochure PDF",
    description: "Public link to download official information brochure",
    content: "/documents/admissions/BAC_College_Prospectus_2025_26.pdf",
    lastUpdated: "2025-01-10",
  },
];

export function AdmissionInfoCMS() {
  const { logAction } = useCMSStore();
  const [items, setItems] = useState<AdmissionSettingItem[]>(INITIAL_ADMISSION_DATA);
  const [selectedItem, setSelectedItem] = useState<AdmissionSettingItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleOpenEditor = (item?: AdmissionSettingItem) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem({
        id: "adm-" + Date.now(),
        category: "General",
        title: "",
        description: "",
        content: "",
        lastUpdated: new Date().toISOString().split("T")[0],
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (items.some((i) => i.id === selectedItem.id)) {
      setItems((prev) => prev.map((i) => (i.id === selectedItem.id ? selectedItem : i)));
      logAction({
        action: "UPDATE",
        module: "Admission Guidelines",
        recordId: selectedItem.id,
        recordTitle: selectedItem.title,
      });
    } else {
      setItems((prev) => [selectedItem, ...prev]);
      logAction({
        action: "CREATE",
        module: "Admission Guidelines",
        recordId: selectedItem.id,
        recordTitle: selectedItem.title,
      });
    }
    setIsEditorOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = (id: string, title: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    logAction({
      action: "DELETE",
      module: "Admission Guidelines",
      recordId: id,
      recordTitle: title,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Guidelines & Fee Policy CMS"
        description="Configure admission brochures, intake criteria, eligibility requirements, and important deadline announcements."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Admissions", href: "#" },
          { label: "Guidelines" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Guideline / Timeline
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-amber-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  {item.category}
                </span>
                <span className="text-[11px] text-slate-400">Updated: {item.lastUpdated}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{item.description}</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-mono leading-relaxed">
                {item.content}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleOpenEditor(item)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id, item.title)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {items.some((i) => i.id === selectedItem.id) ? "Edit Admission Section" : "Add New Section"}
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
                  Category
                </label>
                <select
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="General">General Announcement</option>
                  <option value="UG Eligibility">UG Eligibility Criteria</option>
                  <option value="PG Eligibility">PG Eligibility Criteria</option>
                  <option value="Fee Structure">Fee Structure & Concessions</option>
                  <option value="Important Dates">Important Dates & Deadlines</option>
                  <option value="Prospectus">Prospectus PDF Brochure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  value={selectedItem.title}
                  onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                  placeholder="e.g. Undergraduate Eligibility Guidelines"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={selectedItem.description}
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                  placeholder="Subtitle or brief summary"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Content / URL / Dates *
                </label>
                <textarea
                  required
                  rows={6}
                  value={selectedItem.content}
                  onChange={(e) => setSelectedItem({ ...selectedItem, content: e.target.value })}
                  placeholder="Enter policy details, bullet points, or document path..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-mono text-xs"
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
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
