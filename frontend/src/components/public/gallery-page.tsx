"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  Maximize2,
  Sparkles,
  Trophy,
  Users,
  X,
  Calendar,
} from "lucide-react";
import { Reveal, Badge } from "@/components/site/primitives";

type GalleryItem = {
  id: string;
  title: string;
  category: "Campus" | "Academic" | "Cultural" | "Sports" | "Convocation";
  date: string;
  desc: string;
  aspect: "landscape" | "portrait" | "square";
  colorGradient: string;
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g-1",
    title: "Annual Convocation & Degree Conferment Ceremony",
    category: "Convocation",
    date: "March 2026",
    desc: "Graduands receiving their degree citations from the Chief Guest and College Secretary at Bishop Ambrose Main Auditorium.",
    aspect: "landscape",
    colorGradient: "from-blue-900 via-indigo-900 to-slate-900",
  },
  {
    id: "g-2",
    title: "Ambrose Fiesta — Grand Inter-Collegiate Cultural Fest",
    category: "Cultural",
    date: "February 2026",
    desc: "Over 40 colleges across South India competing in group choreography, western music, and theatrical drama.",
    aspect: "landscape",
    colorGradient: "from-purple-900 via-pink-900 to-slate-900",
  },
  {
    id: "g-3",
    title: "High-Tech AI & Data Science Workstation Lab",
    category: "Campus",
    date: "January 2026",
    desc: "Students collaborating on machine learning and web application development inside the newly inaugurated computing center.",
    aspect: "landscape",
    colorGradient: "from-teal-900 via-cyan-900 to-slate-900",
  },
  {
    id: "g-4",
    title: "Bharathiar University Inter-Collegiate Football Championship",
    category: "Sports",
    date: "December 2025",
    desc: "BAC Men's Football team securing the Winners Trophy in the fiercely contested regional championship.",
    aspect: "landscape",
    colorGradient: "from-emerald-900 via-green-900 to-slate-900",
  },
  {
    id: "g-5",
    title: "National Conference on Autonomous Higher Education",
    category: "Academic",
    date: "November 2025",
    desc: "Eminent academicians, vice chancellors, and UGC committee members presenting research papers on NEP & OBE.",
    aspect: "landscape",
    colorGradient: "from-amber-900 via-yellow-950 to-slate-900",
  },
  {
    id: "g-6",
    title: "Traditional Pongal & Samathuva Festival Celebrations",
    category: "Cultural",
    date: "January 2026",
    desc: "Faculty and students in traditional attire cooking sweet pongal pots with folk dances and Uriyadithal games.",
    aspect: "landscape",
    colorGradient: "from-orange-900 via-rose-950 to-slate-900",
  },
  {
    id: "g-7",
    title: "Central Digital Library Research & Reading Lounge",
    category: "Campus",
    date: "Ongoing",
    desc: "Peaceful ambiance for scholarly reading with automated RFID kiosks and digital e-journal terminals.",
    aspect: "landscape",
    colorGradient: "from-sky-900 via-slate-900 to-navy",
  },
  {
    id: "g-8",
    title: "Annual Sports Day March Past & Torch Lighting",
    category: "Sports",
    date: "August 2025",
    desc: "Disciplined contingent march past by house squads and lighting of the Olympic sports flame.",
    aspect: "landscape",
    colorGradient: "from-red-900 via-amber-950 to-slate-900",
  },
  {
    id: "g-9",
    title: "BAC Alumni Silver Jubilee Reunion",
    category: "Convocation",
    date: "July 2025",
    desc: "Honouring veteran faculty members and celebrating 25 glorious years of Ambrosean leadership.",
    aspect: "landscape",
    colorGradient: "from-indigo-950 via-navy to-slate-900",
  },
];

const CATEGORIES = ["All", "Campus", "Academic", "Cultural", "Sports", "Convocation"] as const;

export function GalleryPage() {
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const filtered = selectedCat === "All"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === selectedCat);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="relative bg-navy-dark text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy to-navy-dark/90 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="relative container mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gold-light">Media & Gallery</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-light text-xs font-semibold uppercase tracking-wider mb-4">
            <Camera className="w-3.5 h-3.5" /> Campus Life in Pictures
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            BAC Life & Event Gallery
          </h1>
          <p className="text-white/80 max-w-3xl text-sm sm:text-base leading-relaxed">
            Glimpses into the vibrant energy of Bishop Ambrose College — capturing student triumphs, cultural galas, convocations, academic milestones, and serene campus spaces.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl space-y-10">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-navy text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-navy hover:text-navy"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Visual Card Banner */}
                <div className={`h-48 relative bg-gradient-to-br ${item.colorGradient} p-6 flex flex-col justify-between text-white overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <Badge variant="gold">{item.category}</Badge>
                    <span className="text-[11px] text-white/80 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-gold" /> {item.date}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-2 group-hover:bg-gold group-hover:text-navy transition-colors">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-navy/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-navy font-bold text-xs shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5 text-gold-dark" /> View Details
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-sm text-navy leading-snug group-hover:text-gold-dark transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-white/20"
            >
              {/* Modal header visual */}
              <div className={`h-56 relative bg-gradient-to-br ${selectedPhoto.colorGradient} p-6 flex flex-col justify-between text-white`}>
                <div className="flex items-center justify-between">
                  <Badge variant="gold">{selectedPhoto.category}</Badge>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <span className="text-xs text-gold flex items-center gap-1 font-semibold mb-1">
                    <Calendar className="w-3.5 h-3.5" /> {selectedPhoto.date}
                  </span>
                  <h3 className="text-xl font-bold font-serif text-white">{selectedPhoto.title}</h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedPhoto.desc}
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Bishop Ambrose College Media Archives</span>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="px-4 py-2 bg-navy text-white font-semibold rounded-xl text-xs hover:bg-navy-dark transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
