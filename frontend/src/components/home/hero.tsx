"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useSiteData } from "@/lib/site-context";
import { cn } from "@/lib/utils";

// ── Curated High-Resolution Campus & Graduation Photography ──────────────────
const HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2400&q=85",
    alt: "Bishop Ambrose College Graduation Ceremony & Convocation",
    objectPosition: "object-[82%_35%]",
  },
  {
    src: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2400&q=85",
    alt: "Bishop Ambrose College Main Academic Quadrangle",
    objectPosition: "object-center",
  },
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2400&q=85",
    alt: "Bishop Ambrose College Central Library & Learning Commons",
    objectPosition: "object-center",
  },
  {
    src: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=2400&q=85",
    alt: "Modern Campus Facilities & State-of-the-Art Architecture",
    objectPosition: "object-center",
  },
];

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { data } = useSiteData();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Allow CMS custom fallback image if specified, keeping the curated slides as primary
  const slides = data?.heroSection?.fallbackImage
    ? [
        {
          src: data.heroSection.fallbackImage,
          alt: "Bishop Ambrose College Campus",
          objectPosition: "object-center",
        },
        ...HERO_SLIDES.filter((s) => s.src !== data?.heroSection?.fallbackImage),
      ]
    : HERO_SLIDES;

  // ── Auto-advance carousel with smooth 6.5s interval ─────────────────────────
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
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
    const nextElem =
      document.getElementById("why-choose-us") ||
      document.getElementById("departments");
    if (nextElem) {
      nextElem.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  };

  return (
    <section
      aria-label="Bishop Ambrose College Hero"
      className="relative w-full h-[88vh] min-h-[620px] max-h-[920px] overflow-hidden bg-[#002F20] select-none group"
    >
      {/* ── 1. Full-Width Background Photography with Slow Ken Burns Zoom ──── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: {
                duration: shouldReduceMotion ? 0.3 : 1.2,
                ease: "easeInOut",
              },
            }}
            className="absolute inset-0 w-full h-full overflow-hidden"
          >
            <motion.img
              src={slides[currentSlide].src}
              alt={slides[currentSlide].alt}
              initial={{ scale: shouldReduceMotion ? 1 : 1.0 }}
              animate={{ scale: shouldReduceMotion ? 1 : 1.06 }}
              transition={{
                duration: 7,
                ease: "easeOut",
              }}
              className={cn(
                "w-full h-full object-cover pointer-events-none",
                slides[currentSlide].objectPosition
              )}
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── 2. Cinematic Gradient Overlays (Refined & 35% Softer) ──────────── */}
      {/* Desktop Left-to-Right Softer Forest-Green Gradient */}
      <div
        className="hidden sm:block absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            "linear-gradient(90deg, rgba(0, 47, 32, 0.88) 0%, rgba(0, 47, 32, 0.65) 32%, rgba(0, 47, 32, 0.25) 58%, rgba(0, 47, 32, 0.05) 100%)",
        }}
      />

      {/* Mobile Top-to-Bottom Refined Gradient */}
      <div
        className="sm:hidden absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0, 47, 32, 0.86) 0%, rgba(0, 47, 32, 0.62) 48%, rgba(0, 47, 32, 0.18) 85%, transparent 100%)",
        }}
      />

      {/* Subtle Depth Vignette (Soft & Natural) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15 pointer-events-none z-[2]" />

      {/* ── 3. Top-Right Decorative Dotted Pattern (Corner Motif) ─────────── */}
      <div className="absolute top-6 right-6 sm:top-10 sm:right-12 lg:top-12 lg:right-16 z-10 pointer-events-none select-none opacity-40">
        <svg
          width="112"
          height="112"
          viewBox="0 0 112 112"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <pattern
            id="hero-dot-grid"
            x="0"
            y="0"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2.5" cy="2.5" r="1.5" fill="#8BD66A" />
          </pattern>
          <rect width="112" height="112" fill="url(#hero-dot-grid)" />
        </svg>
      </div>

      {/* ── 4. Main Content (Editorial Left Text Block) ────────────────────── */}
      <div className="relative z-10 w-full h-full max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center">
        <div className="max-w-[580px] w-full text-left pt-6 pb-20 sm:pb-16">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="mb-5 sm:mb-6"
          >
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#8BD66A]/12 border border-[#8BD66A]/30 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#8BD66A] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#8BD66A] uppercase">
                Bishop Ambrose College
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: "easeOut" }}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold text-white tracking-tight leading-[1.06] drop-shadow-[0_2px_14px_rgba(0,30,18,0.45)]"
          >
            <span className="block">Learn. Discover.</span>
            <span className="relative inline-block italic font-normal text-[#8BD66A] mt-1 sm:mt-2">
              Become.
              {/* Subtle Hand-Crafted Curved Decorative Underline */}
              <svg
                className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-[#8BD66A] overflow-visible pointer-events-none"
                viewBox="0 0 160 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 9.5C48 2.5 118 2 158 9.5"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
            className="text-white/90 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-md mt-6 sm:mt-7 font-sans drop-shadow-[0_1px_8px_rgba(0,30,18,0.35)]"
          >
            Empowering generations through knowledge, character and service.
          </motion.p>
        </div>
      </div>

      {/* ── 5. Circular Previous/Next Carousel Navigation Controls ───────── */}
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

      {/* ── 6. Minimalist Slide Indicators ───────────────────────────────── */}
      <div className="absolute bottom-16 sm:bottom-20 left-6 sm:left-10 lg:left-16 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500 cursor-pointer",
              idx === currentSlide
                ? "w-8 bg-[#8BD66A] shadow-md"
                : "w-2.5 bg-white/35 hover:bg-white/60"
            )}
          />
        ))}
      </div>

      {/* ── 7. Elegant Bottom-Centre Scroll Indicator ─────────────────────── */}
      <button
        onClick={scrollToNextSection}
        aria-label="Scroll to explore"
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white/80 hover:text-white transition-colors cursor-pointer group/scroll"
      >
        <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/80 group-hover/scroll:text-white transition-colors">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center bg-black/15 backdrop-blur-sm group-hover/scroll:border-white/70"
        >
          <ChevronDown className="w-4 h-4 stroke-[2]" />
        </motion.div>
      </button>

      {/* ── 8. Layered Curved Green Shapes (Bottom Boundary Wave) ─────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 lg:h-24 preserve-3d"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Deep Forest-Green Ambient Wave */}
          <path
            d="M0,45 C320,115 520,15 760,55 C1000,95 1180,25 1440,65 L1440,120 L0,120 Z"
            fill="#063B27"
            fillOpacity="0.25"
          />
          {/* Primary Green Mid-Wave */}
          <path
            d="M0,65 C260,15 540,100 840,48 C1120,-2 1280,75 1440,55 L1440,120 L0,120 Z"
            fill="#087A45"
            fillOpacity="0.18"
          />
          {/* Seamless Soft Transition into the next section background (#F5FBF6) */}
          <path
            d="M0,85 C380,25 760,115 1120,55 C1280,28 1380,68 1440,78 L1440,120 L0,120 Z"
            fill="#F5FBF6"
          />
        </svg>
      </div>
    </section>
  );
}
