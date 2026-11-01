"use client";

import React, { useState, useMemo } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  BookOpen, Plus, FileText, CheckCircle, Download, 
  ExternalLink, Layers, GraduationCap, Award, Search, Trash2, Edit3 
} from "lucide-react";

interface CurriculumItem {
  id: string;
  courseCode: string;
  courseName: string;
  departmentId: string;
  degreeType: "UG" | "PG" | "Ph.D";
  regulationYear: string; // e.g., "2024 (OBE)", "2021"
  semester: number;
  credits: number;
  courseType: "Core" | "Allied" | "Elective" | "Skill Based" | "Value Added" | "NME";
  syllabusPdfUrl: string;
  status: ContentStatus;
  outcomesCount: number;
  lastUpdated: string;
}

const INITIAL_CURRICULUM: CurriculumItem[] = [
  {
    id: "curr-1",
    courseCode: "24UCSC101",
    courseName: "Programming in C & Data Structures",
    departmentId: "computer-science",
    degreeType: "UG",
    regulationYear: "2024 (OBE - CBCS)",
    semester: 1,
    credits: 4,
    courseType: "Core",
    syllabusPdfUrl: "/documents/curriculum/24UCSC101_Syllabus.pdf",
    status: "published",
    outcomesCount: 5,
    lastUpdated: "2024-06-15",
  },
  {
    id: "curr-2",
    courseCode: "24UCSC102",
    courseName: "Digital Computer Fundamentals",
    departmentId: "computer-science",
    degreeType: "UG",
    regulationYear: "2024 (OBE - CBCS)",
    semester: 1,
    credits: 4,
    courseType: "Core",
    syllabusPdfUrl: "/documents/curriculum/24UCSC102_Syllabus.pdf",
    status: "published",
    outcomesCount: 5,
    lastUpdated: "2024-06-15",
  },
  {
    id: "curr-3",
    courseCode: "24UCOMC101",
    courseName: "Financial Accounting I",
    departmentId: "commerce",
    degreeType: "UG",
    regulationYear: "2024 (OBE - CBCS)",
    semester: 1,
    credits: 4,
    courseType: "Core",
    syllabusPdfUrl: "/documents/curriculum/24UCOMC101_Syllabus.pdf",
    status: "published",
    outcomesCount: 5,
    lastUpdated: "2024-06-10",
  },
  {
    id: "curr-4",
    courseCode: "24UENG101",
    courseName: "General English: Communication Skills",
    departmentId: "english",
    degreeType: "UG",
    regulationYear: "2024 (OBE - CBCS)",
    semester: 1,
    credits: 3,
    courseType: "Allied",
    syllabusPdfUrl: "/documents/curriculum/24UENG101_Syllabus.pdf",
    status: "published",
    outcomesCount: 4,
    lastUpdated: "2024-06-08",
  },
  {
    id: "curr-5",
    courseCode: "24PCSC201",
    courseName: "Advanced Algorithms & Cloud Computing",
    departmentId: "computer-science",
    degreeType: "PG",
    regulationYear: "2024 (OBE - CBCS)",
    semester: 2,
    credits: 4,
    courseType: "Core",
    syllabusPdfUrl: "/documents/curriculum/24PCSC201_Syllabus.pdf",
    status: "published",
    outcomesCount: 5,
    lastUpdated: "2024-06-20",
  },
  {
    id: "curr-6",
    courseCode: "24UMATC101",
    courseName: "Classical Algebra & Trigonometry",
    departmentId: "mathematics",
    degreeType: "UG",
    regulationYear: "2024 (OBE - CBCS)",
    semester: 1,
    credits: 4,
    courseType: "Core",
    syllabusPdfUrl: "/documents/curriculum/24UMATC101_Syllabus.pdf",
    status: "published",
    outcomesCount: 5,
    lastUpdated: "2024-06-12",
  },
];

export function CurriculumCMS() {
  const { currentUser, canAccessDepartment, logAction } = useCMSStore();
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>(INITIAL_CURRICULUM);
  const [selectedItem, setSelectedItem] = useState<CurriculumItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CurriculumItem | null>(null);
  const [selectedRegulation, setSelectedRegulation] = useState<string>("All");

  // Filter based on user department scope
  const filteredCurriculum = useMemo(() => {
    return curriculum.filter((item) => {
      if (!canAccessDepartment(item.departmentId)) return false;
      if (selectedRegulation !== "All" && !item.regulationYear.includes(selectedRegulation)) return false;
      return true;
    });
  }, [curriculum, canAccessDepartment, selectedRegulation]);

  const handleOpenEditor = (item?: CurriculumItem) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem({
        id: "curr-" + Date.now(),
        courseCode: "",
        courseName: "",
        departmentId: currentUser.departmentId || "computer-science",
        degreeType: "UG",
        regulationYear: "2024 (OBE - CBCS)",
        semester: 1,
        credits: 4,
        courseType: "Core",
        syllabusPdfUrl: "",
        status: currentUser.role === "master_admin" ? "published" : "submitted",
        outcomesCount: 5,
        lastUpdated: new Date().toISOString().split("T")[0],
      });
    }
    setIsEditorOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (curriculum.some((c) => c.id === selectedItem.id)) {
      setCurriculum((prev) => prev.map((c) => (c.id === selectedItem.id ? selectedItem : c)));
      logAction({
        action: "UPDATE",
        module: "Curriculum & Syllabus",
        recordId: selectedItem.id,
        recordTitle: `${selectedItem.courseCode} - ${selectedItem.courseName}`,
      });
    } else {
      setCurriculum((prev) => [selectedItem, ...prev]);
      logAction({
        action: "CREATE",
        module: "Curriculum & Syllabus",
        recordId: selectedItem.id,
        recordTitle: `${selectedItem.courseCode} - ${selectedItem.courseName}`,
      });
    }
    setIsEditorOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    setCurriculum((prev) => prev.filter((c) => c.id !== itemToDelete.id));
    logAction({
      action: "DELETE",
      module: "Curriculum & Syllabus",
      recordId: itemToDelete.id,
      recordTitle: `${itemToDelete.courseCode} - ${itemToDelete.courseName}`,
    });
    setItemToDelete(null);
  };

  const columns: Column<CurriculumItem>[] = [
    {
      key: "courseCode",
      header: "Course Code",
      sortable: true,
      render: (item) => (
        <div className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded w-max border border-amber-200 dark:border-amber-800/60">
          {item.courseCode}
        </div>
      ),
    },
    {
      key: "courseName",
      header: "Course Title & Scheme",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">{item.courseName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
            <span className="capitalize">{item.departmentId.replace("-", " ")}</span>
            <span>•</span>
            <span>Sem {item.semester}</span>
            <span>•</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {item.courseType}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "degreeType",
      header: "Level",
      render: (item) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {item.degreeType}
        </span>
      ),
    },
    {
      key: "credits",
      header: "Credits",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
          {item.credits} Credits
        </span>
      ),
    },
    {
      key: "regulationYear",
      header: "Regulation",
      render: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {item.regulationYear}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(item)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Syllabus"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setItemToDelete(item)}
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
            title="Delete Course"
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
        title="Curriculum & Syllabus (OBE Framework)"
        description="Manage Outcome Based Education (OBE) course structures, learning outcomes, credits, and syllabus PDF documents."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Academics", href: "#" },
          { label: "Curriculum" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Course Syllabus
          </button>
        }
      />

      {/* Regulation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {["All", "2024", "2021", "2018"].map((reg) => (
          <button
            key={reg}
            onClick={() => setSelectedRegulation(reg)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              selectedRegulation === reg
                ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {reg === "All" ? "All Regulations" : `Regulation ${reg}`}
          </button>
        ))}
      </div>

      <DataTable
        data={filteredCurriculum}
        columns={columns}
        searchKey="courseName"
        searchPlaceholder="Search courses by title, code or department..."
        pageSize={8}
      />

      {/* Edit / Create Modal */}
      {isEditorOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSaveItem} className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {curriculum.some((c) => c.id === selectedItem.id) ? "Edit Course Syllabus" : "Add New Course"}
                  </h3>
                  <p className="text-xs text-slate-500">Autonomous curriculum details & OBE framework</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedItem.courseCode}
                    onChange={(e) => setSelectedItem({ ...selectedItem, courseCode: e.target.value })}
                    placeholder="e.g. 24UCSC101"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Degree Level *
                  </label>
                  <select
                    value={selectedItem.degreeType}
                    onChange={(e) => setSelectedItem({ ...selectedItem, degreeType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="Ph.D">Doctoral (Ph.D)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={selectedItem.courseName}
                  onChange={(e) => setSelectedItem({ ...selectedItem, courseName: e.target.value })}
                  placeholder="e.g. Programming in C & Data Structures"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={selectedItem.semester}
                    onChange={(e) => setSelectedItem({ ...selectedItem, semester: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={selectedItem.credits}
                    onChange={(e) => setSelectedItem({ ...selectedItem, credits: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Type
                  </label>
                  <select
                    value={selectedItem.courseType}
                    onChange={(e) => setSelectedItem({ ...selectedItem, courseType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Core">Core Course</option>
                    <option value="Allied">Allied Course</option>
                    <option value="Elective">Elective</option>
                    <option value="Skill Based">Skill Based Subject</option>
                    <option value="Value Added">Value Added Course</option>
                    <option value="NME">Non-Major Elective</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Regulation & Scheme
                </label>
                <input
                  type="text"
                  value={selectedItem.regulationYear}
                  onChange={(e) => setSelectedItem({ ...selectedItem, regulationYear: e.target.value })}
                  placeholder="e.g. 2024 (OBE - CBCS)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Syllabus PDF URL / File Link
                </label>
                <input
                  type="text"
                  value={selectedItem.syllabusPdfUrl}
                  onChange={(e) => setSelectedItem({ ...selectedItem, syllabusPdfUrl: e.target.value })}
                  placeholder="/documents/curriculum/syllabus.pdf or external Drive link"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  Save Syllabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteItem}
        title="Delete Course Syllabus"
        description={`Are you sure you want to delete ${itemToDelete?.courseCode} - ${itemToDelete?.courseName}? This course will no longer appear in the academic curriculum.`}
        confirmText="Delete Course"
        variant="danger"
      />
    </div>
  );
}
