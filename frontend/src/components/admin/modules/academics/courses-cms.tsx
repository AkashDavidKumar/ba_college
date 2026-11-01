"use client";

import React, { useState } from "react";
import { useSiteData } from "@/lib/site-context";
import { useCMSStore } from "@/lib/cms-store";
import { PageHeader } from "@/components/admin/core/page-header";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Clock,
  GraduationCap,
  Users,
  Award,
  ChevronLeft,
  Save,
} from "lucide-react";

export type CourseItem = {
  id: string;
  name: string;
  code: string;
  departmentSlug: string;
  departmentName: string;
  level: "UG" | "PG";
  duration: string;
  eligibility: string;
  intake: number;
  description: string;
  status: "Open" | "Closing Soon" | "Admissions Open";
};

const INITIAL_COURSES: CourseItem[] = [
  { id: "c-1", name: "B.Sc Computer Science", code: "BSC-CS", departmentSlug: "computer-science", departmentName: "Computer Science", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass with Mathematics / Computer Science (Min 50%)", intake: 60, description: "Core algorithms, data structures, full-stack web, cloud computing, and AI.", status: "Admissions Open" },
  { id: "c-2", name: "B.Sc Information Technology", code: "BSC-IT", departmentSlug: "computer-science", departmentName: "Computer Science", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass with Mathematics / Computer Science", intake: 60, description: "Applied IT infrastructure, networking, cloud systems, and database management.", status: "Admissions Open" },
  { id: "c-3", name: "BCA (Computer Applications)", code: "BCA", departmentSlug: "computer-science", departmentName: "Computer Science", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass in any stream with Mathematics / Computer Applications", intake: 60, description: "Software development, enterprise application programming, and mobile app design.", status: "Admissions Open" },
  { id: "c-4", name: "B.Com (General)", code: "BCOM-GEN", departmentSlug: "commerce-general", departmentName: "Commerce", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass with Commerce / Accountancy", intake: 60, description: "Corporate accounting, banking regulations, business law, and taxation.", status: "Admissions Open" },
  { id: "c-5", name: "B.Com Computer Applications (CA)", code: "BCOM-CA", departmentSlug: "commerce-general", departmentName: "Commerce", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass with Commerce / Accountancy / Computer Science", intake: 60, description: "Financial accounting combined with Tally ERP, e-commerce, and database systems.", status: "Admissions Open" },
  { id: "c-6", name: "B.Com Professional Accounting (PA)", code: "BCOM-PA", departmentSlug: "commerce-general", departmentName: "Commerce", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass with Commerce / Accountancy (Min 60%)", intake: 60, description: "Specialized CA/CMA integrated syllabus covering auditing, advanced cost accounting.", status: "Admissions Open" },
  { id: "c-7", name: "B.Com Corporate Secretaryship (CS)", code: "BCOM-CS", departmentSlug: "commerce-general", departmentName: "Commerce", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass with Commerce / Accountancy", intake: 60, description: "Company law, secretarial practice, governance standards, and corporate compliance.", status: "Admissions Open" },
  { id: "c-8", name: "BBA (Business Administration)", code: "BBA", departmentSlug: "management", departmentName: "Management Studies", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass in any discipline", intake: 60, description: "Managerial leadership, marketing strategy, HR analytics, and entrepreneurship.", status: "Admissions Open" },
  { id: "c-9", name: "B.Sc Mathematics", code: "BSC-MATH", departmentSlug: "mathematics", departmentName: "Mathematics", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass with Pure Mathematics / Higher Mathematics", intake: 50, description: "Pure & applied mathematics, operations research, statistics, and computational logic.", status: "Admissions Open" },
  { id: "c-10", name: "B.A. English Literature", code: "BA-ENG", departmentSlug: "english", departmentName: "English", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass in any stream with English", intake: 50, description: "World literature, communicative journalism, linguistics, and creative writing.", status: "Admissions Open" },
  { id: "c-11", name: "B.A. Tamil Literature", code: "BA-TAM", departmentSlug: "tamil", departmentName: "Tamil", level: "UG", duration: "3 Years (6 Semesters)", eligibility: "+2 Pass with Tamil as first language", intake: 50, description: "Classical Sangam literature, epics, grammar, media writing, and Tamil cultural history.", status: "Admissions Open" },
  { id: "c-12", name: "M.Com (Master of Commerce)", code: "MCOM", departmentSlug: "commerce-general", departmentName: "Commerce", level: "PG", duration: "2 Years (4 Semesters)", eligibility: "B.Com / BBA with minimum 55% aggregate", intake: 40, description: "Advanced financial management, security analysis, quantitative research methods.", status: "Admissions Open" },
  { id: "c-13", name: "M.Sc Computer Science", code: "MSC-CS", departmentSlug: "computer-science", departmentName: "Computer Science", level: "PG", duration: "2 Years (4 Semesters)", eligibility: "B.Sc CS / BCA / B.Sc IT with minimum 55% aggregate", intake: 40, description: "Advanced machine learning, distributed computing, cyber forensics, and research project.", status: "Admissions Open" },
];

export function CoursesCMS() {
  const { currentUser, canAccessDepartment, logAction } = useCMSStore();
  const { toast } = useToast();

  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CourseItem>>({
    name: "",
    code: "",
    departmentSlug: "computer-science",
    departmentName: "Computer Science",
    level: "UG",
    duration: "3 Years (6 Semesters)",
    eligibility: "",
    intake: 60,
    description: "",
    status: "Admissions Open",
  });

  const accessibleCourses = courses.filter((c) => canAccessDepartment(c.departmentSlug));

  const handleOpenCreate = () => {
    setFormData({
      id: "c-" + Date.now(),
      name: "",
      code: "",
      departmentSlug: currentUser.departmentId || "computer-science",
      departmentName: "Department",
      level: "UG",
      duration: "3 Years (6 Semesters)",
      eligibility: "+2 Pass with relevant stream (Min 50%)",
      intake: 60,
      description: "",
      status: "Admissions Open",
    });
    setEditingCourse(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (course: CourseItem) => {
    setFormData({ ...course });
    setEditingCourse(course);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.code?.trim()) {
      toast({ title: "Validation Error", description: "Course title and code are required.", variant: "destructive" });
      return;
    }

    if (editingCourse) {
      setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? ({ ...c, ...formData } as CourseItem) : c)));
      logAction({ action: "UPDATE", module: "Courses", recordId: editingCourse.id, recordTitle: formData.name });
      toast({ title: "Course Updated", description: `Updated '${formData.name}'.` });
    } else {
      const newC: CourseItem = {
        id: "c-" + Date.now(),
        name: formData.name,
        code: formData.code,
        departmentSlug: formData.departmentSlug || "computer-science",
        departmentName: formData.departmentName || "Department",
        level: formData.level || "UG",
        duration: formData.duration || "3 Years",
        eligibility: formData.eligibility || "",
        intake: formData.intake || 60,
        description: formData.description || "",
        status: formData.status || "Admissions Open",
      };
      setCourses((prev) => [newC, ...prev]);
      logAction({ action: "CREATE", module: "Courses", recordId: newC.id, recordTitle: newC.name });
      toast({ title: "Course Added", description: `Added '${newC.name}'.` });
    }
    setIsEditing(false);
  };

  const columns: Column<CourseItem>[] = [
    {
      key: "name",
      header: "Programme Title & Code",
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{c.name}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            {c.code} • {c.level}
          </div>
        </div>
      ),
    },
    {
      key: "departmentName",
      header: "Department",
      sortable: true,
      render: (c) => <span className="text-xs text-slate-700 font-medium">{c.departmentName}</span>,
    },
    {
      key: "duration",
      header: "Duration",
      render: (c) => (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#009688]" /> {c.duration}
        </span>
      ),
    },
    {
      key: "intake",
      header: "Intake",
      render: (c) => <span className="font-bold text-xs">{c.intake} Seats</span>,
    },
    {
      key: "status",
      header: "Admission Status",
      render: (c) => (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {c.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(c)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          {currentUser.role === "master_admin" && (
            <button
              onClick={() => setDeleteId(c.id)}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {!isEditing ? (
        <>
          <PageHeader
            title="Courses & Degree Programmes"
            subtitle="Manage all 13 undergraduate and postgraduate programmes, durations, eligibility criteria, intake capacity, and syllabus outlines."
            badge={`${accessibleCourses.length} Programmes`}
            breadcrumbs={[
              { label: "Dashboard", onClick: () => {} },
              { label: "Academics" },
              { label: "Courses" },
            ]}
            action={
              currentUser.role === "master_admin"
                ? {
                    label: "Add Programme",
                    icon: Plus,
                    onClick: handleOpenCreate,
                  }
                : undefined
            }
          />

          <DataTable
            data={accessibleCourses}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search courses by name or code..."
            emptyTitle="No courses found"
            onRowClick={handleOpenEdit}
          />
        </>
      ) : (
        /* Form view */
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs space-y-5 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-base text-slate-900 font-serif">
                {editingCourse ? `Editing: ${formData.name}` : "Add Degree Programme"}
              </h3>
            </div>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#009688] hover:bg-[#00796b] shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Course
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. B.Sc Computer Science"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. BSC-CS"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Degree Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="UG">Undergraduate (UG)</option>
                  <option value="PG">Postgraduate (PG)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sanctioned Intake
                </label>
                <input
                  type="number"
                  value={formData.intake}
                  onChange={(e) => setFormData({ ...formData, intake: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Eligibility Criteria
              </label>
              <input
                type="text"
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                placeholder="+2 Pass in relevant subjects"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Programme Description & Outcomes
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none resize-none"
              />
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
            setCourses((prev) => prev.filter((c) => c.id !== deleteId));
            logAction({ action: "DELETE", module: "Courses", recordId: deleteId, recordTitle: "Deleted course" });
            toast({ title: "Course Deleted", description: "Course removed from catalog." });
          }
        }}
        title="Delete Degree Programme"
        description="Are you sure you want to delete this course? Public admissions and curriculum pages will be updated."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
