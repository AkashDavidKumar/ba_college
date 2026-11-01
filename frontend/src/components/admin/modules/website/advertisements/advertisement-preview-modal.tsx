"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ExternalLink,
  Laptop,
  Smartphone,
  RotateCcw,
  Clock,
  Megaphone,
  Sparkles,
  Info,
} from "lucide-react";
import { Advertisement } from "@/types/advertisement";
import { cn } from "@/lib/utils";

interface AdvertisementPreviewModalProps {
  ad: Partial<Advertisement> | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdvertisementPreviewModal({
  ad,
  isOpen,
  onClose,
}: AdvertisementPreviewModalProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const duration = ad?.displayDuration || 10;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(100);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(duration);
    setProgress(100);
    setIsFinished(false);

    const durationMs = duration * 1000;
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, durationMs - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);

      setTimeLeft(remainingSec);
      setProgress((remainingMs / durationMs) * 100);

      if (remainingMs <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsFinished(true);
      }
    }, 100);
  };

  useEffect(() => {
    if (isOpen && ad) {
      resetTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, ad, duration]);

  if (!isOpen || !ad) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Top Device & Control Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] bg-slate-900 text-white px-5 py-2.5 rounded-full border border-slate-800 shadow-2xl flex items-center gap-4">
        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-full text-xs font-semibold">
          <button
            onClick={() => setDevice("desktop")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer",
              device === "desktop" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            )}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer",
              device === "mobile" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Timer Reset Test */}
        <button
          onClick={resetTimer}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-400 font-semibold cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Timer ({duration}s)</span>
        </button>

        {/* Close Modal */}
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Simulated Website Background Container */}
      <div
        className={cn(
          "relative transition-all duration-300 mx-auto flex items-center justify-center pt-12 pb-6",
          device === "desktop" ? "w-full max-w-4xl" : "w-full max-w-sm"
        )}
      >
        {/* Isolated Interactive Popup */}
        <div className="relative w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          {/* Header Countdown Bar */}
          <div className="relative bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Megaphone className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span className="tracking-wide uppercase text-[10px] font-bold text-slate-300">
                Live Public Preview
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {isFinished ? (
                    <strong className="text-rose-400">Auto Closed</strong>
                  ) : (
                    <>
                      Closing in <strong className="text-amber-400 font-bold">{timeLeft}s</strong>
                    </>
                  )}
                </span>
              </div>

              <button
                onClick={resetTimer}
                title="Simulate Dismissing X"
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Banner Content */}
          <div className="relative">
            <div className="relative w-full aspect-video bg-slate-950 overflow-hidden">
              <img
                src={ad.imageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"}
                alt={ad.imageAltText || ad.title || "Preview Banner"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                Preview Mode
              </div>
            </div>

            <div className="p-5 space-y-2 bg-white dark:bg-slate-900">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                {ad.title || "Advertisement Title Preview"}
              </h3>

              {ad.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ad.description}
                </p>
              )}

              {ad.destinationUrl && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs shadow-md">
                    <span>Explore Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>

                  <span className="text-[10px] text-slate-400">
                    Target: {ad.openInNewTab ? "New Tab (_blank)" : "Same Tab (_self)"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
