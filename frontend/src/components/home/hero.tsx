"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Curated High-Resolution Campus & Graduation Photography ──────────────────
// The primary slide is the authentic graduation ceremony photograph.
const HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=85",
    alt: "Bishop Ambrose College Graduation Ceremony & Convocation",
    objectPosition: "object-[80%_35%]",
  },
  {
    src: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85",
    alt: "Bishop Ambrose College Main Academic Quadrangle",
    objectPosition: "object-center",
  },
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=85",
    alt: "Bishop Ambrose College Central Library & Learning Commons",
    objectPosition: "object-center",
  },
  {
    src: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=2000&q=85",
    alt: "Modern Campus Facilities & State-of-the-Art Architecture",
    objectPosition: "object-center",
  },
];

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preload all slides on initial mount for instant, flicker-free crossfades
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });
  }, []);

  // ── Auto-advance carousel with smooth 6.5s interval ─────────────────────────
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

  return (
    <section
      aria-label="Bishop Ambrose College Hero"
      className="hero-section relative w-full overflow-hidden bg-slate-950 select-none group flex flex-col justify-center"
      style={{
        height: "calc(100svh - var(--header-height, 104px))",
        minHeight: "clamp(520px, calc(100svh - var(--header-height, 104px)), 760px)",
        maxHeight: "760px",
      }}
    >
      {/* ── 1. Full-Width Background Photography with Seamless Crossfade ──── */}
      {/* All slides are rendered simultaneously so outgoing & incoming images blend without solid color flashes */}
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

      {/* ── 2. Refined Cinematic Gradient Overlay ───────────────────────────── */}
      {/* Desktop Left-to-Right Natural Gradient */}
      <div
        className="hidden sm:block absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            "linear-gradient(90deg, rgba(0, 47, 32, 0.70) 0%, rgba(0, 47, 32, 0.38) 35%, rgba(0, 47, 32, 0.10) 65%, rgba(0, 47, 32, 0.01) 100%)",
        }}
      />

      {/* Mobile Top-to-Bottom Natural Gradient */}
      <div
        className="sm:hidden absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 47, 32, 0.72) 0%, rgba(0, 47, 32, 0.40) 45%, rgba(0, 47, 32, 0.10) 80%, rgba(0, 47, 32, 0.01) 100%)",
        }}
      />

      {/* Light Depth Vignette for Edge Definition */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 pointer-events-none z-[2]" />

      {/* ── 3. Top-Right Decorative Dotted Pattern (Corner Motif) ─────────── */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-10 lg:top-10 lg:right-14 z-10 pointer-events-none select-none opacity-35">
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
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center">
        <div className="max-w-[580px] w-full text-left py-6 sm:py-8 lg:py-10">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="mb-3.5 sm:mb-4 lg:mb-5"
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
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: "easeOut" }}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[68px] 2xl:text-[72px] font-bold text-white tracking-tight leading-[1.08] sm:leading-[1.05] drop-shadow-[0_2px_14px_rgba(0,30,18,0.5)]"
          >
            <span className="block">Learn. Discover.</span>
            <span className="relative inline-block italic font-normal text-[#8BD66A] mt-1 sm:mt-1.5">
              Become.
              {/* Subtle Hand-Crafted Curved Decorative Underline */}
              <svg
                className="absolute -bottom-1.5 sm:-bottom-2.5 left-0 w-full h-2.5 sm:h-3.5 text-[#8BD66A] overflow-visible pointer-events-none"
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
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
            className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed max-w-md mt-4 sm:mt-5 font-sans drop-shadow-[0_1px_8px_rgba(0,30,18,0.4)]"
          >
            Empowering generations through knowledge, character and service.
          </motion.p>
        </div>
      </div>

      {/* ── 5. Circular Previous/Next Carousel Navigation Controls ───────── */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/25 hover:bg-black/55 text-white/85 hover:text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/25 hover:bg-black/55 text-white/85 hover:text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

      {/* ── 6. Minimalist Slide Indicators ───────────────────────────────── */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-7 left-6 sm:left-10 lg:left-16 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, idx) => (
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

      {/* ── 7. Layered Curved Shapes (Bottom Boundary Wave) ───────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-10 sm:h-12 lg:h-14 preserve-3d"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Deep Forest-Green Ambient Wave */}
          <path
            d="M0,45 C320,115 520,15 760,55 C1000,95 1180,25 1440,65 L1440,120 L0,120 Z"
            fill="#063B27"
            fillOpacity="0.22"
          />
          {/* Primary Green Mid-Wave */}
          <path
            d="M0,65 C260,15 540,100 840,48 C1120,-2 1280,75 1440,55 L1440,120 L0,120 Z"
            fill="#087A45"
            fillOpacity="0.15"
          />
          {/* Seamless Soft Transition into the next section background (#F5F7F1) */}
          <path
            d="M0,85 C380,25 760,115 1120,55 C1280,28 1380,68 1440,78 L1440,120 L0,120 Z"
            fill="#F5F7F1"
          />
        </svg>
      </div>
    </section>
  );
}
