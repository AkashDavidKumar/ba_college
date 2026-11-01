"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/admin/core/page-header";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Edit, Trash2, Download, Clock, CheckCircle2 } from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  semester: "Odd Semester" | "Even Semester" | "Annual";
  category: "Academic" | "Examination" | "Holiday" | "Cultural" | "Admission";
  description: string;
};

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: "cal-1", title: "College Reopening for Academic Year 2026-27", date: "2026-06-18", semester: "Odd Semester", category: "Academic", description: "Commencement of classes for II & III Year UG students." },
  { id: "cal-2", title: "Orientation & Induction Programme for First Year UG", date: "2026-07-02", semester: "Odd Semester", category: "Admission", description: "Inaugural prayer, bridge courses, and campus orientation." },
  { id: "cal-3", title: "Continuous Internal Assessment (CIA – I)", date: "2026-08-20", endDate: "2026-08-26", semester: "Odd Semester", category: "Examination", description: "First internal theory assessment across all departments." },
  { id: "cal-4", title: "Independence Day & Alumni Connect Assembly", date: "2026-08-15", semester: "Odd Semester", category: "Holiday", description: "Flag hoisting ceremony and special address." },
  { id: "cal-5", title: "Continuous Internal Assessment (CIA – II)", date: "2026-10-12", endDate: "2026-10-18", semester: "Odd Semester", category: "Examination", description: "Second internal assessment & model exams." },
  { id: "cal-6", title: "Autonomous Odd Semester End Examinations (Theory)", date: "2026-11-04", endDate: "2026-11-25", semester: "Odd Semester", category: "Examination", description: "Bharathiar University affiliated autonomous semester exams." },
  { id: "cal-7", title: "College Reopening for Even Semester", date: "2026-12-08", semester: "Even Semester", category: "Academic", description: "Commencement of even semester classes." },
];

export function CalendarCMS() {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<CalendarEvent>>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    semester: "Odd Semester",
    category: "Academic",
    description: "",
  });

  const handleOpenCreate = () => {
    setForm({
      id: "cal-" + Date.now(),
      title: "",
      date: new Date().toISOString().split("T")[0],
      semester: "Odd Semester",
      category: "Academic",
      description: "",
    });
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title?.trim() || !form.date) {
      toast({ title: "Validation Error", description: "Event title and date are required.", variant: "destructive" });
      return;
    }
    if (editingEvent) {
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? ({ ...e, ...form } as CalendarEvent) : e)));
      toast({ title: "Event Updated", description: `Updated '${form.title}'.` });
    } else {
      setEvents((prev) => [{ ...form, id: "cal-" + Date.now() } as CalendarEvent, ...prev]);
      toast({ title: "Event Added", description: `Added '${form.title}' to academic calendar.` });
    }
    setModalOpen(false);
  };

  const columns: Column<CalendarEvent>[] = [
    {
      key: "title",
      header: "Academic Milestone",
      sortable: true,
      render: (e) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{e.title}</div>
          <div className="text-[10px] text-slate-400">{e.description}</div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Scheduled Date",
      sortable: true,
      render: (e) => (
        <span className="font-semibold text-xs text-slate-700 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#009688]" />
          {e.date} {e.endDate && `– ${e.endDate}`}
        </span>
      ),
    },
    {
      key: "semester",
      header: "Semester",
      sortable: true,
      render: (e) => <span className="text-xs text-slate-600">{e.semester}</span>,
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (e) => (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {e.category}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (e) => (
        <div className="flex items-center gap-1" onClick={(ev) => ev.stopPropagation()}>
          <button
            onClick={() => {
              setForm({ ...e });
              setEditingEvent(e);
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteId(e.id)}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="College Academic Calendar"
        subtitle="Manage academic schedules, semester reopening dates, CIA internal exams, holidays, and autonomous end-semester examination periods."
        badge={`${events.length} Milestones`}
        breadcrumbs={[
          { label: "Dashboard", onClick: () => {} },
          { label: "Academics" },
          { label: "Academic Calendar" },
        ]}
        action={{
          label: "Add Milestone",
          icon: Plus,
          onClick: handleOpenCreate,
        }}
      />

      <DataTable
        data={events}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search calendar milestones..."
        filterKey="category"
        filterLabel="Category"
        filterOptions={[
          { label: "Academic", value: "Academic" },
          { label: "Examination", value: "Examination" },
          { label: "Holiday", value: "Holiday" },
          { label: "Cultural", value: "Cultural" },
        ]}
      />

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 font-serif">
              {editingEvent ? "Edit Milestone" : "Add Calendar Milestone"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CIA – I Internal Examinations"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={form.endDate || ""}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option>Odd Semester</option>
                    <option>Even Semester</option>
                    <option>Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option>Academic</option>
                    <option>Examination</option>
                    <option>Holiday</option>
                    <option>Cultural</option>
                    <option>Admission</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#009688] hover:bg-[#00796b] shadow-xs cursor-pointer"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            setEvents((prev) => prev.filter((e) => e.id !== deleteId));
            toast({ title: "Deleted", description: "Milestone removed from calendar." });
          }
        }}
        title="Delete Milestone"
        description="Are you sure you want to remove this calendar entry?"
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

export { CalendarCMS as AcademicCalendarCMS };
