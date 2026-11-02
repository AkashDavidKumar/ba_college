"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Phone,
  Mail,
  User,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save
} from "lucide-react";

export function AdmissionsTab() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>("/admissions?limit=100");
      const list = Array.isArray(res) ? res : res?.data || [];
      setApplications(list);
      
      // Pre-fill admin notes map
      const notesMap: Record<string, string> = {};
      list.forEach((app: any) => {
        notesMap[app.id || app.appNumber] = app.notes || "";
      });
      setAdminNotes(notesMap);
    } catch (e: any) {
      console.error("Admissions fetch error:", e);
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        toast({
          title: "Access Restricted",
          description: "You lack permissions to view confidential admission applications.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setSavingId(id);
    try {
      await apiClient.put("/admissions", {
        id,
        status: newStatus,
        notes: adminNotes[id] || ""
      });
      
      toast({
        title: "Application Updated",
        description: `Status changed to ${newStatus}.`,
      });

      // Update local state reactively
      setApplications(
        applications.map((app) => ((app.id === id || app.appNumber === id) ? { ...app, status: newStatus, notes: adminNotes[id] } : app))
      );
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : "An error occurred while updating the status.";
      toast({
        title: "Update Failed",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setSavingId(id);
    try {
      // Find current application
      const currentApp = applications.find(app => app.id === id || app.appNumber === id);
      if (!currentApp) return;

      await apiClient.put("/admissions", {
        id,
        status: currentApp.status,
        notes: adminNotes[id] || ""
      });

      toast({
        title: "Notes Saved",
        description: "Administrative notes successfully updated.",
      });

      setApplications(
        applications.map((app) => ((app.id === id || app.appNumber === id) ? { ...app, notes: adminNotes[id] } : app))
      );
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : "Failed to save administrative notes.";
      toast({
        title: "Save Failed",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setSavingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "Rejected":
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-900">Student Admissions Applications</h3>
          <p className="text-xs text-slate-400">Review, vet qualifications, approve, reject, or comment on candidate applications.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          Loading candidate applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
          <FileText className="w-8 h-8 text-slate-300" />
          No admission applications received yet.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const isExpanded = expandedId === app.id;
            const isSaving = savingId === app.id;
            
            return (
              <div
                key={app.id}
                className="border border-slate-250 rounded-xl bg-slate-50/50 hover:bg-white overflow-hidden transition-all duration-150"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        {app.name}
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-normal font-mono">
                          ID: {app.id}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" /> {app.program}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <div className="text-xs font-bold text-slate-900">Score/GPA: {app.gpa}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Applied: {new Date(app.appliedAt).toLocaleDateString()}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusStyle(app.status)}`}>
                        {getStatusIcon(app.status)} {app.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Form */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-white p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left side details */}
                      <div className="space-y-3 md:col-span-2">
                        <h5 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Candidate Profile</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800">Full Name:</span> {app.name}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800">Email:</span> {app.email}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800">Phone:</span> {app.phone}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800">Applied Date:</span> {new Date(app.appliedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Status controls */}
                      <div className="space-y-3">
                        <h5 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Review Status</h5>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateStatus(app.id, "Approved")}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(app.id, "Rejected")}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(app.id, "Pending")}
                            disabled={isSaving}
                            className="flex items-center justify-center p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all disabled:opacity-50"
                            title="Set to Pending"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Administrative comments */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <label className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
                        Internal Screening Comments & Notes
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={adminNotes[app.id] ?? ""}
                          onChange={(e) => setAdminNotes({ ...adminNotes, [app.id]: e.target.value })}
                          placeholder="Add internal candidate review comments, missing transcripts notifications, or scholarship recommendations..."
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(app.id)}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 self-end transition-all"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Notes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
