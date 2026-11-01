"use client";

import React, { useState, useEffect } from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  BookOpen,
  Search,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  name: string;
  level: "UG" | "PG" | "Doctoral" | "Certificate";
  department: string;
  duration: string;
  eligibility: string;
  fees?: string;
  description: string;
  curriculum?: string;
  admissionInfo?: string;
  published: boolean;
}

const LEVEL_TABS = [
  { id: "all",         label: "All Programs" },
  { id: "UG",          label: "UG Programs" },
  { id: "PG",          label: "PG Programs" },
  { id: "Doctoral",    label: "Doctoral" },
  { id: "Certificate", label: "Certifications" },
];

const EMPTY_COURSE: Omit<Course, "id"> = {
  name: "",
  level: "UG",
  department: "",
  duration: "",
  eligibility: "",
  fees: "",
  description: "",
  curriculum: "",
  admissionInfo: "",
  published: true,
};

interface CoursesDashboardProps {
  nav: NavState;
  setNav: (nav: NavState) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CoursesDashboard({ nav, setNav }: CoursesDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLevel, setActiveLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Omit<Course, "id">>(EMPTY_COURSE);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data.courses || []);
    } catch {
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.department || !form.duration) {
      setError("Name, department, and duration are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const isEdit = !!editCourse;
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/courses/${editCourse!.id}` : "/api/courses";
      const body = isEdit ? { ...form, id: editCourse!.id } : form;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      setSuccess(isEdit ? "Course updated!" : "Course added!");
      setEditCourse(null);
      setIsAdding(false);
      setForm(EMPTY_COURSE);
      fetchCourses();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    try {
      await fetch(`/api/courses/${id}`, { method: "DELETE" });
      fetchCourses();
    } catch {
      setError("Failed to delete course.");
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...course, published: !course.published }),
      });
      fetchCourses();
    } catch {}
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setForm({
      name: course.name,
      level: course.level,
      department: course.department,
      duration: course.duration,
      eligibility: course.eligibility,
      fees: course.fees || "",
      description: course.description,
      curriculum: course.curriculum || "",
      admissionInfo: course.admissionInfo || "",
      published: course.published,
    });
    setIsAdding(false);
  };

  const openAdd = () => {
    setEditCourse(null);
    setForm(EMPTY_COURSE);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditCourse(null);
    setIsAdding(false);
    setForm(EMPTY_COURSE);
    setError("");
  };

  const filtered = courses.filter((c) => {
    const matchLevel = activeLevel === "all" || c.level === activeLevel;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const showForm = isAdding || !!editCourse;

  return (
    <PageDashboard
      pageName="Course Management"
      pageDescription="Manage all academic programs and course offerings listed on the public Courses page"
    >
      {/* ── Level Tabs ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex min-w-max">
          {LEVEL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveLevel(tab.id)}
              className={`px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeLevel === tab.id
                  ? "border-amber-400 text-amber-700 bg-amber-50/60"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">
                {tab.id === "all"
                  ? courses.length
                  : courses.filter((c) => c.level === tab.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* ── Alerts ────────────────────────────────────── */}
      {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

      {/* ── Add / Edit Form ───────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-amber-400 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              {editCourse ? "Edit Course" : "Add New Course"}
            </h3>
            <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Course / Program Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. B.Tech Computer Science & Engineering" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Level *</label>
              <select className={inputCls} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as Course["level"] })}>
                <option>UG</option>
                <option>PG</option>
                <option>Doctoral</option>
                <option>Certificate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Department *</label>
              <input className={inputCls} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Computer Science & Engineering" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Duration *</label>
              <input className={inputCls} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 4 Years (8 Semesters)" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fee Structure</label>
              <input className={inputCls} value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} placeholder="e.g. ₹1,20,000 per year" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Eligibility Criteria *</label>
              <input className={inputCls} value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="e.g. 10+2 with PCM, 75% aggregate" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
              <textarea className={inputCls + " resize-none"} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief overview of the program…" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Curriculum Overview</label>
              <textarea className={inputCls + " resize-none"} rows={3} value={form.curriculum} onChange={(e) => setForm({ ...form, curriculum: e.target.value })} placeholder="Key subjects, specialisations, electives…" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Admission Information</label>
              <textarea className={inputCls + " resize-none"} rows={2} value={form.admissionInfo} onChange={(e) => setForm({ ...form, admissionInfo: e.target.value })} placeholder="Entrance test, merit process, dates…" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 accent-amber-500"
              />
              Published (visible on public website)
            </label>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 disabled:opacity-60 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : editCourse ? "Update Course" : "Add Course"}
            </button>
            <button onClick={cancelEdit} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Course List ────────────────────────────────── */}
      {loading ? (
        <CourseListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className="space-y-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => openEdit(course)}
              onDelete={() => handleDelete(course.id)}
              onTogglePublish={() => handleTogglePublish(course)}
            />
          ))}
        </div>
      )}
    </PageDashboard>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  course: Course;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const levelColors: Record<string, string> = {
    UG: "bg-blue-100 text-blue-700",
    PG: "bg-purple-100 text-purple-700",
    Doctoral: "bg-rose-100 text-rose-700",
    Certificate: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-sm hover:border-amber-200 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${levelColors[course.level] || "bg-slate-100 text-slate-600"}`}>
              {course.level}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${course.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {course.published ? "Published" : "Draft"}
            </span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm truncate">{course.name}</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
            <span className="text-xs text-slate-500">{course.department}</span>
            <span className="text-xs text-slate-400">{course.duration}</span>
            {course.fees && <span className="text-xs text-slate-400">{course.fees}</span>}
          </div>
          {course.description && (
            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{course.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onTogglePublish}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              course.published
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {course.published ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
      <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p className="font-semibold text-slate-500 mb-1">No courses found</p>
      <p className="text-xs text-slate-400 mb-4">Add your first course to get started.</p>
      <button onClick={onAdd} className="px-4 py-2 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-500 transition-colors">
        Add Course
      </button>
    </div>
  );
}

function CourseListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-100 rounded w-24" />
              <div className="h-4 bg-slate-100 rounded w-64" />
              <div className="h-3 bg-slate-100 rounded w-40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white transition";
