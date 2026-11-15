"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  ArrowRight,
  Code,
  BarChart3,
  Dna,
  Brain,
  BookOpen,
  Users,
  Trophy,
  Lightbulb,
} from "lucide-react";
import { departments as defaultDepts, Department } from "@/lib/university-data";
import { useNav } from "@/components/site/nav-context";
import { useSiteData } from "@/lib/site-context";

// ── Department Visual Metadata (icons, images, tailored short subtitles) ────
interface DepartmentMeta {
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  tagline: string;
}

const DEPARTMENT_META: Record<string, DepartmentMeta> = {
  "computer-science": {
    icon: Code,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    tagline: "Innovative learning in cutting-edge technologies.",
  },
  "commerce-management": {
    icon: BarChart3,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    tagline: "Build expertise in business, finance and management.",
  },
  "biotechnology": {
    icon: Dna,
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80",
    tagline: "Explore the frontiers of life sciences and innovation.",
  },
  "psychology": {
    icon: Brain,
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    tagline: "Understand the mind, enrich lives.",
  },
};

// ── Faint Campus Architectural Illustration (Neoclassical College Silhouette) ──
function CampusBuildingWatermark() {
  return (
    <svg
      className="absolute -left-10 top-6 sm:top-10 w-[320px] sm:w-[420px] lg:w-[500px] h-auto opacity-[0.14] text-[#155B35] pointer-events-none select-none z-0"
      viewBox="0 0 600 450"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Central Cupola / Clock Tower */}
      <path d="M 285 30 L 300 10 L 315 30 Z" />
      <rect x="290" y="30" width="20" height="25" />
      <circle cx="300" cy="42" r="5" fill="#F4FAF4" />
      <path d="M 275 55 C 275 55, 300 48, 325 55 L 330 90 L 270 90 Z" />
      <rect x="280" y="90" width="40" height="35" />
      <circle cx="300" cy="107" r="10" fill="#F4FAF4" />
      {/* Triangular Pediment */}
      <path d="M 240 125 L 300 95 L 360 125 Z" />
      {/* Portico Columns */}
      <rect x="250" y="125" width="8" height="90" />
      <rect x="270" y="125" width="8" height="90" />
      <rect x="290" y="125" width="8" height="90" />
      <rect x="310" y="125" width="8" height="90" />
      <rect x="330" y="125" width="8" height="90" />
      <rect x="350" y="125" width="8" height="90" />
      {/* Main Building Wings */}
      <rect x="40" y="125" width="200" height="150" />
      <rect x="360" y="125" width="200" height="150" />
      {/* Roofline Cornices */}
      <rect x="30" y="120" width="540" height="8" />
      {/* Windows Left Wing */}
      <rect x="60" y="145" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="95" y="145" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="130" y="145" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="165" y="145" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="200" y="145" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="60" y="185" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="95" y="185" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="130" y="185" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="165" y="185" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="200" y="185" width="16" height="24" rx="2" fill="#F4FAF4" />
      {/* Windows Right Wing */}
      <rect x="385" y="145" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="420" y="145" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="455" y="145" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="490" y="145" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="525" y="145" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="385" y="185" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="420" y="185" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="455" y="185" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="490" y="185" width="16" height="24" rx="2" fill="#F4FAF4" />
      <rect x="525" y="185" width="16" height="24" rx="2" fill="#F4FAF4" />
      {/* Steps and Ground Line */}
      <rect x="20" y="275" width="560" height="12" />
      <rect x="0" y="287" width="600" height="6" />
    </svg>
  );
}

// ── Subtle Decorative Botanical Foliage in Corners ───────────────────────────
function LeafDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Top-Right Botanical Foliage */}
      <svg
        className="absolute -top-4 -right-4 w-48 sm:w-64 h-48 sm:h-64 opacity-50 blur-[0.5px]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M190 20 C150 45 125 90 140 140 C150 115 175 70 190 20 Z" fill="#2E7D32" fillOpacity="0.8" />
        <path d="M170 5 C130 30 110 75 125 115 C135 95 155 55 170 5 Z" fill="#155B35" fillOpacity="0.85" />
        <path d="M145 15 C115 45 105 85 118 120 C125 100 140 60 145 15 Z" fill="#4CAF50" fillOpacity="0.65" />
      </svg>

      {/* Bottom-Right Soft Leaf Cluster */}
      <svg
        className="absolute -bottom-8 -right-8 w-44 sm:w-56 h-44 sm:h-56 opacity-45 blur-[0.5px]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M180 180 C145 145 100 135 60 150 C85 130 130 135 180 180 Z" fill="#155B35" fillOpacity="0.75" />
        <path d="M165 190 C125 160 85 155 45 170 C70 155 115 155 165 190 Z" fill="#2E7D32" fillOpacity="0.8" />
      </svg>
    </div>
  );
}

export function Departments() {
  const shouldReduceMotion = useReducedMotion();
  const { goDepartment, goAcademic } = useNav();
  const { data } = useSiteData();

  const allDepts: Department[] = data?.departments && data.departments.length > 0
    ? data.departments
    : defaultDepts;

  // The 4 priority departments matching the exact visual reference
  const targetSlugs = ["computer-science", "commerce-management", "biotechnology", "psychology"];

  const featuredDepts: Department[] = targetSlugs
    .map((slug) => allDepts.find((d) => d.slug === slug))
    .filter((d): d is Department => Boolean(d));

  // If any of the target slugs are not present, fill up to 4 with other departments
  if (featuredDepts.length < 4) {
    for (const d of allDepts) {
      if (!featuredDepts.some((f) => f.slug === d.slug)) {
        featuredDepts.push(d);
        if (featuredDepts.length === 4) break;
      }
    }
  }

  return (
    <section
      id="departments"
      className="relative py-14 sm:py-20 lg:py-24 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #F4FAF4 0%, #FFFFFF 100%)",
      }}
    >
      {/* Background Campus Illustration & Foliage Accents */}
      <CampusBuildingWatermark />
      <LeafDecorations />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Header ──────────────────────────────────────────── */}
        <div className="relative mb-12 sm:mb-14">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Center Rounded Badge */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C8E6C9] shadow-xs text-xs font-bold uppercase tracking-wider text-[#155B35] mb-3.5"
            >
              <GraduationCap className="w-4 h-4 text-[#2E7D32]" />
              <span>ACADEMIC DEPARTMENTS</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : 0.1, ease: "easeOut" }}
              className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#155B35] tracking-tight leading-tight mb-3"
            >
              Our Academic Departments
            </motion.h2>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
              className="text-[#344054] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
            >
              Explore a wide range of programs across diverse disciplines, designed to shape your future.
            </motion.p>
          </div>

          {/* "View All Departments" Button on Right Side */}
          <div className="mt-5 text-center lg:mt-0 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2">
            <button
              onClick={() => goAcademic()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#155B35] text-[#155B35] text-xs sm:text-sm font-semibold hover:bg-[#155B35] hover:text-white transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group"
            >
              <span>View All Departments</span>
              <ArrowRight className="w-4 h-4 text-[#155B35] group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </button>
          </div>
        </div>

        {/* ── 4 Department Cards Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDepts.map((dept, idx) => {
            const meta = DEPARTMENT_META[dept.slug];
            const IconComponent = meta?.icon || Code;
            const cardImage = meta?.image || dept.coverImage;
            const description = meta?.tagline || dept.description;

            return (
              <motion.div
                key={dept.slug}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: shouldReduceMotion ? 0 : idx * 0.08,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: shouldReduceMotion ? 0 : -6,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                onClick={() => goDepartment(dept.slug)}
                className="group relative rounded-[20px] bg-white border border-[#E0EFE2] hover:border-[#2E7D32]/50 shadow-[0_4px_20px_rgba(21,91,53,0.06)] hover:shadow-[0_12px_32px_rgba(21,91,53,0.12)] transition-all duration-300 flex flex-col cursor-pointer overflow-hidden h-full"
              >
                {/* 16:9 Image Area */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={cardImage}
                    alt={dept.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Floating Dark-Green Rounded-Square Icon Badge */}
                  <div className="absolute -bottom-5 left-5 w-11 h-11 rounded-xl bg-[#155B35] flex items-center justify-center shadow-md z-10 group-hover:bg-[#2E7D32] transition-colors duration-300">
                    <IconComponent className="w-5 h-5 text-white stroke-[2.2]" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="pt-8 pb-5 px-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Department Name */}
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#155B35] leading-snug mb-2 group-hover:text-[#2E7D32] transition-colors">
                      {dept.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs sm:text-sm text-[#344054] leading-relaxed line-clamp-2 mb-4">
                      {description}
                    </p>
                  </div>

                  {/* Bottom Action Strip with Subtle Divider */}
                  <div className="pt-3.5 border-t border-[#EDF4EE] flex items-center justify-between mt-auto">
                    <span className="text-xs sm:text-sm font-bold text-[#155B35] group-hover:text-[#2E7D32] transition-colors">
                      Explore Department
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#155B35] text-white flex items-center justify-center shadow-xs group-hover:bg-[#2E7D32] group-hover:translate-x-1 transition-all duration-300 shrink-0">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom Feature Strip (Matching Reference Image) ────────── */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
          className="mt-10 sm:mt-12 bg-[#EAF5EC] border border-[#D5EBD8] rounded-2xl sm:rounded-3xl shadow-[0_4px_16px_rgba(21,91,53,0.04)] py-5 px-6 sm:px-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 items-center">
            {/* Feature 1: Quality Education */}
            <div className="flex items-center gap-3.5 justify-center sm:justify-start lg:justify-center px-2 sm:px-4">
              <div className="shrink-0 text-[#155B35]">
                <BookOpen className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#155B35] leading-tight">
                  Quality Education
                </h4>
                <p className="text-xs text-[#667085] mt-0.5">
                  Learn with Excellence
                </p>
              </div>
            </div>

            {/* Separator 1 */}
            <div className="hidden lg:block w-px h-10 bg-[#C5E1CA] mx-auto" />

            {/* Feature 2: Expert Faculty */}
            <div className="flex items-center gap-3.5 justify-center sm:justify-start lg:justify-center px-2 sm:px-4">
              <div className="shrink-0 text-[#155B35]">
                <Users className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#155B35] leading-tight">
                  Expert Faculty
                </h4>
                <p className="text-xs text-[#667085] mt-0.5">
                  Learn from the Best
                </p>
              </div>
            </div>

            {/* Separator 2 */}
            <div className="hidden lg:block w-px h-10 bg-[#C5E1CA] mx-auto" />

            {/* Feature 3: Holistic Development */}
            <div className="flex items-center gap-3.5 justify-center sm:justify-start lg:justify-center px-2 sm:px-4">
              <div className="shrink-0 text-[#155B35]">
                <Trophy className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#155B35] leading-tight">
                  Holistic Development
                </h4>
                <p className="text-xs text-[#667085] mt-0.5">
                  Grow Beyond Academics
                </p>
              </div>
            </div>

            {/* Separator 3 */}
            <div className="hidden lg:block w-px h-10 bg-[#C5E1CA] mx-auto" />

            {/* Feature 4: Bright Future */}
            <div className="flex items-center gap-3.5 justify-center sm:justify-start lg:justify-center px-2 sm:px-4">
              <div className="shrink-0 text-[#155B35]">
                <Lightbulb className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#155B35] leading-tight">
                  Bright Future
                </h4>
                <p className="text-xs text-[#667085] mt-0.5">
                  Achieve Your Goals
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
