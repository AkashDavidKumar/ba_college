"use client";

import React, { useState, useMemo } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Users, Plus, Mail, Phone, Award, BookOpen, 
  Trash2, Edit3, ShieldCheck, CheckCircle, ExternalLink 
} from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  designation: string; // e.g. "Associate Professor & Head", "Assistant Professor"
  departmentId: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  email: string;
  phone?: string;
  isHod: boolean;
  avatarUrl?: string;
  publicationsCount: number;
  status: ContentStatus;
  joiningDate: string;
}

const INITIAL_FACULTY: FacultyMember[] = [
  {
    id: "fac-1",
    name: "Dr. K. Senthil Kumar",
    designation: "Associate Professor & Head",
    departmentId: "computer-science",
    qualification: "M.C.A., M.Phil., Ph.D., SET",
    specialization: "Cloud Computing, Big Data Analytics & Deep Learning",
    experienceYears: 18,
    email: "senthilkumar.cs@bac.edu.in",
    phone: "+91 94432 10981",
    isHod: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    publicationsCount: 24,
    status: "published",
    joiningDate: "2008-06-12",
  },
  {
    id: "fac-2",
    name: "Mrs. P. Revathi",
    designation: "Assistant Professor",
    departmentId: "computer-science",
    qualification: "M.Sc. (CS), M.Phil., NET",
    specialization: "Network Security & Cryptography",
    experienceYears: 9,
    email: "revathi.cs@bac.edu.in",
    phone: "+91 98941 23456",
    isHod: false,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    publicationsCount: 8,
    status: "published",
    joiningDate: "2015-07-01",
  },
  {
    id: "fac-3",
    name: "Dr. M. Joseph Raj",
    designation: "Associate Professor & Head",
    departmentId: "commerce",
    qualification: "M.Com., M.Phil., Ph.D., MBA",
    specialization: "Banking, Corporate Finance & Taxation Laws",
    experienceYears: 22,
    email: "josephraj.comm@bac.edu.in",
    phone: "+91 98422 56789",
    isHod: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    publicationsCount: 31,
    status: "published",
    joiningDate: "2004-06-16",
  },
  {
    id: "fac-4",
    name: "Dr. S. Anitha",
    designation: "Assistant Professor & Head",
    departmentId: "english",
    qualification: "M.A., M.Phil., Ph.D., SET",
    specialization: "British Literature & English Language Teaching (ELT)",
    experienceYears: 14,
    email: "anitha.eng@bac.edu.in",
    phone: "+91 97890 12345",
    isHod: true,
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    publicationsCount: 12,
    status: "published",
    joiningDate: "2011-08-01",
  },
  {
    id: "fac-5",
    name: "Mr. R. Vijay Anand",
    designation: "Assistant Professor",
    departmentId: "management",
    qualification: "MBA, M.Phil., NET",
    specialization: "Human Resource Management & Organizational Behavior",
    experienceYears: 7,
    email: "vijayanand.mgmt@bac.edu.in",
    phone: "+91 96290 87654",
    isHod: false,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    publicationsCount: 5,
    status: "published",
    joiningDate: "2018-06-25",
  },
];

export function FacultyCMS() {
  const { currentUser, canAccessDepartment, logAction } = useCMSStore();
  const [faculty, setFaculty] = useState<FacultyMember[]>(INITIAL_FACULTY);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<FacultyMember | null>(null);

  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => canAccessDepartment(f.departmentId));
  }, [faculty, canAccessDepartment]);

  const handleOpenEditor = (member?: FacultyMember) => {
    if (member) {
      setSelectedFaculty(member);
    } else {
      setSelectedFaculty({
        id: "fac-" + Date.now(),
        name: "",
        designation: "Assistant Professor",
        departmentId: currentUser.departmentId || "computer-science",
        qualification: "",
        specialization: "",
        experienceYears: 1,
        email: "",
        phone: "",
        isHod: false,
        publicationsCount: 0,
        status: currentUser.role === "master_admin" ? "published" : "submitted",
        joiningDate: new Date().toISOString().split("T")[0],
      });
    }
    setIsEditorOpen(true);
  };

  const handleSaveFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) return;

    if (faculty.some((f) => f.id === selectedFaculty.id)) {
      setFaculty((prev) => prev.map((f) => (f.id === selectedFaculty.id ? selectedFaculty : f)));
      logAction({
        action: "UPDATE",
        module: "Faculty Management",
        recordId: selectedFaculty.id,
        recordTitle: selectedFaculty.name,
      });
    } else {
      setFaculty((prev) => [selectedFaculty, ...prev]);
      logAction({
        action: "CREATE",
        module: "Faculty Management",
        recordId: selectedFaculty.id,
        recordTitle: selectedFaculty.name,
      });
    }
    setIsEditorOpen(false);
    setSelectedFaculty(null);
  };

  const handleDeleteFaculty = () => {
    if (!facultyToDelete) return;
    setFaculty((prev) => prev.filter((f) => f.id !== facultyToDelete.id));
    logAction({
      action: "DELETE",
      module: "Faculty Management",
      recordId: facultyToDelete.id,
      recordTitle: facultyToDelete.name,
    });
    setFacultyToDelete(null);
  };

  const columns: Column<FacultyMember>[] = [
    {
      key: "name",
      header: "Faculty Profile",
      sortable: true,
      render: (f) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
            {f.avatarUrl ? (
              <img src={f.avatarUrl} alt={f.name} className="w-full h-full object-cover" />
            ) : (
              f.name.charAt(0)
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              {f.name}
              {f.isHod && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  HOD
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{f.designation}</div>
          </div>
        </div>
      ),
    },
    {
      key: "departmentId",
      header: "Department",
      sortable: true,
      render: (f) => (
        <span className="capitalize text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {f.departmentId.replace("-", " ")}
        </span>
      ),
    },
    {
      key: "qualification",
      header: "Qualifications",
      render: (f) => (
        <div>
          <div className="text-xs font-medium text-slate-900 dark:text-slate-200">{f.qualification}</div>
          <div className="text-[11px] text-slate-500 truncate max-w-xs">{f.specialization}</div>
        </div>
      ),
    },
    {
      key: "experienceYears",
      header: "Experience",
      sortable: true,
      render: (f) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {f.experienceYears} Years
        </span>
      ),
    },
    {
      key: "email",
      header: "Contact",
      render: (f) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            {f.email}
          </div>
          {f.phone && (
            <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              {f.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (f) => <StatusBadge status={f.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (f) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(f)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Faculty"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFacultyToDelete(f)}
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
            title="Delete Faculty"
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
        title="Faculty Directory & Profiles"
        description="Manage teaching faculty members, designations, educational qualifications, research profiles, and contact info."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Academics", href: "#" },
          { label: "Faculty" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Faculty Member
          </button>
        }
      />

      <DataTable
        data={filteredFaculty}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search faculty by name, department, or qualification..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSaveFaculty} className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {faculty.some((f) => f.id === selectedFaculty.id) ? "Edit Faculty Profile" : "Add Faculty Member"}
                  </h3>
                  <p className="text-xs text-slate-500">Academic credentials & departmental role</p>
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
                    Full Name & Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedFaculty.name}
                    onChange={(e) => setSelectedFaculty({ ...selectedFaculty, name: e.target.value })}
                    placeholder="e.g. Dr. K. Senthil Kumar"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedFaculty.designation}
                    onChange={(e) => setSelectedFaculty({ ...selectedFaculty, designation: e.target.value })}
                    placeholder="e.g. Associate Professor & Head"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Qualifications *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedFaculty.qualification}
                    onChange={(e) => setSelectedFaculty({ ...selectedFaculty, qualification: e.target.value })}
                    placeholder="e.g. M.C.A., M.Phil., Ph.D., SET"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teaching Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={selectedFaculty.experienceYears}
                    onChange={(e) => setSelectedFaculty({ ...selectedFaculty, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Area of Specialization / Research Focus
                </label>
                <input
                  type="text"
                  value={selectedFaculty.specialization}
                  onChange={(e) => setSelectedFaculty({ ...selectedFaculty, specialization: e.target.value })}
                  placeholder="e.g. Cloud Computing, Big Data Analytics & Deep Learning"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={selectedFaculty.email}
                    onChange={(e) => setSelectedFaculty({ ...selectedFaculty, email: e.target.value })}
                    placeholder="senthilkumar.cs@bac.edu.in"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={selectedFaculty.phone}
                    onChange={(e) => setSelectedFaculty({ ...selectedFaculty, phone: e.target.value })}
                    placeholder="+91 94432 10981"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Profile Photo URL
                  </label>
                  <input
                    type="text"
                    value={selectedFaculty.avatarUrl || ""}
                    onChange={(e) => setSelectedFaculty({ ...selectedFaculty, avatarUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFaculty.isHod}
                      onChange={(e) => setSelectedFaculty({ ...selectedFaculty, isHod: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Designated Head of Department (HOD)
                    </span>
                  </label>
                </div>
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
                  Save Faculty Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!facultyToDelete}
        onClose={() => setFacultyToDelete(null)}
        onConfirm={handleDeleteFaculty}
        title="Remove Faculty Member"
        description={`Are you sure you want to remove ${facultyToDelete?.name}? Their profile will be deleted from the college department page.`}
        confirmText="Remove Faculty"
        variant="danger"
      />
    </div>
  );
}
