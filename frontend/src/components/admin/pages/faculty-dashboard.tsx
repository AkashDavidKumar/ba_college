"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Building2,
  Mail,
  Award,
  BookOpen,
  Edit2,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useSiteData } from "@/lib/site-context";
import { useToast } from "@/hooks/use-toast";

interface FacultyItem {
  id: string;
  name: string;
  department: string;
  designation: string;
  qualification: string;
  experience: string;
  email: string;
  publications: number;
  image: string;
}

const INITIAL_FACULTY: FacultyItem[] = [
  {
    id: "f1",
    name: "Dr. K. Suresh",
    department: "Computer Science",
    designation: "Associate Professor & HOD",
    qualification: "Ph.D. in AI & Machine Learning, M.Tech",
    experience: "16 Years",
    email: "suresh.cs@bac.edu.in",
    publications: 24,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f2",
    name: "Dr. M. Lakshmi",
    department: "Commerce",
    designation: "Professor & HOD",
    qualification: "Ph.D., M.Com, M.Phil, MBA",
    experience: "21 Years",
    email: "lakshmi.commerce@bac.edu.in",
    publications: 32,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f3",
    name: "Dr. V. Anitha",
    department: "Computer Science",
    designation: "Principal & Senior Professor",
    qualification: "Ph.D. in Cloud Computing, M.Sc, M.Phil",
    experience: "24 Years",
    email: "principal@bac.edu.in",
    publications: 48,
    image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f4",
    name: "Dr. S. Ramanathan",
    department: "Management Studies",
    designation: "Associate Professor",
    qualification: "Ph.D., MBA (Finance), UGC NET",
    experience: "14 Years",
    email: "ramanathan.mgmt@bac.edu.in",
    publications: 18,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f5",
    name: "Prof. P. Mary Sunitha",
    department: "English",
    designation: "Assistant Professor & Head",
    qualification: "M.A., M.Phil., SET",
    experience: "11 Years",
    email: "sunitha.eng@bac.edu.in",
    publications: 12,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f6",
    name: "Dr. R. David Wilson",
    department: "Mathematics",
    designation: "Assistant Professor",
    qualification: "Ph.D. in Operations Research, M.Sc",
    experience: "9 Years",
    email: "david.maths@bac.edu.in",
    publications: 15,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f7",
    name: "Prof. A. Catherine",
    department: "Visual Communication",
    designation: "Assistant Professor",
    qualification: "M.Sc. Electronic Media, M.Phil",
    experience: "8 Years",
    email: "catherine.viscom@bac.edu.in",
    publications: 7,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f8",
    name: "Dr. N. Balamurugan",
    department: "Biotechnology",
    designation: "Associate Professor & HOD",
    qualification: "Ph.D., M.Sc., Post-Doc (Japan)",
    experience: "15 Years",
    email: "balamurugan.biotech@bac.edu.in",
    publications: 29,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  },
];

export function FacultyDashboard() {
  const { toast } = useToast();
  const [facultyList, setFacultyList] = useState<FacultyItem[]>(INITIAL_FACULTY);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState<Partial<FacultyItem>>({
    name: "",
    department: "Computer Science",
    designation: "Assistant Professor",
    qualification: "",
    experience: "",
    email: "",
    publications: 0,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  });

  const departments = ["All", ...Array.from(new Set(facultyList.map((f) => f.department)))];

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase()) ||
      f.qualification.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "All" || f.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.department) return;

    const item: FacultyItem = {
      id: Date.now().toString(),
      name: newFaculty.name,
      department: newFaculty.department || "Computer Science",
      designation: newFaculty.designation || "Assistant Professor",
      qualification: newFaculty.qualification || "M.Phil, Ph.D",
      experience: newFaculty.experience || "5 Years",
      email: newFaculty.email || `${newFaculty.name.toLowerCase().replace(/\s+/g, ".")}@bac.edu.in`,
      publications: Number(newFaculty.publications) || 0,
      image: newFaculty.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    };

    setFacultyList([item, ...facultyList]);
    setShowModal(false);
    toast({
      title: "Faculty Added",
      description: `${item.name} has been added to ${item.department}.`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from faculty directory?`)) {
      setFacultyList(facultyList.filter((f) => f.id !== id));
      toast({
        title: "Faculty Removed",
        description: `${name} has been removed.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Directory & Staff</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage 95+ accredited professors, department heads, and academic mentors at BAC.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C1E36] hover:bg-[#081526] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Faculty Member
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name, qualification..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-500 shrink-0">Department:</span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFaculty.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3.5 mb-4">
                <img
                  src={f.image}
                  alt={f.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0 shadow-xs"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{f.name}</h3>
                  <div className="text-xs font-medium text-[#009688] mt-0.5">{f.designation}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <Building2 className="w-3 h-3 text-slate-300 shrink-0" />
                    {f.department}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex items-start gap-2 text-slate-600">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate">{f.qualification}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{f.experience} Academic Experience</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-slate-500 font-mono">{f.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                <strong className="text-slate-900 font-bold">{f.publications}</strong> Publications
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    toast({
                      title: `Editing ${f.name}`,
                      description: "Faculty update dialog opened.",
                    })
                  }
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Edit Faculty"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(f.id, f.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Faculty"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Add New Faculty Member</h3>
            <p className="text-xs text-slate-500">
              Provide complete academic profile details for college accreditation records.
            </p>

            <form onSubmit={handleAddFaculty} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name with Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. A. Johnson"
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Management Studies">Management Studies</option>
                    <option value="English">English</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Visual Communication">Visual Communication</option>
                    <option value="Biotechnology">Biotechnology</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Designation</label>
                  <select
                    value={newFaculty.designation}
                    onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                  >
                    <option value="HOD & Professor">HOD & Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Academic Qualifications</label>
                <input
                  type="text"
                  placeholder="e.g. Ph.D. in AI, M.Sc, M.Phil"
                  value={newFaculty.qualification}
                  onChange={(e) => setNewFaculty({ ...newFaculty, qualification: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Teaching Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 Years"
                    value={newFaculty.experience}
                    onChange={(e) => setNewFaculty({ ...newFaculty, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Research Publications</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={newFaculty.publications}
                    onChange={(e) => setNewFaculty({ ...newFaculty, publications: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#0C1E36] hover:bg-[#081526] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Faculty Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
