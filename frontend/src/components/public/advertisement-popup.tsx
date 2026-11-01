"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, ExternalLink, Sparkles, Clock, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Advertisement } from "@/types/advertisement";
import { advertisementService } from "@/lib/api/advertisement-service";

export function AdvertisementPopup() {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [progress, setProgress] = useState(100);

  const progressIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate initializations in React 18 strict mode
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    let isMounted = true;

    async function checkAndDisplayAd() {
      try {
        const activeAd = await advertisementService.getActiveAdvertisement();

        if (!activeAd || !isMounted) return;

        // Frequency check for session storage
        if (activeAd.displayFrequency === "once_per_session") {
          const sessionKey = `bac_ad_seen_${activeAd.id}`;
          if (sessionStorage.getItem(sessionKey)) {
            return; // Skip displaying ad in this session
          }
        }

        const duration = activeAd.displayDuration || 10;
        setAd(activeAd);
        setTimeLeft(duration);
        setProgress(100);
        setIsOpen(true);

        // Lock background body scrolling while popup is active
        document.body.style.overflow = "hidden";

        // Track impression
        advertisementService.trackImpression(activeAd.id);

        // Mark session seen if frequency rule is once_per_session
        if (activeAd.displayFrequency === "once_per_session") {
          sessionStorage.setItem(`bac_ad_seen_${activeAd.id}`, "true");
        }

        // Start countdown timer
        const startTime = Date.now();
        const durationMs = duration * 1000;

        progressIntervalRef.current = setInterval(() => {
          if (!isMounted) return;
          const elapsed = Date.now() - startTime;
          const remainingMs = Math.max(0, durationMs - elapsed);
          const remainingSec = Math.ceil(remainingMs / 1000);

          setTimeLeft(remainingSec);
          setProgress((remainingMs / durationMs) * 100);

          if (remainingMs <= 0) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            document.body.style.overflow = "";
            setIsOpen(false);
          }
        }, 100);

      } catch (err) {
        console.error("Failed to load active popup advertisement:", err);
      }
    }

    checkAndDisplayAd();

    return () => {
      isMounted = false;
      document.body.style.overflow = "";
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleClose = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    document.body.style.overflow = "";
    setIsOpen(false);
  };

  const handleAdClick = () => {
    if (!ad) return;
    advertisementService.trackClick(ad.id);
    if (ad.destinationUrl) {
      if (ad.openInNewTab) {
        window.open(ad.destinationUrl, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = ad.destinationUrl;
      }
    }
  };

  if (!isOpen || !ad) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-x-hidden overflow-y-auto">
          {/* Backdrop dimming overlay covering viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-0 cursor-pointer"
          />

          {/* Centered Popup Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-[620px] max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col my-auto"
          >
            {/* 1. Header: Announcement Badge, Live Countdown & Close Button */}
            <div className="relative bg-slate-900 text-white px-4 sm:px-5 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Megaphone className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span className="tracking-wide uppercase text-[10px] sm:text-[11px] font-bold text-slate-300">
                  Official Announcement
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Live Countdown badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Closing in <strong className="text-amber-400 font-bold">{timeLeft}s</strong>
                  </span>
                </div>

                {/* Visible Close X button */}
                <button
                  onClick={handleClose}
                  aria-label="Close advertisement"
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Countdown progress indicator bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div className="overflow-y-auto flex-1">
              <div
                onClick={ad.destinationUrl ? handleAdClick : undefined}
                className={ad.destinationUrl ? "cursor-pointer group" : "group"}
              >
                {/* 2. Advertisement Image Banner */}
                <div className="relative w-full aspect-video bg-slate-950 overflow-hidden shrink-0">
                  <img
                    src={ad.imageUrl}
                    alt={ad.imageAltText || ad.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Featured Badge */}
                  <div className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md shadow-md backdrop-blur-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    Featured
                  </div>
                </div>

                {/* 3. Title & Description */}
                <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 space-y-2">
                  <h3 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {ad.title}
                  </h3>

                  {ad.description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {ad.description}
                    </p>
                  )}

                  {/* 4. Call-to-action Button & 5. Link Hint */}
                  {ad.destinationUrl && (
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all">
                        <span>Learn More / Apply Now</span>
                        <ExternalLink className="w-4 h-4" />
                      </span>

                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        Clicking opens destination link
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
