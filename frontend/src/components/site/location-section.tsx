"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Clock,
  Star,
  Compass,
  Layers,
  RotateCcw,
  Share2,
  Bookmark,
  CheckCircle2,
  Car,
  Train,
  Plane,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Reveal } from "./primitives";
import { motion, useReducedMotion } from "framer-motion";
import { useSiteData, defaultLocationConfig, LocationConfig } from "@/lib/site-context";

interface LocationSectionProps {
  onContactClick?: () => void;
  customConfig?: LocationConfig; // Optional override for admin preview
}

export function LocationSection({ onContactClick, customConfig }: LocationSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const { data } = useSiteData();
  const location: LocationConfig = customConfig || data?.location || defaultLocationConfig;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mobileCardCollapsed, setMobileCardCollapsed] = useState(false);

  // Helper to construct custom marker pin
  const createMarkerIcon = (color: string, label: string, pulse: boolean) => {
    const safeColor = color || "#EA4335";
    const pulseHtml = pulse
      ? `<div style="position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 36px; height: 14px; background: ${safeColor}55; border-radius: 50%; filter: blur(2px); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>`
      : "";

    return L.divIcon({
      className: "custom-google-pin-container",
      html: `
        <div style="position: relative; width: 44px; height: 48px; transform: translate(-50%, -100%); cursor: pointer;">
          ${pulseHtml}
          <!-- Drop shadow -->
          <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 18px; height: 6px; background: rgba(0,0,0,0.35); border-radius: 50%;"></div>
          
          <!-- Google Maps Pin SVG -->
          <svg viewBox="0 0 384 512" width="38" height="48" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35)); transition: transform 0.2s ease;">
            <path fill="${safeColor}" stroke="#ffffff" stroke-width="12" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
            <circle cx="192" cy="192" r="76" fill="#FFFFFF"/>
            <circle cx="192" cy="192" r="42" fill="${safeColor}"/>
          </svg>
        </div>
      `,
      iconSize: [44, 48],
      iconAnchor: [22, 48],
      popupAnchor: [0, -48],
    });
  };

  // Construct popup HTML
  const getPopupContent = (cfg: LocationConfig) => {
    return `
      <div style="font-family: inherit; padding: 2px; max-width: 240px; color: #1e293b;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #16a34a;"></span>
          <span style="font-size: 11px; font-weight: 600; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">Campus Open</span>
        </div>
        <h4 style="font-weight: 700; font-size: 14px; margin: 0 0 4px 0; color: #0f172a; line-height: 1.25;">${cfg.campusName}</h4>
        <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #475569; margin-bottom: 6px;">
          <span style="color: #f59e0b; font-weight: 700;">${cfg.rating || 4.5} ★</span>
          <span>(${cfg.reviewsCount || 682} reviews)</span>
        </div>
        <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.4;">${cfg.address}</p>
        <a href="${cfg.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cfg.address)}`}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 4px; background: #1a73e8; color: #fff; font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 6px; text-decoration: none;">
          <span>Get Directions</span>
          <span>→</span>
        </a>
      </div>
    `;
  };

  // Initialize and handle map instance updates
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = Number(location.lat) || 11.009477;
    const lng = Number(location.lng) || 76.993425;
    const zoom = Number(location.zoom) || 16;

    if (!mapInstanceRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: zoom,
        minZoom: 11,
        maxZoom: 19,
        scrollWheelZoom: false,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      // Add default clean streets tile layer
      const streetTiles = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      tileLayerRef.current = streetTiles;

      // Add pin marker
      const icon = createMarkerIcon(location.pinColor, location.pinLabel, location.pinPulse);
      const marker = L.marker([lat, lng], {
        icon,
        title: location.campusName,
        riseOnHover: true,
      }).addTo(map);

      marker.bindPopup(getPopupContent(location), {
        className: "google-maps-popup",
        offset: [0, -42],
      });

      markerRef.current = marker;
    } else {
      // Update existing map view and marker when coordinates or config changes
      const map = mapInstanceRef.current;
      map.setView([lat, lng], zoom, { animate: true });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.setIcon(createMarkerIcon(location.pinColor, location.pinLabel, location.pinPulse));
        markerRef.current.setPopupContent(getPopupContent(location));
      }
    }
  }, [
    location.lat,
    location.lng,
    location.zoom,
    location.pinColor,
    location.pinLabel,
    location.pinPulse,
    location.campusName,
    location.address,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Toggle map layers (Street / Satellite)
  const toggleMapStyle = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapStyle === "streets") {
      const satLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 19,
        }
      ).addTo(map);
      tileLayerRef.current = satLayer;
      setMapStyle("satellite");
    } else {
      const streetLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);
      tileLayerRef.current = streetLayer;
      setMapStyle("streets");
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const lat = Number(location.lat) || 11.009477;
    const lng = Number(location.lng) || 76.993425;
    const zoom = Number(location.zoom) || 16;
    mapInstanceRef.current.setView([lat, lng], zoom, { animate: true });
    markerRef.current?.openPopup();
  };

  const handleShare = async () => {
    const shareUrl = location.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: location.campusName,
          text: `Find ${location.campusName} at ${location.address}`,
          url: shareUrl,
        });
      } catch {
        // Ignored
      }
    } else {
      await navigator.clipboard.writeText(
        `${location.campusName}\n${location.address}\n${shareUrl}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const effectiveGoogleMapsUrl =
    location.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.campusName + " " + location.address)}`;

  const effectiveDirectionsUrl =
    location.directionsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.campusName + " " + location.address)}`;

  return (
    <section
      id="campus-location"
      aria-label="Location and Campus Map"
      className="relative border-b border-white/10 bg-navy-dark text-white pt-10 sm:pt-14 pb-12 sm:pb-16"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-light text-xs font-semibold uppercase tracking-widest mb-2">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                {location.sectionBadge || "Find Us & Campus Map"}
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
                {location.heading || "Our Location"}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-white/70">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{location.statusText || "Campus open for visitors & prospective students"}</span>
            </div>
          </div>
        </Reveal>

        {/* Map Container with Floating Information Card */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-slate-100"
        >
          {/* If custom embedUrl is provided by admin, optionally render iframe; otherwise render interactive Leaflet map */}
          {location.embedUrl && location.embedUrl.trim().length > 0 ? (
            <iframe
              src={location.embedUrl}
              className="w-full h-[350px] sm:h-[420px] md:h-[480px] lg:h-[500px] border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Embedded map showing ${location.campusName}`}
            />
          ) : (
            <div
              ref={mapContainerRef}
              className="w-full h-[350px] sm:h-[420px] md:h-[480px] lg:h-[500px] z-0 focus:outline-none"
              style={{ minHeight: "350px" }}
              aria-label={`Interactive Google Map showing ${location.campusName}`}
            />
          )}

          {/* Floating Google Maps-Style Location Information Card */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
            className={`
              absolute z-[500] transition-all duration-300
              top-2 left-2 right-2 sm:right-auto sm:top-4 sm:left-4
              max-w-full sm:max-w-[360px] md:max-w-[390px]
            `}
          >
            <div className="bg-white text-slate-900 rounded-xl sm:rounded-2xl shadow-xl shadow-black/20 border border-slate-200/90 overflow-hidden backdrop-blur-md">
              {/* Card Header & Title */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                        Campus
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium truncate">
                        {location.tagline || "Autonomous · NAAC A++"}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 leading-snug">
                      {location.campusName}
                    </h3>
                  </div>

                  {/* Mobile collapse / expand toggle */}
                  <button
                    onClick={() => setMobileCardCollapsed(!mobileCardCollapsed)}
                    className="sm:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                    aria-label={mobileCardCollapsed ? "Expand location card" : "Collapse location card"}
                  >
                    {mobileCardCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-slate-700" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-slate-700" />
                    )}
                  </button>
                </div>

                {/* Rating & Category */}
                <div className="flex items-center flex-wrap gap-2 mt-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <span>{location.rating || 4.5}</span>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(location.rating || 4)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-amber-200 text-amber-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-slate-500">({location.reviewsCount || 682})</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600 truncate">{location.category || "Higher Education"}</span>
                </div>

                {/* Expandable Details */}
                <div className={`${mobileCardCollapsed ? "hidden sm:block" : "block"} transition-all`}>
                  {/* Full Address */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{location.address}</span>
                  </div>

                  {/* Status & Hours */}
                  <div className="mt-2 flex items-center gap-2.5 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-emerald-700">Open</span>
                    <span className="text-slate-500">· {location.openingHours || "Closes 5:00 PM"}</span>
                  </div>

                  {/* Phone */}
                  {location.phone && (
                    <div className="mt-1.5 flex items-center gap-2.5 text-xs text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a
                        href={`tel:${location.phone}`}
                        className="hover:text-blue-600 hover:underline transition-colors"
                      >
                        {location.phone}
                      </a>
                    </div>
                  )}

                  {/* Quick Action Icons Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center">
                    {location.enableDirectionsButton !== false && (
                      <a
                        href={effectiveDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-blue-50 transition-colors group"
                        title="Get Directions on Google Maps"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <Navigation className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-semibold text-blue-700">Directions</span>
                      </a>
                    )}

                    {location.enableSaveButton !== false && (
                      <button
                        onClick={handleSave}
                        className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 transition-colors group cursor-pointer"
                        title={saved ? "Saved to your list" : "Save location"}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                            saved
                              ? "bg-amber-100 border-amber-300 text-amber-600"
                              : "bg-white border-slate-200 text-slate-600 group-hover:border-slate-300"
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600">
                          {saved ? "Saved" : "Save"}
                        </span>
                      </button>
                    )}

                    {location.enableShareButton !== false && (
                      <button
                        onClick={handleShare}
                        className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 transition-colors group cursor-pointer"
                        title="Share location"
                      >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:border-slate-300 transition-all">
                          {copied ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-slate-600">
                          {copied ? "Copied!" : "Share"}
                        </span>
                      </button>
                    )}

                    <a
                      href={effectiveGoogleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 transition-colors group"
                      title="View larger map on Google Maps"
                    >
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center group-hover:border-slate-300 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-600">Open Map</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Open in Maps Direct Link */}
              <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium truncate max-w-[200px]">
                  {location.nearbyLandmark || "Near Campus Main Gate"}
                </span>
                <a
                  href={effectiveGoogleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 shrink-0"
                >
                  <span>View larger map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Map Controls: Floating Bottom-Right */}
          <div className="absolute right-3 bottom-4 z-[500] flex flex-col gap-2">
            {/* Layer switcher (if enabled) */}
            {location.enableSatelliteToggle !== false && (
              <button
                onClick={toggleMapStyle}
                className="px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-md text-slate-800 text-xs font-semibold shadow-lg border border-slate-200 hover:bg-white hover:text-blue-600 transition-all flex items-center gap-1.5 cursor-pointer"
                title={mapStyle === "streets" ? "Switch to Satellite View" : "Switch to Clean Street Map"}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">
                  {mapStyle === "streets" ? "Satellite" : "Map"}
                </span>
              </button>
            )}

            {/* Recenter button */}
            <button
              onClick={handleRecenter}
              className="p-2 rounded-lg bg-white/95 backdrop-blur-md text-slate-800 shadow-lg border border-slate-200 hover:bg-white hover:text-red-600 transition-all cursor-pointer"
              title="Recenter map on College Location"
              aria-label="Recenter map on College Location"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Zoom In & Out */}
            <div className="flex flex-col rounded-lg bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 overflow-hidden">
              <button
                onClick={handleZoomIn}
                className="p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors border-b border-slate-200 font-bold text-base leading-none cursor-pointer"
                title="Zoom In"
                aria-label="Zoom In"
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors font-bold text-base leading-none cursor-pointer"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                −
              </button>
            </div>
          </div>
        </motion.div>

        {/* Clean Contact / Location Area Below the Map */}
        <Reveal>
          <div className="mt-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8 lg:p-10 backdrop-blur-md">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Visit Our Campus info */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-light text-xs font-semibold uppercase tracking-widest mb-3">
                  <Compass className="w-3.5 h-3.5 text-gold" />
                  Campus Experience
                </div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white mb-2 text-shadow-subtle">
                  {location.visitTitle || "Visit Our Campus"}
                </h3>
                <p className="text-white/95 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl font-sans font-medium text-shadow-subtle">
                  {location.visitDescription || "“We welcome you to visit our campus and experience our learning environment.”"}
                </p>

                {/* Transit & Commute Quick Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: location.transit1Label, dist: location.transit1Distance, icon: Train },
                    { label: location.transit2Label, dist: location.transit2Distance, icon: Plane },
                    { label: location.transit3Label, dist: location.transit3Distance, icon: Car },
                  ].filter(t => Boolean(t.label)).map((item, idx) => {
                    const TransitIcon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{
                          duration: 0.5,
                          delay: shouldReduceMotion ? 0 : 0.15 + idx * 0.1,
                          ease: "easeOut",
                        }}
                        whileHover={shouldReduceMotion ? {} : { y: -3 }}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 border border-white/20 transition-colors hover:border-white/40 hover:bg-white/15"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/30 text-emerald-200 flex items-center justify-center shrink-0">
                          <TransitIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] text-emerald-200 uppercase font-bold">
                            {item.label}
                          </div>
                          <div className="text-xs font-bold text-white">
                            {item.dist}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Action Buttons */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col justify-center items-stretch sm:items-center lg:items-end gap-3.5">
                <a
                  href={effectiveDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#14532D] font-bold text-sm tracking-wide shadow-lg hover:bg-emerald-50 hover:scale-[1.02] active:scale-[0.98] transition-all text-center w-full sm:w-auto lg:w-64"
                >
                  <Navigation className="w-4 h-4 text-[#14532D]" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                <button
                  onClick={onContactClick}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 hover:border-white/40 transition-all text-center w-full sm:w-auto lg:w-64 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-300" />
                  <span>Contact Us</span>
                </button>

                <p className="text-[11px] text-white/80 text-center lg:text-right mt-1 w-full lg:w-64 font-normal">
                  {location.tourNotice || "Campus tours available Mon–Sat (9 AM – 4:30 PM). Advance booking recommended."}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
