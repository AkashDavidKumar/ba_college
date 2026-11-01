"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Trophy, Plus, Medal, Star, Flame, 
  Trash2, Edit3, Image, Award 
} from "lucide-react";

interface SportsArtsItem {
  id: string;
  title: string;
  type: "Sports" | "Cultural" | "Fine Arts";
  eventLevel: "National" | "State" | "University" | "Inter-Collegiate" | "Intramural";
  studentName: string;
  department: string;
  achievement: string; // e.g., "Gold Medal in 400m Sprint", "1st Place Classical Dance"
  academicYear: string;
  imageUrl?: string;
  status: ContentStatus;
}

const INITIAL_SPORTS_ARTS: SportsArtsItem[] = [
  {
    id: "sa-1",
    title: "Bharathiar University Inter-Collegiate Athletics Championship 2024–25",
    type: "Sports",
    eventLevel: "University",
    studentName: "D. Praveen Kumar (III B.Sc CS)",
    department: "Computer Science",
    achievement: "Gold Medal & New Meet Record — 400m Men's Track Event",
    academicYear: "2024–2025",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80",
    status: "published",
  },
  {
    id: "sa-2",
    title: "State Level Inter-Collegiate Cultural Carnival — 'TARANG 2024'",
    type: "Cultural",
    eventLevel: "State",
    studentName: "Bishop Ambrose Fine Arts Troupe (14 Members)",
    department: "All Departments",
    achievement: "Overall Cultural Champions Rolling Trophy & Best Folk Dance",
    academicYear: "2024–2025",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    status: "published",
  },
  {
    id: "sa-3",
    title: "South Zone Inter-University Basketball Tournament",
    type: "Sports",
    eventLevel: "National",
    studentName: "J. Antony (II M.Com) & S. Vignesh (III B.Com)",
    department: "Commerce",
    achievement: "Selected to Represent Bharathiar University South Zone Squad",
    academicYear: "2024–2025",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80",
    status: "published",
  },
  {
    id: "sa-4",
    title: "National Theatre & Mime Festival 2024",
    type: "Fine Arts",
    eventLevel: "National",
    studentName: "Ambrose Theatre Society (8 Members)",
    department: "English & Commerce",
    achievement: "1st Place & Best Script Award for Street Play on Green Campus",
    academicYear: "2024–2025",
    imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
    status: "published",
  },
];

export function SportsArtsCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [items, setItems] = useState<SportsArtsItem[]>(INITIAL_SPORTS_ARTS);
  const [selectedItem, setSelectedItem] = useState<SportsArtsItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SportsArtsItem | null>(null);

  const handleOpenEditor = (item?: SportsArtsItem) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem({
        id: "sa-" + Date.now(),
        title: "",
        type: "Sports",
        eventLevel: "Inter-Collegiate",
        studentName: "",
        department: "Computer Science",
        achievement: "",
        academicYear: "2024–2025",
        imageUrl: "",
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (items.some((i) => i.id === selectedItem.id)) {
      setItems((prev) => prev.map((i) => (i.id === selectedItem.id ? selectedItem : i)));
      logAction({
        action: "UPDATE",
        module: "Sports & Cultural Achievements",
        recordId: selectedItem.id,
        recordTitle: selectedItem.title,
      });
    } else {
      setItems((prev) => [selectedItem, ...prev]);
      logAction({
        action: "CREATE",
        module: "Sports & Cultural Achievements",
        recordId: selectedItem.id,
        recordTitle: selectedItem.title,
      });
    }
    setIsEditorOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    logAction({
      action: "DELETE",
      module: "Sports & Cultural Achievements",
      recordId: itemToDelete.id,
      recordTitle: itemToDelete.title,
    });
    setItemToDelete(null);
  };

  const columns: Column<SportsArtsItem>[] = [
    {
      key: "title",
      header: "Event / Tournament",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5 flex items-center gap-1.5">
            <Medal className="w-3.5 h-3.5" />
            {item.achievement}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Category & Level",
      sortable: true,
      render: (item) => (
        <div className="text-xs space-y-0.5">
          <span className="font-bold text-slate-800 dark:text-slate-200">{item.type}</span>
          <div className="text-[11px] text-slate-500">{item.eventLevel} Level</div>
        </div>
      ),
    },
    {
      key: "studentName",
      header: "Winner / Team",
      render: (item) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200">{item.studentName}</div>
          <div className="text-slate-500">{item.department}</div>
        </div>
      ),
    },
    {
      key: "academicYear",
      header: "Year",
      render: (item) => <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{item.academicYear}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditor(item)}
            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Edit Achievement"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setItemToDelete(item)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Achievement"
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
        title="Sports, Cultural & Fine Arts Achievements"
        description="Showcase university championships, athletics meet records, cultural trophies, and fine arts accolades."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Student Life", href: "#" },
          { label: "Sports & Arts" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Achievement Record
          </button>
        }
      />

      <DataTable
        data={items}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search sports or cultural achievements..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {items.some((i) => i.id === selectedItem.id) ? "Edit Trophy / Award Record" : "Add New Achievement Record"}
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
                  Championship / Tournament / Fest Title *
                </label>
                <input
                  type="text"
                  required
                  value={selectedItem.title}
                  onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                  placeholder="e.g. Bharathiar University Athletics Championship 2024–25"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Activity Domain *
                  </label>
                  <select
                    value={selectedItem.type}
                    onChange={(e) => setSelectedItem({ ...selectedItem, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Sports">Sports & Games</option>
                    <option value="Cultural">Cultural Troupe / Fest</option>
                    <option value="Fine Arts">Fine Arts & Theatre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Competition Level *
                  </label>
                  <select
                    value={selectedItem.eventLevel}
                    onChange={(e) => setSelectedItem({ ...selectedItem, eventLevel: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="National">National Level</option>
                    <option value="State">State Level</option>
                    <option value="University">University Level</option>
                    <option value="Inter-Collegiate">Inter-Collegiate</option>
                    <option value="Intramural">Intramural / Annual Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prize / Medal / Distinction Won *
                </label>
                <input
                  type="text"
                  required
                  value={selectedItem.achievement}
                  onChange={(e) => setSelectedItem({ ...selectedItem, achievement: e.target.value })}
                  placeholder="e.g. Gold Medal & New Meet Record in 400m Men's Track"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Name(s) / Team *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedItem.studentName}
                    onChange={(e) => setSelectedItem({ ...selectedItem, studentName: e.target.value })}
                    placeholder="e.g. D. Praveen Kumar (III B.Sc CS)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={selectedItem.department}
                    onChange={(e) => setSelectedItem({ ...selectedItem, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={selectedItem.academicYear}
                    onChange={(e) => setSelectedItem({ ...selectedItem, academicYear: e.target.value })}
                    placeholder="e.g. 2024–2025"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Trophy / Event Photo URL
                  </label>
                  <input
                    type="text"
                    value={selectedItem.imageUrl || ""}
                    onChange={(e) => setSelectedItem({ ...selectedItem, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
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
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Achievement"
        description={`Are you sure you want to delete ${itemToDelete?.title}?`}
        confirmText="Delete Record"
        variant="danger"
      />
    </div>
  );
}
