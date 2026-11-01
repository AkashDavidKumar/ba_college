"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSiteData, HeroSectionConfig, defaultHeroSectionConfig } from "@/lib/site-context";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Loader2,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  Sparkles,
  Eye,
  Layers,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroVideoManager() {
  const { data, updateHeroSection } = useSiteData();
  const { toast } = useToast();

  const [backgroundVideo, setBackgroundVideo] = useState(defaultHeroSectionConfig.backgroundVideo);
  const [fallbackImage, setFallbackImage] = useState(defaultHeroSectionConfig.fallbackImage);
  const [blurIntensity, setBlurIntensity] = useState(defaultHeroSectionConfig.blurIntensity);
  const [overlayOpacity, setOverlayOpacity] = useState(defaultHeroSectionConfig.overlayOpacity);
  const [enabled, setEnabled] = useState(defaultHeroSectionConfig.enabled);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [isPlayingPreview, setIsPlayingPreview] = useState(true);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync state when context data loads or updates
  useEffect(() => {
    if (data?.heroSection) {
      setBackgroundVideo(data.heroSection.backgroundVideo ?? defaultHeroSectionConfig.backgroundVideo);
      setFallbackImage(data.heroSection.fallbackImage ?? defaultHeroSectionConfig.fallbackImage);
      setBlurIntensity(typeof data.heroSection.blurIntensity === "number" ? data.heroSection.blurIntensity : 80);
      setOverlayOpacity(typeof data.heroSection.overlayOpacity === "number" ? data.heroSection.overlayOpacity : 75);
      setEnabled(data.heroSection.enabled !== false);
    }
  }, [data?.heroSection]);

  // Handle Video Upload
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      toast({
        title: "Invalid File Type",
        description: "Please select an MP4 or WebM video file.",
        variant: "destructive"
      });
      return;
    }

    // Validate size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Video must be under 500MB for optimal web performance.",
        variant: "destructive"
      });
      return;
    }

    // Instant local preview before network upload finishes
    const localUrl = URL.createObjectURL(file);
    setBackgroundVideo(localUrl);

    setIsUploadingVideo(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadProgress(50);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      setUploadProgress(85);
      if (!res.ok) {
        throw new Error("Upload failed with status " + res.status);
      }

      const result = await res.json();
      setUploadProgress(100);
      setBackgroundVideo(result.url);

      toast({
        title: "Video Uploaded Successfully",
        description: `${file.name} is ready. Click "Save Changes Instantly" to apply sitewide.`,
      });
    } catch (err: any) {
      console.error("Video upload error:", err);
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload video to server.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  // Handle Fallback Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid Image",
        description: "Please upload a valid JPG, PNG, or WebP image.",
        variant: "destructive"
      });
      return;
    }

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setFallbackImage(localUrl);

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Image upload failed");
      const result = await res.json();
      setFallbackImage(result.url);

      toast({
        title: "Fallback Image Uploaded",
        description: "Hero fallback background image updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: "Could not upload fallback image.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  // Delete / Remove Video
  const handleDeleteVideo = () => {
    if (confirm("Are you sure you want to remove the hero background video? The hero will display the fallback image.")) {
      setBackgroundVideo("");
      toast({
        title: "Video Removed",
        description: "Hero video cleared. Click Save to finalize.",
      });
    }
  };

  // Reset to Default Preset
  const handleResetDefaults = () => {
    if (confirm("Reset hero video settings to default campus showcase preset?")) {
      setBackgroundVideo(defaultHeroSectionConfig.backgroundVideo);
      setFallbackImage(defaultHeroSectionConfig.fallbackImage);
      setBlurIntensity(defaultHeroSectionConfig.blurIntensity);
      setOverlayOpacity(defaultHeroSectionConfig.overlayOpacity);
      setEnabled(defaultHeroSectionConfig.enabled);
      toast({
        title: "Defaults Restored",
        description: "Reset to BAC Campus Showcase video preset. Remember to save.",
      });
    }
  };

  // Save Settings Instantly
  const handleSave = async () => {
    setIsSaving(true);
    const payload: HeroSectionConfig = {
      backgroundVideo,
      fallbackImage,
      blurIntensity,
      overlayOpacity,
      enabled
    };

    try {
      const success = await updateHeroSection(payload);
      if (success) {
        toast({
          title: "Changes Saved Instantly",
          description: "Hero section video, blur, and overlay settings are now live on the website.",
        });
      } else {
        throw new Error("Server returned unsuccessful response");
      }
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message || "Failed to update hero video settings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculated Preview CSS values
  const previewBlurPx = Math.round((blurIntensity / 100) * 24);
  const previewAlpha = overlayOpacity / 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Hero Section Engine
            </span>
            {enabled ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Video Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Video Disabled (Static Image Mode)
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Hero Video Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure full-screen background video, 80% blur effect, light-green tint overlay, and fallback visuals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
            title="Reset to default preset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 shadow-md shadow-emerald-700/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes Instantly
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Settings & Sliders / Right Interactive Preview */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Controls and Uploads */}
        <div className="lg:col-span-7 space-y-6">
          {/* Master Enable/Disable Switch */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-700" />
                  Hero Background Video State
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  When enabled, autoplaying video loops across the landing page hero background.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
              </label>
            </div>
          </div>

          {/* Video Upload & Management Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  Background Video Source
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports high-definition MP4 & WebM videos (up to 500MB).
                </p>
              </div>
            </div>

            {/* Current Video Display / URL Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Video File URL / Path
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={backgroundVideo}
                  onChange={(e) => setBackgroundVideo(e.target.value)}
                  placeholder="https://... or /uploads/video.mp4"
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-mono text-slate-700"
                />
                {backgroundVideo && (
                  <button
                    type="button"
                    onClick={handleDeleteVideo}
                    className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={handleVideoFileChange}
                className="hidden"
                id="hero-video-upload-input"
              />
              <label
                htmlFor="hero-video-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-inner">
                  {isUploadingVideo ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {isUploadingVideo ? "Uploading Campus Video..." : "Upload New Campus Video"}
                </div>
                <p className="text-xs text-slate-500 max-w-sm">
                  Drag & drop an MP4 video here or click to browse. Videos are automatically optimized for web autoplay.
                </p>
                {uploadProgress !== null && (
                  <div className="w-full max-w-xs bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Effects & Customization Sliders (Blur & Overlay) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                Blur & Overlay Effects
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fine-tune the ambient depth and light-green branding overlay to ensure maximum text readability.
              </p>
            </div>

            {/* Blur Intensity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  Blur Intensity
                </label>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-800">
                  {blurIntensity}% ({previewBlurPx}px)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={blurIntensity}
                onChange={(e) => setBlurIntensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0% (Sharp, No Blur)</span>
                <span className="font-semibold text-emerald-700">80% (Recommended)</span>
                <span>100% (Maximum Bokeh)</span>
              </div>
            </div>

            {/* Overlay Opacity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  Soft Light-Green Overlay Opacity
                </label>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 font-mono text-xs font-bold text-emerald-800">
                  {overlayOpacity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0% (Transparent)</span>
                <span className="font-semibold text-emerald-700">75% (Ideal Text Contrast)</span>
                <span>100% (Solid University Green)</span>
              </div>
            </div>
          </div>

          {/* Fallback Image Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                Fallback Poster Image
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Shown instantly on page load while the video streams and when low-power mode or disabled.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Fallback Image URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={fallbackImage}
                  onChange={(e) => setFallbackImage(e.target.value)}
                  placeholder="https://... or /uploads/image.jpg"
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-mono text-slate-700"
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="hero-fallback-upload-input"
                />
                <label
                  htmlFor="hero-fallback-upload-input"
                  className="px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Interactive Preview Before Saving */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Landing Page Preview
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (previewVideoRef.current) {
                    if (isPlayingPreview) {
                      previewVideoRef.current.pause();
                      setIsPlayingPreview(false);
                    } else {
                      previewVideoRef.current.play();
                      setIsPlayingPreview(true);
                    }
                  }
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer"
              >
                {isPlayingPreview ? (
                  <>
                    <Pause className="w-3 h-3" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" /> Play
                  </>
                )}
              </button>
            </div>

            {/* The Live Video Simulation Screen */}
            <div className="relative aspect-[4/3] sm:aspect-video w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950 flex items-center justify-center select-none">
              {/* Fallback image */}
              {fallbackImage && (
                <img
                  src={fallbackImage}
                  alt="Preview fallback"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: `blur(${previewBlurPx}px)`,
                    transform: "scale(1.1)"
                  }}
                />
              )}

              {/* Video layer */}
              {enabled && backgroundVideo && (
                <video
                  ref={previewVideoRef}
                  src={backgroundVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: `blur(${previewBlurPx}px)`,
                    transform: "scale(1.1)"
                  }}
                />
              )}

              {/* Soft Light Green Overlay matching exact hero */}
              <div
                className="absolute inset-0 transition-all pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, rgba(245, 251, 246, ${Math.min(0.96, previewAlpha * 0.95)}) 0%, rgba(232, 245, 233, ${Math.min(0.92, previewAlpha * 0.88)}) 50%, rgba(200, 230, 201, ${Math.min(0.85, previewAlpha * 0.72)}) 100%)`
                }}
              />

              {/* Foreground Typography & Element Mockup for Contrast Check */}
              <div className="relative z-10 p-5 w-full flex flex-col justify-between h-full pointer-events-none">
                <div>
                  {/* Motto Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md bg-white/85 border border-[#1B5E20]/20 text-[#1B5E20] text-[10px] font-bold shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#388E3C]" />
                    <span>Motto: Trust • Growth • Knowledge • Excellence</span>
                  </div>

                  {/* Heading */}
                  <h2 className="font-serif font-bold text-[#1B5E20] text-lg sm:text-xl leading-tight mt-3">
                    BISHOP AMBROSE COLLEGE
                  </h2>

                  {/* Subtitle */}
                  <p className="text-slate-700 text-[11px] leading-relaxed mt-1 max-w-xs font-medium">
                    Educating leaders, advancing research, and building a better future.
                  </p>

                  {/* Action Buttons Mock */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="px-3 py-1 rounded-full bg-[#1B5E20] text-white text-[10px] font-semibold shadow-xs">
                      Apply Now
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-white/80 border border-[#1B5E20]/20 text-[#1B5E20] text-[10px] font-semibold">
                      Explore Courses
                    </div>
                  </div>
                </div>

                {/* Simulated Stats Bar */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#1B5E20]/15">
                  <div>
                    <div className="font-serif font-bold text-xs text-[#1B5E20]">20,000+</div>
                    <div className="text-[8px] text-slate-600">Students</div>
                  </div>
                  <div>
                    <div className="font-serif font-bold text-xs text-[#1B5E20]">500+</div>
                    <div className="text-[8px] text-slate-600">Faculty</div>
                  </div>
                  <div>
                    <div className="font-serif font-bold text-xs text-[#1B5E20]">200+</div>
                    <div className="text-[8px] text-slate-600">Programs</div>
                  </div>
                  <div>
                    <div className="font-serif font-bold text-xs text-[#1B5E20]">95%</div>
                    <div className="text-[8px] text-slate-600">Placement</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Helper Tips */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Preview Feedback
              </div>
              <p>
                At {blurIntensity}% blur and {overlayOpacity}% green overlay opacity, all typography is sharp, crisp, and high-contrast while the campus video gently moves in the background.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
