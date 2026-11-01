"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

// ─── View types ───────────────────────────────────────────────────────────────

export type View =
  | { type: "home" }
  | { type: "department"; slug: string; section?: string }
  | { type: "events" }
  | { type: "admissions" }
  | { type: "about"; section?: string }
  | { type: "academic"; section?: string }
  | { type: "student-activities"; section?: string }
  | { type: "iqac"; section?: string }
  | { type: "examination"; section?: string }
  | { type: "autonomous"; section?: string }
  | { type: "library"; section?: string }
  | { type: "nirf" }
  | { type: "alumni"; section?: string }
  | { type: "contact" }
  | { type: "facilities" }
  | { type: "gallery" }
  | { type: "placements" }
  | { type: "news" };

type NavContextValue = {
  view: View;
  navigate: (view: View) => void;
  goHome: () => void;
  goDepartment: (slug: string, section?: string) => void;
  goEvents: () => void;
  goAdmissions: () => void;
  goAbout: (section?: string) => void;
  goAcademic: (section?: string) => void;
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
};

const NavContext = createContext<NavContextValue | null>(null);

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>({ type: "home" });

  const navigate = useCallback((v: View) => {
    setView(v);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const goHome                = useCallback(() => navigate({ type: "home" }), [navigate]);
  const goDepartment          = useCallback((slug: string, section?: string) => navigate({ type: "department", slug, section }), [navigate]);
  const goEvents              = useCallback(() => navigate({ type: "events" }), [navigate]);
  const goAdmissions          = useCallback(() => navigate({ type: "admissions" }), [navigate]);
  const goAbout               = useCallback((section?: string) => navigate({ type: "about", section }), [navigate]);
  const goAcademic            = useCallback((section?: string) => navigate({ type: "academic", section }), [navigate]);
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
      goAbout, goAcademic, goStudentActivities, goIqac, goExamination,
      goAutonomous, goLibrary, goNirf, goAlumni, goContact,
      goFacilities, goGallery, goPlacements, goNews,
    }}>
      {children}
    </NavContext.Provider>
  );
}
