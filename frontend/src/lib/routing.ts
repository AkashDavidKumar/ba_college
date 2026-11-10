/**
 * routing.ts — Pure URL and View Route Synchronization Engine
 *
 * Implements bidirectional mapping between browser URL paths (with optional hash
 * fragments) and application View state, with strict normalization and fallback
 * handling for unknown routes.
 */

export type View =
  | { type: "home" }
  | { type: "department"; slug: string; section?: string }
  | { type: "events" }
  | { type: "admissions" }
  | { type: "about"; section?: string }
  | { type: "academic"; section?: string }
  | { type: "courses"; section?: string }
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
  | { type: "news" }
  | { type: "clubs"; slug?: string; section?: string }
  | { type: "notices" }
  | { type: "not-found"; path?: string };

/**
 * Maps a View state to its canonical URL path and hash fragment.
 */
export function viewToPath(view: View): string {
  switch (view.type) {
    case "home":
      return "/";
    case "about":
      return view.section ? `/about#${view.section}` : "/about";
    case "department":
      return view.section ? `/departments/${view.slug}#${view.section}` : `/departments/${view.slug}`;
    case "events":
      return "/events";
    case "admissions":
      return "/admissions";
    case "academic":
      return view.section ? `/academic/${view.section}` : "/academic";
    case "courses":
      return view.section ? `/courses#${view.section}` : "/courses";
    case "student-activities":
      return view.section ? `/student-activities/${view.section}` : "/student-activities";
    case "iqac":
      return view.section ? `/iqac#${view.section}` : "/iqac";
    case "examination":
      return view.section ? `/examination#${view.section}` : "/examination";
    case "autonomous":
      return view.section ? `/autonomous#${view.section}` : "/autonomous";
    case "library":
      return view.section ? `/library#${view.section}` : "/library";
    case "nirf":
      return "/nirf";
    case "alumni":
      return view.section ? `/alumni#${view.section}` : "/alumni";
    case "contact":
      return "/contact";
    case "facilities":
      return "/facilities";
    case "gallery":
      return "/gallery";
    case "placements":
      return "/placements";
    case "news":
      return "/news";
    case "clubs":
      return view.slug ? `/clubs/${view.slug}` : "/clubs";
    case "notices":
      return "/notices";
    case "not-found":
      return view.path || "/404";
    default:
      return "/";
  }
}

/**
 * Parses a browser URL pathname and hash into the matching application View.
 */
export function pathToView(pathname: string, hash = ""): View {
  const cleanPath = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const section = hash ? hash.replace(/^#/, "") : undefined;

  // Root or /home
  if (cleanPath === "" || cleanPath === "/" || cleanPath === "/home") {
    return { type: "home" };
  }

  // /about
  if (cleanPath === "/about") {
    return { type: "about", section };
  }

  // /departments and /departments/:slug
  if (cleanPath === "/departments") {
    return { type: "academic", section: "departments" };
  }
  const deptMatch = cleanPath.match(/^\/departments\/([a-zA-Z0-9_-]+)$/);
  if (deptMatch) {
    return { type: "department", slug: deptMatch[1], section };
  }

  // /courses
  if (cleanPath === "/courses") {
    return { type: "courses", section: section || "courses" };
  }

  // /academic and /academic/:section
  if (cleanPath === "/academic") {
    return { type: "academic", section };
  }
  const academicMatch = cleanPath.match(/^\/academic\/([a-zA-Z0-9_-]+)$/);
  if (academicMatch) {
    return { type: "academic", section: academicMatch[1] };
  }

  // /admissions
  if (cleanPath === "/admissions") {
    return { type: "admissions" };
  }

  // /events
  if (cleanPath === "/events") {
    return { type: "events" };
  }

  // /news
  if (cleanPath === "/news") {
    return { type: "news" };
  }

  // /notices
  if (cleanPath === "/notices") {
    return { type: "notices" };
  }

  // /examination and /examinations
  if (cleanPath === "/examination" || cleanPath === "/examinations") {
    return { type: "examination", section };
  }

  // /iqac
  if (cleanPath === "/iqac") {
    return { type: "iqac", section };
  }

  // /autonomous
  if (cleanPath === "/autonomous") {
    return { type: "autonomous", section };
  }

  // /library
  if (cleanPath === "/library") {
    return { type: "library", section };
  }

  // /nirf
  if (cleanPath === "/nirf") {
    return { type: "nirf" };
  }

  // /alumni
  if (cleanPath === "/alumni") {
    return { type: "alumni", section };
  }

  // /contact
  if (cleanPath === "/contact") {
    return { type: "contact" };
  }

  // /facilities
  if (cleanPath === "/facilities") {
    return { type: "facilities" };
  }

  // /gallery
  if (cleanPath === "/gallery") {
    return { type: "gallery" };
  }

  // /placements
  if (cleanPath === "/placements") {
    return { type: "placements" };
  }

  // /clubs and /clubs/:slug
  if (cleanPath === "/clubs") {
    return { type: "clubs", section: "clubs" };
  }
  const clubMatch = cleanPath.match(/^\/clubs\/([a-zA-Z0-9_-]+)$/);
  if (clubMatch) {
    return { type: "clubs", slug: clubMatch[1], section: "clubs" };
  }

  // /student-activities and /student-activities/:section
  if (cleanPath === "/student-activities") {
    return { type: "student-activities", section };
  }
  const saMatch = cleanPath.match(/^\/student-activities\/([a-zA-Z0-9_-]+)$/);
  if (saMatch) {
    return { type: "student-activities", section: saMatch[1] };
  }

  // Unknown route
  return { type: "not-found", path: cleanPath };
}
