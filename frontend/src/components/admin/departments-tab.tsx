"use client";

import React, { useState } from "react";
import { useSiteData } from "@/lib/site-context";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  GraduationCap,
  FlaskConical,
  Activity,
  Upload,
  Loader2
} from "lucide-react";

export function DepartmentsTab() {
  const { data, saveDepartment, deleteDepartment } = useSiteData();
  const { toast } = useToast();

  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Program form states (sub-forms)
  const [newProgram, setNewProgram] = useState({
    id: "",
    name: "",
    duration: "4 Years",
    eligibility: "10+2 with PCM",
    accreditation: "ABET Accredited",
    description: "",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    level: "UG" as "UG" | "PG" | "Doctoral"
  });

  const [newLab, setNewLab] = useState({
    name: "",
    description: "",
    capacity: 30,
    equipment: [] as string[],
    newEquipmentText: "",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
  });

  const resetForm = () => {
    setEditingDept(null);
    setIsNew(false);
  };

  const handleEdit = (dept: any) => {
    setEditingDept(JSON.parse(JSON.stringify(dept))); // Deep copy
    setIsNew(false);
  };

  const handleCreateNew = () => {
    setEditingDept({
      slug: "",
      name: "",
      shortName: "",
      category: "School of Engineering",
      icon: "Cpu",
      description: "",
      longDescription: "",
      cover: "from-navy via-navy-light to-navy-dark",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
      facultyCount: 20,
      studentCount: 500,
      placementRate: 90,
      programsCount: 1,
      researchLabs: 1,
      color: "navy",
      vision: "",
      mission: "",
      highlights: [],
      programs: [],
      faculty: [],
      researchAreas: [],
      researchStats: { publications: 10, patents: 2, projects: 5, centers: 1 },
      labs: [],
      events: [],
      alumni: [],
      achievements: [],
      flagshipEvents: [],
      contact: { address: "BAC Campus", phone: "+91 80 4967 0000", email: "", hod: "" }
    });
    setIsNew(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this department? This cannot be undone.")) {
      return;
    }
    setIsDeleting(slug);
    try {
      const ok = await deleteDepartment(slug);
      if (ok) {
        toast({
          title: "Department Deleted",
          description: "Department has been removed from the website catalog.",
        });
      } else {
        throw new Error();
      }
    } catch (e) {
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the department.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept.slug || !editingDept.name) {
      toast({
        title: "Validation Error",
        description: "Slug and Name are required.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    // Auto count programs/labs
    editingDept.programsCount = editingDept.programs?.length || 0;
    editingDept.researchLabs = editingDept.labs?.length || 0;

    try {
      const ok = await saveDepartment(editingDept, isNew);
      if (ok) {
        toast({
          title: isNew ? "Department Created" : "Department Saved",
          description: `Successfully configured ${editingDept.name}.`,
        });
        resetForm();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast({
        title: "Save Failed",
        description: "Make sure you used a unique slug.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addProgram = () => {
    if (!newProgram.name || !newProgram.description) {
      alert("Please fill in program name and description.");
      return;
    }
    const id = "p-" + Date.now();
    const updatedPrograms = [...(editingDept.programs || []), { ...newProgram, id }];
    setEditingDept({ ...editingDept, programs: updatedPrograms });
    // Clear subform
    setNewProgram({
      id: "",
      name: "",
      duration: "4 Years",
      eligibility: "10+2 with PCM",
      accreditation: "ABET Accredited",
      description: "",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
      level: "UG"
    });
  };

  const removeProgram = (id: string) => {
    const updatedPrograms = editingDept.programs.filter((p: any) => p.id !== id);
    setEditingDept({ ...editingDept, programs: updatedPrograms });
  };

  const addLab = () => {
    if (!newLab.name || !newLab.description) {
      alert("Please fill in laboratory name and description.");
      return;
    }
    const updatedLabs = [...(editingDept.labs || []), { ...newLab }];
    setEditingDept({ ...editingDept, labs: updatedLabs });
    setNewLab({
      name: "",
      description: "",
      capacity: 30,
      equipment: [],
      newEquipmentText: "",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
    });
  };

  const removeLab = (name: string) => {
    const updatedLabs = editingDept.labs.filter((l: any) => l.name !== name);
    setEditingDept({ ...editingDept, labs: updatedLabs });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, _target: "dept" | "prog" | "lab") => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({
      title: "Direct Upload Unavailable",
      description: "Direct binary file upload is not configured on this server. Please enter a hosted image URL into the Cover Image URL field.",
      variant: "destructive"
    });
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* View list vs Editor */}
      {!editingDept ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">University Departments</h3>
              <p className="text-xs text-slate-400">Configure schools, program curriculums, labs, and metrics.</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.departments?.map((dept: any) => (
              <div
                key={dept.slug}
                className="flex items-start gap-4 p-4 rounded-xl border border-slate-150 hover:border-amber-400 bg-slate-50/50 hover:bg-white transition-all group shadow-sm"
              >
                <img
                  src={dept.coverImage}
                  alt={dept.name}
                  className="w-20 h-20 rounded-lg object-cover bg-slate-200 border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-bold text-slate-900 truncate">{dept.name}</h4>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">{dept.category}</div>
                  
                  <div className="flex gap-4 mt-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {dept.programs?.length || 0} Progs</span>
                    <span className="flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5" /> {dept.labs?.length || 0} Labs</span>
                    <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> {dept.placementRate}% Placements</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-900 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.slug)}
                    disabled={isDeleting === dept.slug}
                    className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    {isDeleting === dept.slug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center pb-6 border-b border-slate-100">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                {isNew ? "Create New Department" : `Configure ${editingDept.name}`}
              </h3>
              <p className="text-xs text-slate-400">Specify details, programs, labs, and metrics.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-amber-150 disabled:text-slate-400 text-xs font-bold text-slate-950 transition-all shadow-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                {isSaving ? "Saving..." : "Save Department"}
              </button>
            </div>
          </div>

          {/* Grid Layout fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Department Name
              </label>
              <input
                type="text"
                required
                value={editingDept.name}
                onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                placeholder="e.g. Mechanical Engineering"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Short Name (Abbreviation)
              </label>
              <input
                type="text"
                required
                value={editingDept.shortName}
                onChange={(e) => setEditingDept({ ...editingDept, shortName: e.target.value })}
                placeholder="e.g. ME"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Unique Slug (URL path)
              </label>
              <input
                type="text"
                required
                disabled={!isNew}
                value={editingDept.slug}
                onChange={(e) => setEditingDept({ ...editingDept, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                placeholder="e.g. mechanical-engineering"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Category School
              </label>
              <select
                value={editingDept.category}
                onChange={(e) => setEditingDept({ ...editingDept, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-white"
              >
                <option>School of Engineering</option>
                <option>School of Management</option>
                <option>School of Design</option>
                <option>School of Science</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Color theme
              </label>
              <select
                value={editingDept.color}
                onChange={(e) => setEditingDept({ ...editingDept, color: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-white"
              >
                <option value="navy">Navy (Blue)</option>
                <option value="gold">Gold (Amber)</option>
                <option value="emerald">Emerald (Green)</option>
                <option value="crimson">Crimson (Rose)</option>
                <option value="violet">Violet (Purple)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Placement Rate (%)
              </label>
              <input
                type="number"
                value={editingDept.placementRate}
                onChange={(e) => setEditingDept({ ...editingDept, placementRate: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Cover Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingDept.coverImage}
                  onChange={(e) => setEditingDept({ ...editingDept, coverImage: e.target.value })}
                  placeholder="https://... or /assets/department.jpg"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                />
                <label className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-slate-500" /> Select File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "dept")}
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Asset URL mode active: Enter a hosted image URL. Direct uploads require an upcoming media storage service.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Lucide icon name
              </label>
              <input
                type="text"
                value={editingDept.icon}
                onChange={(e) => setEditingDept({ ...editingDept, icon: e.target.value })}
                placeholder="e.g. Cpu, BookOpen, Layers"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Brief card description (displays on grid)
              </label>
              <input
                type="text"
                value={editingDept.description}
                onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Long overview description (displays inside detail page)
              </label>
              <textarea
                rows={3}
                value={editingDept.longDescription}
                onChange={(e) => setEditingDept({ ...editingDept, longDescription: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Faculty count
              </label>
              <input
                type="number"
                value={editingDept.facultyCount}
                onChange={(e) => setEditingDept({ ...editingDept, facultyCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Student count
              </label>
              <input
                type="number"
                value={editingDept.studentCount}
                onChange={(e) => setEditingDept({ ...editingDept, studentCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                HOD Name
              </label>
              <input
                type="text"
                value={editingDept.contact?.hod || ""}
                onChange={(e) => setEditingDept({ ...editingDept, contact: { ...editingDept.contact, hod: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Programs sub-form list */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
              Programs Offered
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-150 items-end">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Program name</label>
                <input
                  type="text"
                  value={newProgram.name}
                  onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                  placeholder="e.g. B.Tech in CSE (AI & ML)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Duration</label>
                <input
                  type="text"
                  value={newProgram.duration}
                  onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Level</label>
                <select
                  value={newProgram.level}
                  onChange={(e) => setNewProgram({ ...newProgram, level: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                >
                  <option>UG</option>
                  <option>PG</option>
                  <option>Doctoral</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description</label>
                <input
                  type="text"
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  placeholder="e.g. Focuses on neural networks, NLP, and reinforcement learning."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                />
              </div>

              <button
                type="button"
                onClick={addProgram}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold"
              >
                <PlusCircle className="w-4 h-4" /> Add Program
              </button>
            </div>

            {/* List existing */}
            <div className="space-y-2">
              {editingDept.programs?.map((prog: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                  <div>
                    <span className="font-semibold text-slate-900">{prog.name}</span>
                    <span className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded bg-gold/15 text-gold-dark">{prog.level}</span>
                    <span className="ml-2 text-xs text-slate-400">({prog.duration})</span>
                    <div className="text-xs text-slate-500 mt-1">{prog.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProgram(prog.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Laboratories sub-form list */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h4 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-amber-400 pl-2">
              Labs & Research Facilities
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-150 items-end">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lab name</label>
                <input
                  type="text"
                  value={newLab.name}
                  onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
                  placeholder="e.g. Advanced Robotics Lab"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Capacity (students)</label>
                <input
                  type="number"
                  value={newLab.capacity}
                  onChange={(e) => setNewLab({ ...newLab, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description</label>
                <input
                  type="text"
                  value={newLab.description}
                  onChange={(e) => setNewLab({ ...newLab, description: e.target.value })}
                  placeholder="Focuses on autonomous systems and kinematics."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                />
              </div>

              <button
                type="button"
                onClick={addLab}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold"
              >
                <PlusCircle className="w-4 h-4" /> Add Lab
              </button>
            </div>

            {/* List existing */}
            <div className="space-y-2">
              {editingDept.labs?.map((lab: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                  <div>
                    <span className="font-semibold text-slate-900">{lab.name}</span>
                    <span className="ml-2 text-xs text-slate-400">(Capacity: {lab.capacity})</span>
                    <div className="text-xs text-slate-500 mt-1">{lab.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLab(lab.name)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
