"use client";

import React, { useState } from "react";
import {
  Heart,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
  GraduationCap,
  Building,
  Check,
  X,
  Award,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlumniRecord {
  id: string;
  name: string;
  degree: string;
  batch: string;
  currentRole: string;
  company: string;
  location: string;
  status: "Verified" | "Pending Approval";
  featuredOnHome: boolean;
}

const INITIAL_ALUMNI: AlumniRecord[] = [
  {
    id: "a1",
    name: "Priya Sundaram",
    degree: "B.Sc. Computer Science",
    batch: "Class of 2021",
    currentRole: "Senior Software Engineer",
    company: "Google India",
    location: "Bengaluru",
    status: "Verified",
    featuredOnHome: true,
  },
  {
    id: "a2",
    name: "Jerome Fernandez",
    degree: "B.Com Professional Accounting",
    batch: "Class of 2020",
    currentRole: "Financial Risk Consultant",
    company: "Deloitte & Touche",
    location: "Chennai",
    status: "Verified",
    featuredOnHome: true,
  },
  {
    id: "a3",
    name: "A. Mohamed Imran",
    degree: "M.Sc. Information Technology",
    batch: "Class of 2019",
    currentRole: "Cloud Solutions Architect",
    company: "Amazon Web Services",
    location: "Hyderabad",
    status: "Verified",
    featuredOnHome: true,
  },
  {
    id: "a4",
    name: "Kavitha Rajendran",
    degree: "B.A. English Literature",
    batch: "Class of 2022",
    currentRole: "Lead Content Strategist",
    company: "Zoho Corporation",
    location: "Chennai",
    status: "Pending Approval",
    featuredOnHome: false,
  },
  {
    id: "a5",
    name: "Robert Christopher",
    degree: "B.Sc. Mathematics",
    batch: "Class of 2023",
    currentRole: "Quantitative Data Analyst",
    company: "Goldman Sachs",
    location: "Bengaluru",
    status: "Pending Approval",
    featuredOnHome: false,
  },
  {
    id: "a6",
    name: "S. Deepa",
    degree: "B.Sc. Biotechnology",
    batch: "Class of 2018",
    currentRole: "Research Fellow",
    company: "Biocon Limited",
    location: "Bengaluru",
    status: "Verified",
    featuredOnHome: false,
  },
];

export function AlumniDashboard() {
  const { toast } = useToast();
  const [alumni, setAlumni] = useState<AlumniRecord[]>(INITIAL_ALUMNI);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = alumni.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase()) ||
      item.degree.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string, name: string) => {
    setAlumni(
      alumni.map((a) => (a.id === id ? { ...a, status: "Verified" as const } : a))
    );
    toast({
      title: "Alumni Verified",
      description: `${name}'s alumni registration has been approved.`,
    });
  };

  const toggleFeatured = (id: string) => {
    setAlumni(
      alumni.map((a) =>
        a.id === id ? { ...a, featuredOnHome: !a.featuredOnHome } : a
      )
    );
    toast({
      title: "Homepage Display Updated",
      description: "Alumni spotlight updated on public portal.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Alumni Network & Registrations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review 612 verified alumni members and pending batch registrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200/60">
            612 Registered Members
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60">
            8 Pending Verifications
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alumni by name, company, degree..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "Verified", "Pending Approval"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alumni list table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Alumni Details</th>
                <th className="py-3.5 px-6">Current Professional Role</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-center">Featured Spotlight</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <GraduationCap className="w-3 h-3 text-slate-400" />
                          {item.degree} · <span className="font-semibold">{item.batch}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-900">{item.currentRole}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-400" />
                      {item.company} ({item.location})
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    {item.status === "Verified" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                        <Clock className="w-3 h-3" />
                        Pending Approval
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => toggleFeatured(item.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        item.featuredOnHome
                          ? "bg-[#0C1E36] text-white shadow-xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {item.featuredOnHome ? "★ Spotlight Active" : "Set In Spotlight"}
                    </button>
                  </td>

                  <td className="py-4 px-6 text-right">
                    {item.status === "Pending Approval" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(item.id, item.name)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
