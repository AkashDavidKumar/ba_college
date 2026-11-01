"use client";

import React, { useState, useMemo } from "react";
import { useCMSStore, AlumniMember } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Users, CheckCircle2, XCircle, Search, Mail, 
  Phone, Globe, Building2, Linkedin, Download, ShieldCheck, Eye 
} from "lucide-react";

export function AlumniCMS() {
  const { alumni, verifyAlumni, saveAlumni, canAccessDepartment, logAction } = useCMSStore();
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniMember | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterBatch, setFilterBatch] = useState<string>("all");
  const [verifyTarget, setVerifyTarget] = useState<{ id: string; name: string; verify: boolean } | null>(null);

  const batches = useMemo(() => {
    const list = Array.from(new Set(alumni.map((a) => a.passingYear))).sort().reverse();
    return list;
  }, [alumni]);

  const filteredAlumni = useMemo(() => {
    return alumni.filter((a) => {
      if (!canAccessDepartment(a.departmentSlug)) return false;
      if (filterBatch !== "all" && a.passingYear !== filterBatch) return false;
      return true;
    });
  }, [alumni, canAccessDepartment, filterBatch]);

  const handleConfirmVerify = () => {
    if (!verifyTarget) return;
    verifyAlumni(verifyTarget.id, verifyTarget.verify);
    setVerifyTarget(null);
    if (selectedAlumni && selectedAlumni.id === verifyTarget.id) {
      setSelectedAlumni({ ...selectedAlumni, verified: verifyTarget.verify });
    }
  };

  const exportAlumniCSV = () => {
    const headers = ["Register No", "Full Name", "Degree", "Department", "Passing Year", "Employment", "Employer", "Designation", "City", "Email", "Phone", "Verified"];
    const rows = filteredAlumni.map((a) => [
      a.registerNumber,
      `"${a.fullName}"`,
      `"${a.degree}"`,
      a.departmentSlug,
      a.passingYear,
      a.employmentType,
      `"${a.presentEmployer || ""}"`,
      `"${a.designation || ""}"`,
      `"${a.city}, ${a.country}"`,
      a.email,
      a.mobile,
      a.verified ? "Yes" : "No",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BAC_Alumni_Directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<AlumniMember>[] = [
    {
      key: "fullName",
      header: "Alumni Profile",
      sortable: true,
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
            {a.avatarUrl ? (
              <img src={a.avatarUrl} alt={a.fullName} className="w-full h-full object-cover" />
            ) : (
              a.fullName.charAt(0)
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              {a.fullName}
              {a.verified && (
                <span title="Verified Alumni">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-mono">Reg: {a.registerNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: "degree",
      header: "Graduation",
      sortable: true,
      render: (a) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200">{a.degree}</div>
          <div className="text-slate-500 capitalize">{a.departmentSlug.replace("-", " ")} ({a.passingYear})</div>
        </div>
      ),
    },
    {
      key: "employmentType",
      header: "Current Career / Role",
      render: (a) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            {a.designation || a.employmentType}
          </div>
          <div className="text-slate-500 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            {a.presentEmployer || "Independent / Further Studies"}
          </div>
        </div>
      ),
    },
    {
      key: "city",
      header: "Location",
      render: (a) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <Globe className="w-3 h-3 text-slate-400" />
          {a.city}, {a.country}
        </span>
      ),
    },
    {
      key: "verified",
      header: "Verification",
      sortable: true,
      render: (a) => (
        a.verified ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            Pending
          </span>
        )
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedAlumni(a);
              setIsDetailOpen(true);
            }}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="View Dossier"
          >
            <Eye className="w-4 h-4" />
          </button>
          {!a.verified ? (
            <button
              onClick={() => setVerifyTarget({ id: a.id, name: a.fullName, verify: true })}
              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
              title="Verify Alumni Record"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setVerifyTarget({ id: a.id, name: a.fullName, verify: false })}
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
              title="Unverify Record"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumni Association Network & Directory"
        description="Bishop Ambrose Alumni Association (BAAA) — manage graduate registries, verify credentials, and connect global alumni chapters."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Services", href: "#" },
          { label: "Alumni" },
        ]}
        actions={
          <button
            onClick={exportAlumniCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Directory CSV
          </button>
        }
      />

      {/* Batch Filters */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilterBatch("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
            filterBatch === "all"
              ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-white"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          All Batches ({alumni.length})
        </button>
        {batches.map((b) => (
          <button
            key={b}
            onClick={() => setFilterBatch(b)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              filterBatch === b
                ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            Class of {b}
          </button>
        ))}
      </div>

      <DataTable
        data={filteredAlumni}
        columns={columns}
        searchKey="fullName"
        searchPlaceholder="Search alumni by name, register no, company, or degree..."
        pageSize={8}
      />

      {/* Detail Dossier Modal */}
      {isDetailOpen && selectedAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-lg">
                    {selectedAlumni.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedAlumni.fullName}
                      {selectedAlumni.verified && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Verified Member
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">Class of {selectedAlumni.passingYear} • {selectedAlumni.degree}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Academic Profile</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Register No:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedAlumni.registerNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Degree Conferred:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedAlumni.degree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="capitalize font-semibold text-slate-900 dark:text-white">{selectedAlumni.departmentSlug.replace("-", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Graduation Year:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedAlumni.passingYear}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Current Employment</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Designation:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedAlumni.designation || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Organization:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedAlumni.presentEmployer || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedAlumni.city}, {selectedAlumni.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Career Status:</span>
                    <span className="font-semibold text-amber-600">{selectedAlumni.employmentType}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Contact & Social</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedAlumni.email}
                  </div>
                  <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedAlumni.mobile}
                  </div>
                  {selectedAlumni.linkedin && (
                    <a
                      href={selectedAlumni.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                {!selectedAlumni.verified ? (
                  <button
                    onClick={() => {
                      verifyAlumni(selectedAlumni.id, true);
                      setSelectedAlumni({ ...selectedAlumni, verified: true });
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Verify Membership Record
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      verifyAlumni(selectedAlumni.id, false);
                      setSelectedAlumni({ ...selectedAlumni, verified: false });
                    }}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-700 rounded-lg text-xs font-semibold"
                  >
                    Revoke Verification
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Confirmation */}
      <ConfirmationDialog
        isOpen={!!verifyTarget}
        onClose={() => setVerifyTarget(null)}
        onConfirm={handleConfirmVerify}
        title={verifyTarget?.verify ? "Verify Alumni Record" : "Revoke Verification"}
        description={`Are you sure you want to ${verifyTarget?.verify ? "verify" : "revoke verification for"} ${verifyTarget?.name}?`}
        confirmText={verifyTarget?.verify ? "Verify Alumni" : "Revoke"}
        variant={verifyTarget?.verify ? "primary" : "danger"}
      />
    </div>
  );
}
