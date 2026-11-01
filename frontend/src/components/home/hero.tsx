"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Play, ChevronDown } from "lucide-react";
import { heroStats } from "@/lib/university-data";
import { useNav } from "@/components/site/nav-context";
import { AnimatedCounter, PremiumButton } from "@/components/site/primitives";
import { useSiteData, defaultHeroSectionConfig } from "@/lib/site-context";
import { cn } from "@/lib/utils";
import { VirtualTourModal } from "@/components/home/virtual-tour-modal";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { navigate } = useNav();
  const { data } = useSiteData();
  const [tourOpen, setTourOpen] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hero = data?.hero || {
    badge: "Admissions Open 2026",
    title: "Empowering Students for a Better Future Through Quality Education",
    subtitle: "Educating leaders, advancing research, and building a better future through world-class academic excellence.",
    ctaText: "Apply Now",
    ctaLink: "admissions",
    secondaryCtaText: "Explore Courses",
    secondaryCtaLink: "departments",
    virtualTourUrl: "https://www.youtube.com/embed/91tSZsX0Bjg"
  };

  const heroSection = data?.heroSection || defaultHeroSectionConfig;

  // Auto-play safety check on mount
  useEffect(() => {
    if (videoRef.current && heroSection.enabled && heroSection.backgroundVideo) {
      videoRef.current.play().catch((err) => {
        console.warn("Video auto-play suppressed by browser policy:", err);
      });
    }
  }, [heroSection.backgroundVideo, heroSection.enabled]);

  const handleCta = (link: string) => {
    if (link === "admissions") {
      navigate({ type: "admissions" });
    } else if (link === "departments") {
      document.getElementById("departments")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate({ type: "home" });
    }
  };

  // Compute Blur: 80% intensity -> ~20px smooth blur
  const blurIntensity = typeof heroSection.blurIntensity === "number" ? heroSection.blurIntensity : 80;
  const blurPx = Math.round((blurIntensity / 100) * 24);

  // Compute Overlay Opacity: 75% -> 0.75 alpha
  const overlayOpacity = typeof heroSection.overlayOpacity === "number" ? heroSection.overlayOpacity : 75;
  const overlayAlpha = (overlayOpacity / 100);

  return (
    <section className="relative min-h-[80vh] sm:min-h-[88vh] lg:min-h-[92vh] flex items-center overflow-hidden bg-background pt-6 pb-12 sm:pt-10 sm:pb-20 lg:py-24">
      {/* 
        ========================================================================
        BACKGROUND VIDEO LAYER (Full-Section Autoplaying Blurred Background)
        ========================================================================
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Fallback Image: Displayed while video is buffering or if video is disabled/fails */}
        {heroSection.fallbackImage && (
          <img
            src={heroSection.fallbackImage}
            alt="Campus Architecture Fallback"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{
              filter: `blur(${blurPx}px)`,
              transform: "scale(1.08)"
            }}
          />
        )}

        {/* Full-Screen Autoplaying Campus Background Video */}
        {heroSection.enabled && heroSection.backgroundVideo && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setIsVideoLoaded(true)}
            onLoadedData={() => setIsVideoLoaded(true)}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
              isVideoLoaded ? "opacity-100" : "opacity-0"
            )}
            style={{
              filter: `blur(${blurPx}px)`,
              transform: "scale(1.08)"
            }}
          >
            <source src={heroSection.backgroundVideo} type="video/mp4" />
            <source src={heroSection.backgroundVideo} type="video/webm" />
          </video>
        )}

        {/* Soft Light-Green Brand Overlay Matching BAC Global University Theme */}
        <div
          className="absolute inset-0 transition-all duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(245, 251, 246, ${Math.min(0.96, overlayAlpha * 0.95)}) 0%, rgba(232, 245, 233, ${Math.min(0.92, overlayAlpha * 0.88)}) 50%, rgba(200, 230, 201, ${Math.min(0.85, overlayAlpha * 0.72)}) 100%)`
          }}
        />

        {/* Elegant Subtle Pattern & Radial Ambient University Glows */}
        <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none" />
        <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-gold/30 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-navy-light/10 blur-[90px] pointer-events-none" />
      </div>

      {/* 
        ========================================================================
        CONTENT LAYER (Foreground: 100% Crisp, Sharp, Unblurred Glassmorphism)
        ========================================================================
      */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Heading, Motto Badge, Description, CTAs, Statistics */}
          <div className="lg:col-span-7">
            {/* College Motto Badge */}
            {/* College Motto Badge */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full backdrop-blur-md bg-white/95 border border-[#14532D]/20 text-[#1F2937] text-[11px] xs:text-xs sm:text-sm font-semibold mb-4 sm:mb-6 shadow-sm max-w-full"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#166534] shrink-0" />
              <span className="text-[#1F2937] font-semibold">College Motto:</span>
              <span className="text-[#166534] font-bold tracking-wide break-words">Trust • Growth • Knowledge • Excellence</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: shouldReduceMotion ? 0 : 0.15, ease: "easeOut" }}
              className="font-serif font-bold text-[#14532D] text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.12] sm:leading-[1.1] tracking-tight mb-4 sm:mb-6 text-shadow-subtle break-words"
            >
              {hero.title || "BISHOP AMBROSE COLLEGE"}
            </motion.h1>

            {/* Description Text */}
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" }}
              className="text-[#374151] text-base sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 max-w-2xl font-normal"
            >
              {hero.subtitle || "Educating leaders, advancing research, and building a better future through world-class academic excellence."}
            </motion.p>

            {/* Admission CTA Buttons (Scale + Fade entrance) */}
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
              className="flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-3 sm:gap-4 mb-8 sm:mb-12"
            >
              <PremiumButton
                variant="primary"
                size="lg"
                onClick={() => handleCta(hero.ctaLink)}
                icon={<ArrowRight className="w-4.5 h-4.5" />}
                className="shadow-lg shadow-[#14532D]/25 hover:shadow-xl hover:shadow-[#14532D]/35 transition-all cursor-pointer w-full xs:w-auto hover:-translate-y-0.5 bg-[#14532D] text-white font-bold"
              >
                Apply Now
              </PremiumButton>

              <PremiumButton
                variant="outline"
                size="lg"
                onClick={() => handleCta(hero.secondaryCtaLink)}
                icon={<Compass className="w-4.5 h-4.5" />}
                className="backdrop-blur-md bg-white/95 border-2 border-[#14532D]/30 text-[#14532D] hover:bg-white hover:border-[#14532D] shadow-sm cursor-pointer w-full xs:w-auto hover:-translate-y-0.5 font-bold"
              >
                Explore Courses
              </PremiumButton>

              <button
                onClick={() => setTourOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full backdrop-blur-md bg-white/95 border border-[#14532D]/30 text-[#14532D] font-bold text-sm hover:bg-white hover:border-[#14532D] shadow-sm hover:shadow-md transition-all cursor-pointer group min-h-[44px] w-full xs:w-auto hover:-translate-y-0.5"
              >
                <div className="w-6 h-6 rounded-full bg-[#14532D]/10 flex items-center justify-center group-hover:bg-[#14532D] group-hover:text-white transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                Virtual Tour
              </button>
            </motion.div>

            {/* Statistics Strip Cards (Semi-Transparent High-Contrast Accessible Cards) */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.55, ease: "easeOut" }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-[#14532D]/15"
            >
              {heroStats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.6 + idx * 0.08, ease: "easeOut" }}
                  whileHover={{ y: shouldReduceMotion ? 0 : -3, transition: { duration: 0.2 } }}
                  className="card-image-overlay rounded-2xl p-3.5 sm:p-4 text-center transition-all duration-300 hover:border-[#166534]/50 hover:shadow-md group cursor-default"
                >
                  <div className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#166534] tracking-tight mb-1 text-shadow-accessible">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs sm:text-sm text-[#1F2937] font-bold tracking-wide">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Campus Showcase Card with Crisp Live Preview & Badges */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white/95 backdrop-blur-md group"
            >
              {/* Campus Video / Image Visual */}
              <div className="relative h-[260px] xs:h-[320px] sm:h-[380px] lg:h-[460px] w-full overflow-hidden bg-slate-900">
                <img
                  src={heroSection.fallbackImage || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"}
                  alt="College Campus Architecture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Subtle dark gradient for badge readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Student Success Visual Card (High Contrast 95% Opacity White Card) */}
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.55, ease: "easeOut" }}
                className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 backdrop-blur-md bg-white/95 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/90 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#166534] flex items-center justify-center text-white font-bold text-base sm:text-lg shrink-0 shadow-md">
                    98%
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-[#14532D] text-sm sm:text-base truncate sm:whitespace-normal">Graduate Placement Success</h4>
                    <p className="text-xs sm:text-sm text-[#374151] font-medium line-clamp-1 sm:line-clamp-2">Top-ranked placement across core sectors & global companies.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Accreditation Badge: NAAC A++ (High Contrast 95% Opacity White Card) */}
            <motion.div
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
              className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-emerald-200/80 hidden md:flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#166534] font-bold shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#14532D]">NAAC A++ Accredited</div>
                <div className="text-[11px] sm:text-xs text-[#374151] font-medium">Highest Institutional Distinction</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>


      {/* Virtual Tour Modal */}
      <VirtualTourModal open={tourOpen} onClose={() => setTourOpen(false)} />

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#14532D] z-10"
      >
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#14532D]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[#14532D]" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade into page content */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent z-1 pointer-events-none" />
    </section>
  );
}
