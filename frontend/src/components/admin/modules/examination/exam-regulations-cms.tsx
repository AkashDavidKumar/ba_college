"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { 
  FileText, Plus, Trash2, Edit3, ShieldCheck, 
  CheckCircle, Percent, BookOpen, AlertTriangle 
} from "lucide-react";

interface ExamRegulationItem {
  id: string;
  category: "Evaluation Pattern" | "Grading System (CBCS)" | "Revaluation Rules" | "Attendance Requirement" | "Malpractice Code";
  title: string;
  summary: string;
  details: string;
  lastUpdated: string;
}

const INITIAL_EXAM_REGS: ExamRegulationItem[] = [
  {
    id: "er-1",
    category: "Evaluation Pattern",
    title: "Continuous Internal Assessment (CIA) & End Semester (ESE) Weightage",
    summary: "25% CIA + 75% End Semester Autonomous Examination (Theory)",
    details: "• CIA Test I & II (Best 2 out of 3): 15 Marks\n• Model Examination: 5 Marks\n• Assignment / Seminar / Case Study: 5 Marks\n• Total Internal Marks: 25 Marks\n• End Semester Autonomous Examination: 75 Marks (Total 100 Marks per course)\n• Passing Minimum: 40% in ESE (30/75) and 40% aggregate (40/100) for UG; 50% for PG.",
    lastUpdated: "2024-06-15",
  },
  {
    id: "er-2",
    category: "Grading System (CBCS)",
    title: "10-Point Letter Grading Scale (UGC - CBCS Framework)",
    summary: "Standardized 10-point scale for SGPA and CGPA computation",
    details: "• 90–100: O (Outstanding, Grade Point 10.0)\n• 80–89: D+ (Excellent, Grade Point 9.0)\n• 75–79: D (Distinction, Grade Point 8.0)\n• 70–74: A+ (Very Good, Grade Point 7.5)\n• 60–69: A (Good, Grade Point 6.5)\n• 50–59: B (Average, Grade Point 5.5)\n• 40–49: C (Satisfactory, Grade Point 4.5)\n• <40: RA (Re-Appearance / Arrear)",
    lastUpdated: "2024-06-15",
  },
  {
    id: "er-3",
    category: "Revaluation Rules",
    title: "Transparency, Photocopy & Revaluation Procedures",
    summary: "Application timeline and fee rules for re-totaling and revaluation",
    details: "1. Students can apply for photocopy of answer scripts within 10 days of results publication.\n2. Revaluation applications must be routed through the HOD and Dean within 15 days.\n3. Transparent double-blind revaluation by external university examiners.\n4. Higher mark will be awarded if score variation is positive.",
    lastUpdated: "2024-06-15",
  },
  {
    id: "er-4",
    category: "Attendance Requirement",
    title: "75% Mandatory Attendance for End-Semester Hall Ticket Eligibility",
    summary: "Minimum attendance norms mandated by Bharathiar University",
    details: "• Minimum 75% attendance required to appear for Autonomous examinations.\n• 65% – 74% allows condonation on genuine medical grounds upon Principal approval.\n• Below 65% must repeat the semester in the subsequent academic year.",
    lastUpdated: "2024-06-15",
  },
];

export function ExamRegulationsCMS() {
  const { logAction } = useCMSStore();
  const [items, setItems] = useState<ExamRegulationItem[]>(INITIAL_EXAM_REGS);
  const [selectedItem, setSelectedItem] = useState<ExamRegulationItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleOpenEditor = (item?: ExamRegulationItem) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem({
        id: "er-" + Date.now(),
        category: "Evaluation Pattern",
        title: "",
        summary: "",
        details: "",
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
        module: "Examination Regulations",
        recordId: selectedItem.id,
        recordTitle: selectedItem.title,
      });
    } else {
      setItems((prev) => [selectedItem, ...prev]);
      logAction({
        action: "CREATE",
        module: "Examination Regulations",
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
      module: "Examination Regulations",
      recordId: id,
      recordTitle: title,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Autonomous Examination Regulations & Evaluation Guidelines"
        description="Office of the COE — configure evaluation split, passing criteria, CBCS grading scale, revaluation, and attendance rules."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Examinations", href: "#" },
          { label: "Regulations" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Regulation Section
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{item.summary}</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-mono leading-relaxed">
                {item.details}
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
                  {items.some((i) => i.id === selectedItem.id) ? "Edit Regulation" : "Add Regulation Section"}
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
                  Regulation Category *
                </label>
                <select
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Evaluation Pattern">Evaluation Pattern & CIA Weightage</option>
                  <option value="Grading System (CBCS)">Grading System (CBCS)</option>
                  <option value="Revaluation Rules">Revaluation & Photocopy Procedures</option>
                  <option value="Attendance Requirement">Attendance Norms</option>
                  <option value="Malpractice Code">Malpractice & Disciplinary Penalties</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Regulation Title *
                </label>
                <input
                  type="text"
                  required
                  value={selectedItem.title}
                  onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                  placeholder="e.g. Continuous Internal Assessment & ESE Weightage"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Summary
                </label>
                <input
                  type="text"
                  value={selectedItem.summary}
                  onChange={(e) => setSelectedItem({ ...selectedItem, summary: e.target.value })}
                  placeholder="25% CIA + 75% End Semester Examination"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Regulatory Guidelines & Formula *
                </label>
                <textarea
                  required
                  rows={6}
                  value={selectedItem.details}
                  onChange={(e) => setSelectedItem({ ...selectedItem, details: e.target.value })}
                  placeholder="Enter exact marks distribution, rules, and passing conditions..."
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
                  Save Regulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
