"use client";

import React, { useState, useMemo } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Calendar, Plus, MapPin, Clock, Users, CheckCircle, 
  ExternalLink, Trash2, Edit3, Image, Filter, Tag 
} from "lucide-react";

interface CollegeEvent {
  id: string;
  title: string;
  category: "Academic" | "Cultural" | "Sports" | "Seminar" | "Workshop" | "Alumni" | "Placement";
  departmentId?: string; // "all" or specific slug
  startDate: string;
  endDate?: string;
  time: string;
  venue: string;
  organizer: string;
  description: string;
  bannerImage: string;
  registrationLink?: string;
  attendeesCount: number;
  status: ContentStatus;
}

const INITIAL_EVENTS: CollegeEvent[] = [
  {
    id: "evt-1",
    title: "International Conference on Next-Gen Artificial Intelligence (ICNGAI 2025)",
    category: "Academic",
    departmentId: "computer-science",
    startDate: "2025-03-14",
    endDate: "2025-03-15",
    time: "09:30 AM – 04:30 PM",
    venue: "St. Ambrose Auditorium & Virtual Track",
    organizer: "Department of Computer Science",
    description: "Keynotes by leading scientists from IIT Madras and NUS Singapore on LLMs and Quantum ML.",
    bannerImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
    registrationLink: "https://forms.gle/sample-reg",
    attendeesCount: 280,
    status: "published",
  },
  {
    id: "evt-2",
    title: "AMBROSE FEST '25 — Inter-Collegiate Cultural Carnival",
    category: "Cultural",
    departmentId: "all",
    startDate: "2025-02-28",
    endDate: "2025-03-01",
    time: "10:00 AM – 06:00 PM",
    venue: "College Open Air Amphitheatre",
    organizer: "Cultural Club & Student Council",
    description: "Battle of bands, classical dance, mime, adzap, photography, and fashion pageant with ₹1,00,000 in cash prizes.",
    bannerImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    attendeesCount: 1200,
    status: "published",
  },
  {
    id: "evt-3",
    title: "Mega Campus Placement Drive — Top Tier IT & FinTech Recruiters",
    category: "Placement",
    departmentId: "all",
    startDate: "2025-02-18",
    time: "08:30 AM – 05:30 PM",
    venue: "Computer Labs & Placement Hall Block B",
    organizer: "Training & Placement Cell",
    description: "Exclusive recruitment drive for final year UG & PG students with over 15 MNCs participating.",
    bannerImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80",
    attendeesCount: 450,
    status: "published",
  },
  {
    id: "evt-4",
    title: "National Seminar on Contemporary Taxation & GST Reforms",
    category: "Seminar",
    departmentId: "commerce",
    startDate: "2025-02-06",
    time: "10:00 AM – 02:00 PM",
    venue: "Audio Visual Conference Hall",
    organizer: "Department of Commerce",
    description: "Special session with Chartered Accountants and Tax Consultants on Union Budget 2025 implications.",
    bannerImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80",
    attendeesCount: 160,
    status: "published",
  },
];

export function EventsCMS() {
  const { canAccessDepartment, currentUser, logAction } = useCMSStore();
  const [events, setEvents] = useState<CollegeEvent[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<CollegeEvent | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CollegeEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (e.departmentId && e.departmentId !== "all" && !canAccessDepartment(e.departmentId)) {
        return false;
      }
      return true;
    });
  }, [events, canAccessDepartment]);

  const handleOpenEditor = (evt?: CollegeEvent) => {
    if (evt) {
      setSelectedEvent(evt);
    } else {
      setSelectedEvent({
        id: "evt-" + Date.now(),
        title: "",
        category: "Academic",
        departmentId: currentUser.departmentId || "all",
        startDate: new Date().toISOString().split("T")[0],
        time: "10:00 AM – 01:00 PM",
        venue: "St. Ambrose Auditorium",
        organizer: currentUser.name,
        description: "",
        bannerImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
        attendeesCount: 0,
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (events.some((ev) => ev.id === selectedEvent.id)) {
      setEvents((prev) => prev.map((ev) => (ev.id === selectedEvent.id ? selectedEvent : ev)));
      logAction({
        action: "UPDATE",
        module: "Events & Seminars",
        recordId: selectedEvent.id,
        recordTitle: selectedEvent.title,
      });
    } else {
      setEvents((prev) => [selectedEvent, ...prev]);
      logAction({
        action: "CREATE",
        module: "Events & Seminars",
        recordId: selectedEvent.id,
        recordTitle: selectedEvent.title,
      });
    }
    setIsEditorOpen(false);
    setSelectedEvent(null);
  };

  const handleDelete = () => {
    if (!eventToDelete) return;
    setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
    logAction({
      action: "DELETE",
      module: "Events & Seminars",
      recordId: eventToDelete.id,
      recordTitle: eventToDelete.title,
    });
    setEventToDelete(null);
  };

  const columns: Column<CollegeEvent>[] = [
    {
      key: "title",
      header: "Event Title & Venue",
      sortable: true,
      render: (e) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
            <img src={e.bannerImage} alt={e.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{e.title}</div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <MapPin className="w-3 h-3 text-amber-500" />
                {e.venue}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (e) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          {e.category}
        </span>
      ),
    },
    {
      key: "startDate",
      header: "Event Date & Time",
      sortable: true,
      render: (e) => (
        <div className="text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
            {e.startDate} {e.endDate ? `to ${e.endDate}` : ""}
          </div>
          <div className="text-slate-500">{e.time}</div>
        </div>
      ),
    },
    {
      key: "organizer",
      header: "Organized By",
      render: (e) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {e.organizer}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (e) => <StatusBadge status={e.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (e) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(e)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Event"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEventToDelete(e)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Event"
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
        title="Campus Events, Seminars & Workshops"
        description="Publish and manage upcoming college conferences, cultural fests, academic symposiums, and placement drives."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Content", href: "#" },
          { label: "Events" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create New Event
          </button>
        }
      />

      <DataTable
        data={filteredEvents}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search events by title, organizer, or venue..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {events.some((e) => e.id === selectedEvent.id) ? "Edit Event" : "Create New Event"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                  placeholder="e.g. International Conference on Next-Gen AI"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Category *
                  </label>
                  <select
                    value={selectedEvent.category}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Academic">Academic Conference</option>
                    <option value="Cultural">Cultural Fest / Carnival</option>
                    <option value="Sports">Sports Meet / Tournament</option>
                    <option value="Seminar">National Seminar / Webinar</option>
                    <option value="Workshop">Technical Workshop / Hands-on</option>
                    <option value="Alumni">Alumni Reunion</option>
                    <option value="Placement">Campus Placement Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department Scope
                  </label>
                  <input
                    type="text"
                    value={selectedEvent.departmentId || "all"}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, departmentId: e.target.value })}
                    placeholder="'all' or department slug like 'computer-science'"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedEvent.startDate}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={selectedEvent.endDate || ""}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Duration *
                  </label>
                  <input
                    type="text"
                    value={selectedEvent.time}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })}
                    placeholder="09:30 AM – 04:30 PM"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Venue / Hall *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedEvent.venue}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, venue: e.target.value })}
                    placeholder="St. Ambrose Auditorium"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Organizer / Host Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedEvent.organizer}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, organizer: e.target.value })}
                    placeholder="e.g. Department of Computer Science"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Description & Agenda
                </label>
                <textarea
                  rows={3}
                  value={selectedEvent.description}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                  placeholder="Key topics, guest speakers, schedule..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Banner / Poster Image URL
                  </label>
                  <input
                    type="text"
                    value={selectedEvent.bannerImage}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, bannerImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Online Registration Link
                  </label>
                  <input
                    type="text"
                    value={selectedEvent.registrationLink || ""}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, registrationLink: e.target.value })}
                    placeholder="Google Forms / Portal Link"
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
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        description={`Are you sure you want to delete ${eventToDelete?.title}?`}
        confirmText="Delete Event"
        variant="danger"
      />
    </div>
  );
}
