"use client";

import React, { useState } from "react";
import { useSiteData } from "@/lib/site-context";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  PlusCircle,
  Users,
  Image as ImageIcon,
  Loader2
} from "lucide-react";

export function EventsTab() {
  const { data, saveEvent, deleteEvent, saveSpeaker, deleteSpeaker, saveGalleryItem, deleteGalleryItem } = useSiteData();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<"events" | "speakers" | "gallery">("events");

  // Event form states
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sub-items forms
  const [newSpeaker, setNewSpeaker] = useState({
    name: "",
    company: "",
    topic: "",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80"
  });

  const [newGallery, setNewGallery] = useState({
    title: "",
    category: "Cultural",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
  });

  const handleEditEvent = (evt: any) => {
    setEditingEvent(JSON.parse(JSON.stringify(evt)));
    setIsNewEvent(false);
  };

  const handleCreateNewEvent = () => {
    setEditingEvent({
      id: "",
      title: "",
      category: "Seminars",
      image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1200&q=80",
      date: "",
      dateISO: new Date().toISOString().split("T")[0],
      venue: "",
      participants: 100,
      prizePool: "—",
      description: "",
      speakers: []
    });
    setIsNewEvent(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent.title || !editingEvent.venue) {
      alert("Title and Venue are required.");
      return;
    }

    setIsSaving(true);
    try {
      const ok = await saveEvent(editingEvent, isNewEvent);
      if (ok) {
        toast({
          title: isNewEvent ? "Event Created" : "Event Saved",
          description: `Successfully configured ${editingEvent.title}.`,
        });
        setEditingEvent(null);
      } else {
        throw new Error();
      }
    } catch (e) {
      toast({
        title: "Save Failed",
        description: "An error occurred while saving the event.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const ok = await deleteEvent(id);
      if (ok) {
        toast({
          title: "Event Deleted",
          description: "The event was removed from the calendar.",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSpeaker = async () => {
    if (!newSpeaker.name || !newSpeaker.topic) {
      alert("Name and Topic are required.");
      return;
    }
    try {
      const ok = await saveSpeaker(newSpeaker, true);
      if (ok) {
        toast({
          title: "Speaker Added",
          description: `Added guest speaker ${newSpeaker.name}.`,
        });
        setNewSpeaker({
          name: "",
          company: "",
          topic: "",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80"
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSpeaker = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const ok = await deleteSpeaker(name);
      if (ok) {
        toast({
          title: "Speaker Removed",
          description: "Removed guest speaker successfully.",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddGallery = async () => {
    if (!newGallery.title || !newGallery.url) {
      alert("Title and Image URL are required.");
      return;
    }
    try {
      const ok = await saveGalleryItem(newGallery);
      if (ok) {
        toast({
          title: "Photo Added",
          description: "Added to campus event gallery.",
        });
        setNewGallery({
          title: "",
          category: "Cultural",
          url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGallery = async (title: string) => {
    if (!confirm(`Delete this photo?`)) return;
    try {
      const ok = await deleteGalleryItem(title);
      if (ok) {
        toast({
          title: "Photo Deleted",
          description: "Photo removed from gallery.",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, _target: "event" | "speaker" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({
      title: "Direct Upload Unavailable",
      description: "Direct binary file upload is not configured on this server. Please enter a hosted image URL into the Image URL field.",
      variant: "destructive"
    });
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Sub menu tabs */}
      {!editingEvent && (
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveSection("events")}
            className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-sm font-semibold transition-all ${
              activeSection === "events" ? "border-amber-400 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Calendar className="w-4 h-4" /> University Events
          </button>
          <button
            onClick={() => setActiveSection("speakers")}
            className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-sm font-semibold transition-all ${
              activeSection === "speakers" ? "border-amber-400 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users className="w-4 h-4" /> Guest Speakers
          </button>
          <button
            onClick={() => setActiveSection("gallery")}
            className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-sm font-semibold transition-all ${
              activeSection === "gallery" ? "border-amber-400 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Campus Gallery
          </button>
        </div>
      )}

      {/* 1. EVENTS SECTION */}
      {activeSection === "events" && (
        <>
          {!editingEvent ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">University Events Schedule</h3>
                  <p className="text-xs text-slate-400">Add seminars, national hackathons, or athletic tournaments.</p>
                </div>
                <button
                  onClick={handleCreateNewEvent}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.events?.map((evt: any) => (
                  <div key={evt.id} className="flex gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                    <img src={evt.image} alt={evt.title} className="w-20 h-20 rounded-lg object-cover bg-slate-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        {evt.category}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-1.5 text-sm truncate">{evt.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{evt.date} · {evt.venue}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleEditEvent(evt)}
                        className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-900 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveEvent} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    {isNewEvent ? "Configure New Event" : `Edit Event: ${editingEvent.title}`}
                  </h3>
                  <p className="text-xs text-slate-400">Modify schedules, registration counters, and descriptions.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 rounded-xl"
                  >
                    Save Event
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white focus:border-amber-400"
                  >
                    <option>Seminars</option>
                    <option>Hackathons</option>
                    <option>Workshops</option>
                    <option>Guest Lectures</option>
                    <option>Cultural</option>
                    <option>Sports</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.venue}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Date description</label>
                  <input
                    type="text"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    placeholder="e.g. Feb 21-23, 2026"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">ISO Date (for sorting)</label>
                  <input
                    type="date"
                    value={editingEvent.dateISO}
                    onChange={(e) => setEditingEvent({ ...editingEvent, dateISO: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Target Prize Pool</label>
                  <input
                    type="text"
                    value={editingEvent.prizePool}
                    onChange={(e) => setEditingEvent({ ...editingEvent, prizePool: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Banner Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingEvent.image}
                      onChange={(e) => setEditingEvent({ ...editingEvent, image: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                    />
                    <label className="px-3 py-2 bg-slate-905 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-800 flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "event")}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Expected Participants</label>
                  <input
                    type="number"
                    value={editingEvent.participants}
                    onChange={(e) => setEditingEvent({ ...editingEvent, participants: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Event Description</label>
                  <textarea
                    rows={4}
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* 2. SPEAKERS SECTION */}
      {activeSection === "speakers" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
            Guest Lecturers & Speakers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-150 items-end">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Speaker Name</label>
              <input
                type="text"
                value={newSpeaker.name}
                onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
                placeholder="e.g. Satya Nadella"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Organization / Title</label>
              <input
                type="text"
                value={newSpeaker.company}
                onChange={(e) => setNewSpeaker({ ...newSpeaker, company: e.target.value })}
                placeholder="e.g. CEO, Microsoft"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Keynote Topic</label>
              <input
                type="text"
                value={newSpeaker.topic}
                onChange={(e) => setNewSpeaker({ ...newSpeaker, topic: e.target.value })}
                placeholder="e.g. The AI Platform Shift"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 font-serif">Avatar Image Path/Upload</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpeaker.image}
                  onChange={(e) => setNewSpeaker({ ...newSpeaker, image: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                />
                <label className="px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "speaker")} />
                </label>
              </div>
            </div>

            <button
              onClick={handleAddSpeaker}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
            >
              <PlusCircle className="w-4 h-4" /> Add Speaker
            </button>
          </div>

          {/* Speakers catalog */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {data?.guestSpeakers?.map((sp: any) => (
              <div key={sp.name} className="flex gap-3 items-center p-3 border border-slate-150 rounded-xl bg-slate-50/50">
                <img src={sp.image} alt={sp.name} className="w-12 h-12 rounded-full object-cover border shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{sp.name}</h4>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">{sp.company}</div>
                  <div className="text-[10px] text-slate-600 truncate mt-0.5">Topic: {sp.topic}</div>
                </div>
                <button
                  onClick={() => handleDeleteSpeaker(sp.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GALLERY SECTION */}
      {activeSection === "gallery" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
            Campus Gallery Photos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-150 items-end">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Image Caption</label>
              <input
                type="text"
                value={newGallery.title}
                onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                placeholder="e.g. Convocation 2025"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category tag</label>
              <select
                value={newGallery.category}
                onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
              >
                <option>Cultural</option>
                <option>Hackathons</option>
                <option>Sports</option>
                <option>Labs</option>
                <option>Graduation</option>
                <option>Placement</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Image Upload / Path</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGallery.url}
                  onChange={(e) => setNewGallery({ ...newGallery, url: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none bg-white"
                />
                <label className="px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Upload File
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "gallery")} />
                </label>
              </div>
            </div>

            <button
              onClick={handleAddGallery}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg w-full"
            >
              <PlusCircle className="w-4 h-4" /> Add Photo
            </button>
          </div>

          {/* Gallery grid view */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {data?.eventGallery?.map((gal: any, index: number) => (
              <div key={index} className="relative group rounded-xl overflow-hidden border bg-slate-100 aspect-square shadow-sm">
                <img src={gal.url} alt={gal.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                  <span className="text-[9px] uppercase font-bold text-amber-300 self-start">{gal.category}</span>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold line-clamp-2">{gal.title}</p>
                    <button
                      onClick={() => handleDeleteGallery(gal.title)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 mt-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
