"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Award, Plus, DollarSign, Users, CheckCircle, 
  ExternalLink, FileText, Trash2, Edit3, ShieldCheck 
} from "lucide-react";

interface ScholarshipScheme {
  id: string;
  name: string;
  category: "Government" | "Management Merit" | "Sports Quota" | "Diocesan Endowment" | "Alumni Sponsored";
  eligibility: string;
  concessionAmount: string;
  beneficiariesCount: number;
  contactPerson: string;
  applicationDeadline: string;
  status: ContentStatus;
}

const INITIAL_SCHOLARSHIPS: ScholarshipScheme[] = [
  {
    id: "sch-1",
    name: "Tamil Nadu State Post-Matric Scholarship (SC / ST / SCC)",
    category: "Government",
    eligibility: "Students belonging to SC/ST/SCC categories with annual family income below ₹2,50,000.",
    concessionAmount: "100% Tuition Fee Waiver + Special Allowance",
    beneficiariesCount: 142,
    contactPerson: "Nodal Scholarship Officer (Admin Block)",
    applicationDeadline: "2025-10-31",
    status: "published",
  },
  {
    id: "sch-2",
    name: "BC / MBC / DNC Welfare Educational Scholarship",
    category: "Government",
    eligibility: "BC / MBC students admitted through merit quota with family income below ₹2,00,000.",
    concessionAmount: "₹4,500 – ₹7,500 per annum",
    beneficiariesCount: 210,
    contactPerson: "College Welfare Cell",
    applicationDeadline: "2025-10-31",
    status: "published",
  },
  {
    id: "sch-3",
    name: "Bishop Ambrose Merit Excellence Award",
    category: "Management Merit",
    eligibility: "+2 Higher Secondary aggregate above 90% in school board examinations.",
    concessionAmount: "50% Semester Fee Concession",
    beneficiariesCount: 45,
    contactPerson: "Secretary / Principal Office",
    applicationDeadline: "2025-07-15",
    status: "published",
  },
  {
    id: "sch-4",
    name: "Diocesan Needy Student Support Fund",
    category: "Diocesan Endowment",
    eligibility: "Economically underprivileged students recommended by parish priests / local authorities.",
    concessionAmount: "Up to ₹15,000 financial grant",
    beneficiariesCount: 68,
    contactPerson: "College Bursar / Treasurer",
    applicationDeadline: "2025-08-30",
    status: "published",
  },
  {
    id: "sch-5",
    name: "Inter-Collegiate Sports Quota Concession",
    category: "Sports Quota",
    eligibility: "State or National level representation in Athletics, Football, Volleyball, or Basketball.",
    concessionAmount: "100% Sports Kit, Hostel & Fee Concession",
    beneficiariesCount: 28,
    contactPerson: "Director of Physical Education",
    applicationDeadline: "2025-06-30",
    status: "published",
  },
];

export function ScholarshipsCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [scholarships, setScholarships] = useState<ScholarshipScheme[]>(INITIAL_SCHOLARSHIPS);
  const [selectedScheme, setSelectedScheme] = useState<ScholarshipScheme | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState<ScholarshipScheme | null>(null);

  const handleOpenEditor = (scheme?: ScholarshipScheme) => {
    if (scheme) {
      setSelectedScheme(scheme);
    } else {
      setSelectedScheme({
        id: "sch-" + Date.now(),
        name: "",
        category: "Government",
        eligibility: "",
        concessionAmount: "",
        beneficiariesCount: 0,
        contactPerson: "Scholarship Nodal Officer",
        applicationDeadline: "2025-10-31",
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheme) return;

    if (scholarships.some((s) => s.id === selectedScheme.id)) {
      setScholarships((prev) => prev.map((s) => (s.id === selectedScheme.id ? selectedScheme : s)));
      logAction({
        action: "UPDATE",
        module: "Scholarships & Financial Aid",
        recordId: selectedScheme.id,
        recordTitle: selectedScheme.name,
      });
    } else {
      setScholarships((prev) => [selectedScheme, ...prev]);
      logAction({
        action: "CREATE",
        module: "Scholarships & Financial Aid",
        recordId: selectedScheme.id,
        recordTitle: selectedScheme.name,
      });
    }
    setIsEditorOpen(false);
    setSelectedScheme(null);
  };

  const handleDelete = () => {
    if (!schemeToDelete) return;
    setScholarships((prev) => prev.filter((s) => s.id !== schemeToDelete.id));
    logAction({
      action: "DELETE",
      module: "Scholarships & Financial Aid",
      recordId: schemeToDelete.id,
      recordTitle: schemeToDelete.name,
    });
    setSchemeToDelete(null);
  };

  const columns: Column<ScholarshipScheme>[] = [
    {
      key: "name",
      header: "Scholarship Scheme",
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">{s.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{s.eligibility}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (s) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          {s.category}
        </span>
      ),
    },
    {
      key: "concessionAmount",
      header: "Grant / Concession",
      render: (s) => (
        <span className="font-medium text-emerald-600 dark:text-emerald-400 text-xs">
          {s.concessionAmount}
        </span>
      ),
    },
    {
      key: "beneficiariesCount",
      header: "Beneficiaries",
      sortable: true,
      render: (s) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
          {s.beneficiariesCount} Students
        </span>
      ),
    },
    {
      key: "applicationDeadline",
      header: "Deadline",
      render: (s) => <span className="text-xs text-slate-500 font-mono">{s.applicationDeadline}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(s)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Scheme"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSchemeToDelete(s)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Scheme"
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
        title="Scholarships & Financial Concessions"
        description="Manage government welfare scholarships, management merit concessions, sports quotas, and diocesan endowment schemes."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Admissions", href: "#" },
          { label: "Scholarships" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Scholarship Scheme
          </button>
        }
      />

      <DataTable
        data={scholarships}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search scholarship schemes by name or category..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {scholarships.some((s) => s.id === selectedScheme.id) ? "Edit Scholarship Scheme" : "Add Scholarship Scheme"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheme Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedScheme.name}
                    onChange={(e) => setSelectedScheme({ ...selectedScheme, name: e.target.value })}
                    placeholder="e.g. State Post-Matric Scholarship"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={selectedScheme.category}
                    onChange={(e) => setSelectedScheme({ ...selectedScheme, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Government">Government Scheme</option>
                    <option value="Management Merit">Management Merit Concession</option>
                    <option value="Sports Quota">Sports Quota Award</option>
                    <option value="Diocesan Endowment">Diocesan Endowment Support</option>
                    <option value="Alumni Sponsored">Alumni Sponsored Scholarship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Eligibility Criteria *
                </label>
                <textarea
                  required
                  rows={3}
                  value={selectedScheme.eligibility}
                  onChange={(e) => setSelectedScheme({ ...selectedScheme, eligibility: e.target.value })}
                  placeholder="Income limits, caste community, academic marks cut-off, or sports level..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Grant / Concession Details *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedScheme.concessionAmount}
                    onChange={(e) => setSelectedScheme({ ...selectedScheme, concessionAmount: e.target.value })}
                    placeholder="e.g. 50% Fee Concession or ₹10,000 / year"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={selectedScheme.applicationDeadline}
                    onChange={(e) => setSelectedScheme({ ...selectedScheme, applicationDeadline: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Office / Nodal Officer
                  </label>
                  <input
                    type="text"
                    value={selectedScheme.contactPerson}
                    onChange={(e) => setSelectedScheme({ ...selectedScheme, contactPerson: e.target.value })}
                    placeholder="e.g. Nodal Officer (Admin Block)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Number of Beneficiaries (Last Year)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedScheme.beneficiariesCount}
                    onChange={(e) => setSelectedScheme({ ...selectedScheme, beneficiariesCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
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
                  Save Scholarship Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!schemeToDelete}
        onClose={() => setSchemeToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Scholarship Scheme"
        description={`Are you sure you want to delete ${schemeToDelete?.name}?`}
        confirmText="Delete Scheme"
        variant="danger"
      />
    </div>
  );
}
