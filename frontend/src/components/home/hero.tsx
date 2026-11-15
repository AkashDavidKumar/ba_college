"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useSiteData } from "@/lib/site-context";
import { cn } from "@/lib/utils";

// ── Curated Full-View High-Resolution Campus Photography ────────────────────
const DEFAULT_CAMPUS_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2400&q=85",
    alt: "Bishop Ambrose College Main Academic Building & Central Quadrangle",
  },
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2400&q=85",
    alt: "College Central Library & Digital Learning Commons",
  },
  {
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=2400&q=85",
    alt: "Lush Green Campus Landscapes & Historic Walkways",
  },
  {
    src: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=2400&q=85",
    alt: "Modern Campus Infrastructure & Academic Facilities",
  },
  {
    src: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&w=2400&q=85",
    alt: "Vibrant Campus Life & Open Courtyards",
  },
];

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { data } = useSiteData();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use CMS fallback image if provided, combined with authentic campus slides
  const slides = (data?.heroSection?.fallbackImage
    ? [
        { src: data.heroSection.fallbackImage, alt: "Bishop Ambrose College Campus" },
        ...DEFAULT_CAMPUS_SLIDES.filter((s) => s.src !== data?.heroSection?.fallbackImage),
      ]
    : DEFAULT_CAMPUS_SLIDES);

  // ── Auto-advance slideshow with smooth cinematic timing (6s) ───────────────
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
  }, [slides.length]);

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
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    startTimer();
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    startTimer();
  };

  const scrollToNextSection = () => {
    const nextElem = document.getElementById("why-choose-us") || document.getElementById("departments");
    if (nextElem) {
      nextElem.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  };

  return (
    <section
      aria-label="Campus Experience"
      className="relative w-full h-[calc(100vh-5.5rem)] min-h-[580px] lg:h-[calc(100vh-6.25rem)] overflow-hidden bg-slate-950 select-none group"
    >
      {/* ── Full-Screen Cinematic Slideshow ─────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: shouldReduceMotion ? 0.3 : 1.2, ease: "easeInOut" },
            }}
            className="absolute inset-0 w-full h-full overflow-hidden"
          >
            {/* Cinematic Pan & Slow Zoom (Ken Burns Effect) */}
            <motion.img
              src={slides[currentSlide].src}
              alt={slides[currentSlide].alt}
              initial={{ scale: shouldReduceMotion ? 1 : 1.0 }}
              animate={{ scale: shouldReduceMotion ? 1 : 1.07 }}
              transition={{
                duration: 6.5,
                ease: "easeOut",
              }}
              className="w-full h-full object-cover object-center pointer-events-none"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Subtle Cinematic Depth Vignette (Dark edge framing for premium feel) ─ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

      {/* ── Discreet Navigation Arrows (Fade in on hover) ───────────────── */}
      <button
        onClick={prevSlide}
        aria-label="Previous campus photo"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/25 hover:bg-black/55 text-white/80 hover:text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next campus photo"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/25 hover:bg-black/55 text-white/80 hover:text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <ChevronRight className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* ── Minimalist Bottom Dot Indicators ────────────────────────────── */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            aria-label={`View campus slide ${idx + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500 cursor-pointer",
              idx === currentSlide
                ? "w-8 bg-white shadow-md"
                : "w-2.5 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>

      {/* ── Subtle Down Scroll Indicator ─────────────────────────────────── */}
      <button
        onClick={scrollToNextSection}
        aria-label="Scroll to campus highlights"
        className="absolute bottom-6 sm:bottom-8 right-6 sm:right-10 z-20 hidden md:flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
      >
        <span className="text-[11px] font-semibold tracking-widest uppercase">Explore</span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </motion.div>
      </button>
    </section>
  );
}
