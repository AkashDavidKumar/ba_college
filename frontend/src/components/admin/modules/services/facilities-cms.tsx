"use client";

import React, { useState } from "react";
import { useCMSStore, ContentStatus } from "@/lib/cms-store";
import { DataTable, Column } from "@/components/admin/core/data-table";
import { StatusBadge } from "@/components/admin/core/status-badge";
import { PageHeader } from "@/components/admin/core/page-header";
import { ConfirmationDialog } from "@/components/admin/core/confirmation-dialog";
import { 
  Building2, Plus, Monitor, Image, Trash2, 
  Edit3, CheckCircle, Wifi, Zap 
} from "lucide-react";

interface CampusFacility {
  id: string;
  name: string;
  category: "Smart Classrooms" | "Computer Laboratories" | "Auditorium & Seminar Halls" | "Sports Complex" | "Hostel & Dining" | "Green Campus" | "Chapel & Prayer Hall";
  capacity: string;
  keyFeatures: string[];
  inCharge: string;
  imageUrl: string;
  status: ContentStatus;
}

const INITIAL_FACILITIES: CampusFacility[] = [
  {
    id: "fac-1",
    name: "Advanced Cloud & AI Computing Laboratory",
    category: "Computer Laboratories",
    capacity: "120 High-End Workstations",
    keyFeatures: ["Intel Core i7 13th Gen Terminals", "Gigabit LAN & 1 Gbps Fiber", "NVIDIA RTX GPUs for Deep Learning", "Fully Air-Conditioned"],
    inCharge: "System Administrator & CS Dept",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    status: "published",
  },
  {
    id: "fac-2",
    name: "St. Ambrose Main Auditorium",
    category: "Auditorium & Seminar Halls",
    capacity: "1,200 Seating Capacity",
    keyFeatures: ["Centralized HVAC", "Dolby Digital Surround Acoustics", "Motorized Stage Curtains & 4K Projection", "Green Rooms"],
    inCharge: "Estate Officer",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    status: "published",
  },
  {
    id: "fac-3",
    name: "ICT-Enabled Smart Classrooms",
    category: "Smart Classrooms",
    capacity: "35 Fully Equipped Theatres",
    keyFeatures: ["Interactive Touch Panels", "High-Definition Document Cameras", "Hybrid Lecture Recording LMS", "Wi-Fi 6 Enabled"],
    inCharge: "ICT Coordinator",
    imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
    status: "published",
  },
  {
    id: "fac-4",
    name: "Ambrose Green Energy Solar Park & Eco-Campus",
    category: "Green Campus",
    capacity: "50 kW Rooftop Grid",
    keyFeatures: ["100% Clean Solar Energy Generation", "Rainwater Harvesting Sumps", "Sewage Treatment Plant (STP) for Garden", "Herbal Botanical Garden"],
    inCharge: "Green Campus Cell",
    imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    status: "published",
  },
];

export function FacilitiesCMS() {
  const { logAction, currentUser } = useCMSStore();
  const [facilities, setFacilities] = useState<CampusFacility[]>(INITIAL_FACILITIES);
  const [selectedFac, setSelectedFac] = useState<CampusFacility | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [facToDelete, setFacToDelete] = useState<CampusFacility | null>(null);
  const [featureInput, setFeatureInput] = useState("");

  const handleOpenEditor = (fac?: CampusFacility) => {
    if (fac) {
      setSelectedFac(fac);
    } else {
      setSelectedFac({
        id: "fac-" + Date.now(),
        name: "",
        category: "Smart Classrooms",
        capacity: "",
        keyFeatures: ["High Speed Wi-Fi"],
        inCharge: "Estate Officer",
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
        status: currentUser.role === "master_admin" ? "published" : "submitted",
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFac) return;

    if (facilities.some((f) => f.id === selectedFac.id)) {
      setFacilities((prev) => prev.map((f) => (f.id === selectedFac.id ? selectedFac : f)));
      logAction({
        action: "UPDATE",
        module: "Campus Infrastructure & Facilities",
        recordId: selectedFac.id,
        recordTitle: selectedFac.name,
      });
    } else {
      setFacilities((prev) => [selectedFac, ...prev]);
      logAction({
        action: "CREATE",
        module: "Campus Infrastructure & Facilities",
        recordId: selectedFac.id,
        recordTitle: selectedFac.name,
      });
    }
    setIsEditorOpen(false);
    setSelectedFac(null);
  };

  const handleDelete = () => {
    if (!facToDelete) return;
    setFacilities((prev) => prev.filter((f) => f.id !== facToDelete.id));
    logAction({
      action: "DELETE",
      module: "Campus Infrastructure & Facilities",
      recordId: facToDelete.id,
      recordTitle: facToDelete.name,
    });
    setFacToDelete(null);
  };

  const handleAddFeature = () => {
    if (!selectedFac || !featureInput.trim()) return;
    setSelectedFac({
      ...selectedFac,
      keyFeatures: [...(selectedFac.keyFeatures || []), featureInput.trim()],
    });
    setFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    if (!selectedFac) return;
    setSelectedFac({
      ...selectedFac,
      keyFeatures: selectedFac.keyFeatures.filter((_, i) => i !== index),
    });
  };

  const columns: Column<CampusFacility>[] = [
    {
      key: "name",
      header: "Campus Facility",
      sortable: true,
      render: (f) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
            <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{f.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{f.capacity}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (f) => (
        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          {f.category}
        </span>
      ),
    },
    {
      key: "inCharge",
      header: "Custodian / In-Charge",
      render: (f) => <span className="text-xs text-slate-700 dark:text-slate-300">{f.inCharge}</span>,
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
            title="Edit Facility"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFacToDelete(f)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Facility"
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
        title="Campus Infrastructure & Facilities"
        description="Showcase high-tech computer labs, ICT smart classrooms, St. Ambrose auditorium, sports arena, and green campus assets."
        breadcrumbs={[
          { label: "Admin", href: "#" },
          { label: "Services", href: "#" },
          { label: "Facilities" },
        ]}
        actions={
          <button
            onClick={() => handleOpenEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-sm font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Campus Facility
          </button>
        }
      />

      <DataTable
        data={facilities}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search campus facilities..."
        pageSize={8}
      />

      {/* Editor Modal */}
      {isEditorOpen && selectedFac && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {facilities.some((f) => f.id === selectedFac.id) ? "Edit Facility" : "Add Campus Facility"}
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
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={selectedFac.name}
                  onChange={(e) => setSelectedFac({ ...selectedFac, name: e.target.value })}
                  placeholder="e.g. Advanced Cloud & AI Computing Laboratory"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Facility Category *
                  </label>
                  <select
                    value={selectedFac.category}
                    onChange={(e) => setSelectedFac({ ...selectedFac, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Smart Classrooms">Smart Classrooms</option>
                    <option value="Computer Laboratories">Computer Laboratories</option>
                    <option value="Auditorium & Seminar Halls">Auditorium & Seminar Halls</option>
                    <option value="Sports Complex">Sports Complex & Gymnasium</option>
                    <option value="Hostel & Dining">Hostel & Dining Hall</option>
                    <option value="Green Campus">Green Campus & Solar Grid</option>
                    <option value="Chapel & Prayer Hall">Chapel & Prayer Hall</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Capacity / Size *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedFac.capacity}
                    onChange={(e) => setSelectedFac({ ...selectedFac, capacity: e.target.value })}
                    placeholder="e.g. 120 Workstations or 1,200 Seating"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Custodian / In-Charge Officer
                  </label>
                  <input
                    type="text"
                    value={selectedFac.inCharge}
                    onChange={(e) => setSelectedFac({ ...selectedFac, inCharge: e.target.value })}
                    placeholder="e.g. System Administrator / Estate Officer"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Photo URL
                  </label>
                  <input
                    type="text"
                    value={selectedFac.imageUrl}
                    onChange={(e) => setSelectedFac({ ...selectedFac, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Key Features List */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Key Amenities & Technical Specifications
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add specification (e.g. 1 Gbps Fiber LAN, Dolby Sound)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedFac.keyFeatures?.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      ✓ {feat}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-400 hover:text-red-500 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
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
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!facToDelete}
        onClose={() => setFacToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Facility"
        description={`Are you sure you want to delete ${facToDelete?.name}?`}
        confirmText="Delete Facility"
        variant="danger"
      />
    </div>
  );
}
