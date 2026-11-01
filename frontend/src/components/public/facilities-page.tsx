"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BookOpen,
  Bus,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Cpu,
  HeartPulse,
  Leaf,
  Monitor,
  Music,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Video,
  Wifi,
} from "lucide-react";
import { Reveal, Badge, PremiumButton } from "@/components/site/primitives";

type FacilityItem = {
  id: string;
  title: string;
  category: "Academic" | "Technology" | "Sports" | "Student Life" | "Eco-Friendly";
  desc: string;
  icon: any;
  specs: string[];
  highlight: string;
};

const FACILITIES: FacilityItem[] = [
  {
    id: "smart-classrooms",
    title: "Smart ICT Classrooms",
    category: "Academic",
    desc: "Acoustically designed, spacious lecture halls equipped with high-definition interactive projectors, digital audio podiums, high-speed Wi-Fi, and hybrid lecture capture systems.",
    icon: Video,
    specs: ["45+ ICT Classrooms", "Smart Interactive Boards", "Hybrid Lecture Streaming", "Ergonomic Seating"],
    highlight: "100% Digital Enabled",
  },
  {
    id: "computer-labs",
    title: "Advanced Computing Laboratories",
    category: "Technology",
    desc: "Air-conditioned computer centers housing high-configuration workstations, dedicated gigabit servers, high-speed leased line internet, and latest software suites for AI, Cloud & Data Analytics.",
    icon: Monitor,
    specs: ["350+ Workstations", "1 Gbps Dedicated Leased Line", "Linux & Windows Dual-Boot", "Python / R / Java IDEs"],
    highlight: "Latest Intel i7 Systems",
  },
  {
    id: "central-library",
    title: "Central Digital Library",
    category: "Academic",
    desc: "A knowledge hub featuring over 25,000+ volumes, 65+ national and international journal subscriptions, DELNET & INFLIBNET N-LIST e-journal access, and quiet research cubicles.",
    icon: BookOpen,
    specs: ["25,000+ Print Volumes", "N-LIST & DELNET Consortium", "OPAC Automated Cataloging", "Digital Reading Zone"],
    highlight: "Automated RFID / Barcode",
  },
  {
    id: "sports-complex",
    title: "Sports Arena & Athletics Ground",
    category: "Sports",
    desc: "Expansive multi-sport grounds supporting cricket, football, basketball court, volleyball court, badminton arena, 200m track, and indoor fitness gymnasium.",
    icon: Trophy,
    specs: ["Standard Football & Cricket Pitch", "Floodlit Volleyball Court", "Indoor Badminton & Table Tennis", "Full-body Fitness Gym"],
    highlight: "Inter-University Tournament Venue",
  },
  {
    id: "auditorium",
    title: "Bishop Ambrose Main Auditorium",
    category: "Student Life",
    desc: "State-of-the-art air-conditioned auditorium with 1,200 seating capacity, professional JBL concert acoustic line-arrays, programmable stage lighting, and digital green rooms.",
    icon: Music,
    specs: ["1,200 Seating Capacity", "Concert Line-Array Acoustics", "Digital Stage LED Wall", "Green Rooms & VIP Lounge"],
    highlight: "College Convocation Venue",
  },
  {
    id: "cafeteria",
    title: "Hygienic Campus Cafeteria",
    category: "Student Life",
    desc: "Clean, spacious cafeteria serving nutritious South & North Indian meals, snacks, fresh fruit juices, and bakery items prepared under strict FSSAI hygiene standards.",
    icon: Coffee,
    specs: ["300+ Dining Capacity", "FSSAI Certified Kitchen", "Subsidized Student Meals", "Purified RO Drinking Water"],
    highlight: "Healthy & Pocket-Friendly",
  },
  {
    id: "transport",
    title: "College Bus Fleet",
    category: "Student Life",
    desc: "Dedicated fleet of college buses connecting all major arterial hubs across Coimbatore city, Tirupur, Pollachi, and Palakkad border routes for safe commuting.",
    icon: Bus,
    specs: ["15+ Bus Routes", "GPS Tracking Enabled", "Experienced Drivers & Attendants", "Emergency First Aid Onboard"],
    highlight: "Covers All Coimbatore Hubs",
  },
  {
    id: "health-center",
    title: "Health & First Aid Center",
    category: "Student Life",
    desc: "On-campus dispensary with a registered nursing practitioner, basic emergency medicines, oxygen support, and immediate tie-ups with nearby tertiary multi-specialty hospitals.",
    icon: HeartPulse,
    specs: ["Resident Nurse On-Duty", "First Aid & Recovery Beds", "Periodic Free Medical Camps", "Emergency Hospital Tie-ups"],
    highlight: "Immediate Emergency Care",
  },
  {
    id: "green-campus",
    title: "Solar & Green Eco Initiatives",
    category: "Eco-Friendly",
    desc: "Bishop Ambrose College is committed to carbon-neutral sustainable operations with rooftop solar energy installations, rainwater harvesting reservoirs, and landscaped herbal gardens.",
    icon: Leaf,
    specs: ["50 kW Rooftop Solar Grid", "100% Rainwater Harvesting", "Solid Waste Composting", "Plastic-Free Green Campus"],
    highlight: "50 kW Green Power",
  },
];

const CATEGORIES = ["All", "Academic", "Technology", "Sports", "Student Life", "Eco-Friendly"] as const;

export function FacilitiesPage() {
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const filtered = selectedCat === "All"
    ? FACILITIES
    : FACILITIES.filter((f) => f.category === selectedCat);

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
            <span className="text-gold-light">Campus Facilities</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-light text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> World-Class Infrastructure
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
            Campus Infrastructure & Facilities
          </h1>
          <p className="text-white/80 max-w-3xl text-sm sm:text-base leading-relaxed">
            Bishop Ambrose College provides contemporary amenities, cutting-edge technology labs, rich athletic grounds, and student welfare services designed to elevate holistic learning.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl space-y-10">
        {/* Category Filters */}
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

        {/* Facilities Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-gold/40 transition-all flex flex-col justify-between h-full space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy">
                        <Icon className="w-6 h-6 text-gold-dark" />
                      </div>
                      <Badge variant="gold">{item.highlight}</Badge>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                        {item.category}
                      </span>
                      <h3 className="text-lg font-bold text-navy mt-0.5">{item.title}</h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Key Highlights:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {item.specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-gold-dark shrink-0" />
                          <span className="truncate">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Campus Tour CTA */}
        <div className="bg-gradient-to-r from-navy via-navy to-navy-dark text-white rounded-3xl p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-gold">Schedule a Campus Visit</h3>
            <p className="text-xs text-white/80 max-w-xl leading-relaxed">
              Experience the vibrant environment, meet our faculty deans, and tour our state-of-the-art computer labs and library in person.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:04222316731"
              className="px-6 py-3 bg-gold text-navy font-bold rounded-xl text-xs hover:bg-gold-light transition-colors shadow-md"
            >
              Call 0422-2316731
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
