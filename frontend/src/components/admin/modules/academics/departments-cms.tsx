"use client";

import React, { useState } from "react";
import { useSiteData } from "@/lib/site-context";
import { useCMSStore } from "@/lib/cms-store";
import { Department } from "@/lib/university-data";
import { PageHeader } from "@/components/admin/core/page-header";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  GraduationCap,
  Save,
  ChevronLeft,
  Award,
  Layers,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";

export function DepartmentsCMS() {
  const { data, saveDepartment, deleteDepartment } = useSiteData();
  const { currentUser, canAccessDepartment, logAction } = useCMSStore();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<Partial<Department>>({
    name: "",
    shortName: "",
    slug: "",
    category: "School of Computing",
    icon: "Cpu",
    description: "",
    longDescription: "",
    facultyCount: 12,
    studentCount: 450,
    placementRate: 88,
    programsCount: 2,
    researchLabs: 3,
    color: "navy",
    vision: "",
    mission: "",
    contact: { address: "BAC Campus, Ramanathapuram", phone: "0422-2316731", email: "cs@bac.edu.in", hod: "Dr. K. Suresh" },
  });

  const allDepts = data?.departments || [];
  // Filter based on user role (HOD only sees assigned dept)
  const accessibleDepts = allDepts.filter((d) => canAccessDepartment(d.slug));

  const handleOpenCreate = () => {
    setForm({
      name: "",
      shortName: "",
      slug: "",
      category: "School of Computing",
      icon: "Cpu",
      description: "",
      longDescription: "",
      facultyCount: 10,
      studentCount: 300,
      placementRate: 85,
      programsCount: 1,
      researchLabs: 2,
      color: "navy",
      vision: "To foster excellence in academic knowledge and professional innovation.",
      mission: "To impart quality education with strong practical competencies.",
      contact: { address: "Bishop Ambrose College", phone: "0422-2316731", email: "dept@bac.edu.in", hod: "HOD" },
      highlights: [],
      programs: [],
      faculty: [],
      researchAreas: [],
      researchStats: { publications: 25, patents: 2, projects: 5, centers: 1 },
      labs: [],
      events: [],
      alumni: [],
      achievements: [],
      flagshipEvents: [],
      cover: "from-navy via-navy-light to-navy-dark",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    });
    setEditingDept(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setForm({ ...dept });
    setEditingDept(dept);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.slug?.trim()) {
      toast({ title: "Validation Error", description: "Department name and slug are required.", variant: "destructive" });
      return;
    }

    const deptToSave = {
      ...form,
      programs: form.programs || [],
      faculty: form.faculty || [],
      labs: form.labs || [],
      events: form.events || [],
      alumni: form.alumni || [],
      achievements: form.achievements || [],
      highlights: form.highlights || [],
      flagshipEvents: form.flagshipEvents || [],
    } as Department;

    const ok = await saveDepartment(deptToSave, !editingDept);
    if (ok) {
      logAction({
        action: editingDept ? "UPDATE" : "CREATE",
        module: "Departments",
        recordId: form.slug,
        recordTitle: form.name,
      });
      toast({
        title: editingDept ? "Department Updated" : "Department Created",
        description: `Department '${form.name}' saved and published to website.`,
      });
      setIsEditing(false);
    } else {
      toast({ title: "Save Failed", description: "Could not save department.", variant: "destructive" });
    }
  };

  const columns: Column<Department>[] = [
    {
      key: "name",
      header: "Department Name & Code",
      sortable: true,
      render: (d) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{d.name}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            {d.shortName} • /{d.slug}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Faculty & Students",
      render: (d) => (
        <div className="text-xs text-slate-600">
          <span className="font-bold text-slate-800">{d.facultyCount || d.faculty?.length || 0}</span> Faculty •{" "}
          <span className="font-bold text-slate-800">{d.studentCount || 0}</span> Students
        </div>
      ),
    },
    {
      key: "hod",
      header: "Head of Department",
      render: (d) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800">{d.contact?.hod || "Appointed HOD"}</span>
          <p className="text-[10px] text-slate-400">{d.contact?.email}</p>
        </div>
      ),
    },
    {
      key: "placementRate",
      header: "Placement %",
      sortable: true,
      render: (d) => <span className="font-bold text-xs text-emerald-600">{d.placementRate || 85}%</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (d) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(d)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Edit Department"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          {currentUser.role === "master_admin" && (
            <button
              onClick={() => setDeleteSlug(d.slug)}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
              title="Delete Department"
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
            title="Academic Departments Management"
            subtitle="Configure department curricula, HOD leadership message, faculty rosters, laboratories, and placement milestones."
            badge={`${accessibleDepts.length} Departments`}
            breadcrumbs={[
              { label: "Dashboard", onClick: () => {} },
              { label: "Academics" },
              { label: "Departments" },
            ]}
            action={
              currentUser.role === "master_admin"
                ? {
                    label: "Add Department",
                    icon: Plus,
                    onClick: handleOpenCreate,
                  }
                : undefined
            }
          />

          <DataTable
            data={accessibleDepts}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search departments by name or code..."
            emptyTitle="No departments found"
            emptyDescription="No department records match your query."
            onRowClick={handleOpenEdit}
          />
        </>
      ) : (
        /* Department Edit Form */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  {editingDept ? `Editing: ${form.name}` : "New Academic Department"}
                </h2>
                <p className="text-xs text-slate-500">
                  Update department profile, vision & mission statements, and HOD contact info.
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#009688] hover:bg-[#00796b] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" /> Save Department
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Info */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 font-serif border-b border-slate-100 pb-2">
                Department Overview
              </h3>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Department Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Department of Computer Science"
                  value={form.name}
                  onChange={(e) => {
                    const n = e.target.value;
                    const slug = n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setForm({ ...form, name: n, slug: form.slug || slug });
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Short Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Sc CS"
                    value={form.shortName}
                    onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={currentUser.role !== "master_admin" && Boolean(editingDept)}
                    placeholder="computer-science"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none font-mono disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Brief Department Summary
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Detailed Academic Narrative
                </label>
                <textarea
                  rows={4}
                  value={form.longDescription}
                  onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Vision, Mission & Contact */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 font-serif border-b border-slate-100 pb-2">
                Vision, Mission & Leadership
              </h3>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Department Vision Statement
                </label>
                <textarea
                  rows={3}
                  value={form.vision}
                  onChange={(e) => setForm({ ...form, vision: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Department Mission Statement
                </label>
                <textarea
                  rows={3}
                  value={form.mission}
                  onChange={(e) => setForm({ ...form, mission: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    HOD Name
                  </label>
                  <input
                    type="text"
                    value={form.contact?.hod}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contact: { ...form.contact!, hod: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Department Email
                  </label>
                  <input
                    type="email"
                    value={form.contact?.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contact: { ...form.contact!, email: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        open={Boolean(deleteSlug)}
        onClose={() => setDeleteSlug(null)}
        onConfirm={async () => {
          if (deleteSlug) {
            await deleteDepartment(deleteSlug);
            logAction({ action: "DELETE", module: "Departments", recordId: deleteSlug, recordTitle: "Deleted department" });
            toast({ title: "Department Deleted", description: "Department removed from website." });
          }
        }}
        title="Delete Department"
        description="Are you sure you want to permanently delete this department? All associated courses, faculty mappings, and events will be affected."
        confirmLabel="Delete Department"
        confirmVariant="danger"
      />
    </div>
  );
}
