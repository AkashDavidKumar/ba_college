"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight, FileText, Calendar, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Reveal } from "@/components/site/primitives";
import { noticeService } from "@/lib/api/notice-service";
import type { PublicNotice } from "@/types/notice";

const EXAM_SCHEDULE = [
  { exam: "CIA – I (Odd Semester)",        date: "July 2025",     type: "Internal", status: "Completed" },
  { exam: "CIA – II (Odd Semester)",       date: "September 2025",type: "Internal", status: "Completed" },
  { exam: "Odd Semester Exams",            date: "October 2025",  type: "External", status: "Completed" },
  { exam: "CIA – I (Even Semester)",       date: "December 2025", type: "Internal", status: "Upcoming" },
  { exam: "CIA – II (Even Semester)",      date: "February 2026", type: "Internal", status: "Upcoming" },
  { exam: "Even Semester Exams",           date: "March 2026",    type: "External", status: "Upcoming" },
  { exam: "Supplementary Examinations",   date: "May 2026",      type: "External", status: "Scheduled" },
];

const NOTICES = [
  { title: "Time Table – Even Semester 2025-26",          date: "2025-11-20", size: "180 KB" },
  { title: "Hall Ticket Release Notification",             date: "2025-10-25", size: "85 KB" },
  { title: "Examination Fee Payment Deadline",             date: "2025-10-10", size: "60 KB" },
  { title: "Guidelines for Practical Examinations",        date: "2025-09-15", size: "220 KB" },
  { title: "Results – Odd Semester 2025 (All Programmes)", date: "2025-12-01", size: "340 KB" },
];

export function ExaminationPage() {
  const [liveNotices, setLiveNotices] = useState<PublicNotice[]>([]);

  useEffect(() => {
    noticeService
      .getPublicNotices({ category: "Examination", limit: 10 })
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setLiveNotices(res.data);
        }
      })
      .catch((err) => {
        console.warn("Live exam notices fetch failed, using fallback:", err);
      });
  }, []);

  const displayNotices = liveNotices.length > 0
    ? liveNotices.map((n) => ({
        title: n.title,
        date: String(n.publishAt).split("T")[0],
        size: "PDF Circular",
        url: n.attachmentUrl,
      }))
    : NOTICES.map((n) => ({ ...n, url: undefined }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative bg-navy-dark text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark to-navy/80" />
        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span><ChevronRight className="w-3 h-3" /><span className="text-gold-light">Examination</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">Examination Cell</h1>
          <p className="text-white/70">Exam schedules, hall tickets, results, and notifications from the Controller of Examinations.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Hall Ticket",       icon: FileText, color: "bg-blue-600" },
            { label: "Results",           icon: CheckCircle, color: "bg-emerald-600" },
            { label: "Time Table",        icon: Calendar, color: "bg-amber-600" },
            { label: "Exam Notifications",icon: AlertCircle, color: "bg-rose-600" },
          ].map((q, i) => {
            const Icon = q.icon;
            return (
              <button key={i} className={`${q.color} text-white rounded-2xl p-5 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity shadow-sm`}>
                <Icon className="w-7 h-7" />
                <span className="text-xs font-bold text-center">{q.label}</span>
              </button>
            );
          })}
        </div>

        {/* Exam Schedule */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="bg-navy px-6 py-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-light" />
            <h3 className="text-white font-bold">Examination Schedule 2025-26</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {EXAM_SCHEDULE.map((e, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="font-semibold text-navy text-sm">{e.exam}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{e.date}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2 py-1 rounded-full font-semibold ${e.type === "External" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{e.type}</span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full font-semibold ${e.status === "Completed" ? "bg-emerald-100 text-emerald-700" : e.status === "Upcoming" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                      <Clock className="w-3 h-3" />{e.status}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="bg-navy px-6 py-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gold-light" />
            <h3 className="text-white font-bold">Examination Notices & Downloads</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {displayNotices.map((n, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <span className="text-red-600 text-[10px] font-bold">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.date} · {n.size}</p>
                  </div>
                </div>
                {n.url ? (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-dark transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                ) : (
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-dark transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Controller Info */}
        <div className="bg-navy-dark text-white rounded-2xl p-8">
          <h3 className="font-bold text-lg mb-2">Controller of Examinations</h3>
          <p className="text-white/70 mb-4">For queries related to hall tickets, results, revaluation, or examination procedures, please contact the Examination Cell.</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div><p className="text-white/50 text-xs">Phone</p><p className="font-semibold">0422-2316731 Extn: 105</p></div>
            <div><p className="text-white/50 text-xs">Email</p><p className="font-semibold">exam@bishopambrose.edu.in</p></div>
            <div><p className="text-white/50 text-xs">Office Hours</p><p className="font-semibold">Mon–Fri: 9 AM – 5 PM</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
