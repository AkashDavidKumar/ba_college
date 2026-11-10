"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { View, viewToPath, pathToView } from "@/lib/routing";

// Re-export types and utilities for seamless backward-compatibility
export type { View };
export { viewToPath, pathToView };

export type NavContextValue = {
  view: View;
  navigate: (view: View, replace?: boolean) => void;
  goHome: () => void;
  goDepartment: (slug: string, section?: string) => void;
  goEvents: () => void;
  goAdmissions: () => void;
  goAbout: (section?: string) => void;
  goAcademic: (section?: string) => void;
  goCourses: (section?: string) => void;
  goStudentActivities: (section?: string) => void;
  goIqac: (section?: string) => void;
  goExamination: (section?: string) => void;
  goAutonomous: (section?: string) => void;
  goLibrary: (section?: string) => void;
  goNirf: () => void;
  goAlumni: (section?: string) => void;
  goContact: () => void;
  goFacilities: () => void;
  goGallery: () => void;
  goPlacements: () => void;
  goNews: () => void;
  goClubs: (slug?: string, section?: string) => void;
  goNotices: () => void;
};

const NavContext = createContext<NavContextValue | null>(null);

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}

export function NavProvider({ children }: { children: ReactNode }) {
  // Initialize view from browser location when available
  const [view, setView] = useState<View>(() => {
    if (typeof window !== "undefined") {
      const initialPath = window.location.pathname;
      // If currently on admin routes, default view to home for public components
      if (initialPath.startsWith("/admin")) {
        return { type: "home" };
      }
      return pathToView(initialPath, window.location.hash);
    }
    return { type: "home" };
  });

  const navigate = useCallback((v: View, replace = false) => {
    setView(v);
    if (typeof window !== "undefined") {
      const targetPath = viewToPath(v);
      const currentPath = window.location.pathname + window.location.hash;

      if (targetPath !== currentPath && !window.location.pathname.startsWith("/admin")) {
        if (replace) {
          window.history.replaceState({ view: v }, "", targetPath);
        } else {
          window.history.pushState({ view: v }, "", targetPath);
        }
      }

      const sec = (v as any).section;
      if (!sec) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, []);

  // Sync state on browser back/forward buttons (popstate)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/admin")) return;
      const v = pathToView(currentPath, window.location.hash);
      setView(v);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const goHome                = useCallback(() => navigate({ type: "home" }), [navigate]);
  const goDepartment          = useCallback((slug: string, section?: string) => navigate({ type: "department", slug, section }), [navigate]);
  const goEvents              = useCallback(() => navigate({ type: "events" }), [navigate]);
  const goAdmissions          = useCallback(() => navigate({ type: "admissions" }), [navigate]);
  const goAbout               = useCallback((section?: string) => navigate({ type: "about", section }), [navigate]);
  const goAcademic            = useCallback((section?: string) => navigate({ type: "academic", section }), [navigate]);
  const goCourses             = useCallback((section?: string) => navigate({ type: "courses", section }), [navigate]);
  const goStudentActivities   = useCallback((section?: string) => navigate({ type: "student-activities", section }), [navigate]);
  const goIqac                = useCallback((section?: string) => navigate({ type: "iqac", section }), [navigate]);
  const goExamination         = useCallback((section?: string) => navigate({ type: "examination", section }), [navigate]);
  const goAutonomous          = useCallback((section?: string) => navigate({ type: "autonomous", section }), [navigate]);
  const goLibrary             = useCallback((section?: string) => navigate({ type: "library", section }), [navigate]);
  const goNirf                = useCallback(() => navigate({ type: "nirf" }), [navigate]);
  const goAlumni              = useCallback((section?: string) => navigate({ type: "alumni", section }), [navigate]);
  const goContact             = useCallback(() => navigate({ type: "contact" }), [navigate]);
  const goFacilities          = useCallback(() => navigate({ type: "facilities" }), [navigate]);
  const goGallery             = useCallback(() => navigate({ type: "gallery" }), [navigate]);
  const goPlacements          = useCallback(() => navigate({ type: "placements" }), [navigate]);
  const goNews                = useCallback(() => navigate({ type: "news" }), [navigate]);
  const goClubs               = useCallback((slug?: string, section?: string) => navigate({ type: "clubs", slug, section }), [navigate]);
  const goNotices             = useCallback(() => navigate({ type: "notices" }), [navigate]);

  // Smooth-scroll to section when navigating with a section target
  useEffect(() => {
    const v = view as any;
    if (v.section) {
      const t = setTimeout(() => {
        const el = document.getElementById(v.section);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
      return () => clearTimeout(t);
    }
  }, [view]);

  return (
    <NavContext.Provider value={{
      view, navigate, goHome, goDepartment, goEvents, goAdmissions,
      goAbout, goAcademic, goCourses, goStudentActivities, goIqac, goExamination,
      goAutonomous, goLibrary, goNirf, goAlumni, goContact,
      goFacilities, goGallery, goPlacements, goNews, goClubs, goNotices,
    }}>
      {children}
    </NavContext.Provider>
  );
}
