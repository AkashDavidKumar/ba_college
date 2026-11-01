import { AnimatePresence, motion } from "framer-motion";
import { NavProvider, useNav } from "@/components/site/nav-context";
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
import { DepartmentDetail } from "@/components/department/department-detail";
import { EventsPage } from "@/components/events/events-page";
import { AdmissionsPage } from "@/components/erp/admissions-page";

// All BAC pages
import { AboutPage }           from "@/components/public/about-page";
import { AcademicPage }        from "@/components/public/academic-page";
import { StudentActivitiesPage }from "@/components/public/student-activities-page";
import { IqacPublicPage }      from "@/components/public/iqac-public-page";
import { ExaminationPage }     from "@/components/public/examination-page";
import { AutonomousPage }      from "@/components/public/autonomous-page";
import { LibraryPage }         from "@/components/public/library-page";
import { NirfPage }            from "@/components/public/nirf-page";
import { AlumniPage }          from "@/components/public/alumni-page";
import { ContactPage }         from "@/components/public/contact-page";
import { FacilitiesPage }      from "@/components/public/facilities-page";
import { GalleryPage }         from "@/components/public/gallery-page";
import { PlacementsPage }      from "@/components/public/placements-page";
import { NewsPage }            from "@/components/public/news-page";

import { AdvertisementPopup } from "@/components/public/advertisement-popup";

function AppContent() {
  const { view } = useNav();

  const key =
    view.type === "department"
      ? `dept-${view.slug}-${(view as any).section ?? ""}`
      : view.type === "about"
      ? `about-${(view as any).section ?? ""}`
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

            {/* ── INNER PAGES ──────────────────────────────────────── */}
            {view.type === "department"        && <DepartmentDetail slug={view.slug} section={(view as any).section} />}
            {view.type === "events"            && <EventsPage />}
            {view.type === "admissions"        && <AdmissionsPage />}
            {view.type === "about"             && <AboutPage section={(view as any).section} />}
            {view.type === "academic"          && <AcademicPage section={(view as any).section} />}
            {view.type === "student-activities"&& <StudentActivitiesPage section={(view as any).section} />}
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
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <NavProvider>
      <AppContent />
    </NavProvider>
  );
}
