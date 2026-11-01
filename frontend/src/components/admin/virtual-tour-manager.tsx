"use client";

import { useState, useEffect, useRef } from "react";
import {
  Globe,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Youtube,
  Film,
  LayoutTemplate,
  Upload,
  Eye,
  EyeOff,
  RotateCcw,
  Image as ImageIcon,
  Trash2,
  Play,
  FileVideo,
  UploadCloud,
} from "lucide-react";
import {
  useSiteData,
  defaultVirtualTourConfig,
  VirtualTourConfig,
  VirtualTourMediaType,
} from "@/lib/site-context";
import { useToast } from "@/hooks/use-toast";

const MEDIA_TYPE_OPTIONS: {
  value: VirtualTourMediaType;
  label: string;
  icon: React.ElementType;
  hint: string;
}[] = [
  {
    value: "youtube",
    label: "YouTube Embed",
    icon: Youtube,
    hint: "Paste any YouTube link (e.g. youtu.be/ID or youtube.com/watch?v=ID)",
  },
  {
    value: "mp4",
    label: "MP4 Video",
    icon: Film,
    hint: "Upload a video file up to 500MB or enter a direct MP4 link",
  },
  {
    value: "iframe",
    label: "360° / iFrame",
    icon: LayoutTemplate,
    hint: "Any embeddable URL (360° tour, Matterport, Google Street View, etc.)",
  },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition placeholder:text-slate-400"
    />
  );
}

export function VirtualTourManager() {
  const { data, updateVirtualTour } = useSiteData();
  const { toast } = useToast();
  const rawTour: any = data?.virtualTour;

  const getNormalized = (raw: any): VirtualTourConfig => ({
    enabled: raw?.enabled !== false,
    mediaType:
      raw?.mediaType ||
      (raw?.url?.includes("youtu") || raw?.mediaUrl?.includes("youtu")
        ? "youtube"
        : "mp4"),
    mediaUrl: raw?.mediaUrl || raw?.url || defaultVirtualTourConfig.mediaUrl,
    posterImage: raw?.posterImage || defaultVirtualTourConfig.posterImage,
    heading: raw?.heading || raw?.title || defaultVirtualTourConfig.heading,
    subheading:
      raw?.subheading || raw?.subtitle || defaultVirtualTourConfig.subheading,
    campusName: raw?.campusName || defaultVirtualTourConfig.campusName,
    campusDescription:
      raw?.campusDescription || defaultVirtualTourConfig.campusDescription,
    showStats: raw?.showStats ?? raw?.showStatistics ?? true,
    ctaLabel: raw?.ctaLabel || defaultVirtualTourConfig.ctaLabel,
  });

  const [form, setForm] = useState<VirtualTourConfig>(() =>
    getNormalized(rawTour)
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Upload States
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(
    null
  );
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [posterUploadProgress, setPosterUploadProgress] = useState<
    number | null
  >(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (rawTour) {
      setForm(getNormalized(rawTour));
    }
  }, [rawTour]);

  const set = <K extends keyof VirtualTourConfig>(
    key: K,
    value: VirtualTourConfig[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  // Handle Video Upload (up to 500MB)
  const handleVideoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (
      !file.type.startsWith("video/") &&
      !file.name.match(/\.(mp4|webm|mov|mkv)$/i)
    ) {
      toast({
        title: "Invalid File Type",
        description: "Please select an MP4 or WebM video file.",
        variant: "destructive",
      });
      return;
    }

    // Validate size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Video must be under 500MB for optimal web performance.",
        variant: "destructive",
      });
      return;
    }

    // Set mediaType to mp4 immediately
    set("mediaType", "mp4");

    // Preview immediately using local object URL
    const localUrl = URL.createObjectURL(file);
    set("mediaUrl", localUrl);

    setIsUploadingVideo(true);
    setVideoUploadProgress(20);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setVideoUploadProgress(50);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setVideoUploadProgress(85);
      if (!res.ok) {
        throw new Error("Upload failed with status " + res.status);
      }

      const result = await res.json();
      setVideoUploadProgress(100);
      set("mediaUrl", result.url);

      toast({
        title: "Video Uploaded Successfully",
        description: `${file.name} is ready. Remember to save your settings.`,
      });
    } catch (err: any) {
      console.error("Video upload error:", err);
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload video to server.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadProgress(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  // Handle Poster / Thumbnail Image Upload
  const handlePosterFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPEG, PNG, or WebP image file.",
        variant: "destructive",
      });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    set("posterImage", localUrl);

    setIsUploadingPoster(true);
    setPosterUploadProgress(30);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setPosterUploadProgress(70);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed with status " + res.status);
      }

      const result = await res.json();
      setPosterUploadProgress(100);
      set("posterImage", result.url);

      toast({
        title: "Thumbnail Uploaded",
        description: `${file.name} set as virtual tour cover image.`,
      });
    } catch (err: any) {
      console.error("Poster upload error:", err);
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPoster(false);
      setPosterUploadProgress(null);
      if (posterInputRef.current) posterInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    const ok = await updateVirtualTour(form);
    setSaving(false);
    setStatus(ok ? "success" : "error");
    if (ok) {
      toast({
        title: "Settings Saved",
        description: "Virtual Tour configuration has been updated sitewide.",
      });
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleReset = () => {
    setForm({ ...defaultVirtualTourConfig });
    setStatus("idle");
  };

  const mediaTypeConfig = MEDIA_TYPE_OPTIONS.find(
    (o) => o.value === form.mediaType
  )!;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hidden File Inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        className="hidden"
        onChange={handleVideoFileChange}
      />
      <input
        ref={posterInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/*"
        className="hidden"
        onChange={handlePosterFileChange}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-xs">
          <Globe className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Virtual Tour Control Panel
          </h2>
          <p className="text-sm text-slate-500">
            Configure the immersive campus tour video, branding, and statistics
          </p>
        </div>
      </div>

      {/* Live status badge */}
      <div
        className="rounded-2xl overflow-hidden border transition-all"
        style={{ borderColor: form.enabled ? "#d1fae5" : "#fee2e2" }}
      >
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ background: form.enabled ? "#ecfdf5" : "#fef2f2" }}
        >
          <div className="flex items-center gap-2.5">
            {form.enabled ? (
              <Eye className="w-4.5 h-4.5 text-emerald-600" />
            ) : (
              <EyeOff className="w-4.5 h-4.5 text-red-500" />
            )}
            <div>
              <span
                className="text-sm font-bold"
                style={{ color: form.enabled ? "#059669" : "#dc2626" }}
              >
                Virtual Tour is{" "}
                {form.enabled
                  ? "Enabled (Visible to all visitors)"
                  : "Disabled (Hidden from public site)"}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                {form.enabled
                  ? "Visitors can launch the full-screen modal from the Hero section"
                  : "The Virtual Tour button and modal triggers are currently inactive"}
              </p>
            </div>
          </div>
          <button
            onClick={() => set("enabled", !form.enabled)}
            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
            style={{
              background: form.enabled ? "#dc2626" : "#059669",
              color: "#fff",
            }}
          >
            {form.enabled ? "Disable Tour" : "Enable Tour"}
          </button>
        </div>
      </div>

      {/* Section: Media Source */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4 text-emerald-600" />
            Media Source
          </h3>
          <span className="text-xs text-slate-400">
            Upload capacity: up to 500 MB
          </span>
        </div>

        {/* Media type selector */}
        <Field label="Tour Type">
          <div className="grid grid-cols-3 gap-3">
            {MEDIA_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => set("mediaType", value)}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all shadow-2xs"
                style={{
                  background: form.mediaType === value ? "#ecfdf5" : "#f8fafc",
                  borderColor: form.mediaType === value ? "#10b981" : "#e2e8f0",
                  color: form.mediaType === value ? "#059669" : "#64748b",
                }}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </Field>

        {/* MP4 Dedicated Upload Zone (When MP4 is chosen or available) */}
        {form.mediaType === "mp4" && (
          <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              {isUploadingVideo ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {isUploadingVideo
                  ? "Uploading Campus Video..."
                  : "Upload Video File (MP4, WebM)"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Fast multi-part direct upload up to{" "}
                <strong className="text-emerald-700">500 MB</strong> capacity
              </p>
            </div>

            {/* Upload progress bar */}
            {isUploadingVideo && videoUploadProgress !== null && (
              <div className="max-w-md mx-auto space-y-1.5">
                <div className="h-2 w-full bg-emerald-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                    style={{ width: `${videoUploadProgress}%` }}
                  />
                </div>
                <div className="text-[11px] font-semibold text-emerald-700">
                  {videoUploadProgress}% uploaded
                </div>
              </div>
            )}

            {/* Action button */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploadingVideo}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isUploadingVideo ? "Uploading..." : "Select Video From Computer"}
              </button>
            </div>
          </div>
        )}

        {/* Media URL Input with inline Upload Button */}
        <Field
          label={`${mediaTypeConfig.label} URL`}
          hint={mediaTypeConfig.hint}
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={form.mediaUrl}
                onChange={(v) => set("mediaUrl", v)}
                placeholder={
                  form.mediaType === "youtube"
                    ? "https://www.youtube.com/embed/VIDEO_ID or youtu.be/ID"
                    : form.mediaType === "mp4"
                    ? "https://example.com/campus-tour.mp4 or /uploads/video.mp4"
                    : "https://matterport.com/..."
                }
              />
            </div>

            {/* Direct Upload Video button always accessible */}
            <button
              type="button"
              onClick={() => {
                set("mediaType", "mp4");
                videoInputRef.current?.click();
              }}
              disabled={isUploadingVideo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 font-bold text-xs shrink-0 cursor-pointer transition shadow-2xs disabled:opacity-50"
              title="Upload MP4 / WebM video file (up to 500MB)"
            >
              {isUploadingVideo ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Upload className="w-4 h-4 text-emerald-600" />
              )}
              <span>Upload Video</span>
            </button>
          </div>
        </Field>

        {/* Video Preview Card when video URL is set */}
        {form.mediaUrl && form.mediaType === "mp4" && (
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 p-3 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-56 aspect-video bg-black rounded-xl overflow-hidden relative shrink-0">
              <video
                src={form.mediaUrl}
                controls
                className="w-full h-full object-cover"
                poster={form.posterImage}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 text-white text-xs font-bold">
                <FileVideo className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{form.mediaUrl}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ready for playback in the Virtual Tour modal.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold cursor-pointer transition"
                >
                  Replace Video
                </button>
                <button
                  type="button"
                  onClick={() => set("mediaUrl", "")}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-semibold cursor-pointer transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Poster / Thumbnail Image with inline Upload Button */}
        <Field
          label="Poster / Thumbnail Image"
          hint="Cover image displayed as loading placeholder and in the campus sidebar card"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={form.posterImage}
                onChange={(v) => set("posterImage", v)}
                placeholder="https://images.unsplash.com/... or /uploads/image.jpg"
              />
            </div>

            {/* Direct Upload Thumbnail button */}
            <button
              type="button"
              onClick={() => posterInputRef.current?.click()}
              disabled={isUploadingPoster}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-bold text-xs shrink-0 cursor-pointer transition shadow-2xs disabled:opacity-50"
              title="Upload image from computer"
            >
              {isUploadingPoster ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
              ) : (
                <ImageIcon className="w-4 h-4 text-slate-600" />
              )}
              <span>Upload Image</span>
            </button>
          </div>

          {/* Upload progress */}
          {isUploadingPoster && posterUploadProgress !== null && (
            <div className="space-y-1 pt-1">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                  style={{ width: `${posterUploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Thumbnail preview */}
          {form.posterImage && (
            <div className="mt-3 relative w-full sm:w-72 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
              <img
                src={form.posterImage}
                alt="Poster preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => posterInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-bold hover:bg-white transition"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => set("posterImage", "")}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </Field>
      </div>

      {/* Section: Text & Branding */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
          Branding & Copy
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Modal Heading">
            <Input
              value={form.heading}
              onChange={(v) => set("heading", v)}
              placeholder="Experience Our Campus"
            />
          </Field>
          <Field label="Modal Subheading">
            <Input
              value={form.subheading}
              onChange={(v) => set("subheading", v)}
              placeholder="Take an immersive virtual tour…"
            />
          </Field>
          <Field label="Campus Name">
            <Input
              value={form.campusName}
              onChange={(v) => set("campusName", v)}
              placeholder="Knowledge City Main Campus"
            />
          </Field>
          <Field label="Campus Description">
            <Input
              value={form.campusDescription}
              onChange={(v) => set("campusDescription", v)}
              placeholder="200 Acres of Innovation, Labs & Learning"
            />
          </Field>
          <Field label="CTA Button Label">
            <Input
              value={form.ctaLabel}
              onChange={(v) => set("ctaLabel", v)}
              placeholder="Schedule On-Campus Visit"
            />
          </Field>
        </div>

        {/* Show stats toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <div>
            <div className="text-sm font-semibold text-slate-700">
              Show Campus Stats Dashboard
            </div>
            <div className="text-xs text-slate-400">
              Display the statistics cards (Area, Students, Programs, Ranking)
              in the modal
            </div>
          </div>
          <button
            type="button"
            onClick={() => set("showStats", !form.showStats)}
            className="w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shadow-inner"
            style={{ background: form.showStats ? "#10b981" : "#cbd5e1" }}
          >
            <span
              className="absolute top-0.5 w-5.5 h-5.5 rounded-full bg-white shadow-md transition-all"
              style={{ left: form.showStats ? "calc(100% - 24px)" : "2px" }}
            />
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {status !== "idle" && (
        <div
          className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-semibold shadow-2xs"
          style={{
            background: status === "success" ? "#ecfdf5" : "#fef2f2",
            color: status === "success" ? "#059669" : "#dc2626",
            border: `1px solid ${status === "success" ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          {status === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>
            {status === "success"
              ? "Virtual Tour settings saved successfully!"
              : "Failed to save. Please check your connection and try again."}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || isUploadingVideo || isUploadingPoster}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm cursor-pointer disabled:opacity-60 transition-all shadow-md shadow-emerald-600/20 hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving Changes..." : "Save Virtual Tour Settings"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition border border-slate-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Defaults
        </button>
      </div>
    </div>
  );
}
