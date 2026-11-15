"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  GraduationCap,
  Users,
  BookOpen,
  Sprout,
} from "lucide-react";
import { useNav } from "@/components/site/nav-context";
import { cn } from "@/lib/utils";

// ── Curated High-Resolution Campus & Graduation Photography ──────────────────
const HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=85",
    alt: "Bishop Ambrose College Graduation Ceremony & Convocation",
    objectPosition: "object-[80%_35%]",
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=85",
    alt: "Bishop Ambrose College Students on Campus",
    objectPosition: "object-center",
  },
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=85",
    alt: "Bishop Ambrose College Central Library & Learning Commons",
    objectPosition: "object-center",
  },
  {
    src: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85",
    alt: "Bishop Ambrose College Main Academic Quadrangle",
    objectPosition: "object-center",
  },
];

// ── 4 Institutional Pillars (Directly beneath hero photography) ───────────────
const HERO_PILLARS = [
  {
    icon: GraduationCap,
    title: "Quality Education",
    description: "Industry-relevant programmes",
  },
  {
    icon: Users,
    title: "Experienced Faculty",
    description: "Learn from expert mentors",
  },
  {
    icon: BookOpen,
    title: "Holistic Development",
    description: "Beyond the classroom",
  },
  {
    icon: Sprout,
    title: "Values & Leadership",
    description: "Building responsible global citizens",
  },
];

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { goAdmissions, goAcademic } = useNav();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preload all slides on initial mount for instant, flicker-free crossfades
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });
  }, []);

  // Auto-advance carousel with smooth 6.5s interval
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTimer]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    startTimer();
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
    startTimer();
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    startTimer();
  };

  const scrollToDepartments = () => {
    const el = document.getElementById("departments");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      goAcademic();
    }
  };

  return (
    <div className="w-full flex flex-col bg-white">
      {/* ── Hero Image & Content Banner ───────────────────────────────────── */}
      <section
        aria-label="Bishop Ambrose College Hero"
        className="relative w-full h-[580px] sm:h-[620px] lg:h-[680px] overflow-hidden bg-slate-950 select-none group"
      >
        {/* Full-Width Background Photography with Seamless Crossfade */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.src}
                aria-hidden={!isActive}
                className={cn(
                  "absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-1000 ease-in-out pointer-events-none",
                  isActive ? "opacity-100 z-[1]" : "opacity-0 z-0"
                )}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-[7000ms] ease-out pointer-events-none",
                    slide.objectPosition,
                    isActive && !shouldReduceMotion ? "scale-105" : "scale-100"
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Cinematic Gradient Overlay (78% -> 48% -> 15% -> 2%) */}
        <div
          className="hidden sm:block absolute inset-0 pointer-events-none z-[2]"
          style={{
            background:
              "linear-gradient(90deg, rgba(0, 47, 32, 0.78) 0%, rgba(0, 47, 32, 0.48) 35%, rgba(0, 47, 32, 0.15) 65%, rgba(0, 47, 32, 0.02) 100%)",
          }}
        />

        {/* Mobile Top-to-Bottom Refined Gradient */}
        <div
          className="sm:hidden absolute inset-0 pointer-events-none z-[2]"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 47, 32, 0.82) 0%, rgba(0, 47, 32, 0.52) 45%, rgba(0, 47, 32, 0.15) 75%, rgba(0, 47, 32, 0.02) 100%)",
          }}
        />

        {/* Subtle Depth Edge Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 pointer-events-none z-[2]" />

        {/* Main Content (Editorial Left Text Block) */}
        <div className="relative z-10 w-full h-full max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center">
          <div className="max-w-[620px] w-full text-left py-12">
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-bold text-white tracking-tight leading-[1.1] mb-5 drop-shadow-[0_2px_14px_rgba(0,30,18,0.5)]"
            >
              <span className="block">Shaping Minds for a</span>
              <span className="block">
                Brighter{" "}
                <span className="text-[#4CAF50]">Tomorrow</span>
              </span>
            </motion.h1>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
              className="text-white/90 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-xl mb-8 font-sans drop-shadow-[0_1px_8px_rgba(0,30,18,0.4)]"
            >
              A premier institution committed to academic excellence, character,
              and holistic development.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={goAdmissions}
                className="bg-[#2E7D32] hover:bg-[#14532D] text-white font-semibold text-sm sm:text-base px-7 py-3 rounded-lg shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Apply Now
              </button>
              <button
                onClick={scrollToDepartments}
                className="border border-white/80 bg-black/25 hover:bg-white/15 text-white font-semibold text-sm sm:text-base px-7 py-3 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Programmes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Circular Previous/Next Carousel Navigation Controls */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/25 hover:bg-black/55 text-white/85 hover:text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/25 hover:bg-black/55 text-white/85 hover:text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Center-Bottom Slide Indicators (Pill + Dots matching design reference) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "rounded-full transition-all duration-500 cursor-pointer",
                idx === currentSlide
                  ? "w-6 h-2 bg-[#4CAF50] shadow-sm"
                  : "w-2 h-2 bg-white/60 hover:bg-white/90"
              )}
            />
          ))}
        </div>
      </section>

      {/* ── 4-Column Institutional Feature Strip ───────────────────────────── */}
      <div className="w-full bg-white border-y border-[#DCE8DE] shadow-xs">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DCE8DE]">
            {HERO_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="py-5 sm:py-6 px-4 sm:px-6 flex items-center gap-4 transition-colors hover:bg-[#F1F8F2]/60"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F1F8F2] flex items-center justify-center shrink-0 text-[#2E7D32]">
                    <Icon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[#14532D] text-base sm:text-lg leading-snug">
                      {pillar.title}
                    </h4>
                    <p className="text-[#68766C] text-xs sm:text-sm font-normal mt-0.5">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
