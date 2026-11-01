"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  MapPin,
  Users,
  BookOpen,
  Trophy,
  ArrowRight,
  Play,
  Globe,
  ChevronRight,
} from "lucide-react";
import { useSiteData, defaultVirtualTourConfig } from "@/lib/site-context";
import { useNav } from "@/components/site/nav-context";

interface VirtualTourModalProps {
  open: boolean;
  onClose: () => void;
}

const campusQuickStats = [
  { icon: MapPin, label: "Campus Area", value: "200 Acres" },
  { icon: Users, label: "Students", value: "20,000+" },
  { icon: BookOpen, label: "Programs", value: "200+" },
  { icon: Trophy, label: "Ranked", value: "#1 South" },
];

function getYouTubeEmbedUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  try {
    const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&controls=1`;
    }
    const u = new URL(rawUrl);
    u.searchParams.set("autoplay", "1");
    u.searchParams.set("rel", "0");
    u.searchParams.set("modestbranding", "1");
    u.searchParams.set("controls", "1");
    return u.toString();
  } catch {
    return rawUrl;
  }
}

function YouTubeEmbed({ url }: { url: string; poster?: string }) {
  const embedUrl = getYouTubeEmbedUrl(url);

  return (
    <iframe
      src={embedUrl}
      title="BAC Campus Virtual Tour"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="w-full h-full border-0"
      style={{ background: "#000" }}
    />
  );
}

function Mp4Embed({ url, poster }: { url: string; poster?: string }) {
  return (
    <video
      src={url}
      controls
      autoPlay
      poster={poster}
      playsInline
      className="w-full h-full object-contain bg-black"
    />
  );
}

function IframeEmbed({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      title="BAC Campus Virtual Tour"
      allowFullScreen
      className="w-full h-full border-0"
    />
  );
}

export function VirtualTourModal({ open, onClose }: VirtualTourModalProps) {
  const { data } = useSiteData();
  const { navigate } = useNav();
  const overlayRef = useRef<HTMLDivElement>(null);

  const rawTour: any = data?.virtualTour || defaultVirtualTourConfig;
  const tour = {
    enabled: rawTour.enabled !== false,
    mediaType: rawTour.mediaType || (rawTour.url?.includes("youtu") || rawTour.mediaUrl?.includes("youtu") ? "youtube" : "mp4"),
    mediaUrl: rawTour.mediaUrl || rawTour.url || defaultVirtualTourConfig.mediaUrl,
    posterImage: rawTour.posterImage || defaultVirtualTourConfig.posterImage,
    heading: rawTour.heading || rawTour.title || defaultVirtualTourConfig.heading,
    subheading: rawTour.subheading || rawTour.subtitle || defaultVirtualTourConfig.subheading,
    campusName: rawTour.campusName || defaultVirtualTourConfig.campusName,
    campusDescription: rawTour.campusDescription || defaultVirtualTourConfig.campusDescription,
    showStats: rawTour.showStats ?? rawTour.showStatistics ?? true,
    ctaLabel: rawTour.ctaLabel || defaultVirtualTourConfig.ctaLabel,
  };

  // ESC key support
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        /* ── Backdrop ─────────────────────────────────────────── */
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,20,40,0.97) 0%, rgba(5,30,20,0.95) 100%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
          aria-modal="true"
          role="dialog"
          aria-label="Virtual Campus Tour"
        >
          {/* ── Modal Container ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-7xl mx-4 flex flex-col overflow-hidden"
            style={{
              maxHeight: "calc(100vh - 32px)",
              borderRadius: "24px",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow:
                "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset",
            }}
          >
            {/* ── Header ─────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,40,30,0.9) 0%, rgba(0,60,40,0.8) 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(212,175,55,0.25)" }}
                >
                  <Globe className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-white text-base leading-none">
                    {tour.heading}
                  </h2>
                  <p className="text-white/50 text-xs mt-0.5 leading-none">
                    {tour.subheading}
                  </p>
                </div>
              </div>

              {/* Right: quick campus stats + close */}
              <div className="flex items-center gap-6">
                {/* Stats strip — hidden on small screens */}
                <div className="hidden md:flex items-center gap-5">
                  {campusQuickStats.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-white text-xs font-bold leading-none">
                          {value}
                        </div>
                        <div className="text-emerald-200/90 text-[10px] font-medium leading-none mt-0.5">
                          {label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:text-white transition-all cursor-pointer bg-white/10 border border-white/20"
                  aria-label="Close virtual tour"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* ── Body: Video + Sidebar ─────────────────────────── */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
              {/* Video Player — fills available space */}
              <div
                className="relative flex-1 bg-black"
                style={{ minHeight: "300px" }}
              >
                {/* Loading shimmer visible before iframe loads */}
                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                  <div className="flex flex-col items-center gap-3 text-white/40">
                    <Play className="w-12 h-12 animate-pulse" />
                    <span className="text-sm">Loading tour…</span>
                  </div>
                </div>

                {/* Media */}
                <div className="relative w-full h-full z-10">
                  {tour.mediaType === "youtube" && (
                    <YouTubeEmbed url={tour.mediaUrl} poster={tour.posterImage} />
                  )}
                  {tour.mediaType === "mp4" && (
                    <Mp4Embed url={tour.mediaUrl} poster={tour.posterImage} />
                  )}
                  {tour.mediaType === "iframe" && (
                    <IframeEmbed url={tour.mediaUrl} />
                  )}
                </div>
              </div>

              {/* ── Sidebar (desktop only) ───────────────────────── */}
              <div
                className="hidden lg:flex flex-col w-72 shrink-0 overflow-y-auto"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(5,25,15,0.95) 0%, rgba(0,15,10,0.98) 100%)",
                  borderLeft: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Campus card */}
                <div className="p-5 border-b border-white/10">
                  <div
                    className="w-full h-36 rounded-xl overflow-hidden mb-4 relative"
                    style={{ background: "#0a1a0f" }}
                  >
                    {tour.posterImage && (
                      <img
                        src={tour.posterImage}
                        alt="Campus"
                        className="w-full h-full object-cover opacity-85"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-white text-xs font-bold">
                        {tour.campusName}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/85 text-xs leading-relaxed">
                    {tour.campusDescription}
                  </p>
                </div>

                {/* Stats grid */}
                {tour.showStats && (
                  <div className="p-5 border-b border-white/10">
                    <div className="text-emerald-300 text-[10px] uppercase tracking-widest font-bold mb-3">
                      Campus Highlights
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {campusQuickStats.map(({ icon: Icon, label, value }) => (
                        <div
                          key={label}
                          className="rounded-xl p-3 flex flex-col gap-1 border border-white/10"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <Icon className="w-4 h-4 text-emerald-400" />
                          <div className="text-white font-bold text-sm">
                            {value}
                          </div>
                          <div className="text-emerald-100/90 text-[11px] font-medium">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick nav links */}
                <div className="p-5 border-b border-white/10">
                  <div className="text-emerald-300 text-[10px] uppercase tracking-widest font-bold mb-3">
                    Explore More
                  </div>
                  <div className="flex flex-col gap-2">
                    {["Academic Programs", "Research Centers", "Student Life", "Campus Facilities"].map(
                      (item) => (
                        <button
                          key={item}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/90 hover:text-white text-xs font-semibold transition-all cursor-pointer group"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                          onClick={() => navigate({ type: "departments" } as any)}
                        >
                          <span>{item}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="p-5 mt-auto">
                  <div
                    className="rounded-2xl p-4 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.08) 100%)",
                      border: "1px solid rgba(212,175,55,0.2)",
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white/70 text-xs mb-3 leading-relaxed">
                      Ready to experience campus life in person?
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        navigate({ type: "admissions" });
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-sm text-navy flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ background: "linear-gradient(90deg, #d4af37, #f0d060)" }}
                    >
                      {tour.ctaLabel}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile Footer ─────────────────────────────────── */}
            <div
              className="flex lg:hidden items-center justify-between px-5 py-3 shrink-0"
              style={{
                background: "rgba(0,20,15,0.97)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-white/60 text-xs">
                <span className="font-semibold text-white">
                  {tour.campusName}
                </span>{" "}
                • {tour.campusDescription}
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate({ type: "admissions" });
                }}
                className="px-4 py-2 rounded-full font-bold text-navy text-xs flex items-center gap-1.5 cursor-pointer"
                style={{ background: "linear-gradient(90deg, #d4af37, #f0d060)" }}
              >
                {tour.ctaLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
