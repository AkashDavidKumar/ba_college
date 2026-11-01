"use client";

import React, { useState, useEffect } from "react";
import { NavState } from "../admin-nav";
import { PageDashboard } from "../page-dashboard";
import {
  useSiteData,
  defaultLocationConfig,
  LocationConfig,
  FooterSection,
  defaultFooterSections,
} from "@/lib/site-context";
import { LocationSection } from "@/components/site/location-section";
import {
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Compass,
  Navigation,
  ExternalLink,
  Layers,
  Sparkles,
  Eye,
  Sliders,
  Building2,
  Phone,
  Clock,
  Map,
  LayoutDashboard,
  Mail,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Copy,
  Info,
  Plus,
  Trash2,
  X,
  LayoutGrid,
} from "lucide-react";

interface LocationDashboardProps {
  nav: NavState;
}

// Quick presets for convenience
const PRESETS: { name: string; description: string; data: Partial<LocationConfig> }[] = [
  {
    name: "BAC Global University (Bangalore Main Campus)",
    description: "Knowledge City, Bangalore - 200 acre research campus",
    data: {
      campusName: "BAC Global University",
      shortName: "BAC University",
      tagline: "Premier Research University · Ranked #1 for Innovation & Placements",
      category: "Global Research University · Main Campus",
      address: "BAC Campus, Knowledge City, Bangalore, Karnataka - 560100, India",
      lat: 12.9716,
      lng: 77.5946,
      zoom: 16,
      nearbyLandmark: "Near Knowledge City Tech Park, Phase 2",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BAC+Campus+Knowledge+City+Bangalore",
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Knowledge+City+Bangalore",
      embedUrl: "",
      pinColor: "#EAB308", // BAC Gold
      pinLabel: "BAC Main Campus",
      pinPulse: true,
      sectionBadge: "Find Us & Campus Map",
      heading: "Our Location",
      statusText: "Campus open for visitors, prospective students & researchers",
      statusBadge: "Open · Closes 6:00 PM",
      phone: "+91 80 4967 0000",
      email: "admissions@bac.edu",
      openingHours: "Mon – Sat: 8:30 AM – 6:00 PM",
      enableSatelliteToggle: true,
      enableDirectionsButton: true,
      enableShareButton: true,
      enableSaveButton: true,
      rating: 4.8,
      reviewsCount: 1240,
      visitTitle: "Visit Our Campus",
      visitDescription: "We welcome you to visit our 200-acre Knowledge City campus and experience world-class academic and research facilities.",
      tourNotice: "Campus tours available Monday to Saturday (9:00 AM – 5:00 PM). Schedule with admissions.",
      transit1Label: "Majestic Metro/Jn",
      transit1Distance: "12 km (25 mins)",
      transit2Label: "Bengaluru Airport (BLR)",
      transit2Distance: "34 km (45 mins)",
      transit3Label: "Tech Corridor Bus",
      transit3Distance: "1.2 km (5 mins)",
    },
  },
  {
    name: "Nirmala College for Women (Coimbatore)",
    description: "Red Fields, Coimbatore campus location",
    data: {
      campusName: "Nirmala College for Women",
      shortName: "Nirmala College",
      tagline: "Autonomous Institution · Re-accredited with 'A++' Grade by NAAC",
      category: "Women's College · Higher Education Institution",
      address: "25C, Kamaraj Rd, near HDFC Bank, Red Fields, Puliakulam, Coimbatore, Tamil Nadu 641018, India",
      lat: 11.009477,
      lng: 76.993425,
      zoom: 16,
      nearbyLandmark: "Near HDFC Bank, Red Fields",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Nirmala+College+for+Women+Kamaraj+Rd+Puliakulam+Coimbatore+Tamil+Nadu+641018",
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Nirmala+College+for+Women+25C+Kamaraj+Rd+Red+Fields+Puliakulam+Coimbatore+Tamil+Nadu+641018",
      embedUrl: "",
      pinColor: "#EA4335", // Red
      pinLabel: "College Campus",
      pinPulse: true,
      sectionBadge: "Find Us & Campus Map",
      heading: "Our Location",
      statusText: "Campus open for visitors & prospective students",
      statusBadge: "Open · Closes 5:00 PM",
      phone: "+91 422 222 3469",
      email: "office@nirmalacollegeonline.ac.in",
      openingHours: "Mon – Sat: 9:00 AM – 5:00 PM",
      enableSatelliteToggle: true,
      enableDirectionsButton: true,
      enableShareButton: true,
      enableSaveButton: true,
      rating: 4.5,
      reviewsCount: 682,
      visitTitle: "Visit Our Campus",
      visitDescription: "“We welcome you to visit our campus and experience our learning environment.”",
      tourNotice: "Campus tours available Mon–Sat (9 AM – 4:30 PM). Advance booking recommended.",
      transit1Label: "Coimbatore Jn",
      transit1Distance: "3.5 km (10 mins)",
      transit2Label: "Airport (CJB)",
      transit2Distance: "9.2 km (20 mins)",
      transit3Label: "Gandhipuram Bus",
      transit3Distance: "4.1 km (12 mins)",
    },
  },
];

const PIN_COLOR_OPTIONS = [
  { name: "Google Red", value: "#EA4335" },
  { name: "BAC Gold", value: "#EAB308" },
  { name: "Navy Blue", value: "#1E3A8A" },
  { name: "Emerald Green", value: "#10B981" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Coral Orange", value: "#F97316" },
];

export function LocationDashboard({ nav }: LocationDashboardProps) {
  const { data, updateLocation, updateGeneralSettings } = useSiteData();

  // Active sub-tab: "map" | "footer"
  const [activeTab, setActiveTab] = useState<"map" | "footer">(
    nav.section === "footer" ? "footer" : "map"
  );

  // Map state
  const [mapForm, setMapForm] = useState<LocationConfig>(defaultLocationConfig);
  // Footer state
  const [footerForm, setFooterForm] = useState({
    ctaBadge: "Admissions Open 2026",
    ctaTitle: "Ready to shape your future?",
    ctaDescription: "Join 20,000+ students who chose BAC to launch their careers, startups, and research journeys. Your story starts here.",
    aboutText: "BAC Global University is a globally connected research university preparing 20,000+ students for careers, entrepreneurship, research, and leadership through world-class education across 8 schools and 200+ programs.",
    address: "BAC Campus, Knowledge City, Bangalore, Karnataka - 560100",
    phone: "+91 80 4967 0000",
    email: "admissions@bac.edu",
    infoEmail: "info@bac.edu",
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
  });

  // Footer Link Columns (8 Directory Sections)
  const [footerSections, setFooterSections] = useState<FooterSection[]>(defaultFooterSections);
  const [newColTitle, setNewColTitle] = useState("");
  const [showAddColInput, setShowAddColInput] = useState(false);
  const [newLinkInputs, setNewLinkInputs] = useState<Record<number, string>>({});

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  // Sync state from site context
  useEffect(() => {
    if (data?.location) {
      setMapForm({
        ...defaultLocationConfig,
        ...data.location,
      });
    }
    if (data?.footer) {
      setFooterForm((prev) => ({
        ...prev,
        ...data.footer,
      }));
      if (
        data.footer.sections &&
        Array.isArray(data.footer.sections) &&
        data.footer.sections.length > 0
      ) {
        setFooterSections(data.footer.sections);
      }
    }
  }, [data?.location, data?.footer]);

  const handleMapChange = (
    field: keyof LocationConfig,
    value: string | number | boolean
  ) => {
    setMapForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFooterChange = (field: string, value: string) => {
    setFooterForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Column and link management handlers
  const handleColumnTitleChange = (colIndex: number, newTitle: string) => {
    setFooterSections((prev) => {
      const updated = [...prev];
      updated[colIndex] = { ...updated[colIndex], title: newTitle };
      return updated;
    });
  };

  const handleAddColumn = () => {
    if (!newColTitle.trim()) return;
    setFooterSections((prev) => [
      ...prev,
      { title: newColTitle.trim(), links: [] },
    ]);
    setNewColTitle("");
    setShowAddColInput(false);
  };

  const handleDeleteColumn = (colIndex: number) => {
    const colName = footerSections[colIndex]?.title || "this column";
    if (window.confirm(`Are you sure you want to remove "${colName}" from the footer?`)) {
      setFooterSections((prev) => prev.filter((_, i) => i !== colIndex));
    }
  };

  const handleLinkChange = (colIndex: number, linkIndex: number, newText: string) => {
    setFooterSections((prev) => {
      const updated = [...prev];
      const newLinks = [...updated[colIndex].links];
      newLinks[linkIndex] = newText;
      updated[colIndex] = { ...updated[colIndex], links: newLinks };
      return updated;
    });
  };

  const handleDeleteLink = (colIndex: number, linkIndex: number) => {
    setFooterSections((prev) => {
      const updated = [...prev];
      updated[colIndex] = {
        ...updated[colIndex],
        links: updated[colIndex].links.filter((_, i) => i !== linkIndex),
      };
      return updated;
    });
  };

  const handleAddLink = (colIndex: number) => {
    const text = (newLinkInputs[colIndex] || "").trim();
    if (!text) return;
    setFooterSections((prev) => {
      const updated = [...prev];
      updated[colIndex] = {
        ...updated[colIndex],
        links: [...updated[colIndex].links, text],
      };
      return updated;
    });
    setNewLinkInputs((prev) => ({ ...prev, [colIndex]: "" }));
  };

  const handleResetSections = () => {
    if (window.confirm("Reset all footer link columns to the default 8 BAC directory columns?")) {
      setFooterSections(defaultFooterSections);
    }
  };

  const applyPreset = (presetData: Partial<LocationConfig>) => {
    setMapForm((prev) => ({
      ...prev,
      ...presetData,
    }));
  };

  // Sync address from Campus Map into Footer
  const syncAddressToFooter = () => {
    if (mapForm.address) {
      setFooterForm((prev) => ({
        ...prev,
        address: mapForm.address,
        phone: mapForm.phone || prev.phone,
        email: mapForm.email || prev.email,
      }));
      setSaveSuccess(true);
      setSaveMessage("Campus Map address & contact info copied to Footer!");
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      if (activeTab === "map") {
        const ok = await updateLocation(mapForm);
        if (ok) {
          setSaveSuccess(true);
          setSaveMessage("Campus Map & Location settings saved successfully!");
          setTimeout(() => setSaveSuccess(false), 4000);
        } else {
          setSaveError("Failed to save location settings. Please try again.");
        }
      } else {
        const ok = await updateGeneralSettings({
          footer: {
            ...footerForm,
            sections: footerSections,
          },
        });
        if (ok) {
          setSaveSuccess(true);
          setSaveMessage("Footer content & link columns saved successfully!");
          setTimeout(() => setSaveSuccess(false), 4000);
        } else {
          setSaveError("Failed to save footer content. Please try again.");
        }
      }
    } catch (err: any) {
      setSaveError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageDashboard
      pageName="Content Management"
      sectionName={activeTab === "map" ? "Location & Campus Map" : "Footer Controls & Content"}
      pageDescription="Customize your campus location, interactive Google-style map, coordinates, and full footer banner, about text, and social links."
    >
      <div className="space-y-6">
        {/* Top Header & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              Location & Footer Management
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage the public website's interactive Our Location section and all Footer content.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {activeTab === "map" && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{showPreview ? "Hide Map Preview" : "Show Map Preview"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs tracking-wide shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="flex min-w-max p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "map"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Campus Map & Location</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("footer")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "footer"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Footer Content & Controls</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {saveSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold">{saveMessage || "Changes saved successfully!"}</span> The website has been updated in real-time.
            </div>
          </div>
        )}

        {saveError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <span className="font-semibold">Error:</span> {saveError}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 1: CAMPUS MAP & LOCATION                                        */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "map" && (
          <div className="space-y-6">
            {/* Quick Presets Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Campus Presets
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset.data)}
                    className="flex flex-col text-left p-3.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-sm transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-amber-600 transition-colors">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        Apply Preset
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1">
                      {preset.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-6">
              {/* Card 1: Campus Identity & Basic Information */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">Campus Identity & Address</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Campus Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={mapForm.campusName}
                      onChange={(e) => handleMapChange("campusName", e.target.value)}
                      placeholder="e.g. BAC Global University"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Short / Display Name
                    </label>
                    <input
                      type="text"
                      value={mapForm.shortName || ""}
                      onChange={(e) => handleMapChange("shortName", e.target.value)}
                      placeholder="e.g. BAC Campus"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Campus Address *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={mapForm.address}
                      onChange={(e) => handleMapChange("address", e.target.value)}
                      placeholder="e.g. 25C, Kamaraj Rd, near HDFC Bank, Red Fields, Puliakulam, Coimbatore, Tamil Nadu 641018, India"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tagline / Accreditations Badge
                    </label>
                    <input
                      type="text"
                      value={mapForm.tagline || ""}
                      onChange={(e) => handleMapChange("tagline", e.target.value)}
                      placeholder="e.g. Autonomous Institution · Re-accredited with 'A++' Grade by NAAC"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Category / Institution Type
                    </label>
                    <input
                      type="text"
                      value={mapForm.category || ""}
                      onChange={(e) => handleMapChange("category", e.target.value)}
                      placeholder="e.g. Global Research University · Higher Education"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nearby Landmark
                    </label>
                    <input
                      type="text"
                      value={mapForm.nearbyLandmark || ""}
                      onChange={(e) => handleMapChange("nearbyLandmark", e.target.value)}
                      placeholder="e.g. Near HDFC Bank, Red Fields"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Star Rating & Review Count
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={mapForm.rating || 4.5}
                        onChange={(e) => handleMapChange("rating", parseFloat(e.target.value) || 4.5)}
                        className="w-24 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                        placeholder="Rating"
                      />
                      <input
                        type="number"
                        min="0"
                        value={mapForm.reviewsCount || 682}
                        onChange={(e) => handleMapChange("reviewsCount", parseInt(e.target.value, 10) || 0)}
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                        placeholder="Reviews count"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Coordinates, Map Pin & Interactive Map Config */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <Map className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">Map Coordinates & Pin Styling</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={mapForm.lat}
                      onChange={(e) => handleMapChange("lat", parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 11.009477"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={mapForm.lng}
                      onChange={(e) => handleMapChange("lng", parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 76.993425"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Default Zoom Level (12–18)
                    </label>
                    <input
                      type="number"
                      min="11"
                      max="19"
                      value={mapForm.zoom || 16}
                      onChange={(e) => handleMapChange("zoom", parseInt(e.target.value, 10) || 16)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Pin Color & Customization */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Location Pin Color
                    </label>
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      {PIN_COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => handleMapChange("pinColor", c.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            mapForm.pinColor === c.value
                              ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: c.value }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={mapForm.pinColor || "#EA4335"}
                        onChange={(e) => handleMapChange("pinColor", e.target.value)}
                        className="w-10 h-9 p-1 rounded-lg border border-slate-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={mapForm.pinColor || "#EA4335"}
                        onChange={(e) => handleMapChange("pinColor", e.target.value)}
                        placeholder="Hex code (#EA4335)"
                        className="w-32 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                      <span className="text-xs text-slate-400">Custom Hex Code</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Location Pin Label
                    </label>
                    <input
                      type="text"
                      value={mapForm.pinLabel || ""}
                      onChange={(e) => handleMapChange("pinLabel", e.target.value)}
                      placeholder="e.g. College Campus"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="md:col-span-3 flex flex-wrap gap-6 pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapForm.pinPulse !== false}
                        onChange={(e) => handleMapChange("pinPulse", e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span>Enable Pulsing Radar Pin Effect</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapForm.enableSatelliteToggle !== false}
                        onChange={(e) => handleMapChange("enableSatelliteToggle", e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span>Enable Satellite / Map View Switcher</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapForm.enableDirectionsButton !== false}
                        onChange={(e) => handleMapChange("enableDirectionsButton", e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span>Enable Get Directions Button</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 3: External Map & Directions URLs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">Google Maps Links & Embed URL</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Google Maps URL (Open in Maps link)
                    </label>
                    <input
                      type="url"
                      value={mapForm.googleMapsUrl || ""}
                      onChange={(e) => handleMapChange("googleMapsUrl", e.target.value)}
                      placeholder="https://www.google.com/maps/search/?api=1&query=..."
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Directions URL (Navigation link)
                    </label>
                    <input
                      type="url"
                      value={mapForm.directionsUrl || ""}
                      onChange={(e) => handleMapChange("directionsUrl", e.target.value)}
                      placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Custom Map Embed URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={mapForm.embedUrl || ""}
                      onChange={(e) => handleMapChange("embedUrl", e.target.value)}
                      placeholder="Leave empty to use built-in clean Google Maps style interactive map, or paste custom embed URL"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Optional: If provided, this custom URL will be used in place of the built-in interactive vector map.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Headings, Labels & Status Texts */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">Section Headings & Status Labels</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Section Badge / Tag
                    </label>
                    <input
                      type="text"
                      value={mapForm.sectionBadge}
                      onChange={(e) => handleMapChange("sectionBadge", e.target.value)}
                      placeholder="Find Us & Campus Map"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Section Heading
                    </label>
                    <input
                      type="text"
                      value={mapForm.heading}
                      onChange={(e) => handleMapChange("heading", e.target.value)}
                      placeholder="Our Location"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Campus Status Text
                    </label>
                    <input
                      type="text"
                      value={mapForm.statusText}
                      onChange={(e) => handleMapChange("statusText", e.target.value)}
                      placeholder="Campus open for visitors & prospective students"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={mapForm.phone || ""}
                      onChange={(e) => handleMapChange("phone", e.target.value)}
                      placeholder="+91 422 222 3469"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Opening Hours
                    </label>
                    <input
                      type="text"
                      value={mapForm.openingHours || ""}
                      onChange={(e) => handleMapChange("openingHours", e.target.value)}
                      placeholder="Mon – Sat: 9:00 AM – 5:00 PM"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Status Pill Badge
                    </label>
                    <input
                      type="text"
                      value={mapForm.statusBadge || ""}
                      onChange={(e) => handleMapChange("statusBadge", e.target.value)}
                      placeholder="Open · Closes 5:00 PM"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: Visit Our Campus Area Below Map */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">"Visit Our Campus" Area & Commute Distances</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={mapForm.visitTitle || ""}
                      onChange={(e) => handleMapChange("visitTitle", e.target.value)}
                      placeholder="Visit Our Campus"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tour Notice / Booking Note
                    </label>
                    <input
                      type="text"
                      value={mapForm.tourNotice || ""}
                      onChange={(e) => handleMapChange("tourNotice", e.target.value)}
                      placeholder="Campus tours available Mon–Sat (9 AM – 4:30 PM)."
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Invitation Quote / Description
                    </label>
                    <textarea
                      rows={2}
                      value={mapForm.visitDescription || ""}
                      onChange={(e) => handleMapChange("visitDescription", e.target.value)}
                      placeholder="“We welcome you to visit our campus and experience our learning environment.”"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Transit Distances */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Transit #1 Label & Distance
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mapForm.transit1Label || ""}
                        onChange={(e) => handleMapChange("transit1Label", e.target.value)}
                        placeholder="e.g. Coimbatore Jn"
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                      />
                      <input
                        type="text"
                        value={mapForm.transit1Distance || ""}
                        onChange={(e) => handleMapChange("transit1Distance", e.target.value)}
                        placeholder="3.5 km (10 mins)"
                        className="w-36 px-3 py-2 text-sm rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Transit #2 Label & Distance
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mapForm.transit2Label || ""}
                        onChange={(e) => handleMapChange("transit2Label", e.target.value)}
                        placeholder="e.g. Airport (CJB)"
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
                      />
                      <input
                        type="text"
                        value={mapForm.transit2Distance || ""}
                        onChange={(e) => handleMapChange("transit2Distance", e.target.value)}
                        placeholder="9.2 km (20 mins)"
                        className="w-36 px-3 py-2 text-sm rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Changes..." : "Save Location Settings"}</span>
                </button>
              </div>
            </form>

            {/* Live Preview Area */}
            {showPreview && (
              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                      Live Preview
                    </span>
                    <h3 className="font-serif font-bold text-lg text-slate-900">
                      Public Section Preview
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Updates in real-time as you edit fields above
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-lg">
                  <LocationSection customConfig={mapForm} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 2: FOOTER CONTENT & CONTROLS                                    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "footer" && (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Quick Helper Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Footer Content Synchronization</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    You can quickly copy the Campus Address and Phone from the Location & Map settings with one click.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={syncAddressToFooter}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sync Address from Campus Map</span>
              </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* Card: Footer Navigation & Directory Link Columns (8 Columns)   */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-base text-slate-900">
                      Footer Directory & Link Columns ({footerSections.length} Columns)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Control the navigation columns and quick links displayed across the footer (University Information, Departments, Admissions, Student Resources, Research, Campus Life, Placements, Events).
                  </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <button
                    type="button"
                    onClick={handleResetSections}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                    title="Reset to default 8 columns"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset Defaults</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddColInput(!showAddColInput)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Column</span>
                  </button>
                </div>
              </div>

              {/* Add Column Inline Bar */}
              {showAddColInput && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center gap-2.5 animate-in fade-in">
                  <input
                    type="text"
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddColumn();
                      }
                    }}
                    placeholder="Enter new column title (e.g. ALUMNI & CAREERS)..."
                    className="flex-1 w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-amber-300 bg-white focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleAddColumn}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      Create Column
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddColInput(false)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Columns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {footerSections.map((section, colIndex) => (
                  <div
                    key={colIndex}
                    className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between hover:border-amber-300 transition-all group"
                  >
                    <div>
                      {/* Column Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          Column {colIndex + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-medium">
                            {section.links.length} {section.links.length === 1 ? "link" : "links"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteColumn(colIndex)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-1"
                            title="Delete this column"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Column Title Input */}
                      <div className="mb-2.5">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Column Title
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleColumnTitleChange(colIndex, e.target.value)}
                          placeholder="Column Title"
                          className="w-full text-xs font-bold uppercase tracking-wider text-slate-900 bg-white border border-slate-200 focus:border-amber-500 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      {/* Links List */}
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Links List
                      </label>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {section.links.map((link, linkIndex) => (
                          <div
                            key={linkIndex}
                            className="flex items-center gap-1.5 bg-white border border-slate-200/70 rounded-lg px-2 py-1 group/item hover:border-amber-300 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                            <input
                              type="text"
                              value={link}
                              onChange={(e) => handleLinkChange(colIndex, linkIndex, e.target.value)}
                              className="flex-1 text-xs text-slate-700 bg-transparent border-none focus:outline-none p-0"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteLink(colIndex, linkIndex)}
                              className="opacity-40 group-hover/item:opacity-100 p-0.5 text-slate-400 hover:text-red-500 rounded transition-opacity cursor-pointer shrink-0"
                              title="Delete Link"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {section.links.length === 0 && (
                          <p className="text-[11px] text-slate-400 italic py-2 text-center">
                            No links added yet.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Add Link Input */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newLinkInputs[colIndex] || ""}
                        onChange={(e) =>
                          setNewLinkInputs((prev) => ({ ...prev, [colIndex]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddLink(colIndex);
                          }
                        }}
                        placeholder="Add new link..."
                        className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400 text-slate-700 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddLink(colIndex)}
                        className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-colors cursor-pointer shrink-0"
                        title="Add Link"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Real-time Live Directory Grid Preview (matching user screenshot) */}
              <div className="mt-5 pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <Eye className="w-4 h-4 text-amber-500" />
                    <span>Live Public Footer Directory Preview</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Real-time replica of the university website footer
                  </span>
                </div>

                <div className="bg-[#082618] rounded-2xl p-6 sm:p-8 border border-emerald-950/80 shadow-inner">
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                    {footerSections.map((section, idx) => (
                      <div key={idx}>
                        <h5 className="font-serif text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">
                          {section.title || "UNTITLED SECTION"}
                        </h5>
                        <ul className="space-y-2 text-xs text-white/70">
                          {section.links.map((link, lIdx) => (
                            <li key={lIdx} className="hover:text-amber-200 transition-colors cursor-pointer">
                              {link}
                            </li>
                          ))}
                          {section.links.length === 0 && (
                            <li className="text-white/30 italic text-[11px]">(No links)</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Footer CTA Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Footer Call-To-Action (CTA) Banner</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    CTA Pill Badge
                  </label>
                  <input
                    type="text"
                    value={footerForm.ctaBadge}
                    onChange={(e) => handleFooterChange("ctaBadge", e.target.value)}
                    placeholder="e.g. Admissions Open 2026"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    CTA Headline
                  </label>
                  <input
                    type="text"
                    value={footerForm.ctaTitle}
                    onChange={(e) => handleFooterChange("ctaTitle", e.target.value)}
                    placeholder="e.g. Ready to shape your future?"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    CTA Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={footerForm.ctaDescription}
                    onChange={(e) => handleFooterChange("ctaDescription", e.target.value)}
                    placeholder="Join 20,000+ students who chose BAC to launch their careers..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Brand, About Text & Campus Contact Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">About University & Official Contacts</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Footer About Description
                  </label>
                  <textarea
                    rows={3}
                    value={footerForm.aboutText}
                    onChange={(e) => handleFooterChange("aboutText", e.target.value)}
                    placeholder="BAC Global University is a globally connected research university..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official Footer Address
                  </label>
                  <input
                    type="text"
                    value={footerForm.address}
                    onChange={(e) => handleFooterChange("address", e.target.value)}
                    placeholder="BAC Campus, Knowledge City, Bangalore, Karnataka - 560100"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={footerForm.phone}
                    onChange={(e) => handleFooterChange("phone", e.target.value)}
                    placeholder="+91 80 4967 0000"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Admissions Email
                  </label>
                  <input
                    type="email"
                    value={footerForm.email}
                    onChange={(e) => handleFooterChange("email", e.target.value)}
                    placeholder="admissions@bac.edu"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    General Info Email
                  </label>
                  <input
                    type="email"
                    value={footerForm.infoEmail || ""}
                    onChange={(e) => handleFooterChange("infoEmail", e.target.value)}
                    placeholder="info@bac.edu"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Social Media Links */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Social Media Profile Links</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-blue-600" />
                    <span>Facebook URL</span>
                  </label>
                  <input
                    type="text"
                    value={footerForm.facebook || ""}
                    onChange={(e) => handleFooterChange("facebook", e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Twitter className="w-3.5 h-3.5 text-sky-500" />
                    <span>Twitter / X URL</span>
                  </label>
                  <input
                    type="text"
                    value={footerForm.twitter || ""}
                    onChange={(e) => handleFooterChange("twitter", e.target.value)}
                    placeholder="https://x.com/..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    <span>Instagram URL</span>
                  </label>
                  <input
                    type="text"
                    value={footerForm.instagram || ""}
                    onChange={(e) => handleFooterChange("instagram", e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-blue-700" />
                    <span>LinkedIn URL</span>
                  </label>
                  <input
                    type="text"
                    value={footerForm.linkedin || ""}
                    onChange={(e) => handleFooterChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/school/..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-600" />
                    <span>YouTube Channel URL</span>
                  </label>
                  <input
                    type="text"
                    value={footerForm.youtube || ""}
                    onChange={(e) => handleFooterChange("youtube", e.target.value)}
                    placeholder="https://youtube.com/@..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save Footer Controls"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </PageDashboard>
  );
}
