import React, { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNav } from "@/components/site/nav-context";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { Departments } from "@/components/home/departments";
import {
  ResearchInnovation,
  Placements,
  StudentLife,
  SuccessStories,
  HomeCta,
  WhyChooseUs,
  CampusFacilities,
} from "@/components/home/sections";
import { NewsEventsSection } from "@/components/home/news-events";

// Lazy-load inner public pages so the homepage bundle stays ultra-compact
const DepartmentDetail = lazy(() => import("@/components/department/department-detail").then((m) => ({ default: m.DepartmentDetail })));
const EventsPage = lazy(() => import("@/components/events/events-page").then((m) => ({ default: m.EventsPage })));
const AdmissionsPage = lazy(() => import("@/components/erp/admissions-page").then((m) => ({ default: m.AdmissionsPage })));
const AboutPage = lazy(() => import("@/components/public/about-page").then((m) => ({ default: m.AboutPage })));
const AcademicPage = lazy(() => import("@/components/public/academic-page").then((m) => ({ default: m.AcademicPage })));
const StudentActivitiesPage = lazy(() => import("@/components/public/student-activities-page").then((m) => ({ default: m.StudentActivitiesPage })));
const IqacPublicPage = lazy(() => import("@/components/public/iqac-public-page").then((m) => ({ default: m.IqacPublicPage })));
const ExaminationPage = lazy(() => import("@/components/public/examination-page").then((m) => ({ default: m.ExaminationPage })));
const AutonomousPage = lazy(() => import("@/components/public/autonomous-page").then((m) => ({ default: m.AutonomousPage })));
const LibraryPage = lazy(() => import("@/components/public/library-page").then((m) => ({ default: m.LibraryPage })));
const NirfPage = lazy(() => import("@/components/public/nirf-page").then((m) => ({ default: m.NirfPage })));
const AlumniPage = lazy(() => import("@/components/public/alumni-page").then((m) => ({ default: m.AlumniPage })));
const ContactPage = lazy(() => import("@/components/public/contact-page").then((m) => ({ default: m.ContactPage })));
const FacilitiesPage = lazy(() => import("@/components/public/facilities-page").then((m) => ({ default: m.FacilitiesPage })));
const GalleryPage = lazy(() => import("@/components/public/gallery-page").then((m) => ({ default: m.GalleryPage })));
const PlacementsPage = lazy(() => import("@/components/public/placements-page").then((m) => ({ default: m.PlacementsPage })));
const NewsPage = lazy(() => import("@/components/public/news-page").then((m) => ({ default: m.NewsPage })));
import { NotFoundPage }        from "@/components/public/not-found-page";

import { AdvertisementPopup } from "@/components/public/advertisement-popup";

function PageLoadingFallback() {
  return (
    <div className="py-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const { view } = useNav();

  const key =
    view.type === "department"
      ? `dept-${view.slug}-${(view as any).section ?? ""}`
      : view.type === "about"
      ? `about-${(view as any).section ?? ""}`
      : view.type === "not-found"
      ? `not-found-${(view as any).path ?? ""}`
      : view.type;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdvertisementPopup />
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* ── HOME ─────────────────────────────────────────────── */}
            {view.type === "home" && (
              <>
                <Hero />
                <WhyChooseUs />
                <NewsEventsSection />
                <About />
                <Departments />
                <CampusFacilities />
                <Placements />
                <StudentLife />
                <SuccessStories />
                <HomeCta />
              </>
            )}

            {/* ── INNER PAGES (Suspense Lazy-Loaded) ──────────────── */}
            <Suspense fallback={<PageLoadingFallback />}>
              {view.type === "department"        && <DepartmentDetail slug={view.slug} section={(view as any).section} />}
              {view.type === "events"            && <EventsPage />}
              {view.type === "admissions"        && <AdmissionsPage />}
              {view.type === "about"             && <AboutPage section={(view as any).section} />}
              {view.type === "academic"          && <AcademicPage section={(view as any).section} />}
              {view.type === "courses"           && <AcademicPage section={(view as any).section || "courses"} />}
              {view.type === "student-activities"&& <StudentActivitiesPage section={(view as any).section} />}
              {view.type === "clubs"             && <StudentActivitiesPage section={(view as any).section || "clubs"} />}
              {view.type === "iqac"              && <IqacPublicPage section={(view as any).section} />}
              {view.type === "examination"       && <ExaminationPage />}
              {view.type === "autonomous"        && <AutonomousPage />}
              {view.type === "library"           && <LibraryPage />}
              {view.type === "nirf"              && <NirfPage />}
              {view.type === "alumni"            && <AlumniPage section={(view as any).section} />}
              {view.type === "contact"           && <ContactPage />}
              {view.type === "facilities"        && <FacilitiesPage />}
              {view.type === "gallery"           && <GalleryPage />}
              {view.type === "placements"        && <PlacementsPage />}
              {view.type === "news"              && <NewsPage />}
              {view.type === "notices"           && <NewsPage />}
              {view.type === "not-found"         && <NotFoundPage path={(view as any).path} />}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return <AppContent />;
}
