"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Play,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { useNav } from "@/components/site/nav-context";
import { useSiteData } from "@/lib/site-context";
import { cn } from "@/lib/utils";
import { VirtualTourModal } from "@/components/home/virtual-tour-modal";

// ── Campus images for the carousel ──────────────────────────────────────────
const campusImages = [
  {
    src: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    alt: "Bishop Ambrose College Main Academic Building",
  },
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    alt: "College Central Library and Learning Center",
  },
  {
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=1200&q=80",
    alt: "Lush Green College Campus & Quad",
  },
  {
    src: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
    alt: "Modern Science Laboratories & Facilities",
  },
  {
    src: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&w=1200&q=80",
    alt: "Vibrant Student Activities & Campus Life",
  },
];

// ── Realistic Decorative Foliage SVG Elements ───────────────────────────────
function FoliageDecoration() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Top Right Corner Foliage */}
      <svg
        className="absolute -top-6 -right-6 w-56 h-56 sm:w-80 sm:h-80 opacity-40 lg:opacity-50 blur-[0.5px]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M170 10C130 30 110 80 120 120C125 100 145 60 170 10Z"
          fill="#166534"
          fillOpacity="0.8"
        />
        <path
          d="M190 40C160 65 140 105 155 145C165 125 185 85 190 40Z"
          fill="#15803D"
          fillOpacity="0.85"
        />
        <path
          d="M140 20C110 50 100 95 115 135C125 110 140 70 140 20Z"
          fill="#22C55E"
          fillOpacity="0.65"
        />
        <path
          d="M185 80C155 105 135 140 145 175C160 155 180 120 185 80Z"
          fill="#166534"
          fillOpacity="0.75"
        />
        <path
          d="M120 60C95 90 90 130 105 160C115 135 130 100 120 60Z"
          fill="#15803D"
          fillOpacity="0.6"
        />
      </svg>

      {/* Middle Left Leaf Accent */}
      <svg
        className="absolute top-1/3 -left-8 w-44 h-44 sm:w-64 sm:h-64 opacity-30 lg:opacity-45 blur-[0.8px]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 80C50 65 95 70 130 100C105 95 65 95 10 80Z"
          fill="#166534"
          fillOpacity="0.7"
        />
        <path
          d="M15 120C55 100 100 110 140 135C110 130 70 130 15 120Z"
          fill="#15803D"
          fillOpacity="0.6"
        />
        <path
          d="M5 40C40 35 80 50 110 80C85 70 50 65 5 40Z"
          fill="#22C55E"
          fillOpacity="0.5"
        />
      </svg>

      {/* Bottom Left Corner Foliage */}
      <svg
        className="absolute -bottom-10 -left-10 w-64 h-64 sm:w-96 sm:h-96 opacity-45 lg:opacity-60 blur-[0.5px]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 180C45 140 95 125 145 135C120 120 70 125 10 180Z"
          fill="#166534"
          fillOpacity="0.8"
        />
        <path
          d="M30 195C70 155 120 145 170 160C140 145 90 145 30 195Z"
          fill="#15803D"
          fillOpacity="0.85"
        />
        <path
          d="M60 198C95 165 145 160 190 180C165 165 120 165 60 198Z"
          fill="#22C55E"
          fillOpacity="0.65"
        />
      </svg>

      {/* Bottom Right Corner Foliage */}
      <svg
        className="absolute -bottom-12 -right-12 w-64 h-64 sm:w-96 sm:h-96 opacity-45 lg:opacity-60 blur-[0.5px]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M190 180C155 140 105 125 55 135C80 120 130 125 190 180Z"
          fill="#166534"
          fillOpacity="0.8"
        />
        <path
          d="M170 195C130 155 80 145 30 160C60 145 110 145 170 195Z"
          fill="#15803D"
          fillOpacity="0.85"
        />
        <path
          d="M140 198C105 165 55 160 10 180C35 165 80 165 140 198Z"
          fill="#22C55E"
          fillOpacity="0.65"
        />
      </svg>
    </div>
  );
}

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { navigate } = useNav();
  const { data } = useSiteData();
  const [tourOpen, setTourOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hero = data?.hero || {
    badge: "Admissions Open 2026",
    title: "Bishop Ambrose College",
    subtitle:
      "Empowering students through excellence in education, character, and service since 1994.",
    ctaText: "Apply Now",
    ctaLink: "admissions",
    secondaryCtaText: "Explore Courses",
    secondaryCtaLink: "departments",
    virtualTourUrl: "https://www.youtube.com/embed/91tSZsX0Bjg",
  };

  // ── Auto-advance Carousel ─────────────────────────────────────────────────
  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % campusImages.length);
    }, 5500);
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    startAutoSlide();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? campusImages.length - 1 : prev - 1
    );
    startAutoSlide();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % campusImages.length);
    startAutoSlide();
  };

  // ── CTA Handlers ──────────────────────────────────────────────────────────
  const handleCta = (link: string) => {
    if (link === "admissions") {
      navigate({ type: "admissions" });
    } else if (link === "departments") {
      document
        .getElementById("departments")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate({ type: "home" });
    }
  };

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════
          HERO MAIN SECTION
       ════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-2 sm:pt-3 lg:pt-4 pb-6 sm:pb-8"
        style={{
          background: "linear-gradient(135deg, #EFF8F1 0%, #E2F3E6 50%, #D4EED9 100%)",
        }}
      >
        {/* Organic Corner Foliage Accents matching the reference design */}
        <FoliageDecoration />

        {/* Ambient Subtle Green Glows */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#A7F3D0]/25 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] rounded-full bg-[#86EFAC]/20 blur-[100px] pointer-events-none" />

        {/* ── Main Hero Two-Column Grid ──────────────────────────────── */}
        <div className="relative z-10 container mx-auto pl-2 sm:pl-3 lg:pl-4 pr-4 sm:pr-6 lg:pr-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* ── Left Column: Motto, Heading, Subtitle, CTAs ────────── */}
            <div className="lg:col-span-6 xl:col-span-6 lg:-ml-2">
              {/* College Motto Pill */}
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white/95 backdrop-blur-md border border-[#C8E6C9] shadow-[0_2px_10px_rgba(20,83,45,0.06)] text-xs sm:text-sm mb-4 sm:mb-5"
              >
                <Star className="w-4 h-4 text-[#166534] shrink-0 fill-none stroke-[2]" />
                <span className="text-[#374151] font-medium">
                  College Motto:
                </span>
                <span className="text-[#14532D] font-bold tracking-wide">
                  Trust • Growth • Knowledge • Excellence
                </span>
              </motion.div>

              {/* Main Heading: Bishop Ambrose College */}
              <motion.h1
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: shouldReduceMotion ? 0 : 0.15,
                  ease: "easeOut",
                }}
                className="font-serif font-bold text-[#14532D] text-4xl sm:text-5xl lg:text-[3.4rem] xl:text-[3.7rem] leading-[1.12] tracking-tight mb-3.5 sm:mb-5"
              >
                {hero.title || "Bishop Ambrose College"}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: shouldReduceMotion ? 0 : 0.3,
                  ease: "easeOut",
                }}
                className="text-[#374151] text-base sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 max-w-xl font-normal"
              >
                {hero.subtitle ||
                  "Empowering students through excellence in education, character, and service since 1994."}
              </motion.p>

              {/* CTA Action Buttons */}
              <motion.div
                initial={{
                  opacity: 0,
                  scale: shouldReduceMotion ? 1 : 0.96,
                  y: shouldReduceMotion ? 0 : 15,
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: shouldReduceMotion ? 0 : 0.45,
                  ease: "easeOut",
                }}
                className="flex flex-wrap items-center gap-3.5 sm:gap-4"
              >
                {/* Apply Now Primary Pill Button */}
                <button
                  onClick={() => handleCta(hero.ctaLink)}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#14532D] hover:bg-[#0f3e22] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#14532D]/25 hover:shadow-xl hover:shadow-[#14532D]/35 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>

                {/* Explore Courses Secondary Pill Button */}
                <button
                  onClick={() => handleCta(hero.secondaryCtaLink)}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-[#F0FDF4] border-2 border-[#14532D] text-[#14532D] font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 text-[#14532D]" />
                  <span>Explore Courses</span>
                </button>

                {/* Virtual Tour Pill Button */}
                <button
                  onClick={() => setTourOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white/70 hover:bg-white border border-[#14532D]/20 text-[#14532D] font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-[#14532D] text-[#14532D]" />
                  <span>Virtual Tour</span>
                </button>
              </motion.div>
            </div>

            {/* ── Right Column: Campus Image Carousel Card ───────────── */}
            <div className="lg:col-span-6 xl:col-span-6 relative mt-6 lg:mt-0">
              {/* Floating NAAC A++ Accredited Badge (Top-Left) */}
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: shouldReduceMotion ? 0 : 0.45,
                  ease: "easeOut",
                }}
                className="absolute -top-6 left-6 sm:left-10 bg-white/95 backdrop-blur-md px-4 sm:px-5 py-3 rounded-2xl shadow-[0_10px_25px_rgba(20,83,45,0.12)] border border-[#C8E6C9] flex items-center gap-3 z-30"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#166534] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base text-[#14532D] leading-tight">
                    NAAC A++ Accredited
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#4B5563] font-medium">
                    Highest Institutional Distinction
                  </div>
                </div>
              </motion.div>

              {/* Main Rounded Showcase Card with Thick White Border */}
              <motion.div
                initial={{
                  opacity: 0,
                  scale: shouldReduceMotion ? 1 : 0.96,
                  y: shouldReduceMotion ? 0 : 25,
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: shouldReduceMotion ? 0 : 0.25,
                  ease: "easeOut",
                }}
                className="relative rounded-[2.25rem] overflow-hidden shadow-[0_20px_50px_rgba(20,83,45,0.14)] border-[8px] border-white bg-white group"
              >
                {/* Carousel Image Area */}
                <div className="relative h-[280px] xs:h-[340px] sm:h-[400px] lg:h-[450px] w-full overflow-hidden bg-slate-900">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentSlide}
                      src={campusImages[currentSlide].src}
                      alt={campusImages[currentSlide].alt}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Gentle gradient for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

                  {/* Left Chevron Button */}
                  <button
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-[#14532D] hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                  </button>

                  {/* Right Chevron Button */}
                  <button
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-[#14532D] hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                  </button>

                  {/* Carousel Dot Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    {campusImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={cn(
                          "rounded-full transition-all duration-300 cursor-pointer",
                          idx === currentSlide
                            ? "w-6 h-2.5 bg-[#14532D] shadow-md"
                            : "w-2.5 h-2.5 bg-white/80 hover:bg-white"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating Graduate Placement Success Card (Bottom-Right) */}
                <motion.div
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: shouldReduceMotion ? 0 : 0.55,
                    ease: "easeOut",
                  }}
                  className="absolute bottom-5 right-4 sm:bottom-6 sm:right-6 backdrop-blur-md bg-white/95 px-4 py-3 sm:py-3.5 rounded-2xl border border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.12)] max-w-[310px] z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#14532D] flex items-center justify-center text-white font-bold text-base sm:text-lg shrink-0 shadow-sm">
                      98%
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-[#14532D] text-sm sm:text-base leading-snug">
                        Graduate Placement Success
                      </h4>
                      <p className="text-[11px] sm:text-xs text-[#4B5563] font-medium leading-normal mt-0.5">
                        Top-ranked placement across core sectors &amp; global
                        companies.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

      </section>

      {/* Virtual Tour Modal */}
      <VirtualTourModal open={tourOpen} onClose={() => setTourOpen(false)} />
    </>
  );
}
