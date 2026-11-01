"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminDashboardLayout } from "@/components/admin/admin-layout";
import { NavState } from "@/components/admin/admin-nav";

// ── Master Dashboard Overview ────────────────────────────────────────────────
import { DashboardOverview } from "@/components/admin/modules/dashboard-overview";

// ── Website Management Suite ─────────────────────────────────────────────────
import { HomepageCMS } from "@/components/admin/modules/website/homepage-cms";
import { NewsEventsCMS } from "@/components/admin/modules/website/news-events-cms";
import { AdvertisementsCMS } from "@/components/admin/modules/website/advertisements-cms";
import { PageBuilderCMS } from "@/components/admin/modules/website/page-builder-cms";
import { MenuBuilderCMS } from "@/components/admin/modules/website/menu-builder-cms";
import { MediaLibraryCMS } from "@/components/admin/modules/website/media-library-cms";
import { DocumentCenterCMS } from "@/components/admin/modules/website/document-center-cms";
import { SEOManagerCMS } from "@/components/admin/modules/website/seo-manager-cms";
import { WebsiteSettingsCMS } from "@/components/admin/modules/website/website-settings-cms";

// ── Academics Suite ──────────────────────────────────────────────────────────
import { DepartmentsCMS } from "@/components/admin/modules/academics/departments-cms";
import { CoursesCMS } from "@/components/admin/modules/academics/courses-cms";
import { FacultyCMS } from "@/components/admin/modules/academics/faculty-cms";
import { AcademicCalendarCMS } from "@/components/admin/modules/academics/calendar-cms";
import { CurriculumCMS } from "@/components/admin/modules/academics/curriculum-cms";

// ── Admissions Suite ─────────────────────────────────────────────────────────
import { ApplicationsCMS } from "@/components/admin/modules/admissions/applications-cms";
import { AdmissionInfoCMS } from "@/components/admin/modules/admissions/admission-info-cms";
import { ScholarshipsCMS } from "@/components/admin/modules/admissions/scholarships-cms";

// ── Student Life Suite ───────────────────────────────────────────────────────
import { ClubsCMS } from "@/components/admin/modules/student-life/clubs-cms";
import { AssociationsCMS } from "@/components/admin/modules/student-life/associations-cms";
import { SportsArtsCMS } from "@/components/admin/modules/student-life/sports-arts-cms";

// ── Content & Communications Suite ───────────────────────────────────────────
import { EventsCMS } from "@/components/admin/modules/content/events-cms";
import { NewsCMS } from "@/components/admin/modules/content/news-cms";
import { NoticesCMS } from "@/components/admin/modules/content/notices-cms";
import { AchievementsCMS } from "@/components/admin/modules/content/achievements-cms";

// ── IQAC & NAAC Suite ────────────────────────────────────────────────────────
import { IQACCoreCMS } from "@/components/admin/modules/iqac/iqac-core-cms";
import { AQARSSRCMS } from "@/components/admin/modules/iqac/aqar-ssr-cms";

// ── Examination & Autonomous COE ─────────────────────────────────────────────
import { ExamSchedulesCMS } from "@/components/admin/modules/examination/exam-schedules-cms";
import { ExamRegulationsCMS } from "@/components/admin/modules/examination/exam-regulations-cms";

// ── Autonomous Statutory Governance ──────────────────────────────────────────
import { StatutoryBodiesCMS } from "@/components/admin/modules/autonomous/statutory-bodies-cms";
import { AutonomyRegsCMS } from "@/components/admin/modules/autonomous/autonomy-regs-cms";

// ── Institutional Services ───────────────────────────────────────────────────
import { LibraryCMS } from "@/components/admin/modules/services/library-cms";
import { FacilitiesCMS } from "@/components/admin/modules/services/facilities-cms";
import { PlacementCellCMS } from "@/components/admin/modules/services/placement-cell-cms";
import { AlumniCMS } from "@/components/admin/modules/services/alumni-cms";
import { EnquiriesCMS } from "@/components/admin/modules/services/enquiries-cms";

// ── System Administration & Security ─────────────────────────────────────────
import { UsersCMS } from "@/components/admin/modules/admin/users-cms";
import { RolesPermsCMS } from "@/components/admin/modules/admin/roles-perms-cms";
import { ApprovalsCMS } from "@/components/admin/modules/admin/approvals-cms";
import { AuditLogsCMS } from "@/components/admin/modules/admin/audit-logs-cms";

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialNav = (): NavState => {
    const pageParam = searchParams.get("page") || "overview";
    const sectionParam = searchParams.get("section") || (pageParam === "news-events" || pageParam.startsWith("ne-") ? "ne-dashboard" : "");
    const groupParam = searchParams.get("group") || (pageParam === "news-events" || pageParam.startsWith("ne-") ? "website" : "dashboard");
    return {
      group: groupParam,
      page: pageParam,
      section: sectionParam,
    };
  };

  const [nav, setNavState] = useState<NavState>(getInitialNav);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const sectionParam = searchParams.get("section");
    const groupParam = searchParams.get("group");
    if (pageParam && (pageParam !== nav.page || (sectionParam && sectionParam !== nav.section))) {
      setNavState({
        group: groupParam || (pageParam === "news-events" || pageParam.startsWith("ne-") ? "website" : "dashboard"),
        page: pageParam,
        section: sectionParam || (pageParam === "news-events" ? "ne-dashboard" : ""),
      });
    }
  }, [searchParams]);

  const setNav = (newNav: NavState) => {
    setNavState(newNav);
    const params = new URLSearchParams();
    if (newNav.group) params.set("group", newNav.group);
    if (newNav.page) params.set("page", newNav.page);
    if (newNav.section) params.set("section", newNav.section);
    setSearchParams(params, { replace: true });
  };

  const handleNavigateTab = (tab: string) => setNav({ group: "", page: tab, section: "" });
  const p = nav.page;

  return (
    <AdminDashboardLayout nav={nav} setNav={setNav}>
      {/* ── 1. DASHBOARD ──────────────────────────────────────────────────── */}
      {(p === "overview" || p === "dashboard") && (
        <DashboardOverview onNavigateTab={handleNavigateTab} />
      )}

      {/* ── 2. WEBSITE ────────────────────────────────────────────────────── */}
      {p === "home"          && <HomepageCMS />}
      {(p === "news-events" || p.startsWith("ne-")) && (
        <NewsEventsCMS
          activeSubPage={nav.section || (p.startsWith("ne-") ? p : "ne-dashboard")}
          onSubPageChange={(sub) => setNav({ group: "website", page: "news-events", section: sub })}
        />
      )}
      {p === "advertisements" && <AdvertisementsCMS />}
      {p === "pages"         && <PageBuilderCMS />}
      {p === "menus"         && <MenuBuilderCMS />}
      {p === "media"         && <MediaLibraryCMS />}
      {p === "documents"     && <DocumentCenterCMS />}
      {p === "seo"           && <SEOManagerCMS />}
      {(p === "site-settings" || p === "settings") && <WebsiteSettingsCMS />}

      {/* ── 3. ACADEMIC ───────────────────────────────────────────────────── */}
      {p === "departments"       && <DepartmentsCMS />}
      {p === "courses"           && <CoursesCMS />}
      {p === "faculty"           && <FacultyCMS />}
      {p === "academic-calendar" && <AcademicCalendarCMS />}
      {p === "curriculum"        && <CurriculumCMS />}

      {/* ── 4. ADMISSIONS ─────────────────────────────────────────────────── */}
      {(p === "admissions" || p === "admissions-apps") && <ApplicationsCMS />}
      {(p === "admission-info" || p === "admission-forms") && <AdmissionInfoCMS />}
      {p === "scholarships"    && <ScholarshipsCMS />}

      {/* ── 5. STUDENT LIFE ───────────────────────────────────────────────── */}
      {p === "clubs"                && <ClubsCMS />}
      {p === "associations"         && <AssociationsCMS />}
      {(p === "sports" || p === "fine-arts" || p === "student-activities" || p === "student-achievements") && (
        <SportsArtsCMS />
      )}

      {/* ── 6. CONTENT & NOTICES ──────────────────────────────────────────── */}
      {p === "events"        && <EventsCMS />}
      {p === "news"          && <NewsCMS />}
      {(p === "announcements" || p === "notices") && <NoticesCMS />}
      {p === "achievements"  && <AchievementsCMS />}

      {/* ── 7. IQAC & ACCREDITATION ───────────────────────────────────────── */}
      {(p === "iqac" || p === "quality-init" || p === "best-practices" || p === "iqac-docs") && (
        <IQACCoreCMS />
      )}
      {(p === "aqar" || p === "ssr") && <AQARSSRCMS />}

      {/* ── 8. EXAMINATION (COE) ──────────────────────────────────────────── */}
      {(p === "exam-notifications" || p === "timetable" || p === "results" || p === "circulars") && (
        <ExamSchedulesCMS />
      )}
      {p === "exam-regulations" && <ExamRegulationsCMS />}

      {/* ── 9. AUTONOMOUS ─────────────────────────────────────────────────── */}
      {(p === "academic-council" || p === "board-of-studies" || p === "auto-docs") && (
        <StatutoryBodiesCMS />
      )}
      {p === "autonomous-regs" && <AutonomyRegsCMS />}

      {/* ── 10. LIBRARY ───────────────────────────────────────────────────── */}
      {(p === "library-info" || p === "digital-library" || p === "e-resources" || p === "library-docs") && (
        <LibraryCMS />
      )}

      {/* ── 11. FACILITIES ────────────────────────────────────────────────── */}
      {(p === "facilities" || p === "gallery") && <FacilitiesCMS />}

      {/* ── 12. PLACEMENT ─────────────────────────────────────────────────── */}
      {(p === "placements" || p === "companies" || p === "drives" || p === "placement-stats") && (
        <PlacementCellCMS />
      )}

      {/* ── 13. ALUMNI ────────────────────────────────────────────────────── */}
      {(p === "alumni" || p === "alumni-mgmt" || p === "alumni-directory" || p === "alumni-events") && (
        <AlumniCMS />
      )}

      {/* ── 14. COMMUNICATION ─────────────────────────────────────────────── */}
      {(p === "contact" || p === "admin-notifications") && <EnquiriesCMS />}

      {/* ── 15. SYSTEM ADMINISTRATION ─────────────────────────────────────── */}
      {(p === "users" || p === "users-roles") && <UsersCMS />}
      {(p === "roles" || p === "permissions") && <RolesPermsCMS />}
      {p === "approvals"   && <ApprovalsCMS />}
      {p === "audit-logs"  && <AuditLogsCMS />}
    </AdminDashboardLayout>
  );
}
