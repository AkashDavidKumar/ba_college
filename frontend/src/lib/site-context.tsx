"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Department, UniversityEvent } from "./university-data";
import * as mockUniversityData from "./university-data";
import { apiClient } from "./api-client";

type HeroContent = {
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  virtualTourUrl: string;
};

export type HeroSectionConfig = {
  backgroundVideo: string;
  fallbackImage: string;
  blurIntensity: number;
  overlayOpacity: number;
  enabled: boolean;
};

export const defaultHeroSectionConfig: HeroSectionConfig = {
  backgroundVideo: "https://assets.mixkit.co/videos/preview/mixkit-university-campus-with-students-walking-around-4340-large.mp4",
  fallbackImage: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80",
  blurIntensity: 80,
  overlayOpacity: 75,
  enabled: true
};

export type VirtualTourMediaType = "youtube" | "mp4" | "iframe";

export type VirtualTourConfig = {
  enabled: boolean;
  mediaType: VirtualTourMediaType;
  mediaUrl: string;
  posterImage: string;
  heading: string;
  subheading: string;
  campusName: string;
  campusDescription: string;
  showStats: boolean;
  ctaLabel: string;
};

export const defaultVirtualTourConfig: VirtualTourConfig = {
  enabled: true,
  mediaType: "youtube",
  mediaUrl: "https://www.youtube.com/embed/91tSZsX0Bjg",
  posterImage: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80",
  heading: "Experience Our Campus",
  subheading: "Take an immersive virtual tour of BAC Global University",
  campusName: "Knowledge City Main Campus",
  campusDescription: "200 Acres of Innovation, Labs & Learning",
  showStats: true,
  ctaLabel: "Schedule On-Campus Visit"
};

type AboutContent = {
  title: string;
  text1: string;
  text2: string;
  stats: { label: string; value: string }[];
};

export type FooterSection = {
  title: string;
  links: string[];
  isDepartment?: boolean;
};

export const defaultFooterSections: FooterSection[] = [
  {
    title: "University Information",
    links: ["About BAC", "Leadership", "Vision & Mission", "Accreditations", "Campus Map", "Careers at BAC", "Sustainability"],
  },
  {
    title: "Departments",
    links: ["Computer Science", "AI & Data Science", "Commerce & Management", "Biotechnology", "Psychology", "Visual Communication", "Cyber Security"],
    isDepartment: true,
  },
  {
    title: "Admissions",
    links: ["Apply Now", "Programs & Eligibility", "Scholarships", "Fee Structure", "Application Status", "Document Checklist", "Campus Visit"],
  },
  {
    title: "Student Resources",
    links: ["Student ERP", "Learning Portal", "Library", "Hostels & Dining", "Wellness Center", "Sports Complex", "Career Studio"],
  },
  {
    title: "Research",
    links: ["Research Centers", "Publications", "Patents", "Industry Partners", "Ph.D. Admissions", "Research Grants", "Conferences"],
  },
  {
    title: "Campus Life",
    links: ["Student Clubs", "Cultural Festivals", "Sports", "Hostels", "Wellness", "Makerspace", "Spiritual Life"],
  },
  {
    title: "Placements",
    links: ["Placement Report 2025", "Top Recruiters", "Internship Program", "Career Studio", "Alumni Network", "Mentorship", "Startup Incubator"],
  },
  {
    title: "Events",
    links: ["Upcoming Events", "Hackathons", "Conferences", "Guest Lectures", "Cultural Festivals", "Sports Calendar", "Event Gallery"],
  },
];

export type FooterContent = {
  ctaBadge: string;
  ctaTitle: string;
  ctaDescription: string;
  aboutText: string;
  address: string;
  phone: string;
  email: string;
  infoEmail: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  sections?: FooterSection[];
};

export type HomepageStat = {
  id: string;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  order: number;
  visible: boolean;
};

export type HomepageStatistics = {
  sectionEnabled: boolean;
  badgeText: string;
  heading: string;
  description: string;
  statistics: HomepageStat[];
};

export const defaultHomepageStatistics: HomepageStatistics = {
  sectionEnabled: true,
  badgeText: "WHY CHOOSE BISHOP AMBROSE COLLEGE",
  heading: "Four Decades of Academic Excellence",
  description: "Empowering students through quality education, exceptional faculty, and outstanding career outcomes in the heart of Coimbatore.",
  statistics: [
    { id: "stat-1", value: 32, label: "Years of Excellence", prefix: "", suffix: "+", order: 1, visible: true },
    { id: "stat-2", value: 5000, label: "Students Enrolled", prefix: "", suffix: "+", order: 2, visible: true },
    { id: "stat-3", value: 12, label: "Programmes Offered", prefix: "", suffix: "", order: 3, visible: true },
    { id: "stat-4", value: 10, label: "Departments", prefix: "", suffix: "", order: 4, visible: true },
    { id: "stat-5", value: 90, label: "Placement Rate", prefix: "", suffix: "%", order: 5, visible: true }
  ]
};

export type AboutPageHero = {
  enabled: boolean;
  badgeText: string;
  heading: string;
  description: string;
};

export type AboutPageLegacy = {
  enabled: boolean;
  accentLabel?: string;
  heading: string;
  paragraphs: string[];
  image: {
    url: string;
    altText: string;
    caption?: string;
    badge?: string;
  };
};

export type AboutPageSection = {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  author?: string;
  role?: string;
  image?: string;
  enabled: boolean;
  order: number;
};

export type AboutPageData = {
  hero: AboutPageHero;
  legacy: AboutPageLegacy;
  additionalSections?: AboutPageSection[];
  updatedAt?: string;
};

export const defaultAboutPageData: AboutPageData = {
  hero: {
    enabled: true,
    badgeText: "ABOUT BISHOP AMBROSE COLLEGE",
    heading: "Empowering Minds, Enriching Lives in Coimbatore",
    description: "Established in 1994, Bishop Ambrose College is an Autonomous Institution affiliated to Bharathiar University, dedicated to providing quality education and holistic development to students of Coimbatore and beyond."
  },
  legacy: {
    enabled: true,
    accentLabel: "OUR STORY & HERITAGE",
    heading: "A Legacy of Quality Education & Service",
    paragraphs: [
      "Bishop Ambrose College, Coimbatore, was established in 1994 by the Diocese of Coimbatore under the visionary leadership of the late Bishop Rt. Rev. Gnanapragasam. Founded on the principles of Truth, Growth, Knowledge and Excellence, the college has consistently upheld the highest standards of academic quality and moral values.",
      "Affiliated to Bharathiar University, Coimbatore, and recognised by UGC under Section 2(f) and 12(B), the college was granted Autonomous status, a testament to its consistent academic performance and institutional integrity. The college is a co-educational institution offering undergraduate programmes across Science, Commerce, and Arts disciplines.",
      "Through dedicated faculty, modern infrastructure, and a student-centred approach, Bishop Ambrose College continues to produce graduates who are academically sound, professionally competent, and socially committed — ready to contribute meaningfully to society and the nation."
    ],
    image: {
      url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
      altText: "Bishop Ambrose College Coimbatore Campus",
      caption: "Sungam Bypass Road, Coimbatore",
      badge: "Autonomous Institution"
    }
  },
  additionalSections: [
    {
      id: "sec-principal",
      title: "Message from the Principal",
      subtitle: "Leadership & Vision",
      content: "At Bishop Ambrose College, we believe every student carries immense potential. Our mission is to create an environment that nurtures intellectual curiosity, builds character, and develops professional competence. We are committed to providing a holistic education that prepares students not just for careers, but for life.",
      author: "Dr. P. Samuel Manoharan",
      role: "Principal, Bishop Ambrose College",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
      enabled: true,
      order: 1
    },
    {
      id: "sec-vision-mission",
      title: "Vision & Mission",
      subtitle: "Institutional Benchmarks",
      content: "Vision: To be a centre of excellence in higher education that empowers individuals to lead purposeful lives and contribute to a just and sustainable society.\n\nMission: To provide quality education grounded in Christian values, nurture intellectual and personal growth, and develop socially responsible graduates.",
      image: "",
      enabled: true,
      order: 2
    }
  ],
  updatedAt: "2026-09-26T12:00:00.000Z"
};

export type NewsArticle = {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: "University News" | "Achievement" | "Announcement" | "Campus Life" | "Research";
  image: string;
  date: string;
  dateISO: string;
  author?: string;
  featured: boolean;
  published: boolean;
  readMoreUrl?: string;
};

export type NewsEventsConfig = {
  sectionEnabled: boolean;
  heading: string;
  subtitle: string;
  maxNewsVisible: number;
  maxEventsVisible: number;
  featuredArticleId?: string;
  showFeatured: boolean;
  showEvents: boolean;
  showNewsGrid: boolean;
  viewAllTarget?: "events" | "home";
};

export const defaultNewsEventsConfig: NewsEventsConfig = {
  sectionEnabled: true,
  heading: "News & Events",
  subtitle: "Stay updated with the latest news, events, achievements, and activities at BAC Global University.",
  maxNewsVisible: 6,
  maxEventsVisible: 3,
  showFeatured: true,
  showEvents: true,
  showNewsGrid: true,
  viewAllTarget: "events",
};

export type LocationConfig = {
  campusName: string;
  shortName: string;
  tagline: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  zoom: number;
  nearbyLandmark: string;
  googleMapsUrl: string;
  directionsUrl: string;
  embedUrl?: string;
  pinColor: string;
  pinLabel: string;
  pinPulse: boolean;
  sectionBadge: string;
  heading: string;
  statusText: string;
  statusBadge: string;
  phone: string;
  email: string;
  openingHours: string;
  enableSatelliteToggle: boolean;
  enableDirectionsButton: boolean;
  enableShareButton: boolean;
  enableSaveButton: boolean;
  rating: number;
  reviewsCount: number;
  visitTitle: string;
  visitDescription: string;
  tourNotice: string;
  transit1Label: string;
  transit1Distance: string;
  transit2Label: string;
  transit2Distance: string;
  transit3Label: string;
  transit3Distance: string;
};

export const defaultLocationConfig: LocationConfig = {
  campusName: "Bishop Ambrose College",
  shortName: "BAC",
  tagline: "Autonomous Institution · Affiliated to Bharathiar University · Co-Education",
  category: "Co-Educational College · Higher Education Institution",
  address: "56, Sungam Bypass Road, Sungam, Alwin Nagar, Coimbatore, Tamil Nadu – 641045",
  lat: 11.0128,
  lng: 77.0276,
  zoom: 16,
  nearbyLandmark: "Near Sungam Signal, Ramanathapuram",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bishop+Ambrose+College+Sungam+Bypass+Road+Coimbatore+Tamil+Nadu+641045",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Bishop+Ambrose+College+56+Sungam+Bypass+Road+Coimbatore+Tamil+Nadu+641045",
  embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.8!2d77.0276!3d11.0128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBishop+Ambrose+College!5e0!3m2!1sen!2sin!4v1",
  pinColor: "#14532D",
  pinLabel: "BAC Campus",
  pinPulse: true,
  sectionBadge: "Find Us & Campus Map",
  heading: "Our Campus Location",
  statusText: "Campus open for visitors & prospective students",
  statusBadge: "Open · Closes 5:00 PM",
  phone: "0422-2316731",
  email: "bishopambrosecollege1@gmail.com",
  openingHours: "Mon – Sat: 9:00 AM – 5:00 PM",
  enableSatelliteToggle: true,
  enableDirectionsButton: true,
  enableShareButton: true,
  enableSaveButton: true,
  rating: 4.4,
  reviewsCount: 312,
  visitTitle: "Visit Our Campus",
  visitDescription: "We warmly welcome prospective students and parents to visit our vibrant campus at Sungam Bypass Road, Coimbatore.",
  tourNotice: "Campus tours available Mon–Sat (9 AM – 4:30 PM). Contact the admissions office to schedule your visit.",
  transit1Label: "Coimbatore Jn",
  transit1Distance: "6.5 km (18 mins)",
  transit2Label: "Airport (CJB)",
  transit2Distance: "8.2 km (22 mins)",
  transit3Label: "Sungam Bus Stop",
  transit3Distance: "0.4 km (2 mins)",
};

type SiteData = {
  logo: { text1: string; text2: string; image: string };
  hero: HeroContent;
  announcements: string[];
  about: AboutContent;
  footer: FooterContent;
  departments: Department[];
  events: UniversityEvent[];
  guestSpeakers: any[];
  eventGallery: any[];
  erpModules: any;
  admissionsPortalFeatures: any[];
  statistics?: HomepageStatistics;
  aboutPage?: AboutPageData;
  heroSection?: HeroSectionConfig;
  virtualTour?: VirtualTourConfig;
  news?: NewsArticle[];
  newsConfig?: NewsEventsConfig;
  location?: LocationConfig;
};

type SiteContextValue = {
  data: SiteData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateGeneralSettings: (updates: Partial<{ logo: { text1: string; text2: string; image: string }; hero: HeroContent; announcements: string[]; about: AboutContent; footer: FooterContent; statistics?: HomepageStatistics; aboutPage?: AboutPageData; heroSection?: HeroSectionConfig; location?: LocationConfig }>) => Promise<boolean>;
  updateStatistics: (stats: HomepageStatistics) => Promise<boolean>;
  updateAboutPage: (aboutData: AboutPageData) => Promise<boolean>;
  updateHeroSection: (heroSection: HeroSectionConfig) => Promise<boolean>;
  updateVirtualTour: (virtualTour: VirtualTourConfig) => Promise<boolean>;
  updateLocation: (location: Partial<LocationConfig>) => Promise<boolean>;
  saveDepartment: (dept: Department, isNew: boolean) => Promise<boolean>;
  deleteDepartment: (slug: string) => Promise<boolean>;
  saveEvent: (eventData: any, isNew: boolean) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  saveSpeaker: (speakerData: any, isNew: boolean) => Promise<boolean>;
  deleteSpeaker: (name: string) => Promise<boolean>;
  saveGalleryItem: (itemData: any) => Promise<boolean>;
  deleteGalleryItem: (title: string) => Promise<boolean>;
  submitApplication: (app: { name: string; email: string; phone: string; program: string; gpa?: string; notes?: string }) => Promise<boolean>;
  resetAllData: () => Promise<boolean>;
  saveNewsArticle: (article: Partial<NewsArticle>, isNew: boolean) => Promise<boolean>;
  deleteNewsArticle: (id: string) => Promise<boolean>;
  updateNewsEventsConfig: (config: Partial<NewsEventsConfig>) => Promise<boolean>;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSiteData() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSiteData must be used within SiteDataProvider");
  return ctx;
}

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [content, departments, eventsData, newsData] = await Promise.all([
        apiClient.get<any>("/content"),
        apiClient.get<any[]>("/departments"),
        apiClient.get<any>("/events"),
        apiClient.get<any>("/news").catch(() => ({ articles: [], config: defaultNewsEventsConfig })),
      ]);

      const normalizedEvents = (eventsData.events || []).map((e: any) => {
        const rawDate = e.dateISO || e.startDate || e.date;
        let dateISO = "";
        if (rawDate) {
          const parsed = new Date(rawDate);
          dateISO = !isNaN(parsed.getTime()) ? parsed.toISOString().split("T")[0] : String(rawDate);
        }
        return {
          ...e,
          id: String(e.id || e.slug || e._id || `event-${Math.random().toString(36).slice(2, 7)}`),
          title: e.title || "Campus Event",
          category: e.category || "Seminars",
          image: e.image || e.coverImage || "/placeholder-event.jpg",
          date: e.date || dateISO || "TBA",
          dateISO: dateISO || new Date().toISOString().split("T")[0],
          venue: e.venue || "Campus Main Hall",
          participants: typeof e.participants === "number" ? e.participants : 0,
          prizePool: e.prizePool || "—",
          description: e.description || "",
          speakers: Array.isArray(e.speakers) ? e.speakers : [],
        };
      });

      setData({
        logo: content.logo || { text1: "Bishop Ambrose", text2: "College", image: "" },
        hero: content.hero,
        announcements: content.announcements,
        about: content.about,
        footer: content.footer,
        departments: departments,
        events: normalizedEvents,
        guestSpeakers: eventsData.guestSpeakers || [],
        eventGallery: eventsData.eventGallery || [],
        erpModules: content.erpModules || {}, // Filled from seed
        admissionsPortalFeatures: content.admissionsPortalFeatures || [],
        statistics: content.statistics || defaultHomepageStatistics,
        aboutPage: content.aboutPage || defaultAboutPageData,
        heroSection: content.heroSection || defaultHeroSectionConfig,
        virtualTour: content.virtualTour || defaultVirtualTourConfig,
        news: newsData.articles || [],
        newsConfig: newsData.config || defaultNewsEventsConfig,
        location: content.location || defaultLocationConfig,
      });
    } catch (err: any) {
      console.info("[SiteContext] Backend not reachable, activating resilient offline data fallback.");
      setError(err.message || "An error occurred while loading content");
      
      // Resilient Fallback: Use imported university data mock so site functions offline/during boot
      try {
        const mock = mockUniversityData;
        setData((prev) => {
          // If we already had valid content loaded, preserve it instead of overriding with mock
          if (prev && prev.departments && prev.departments.length > 0) {
            return prev;
          }
          return {
            logo: {
              text1: "Bishop Ambrose",
              text2: "College",
              image: ""
            },
            hero: {
              badge: "Admissions Open 2026-27",
              title: "Bishop Ambrose College",
              subtitle: "Empowering students through excellence in education, character, and service since 1994.",
              ctaText: "Apply Now",
              ctaLink: "admissions",
              secondaryCtaText: "Explore Courses",
              secondaryCtaLink: "departments",
              virtualTourUrl: "https://www.youtube.com/embed/91tSZsX0Bjg"
            },
            announcements: [
              "Admissions for Academic Year 2026-27 are now open — Apply Online Today!",
              "Bishop Ambrose College granted Autonomous status by Bharathiar University.",
              "NAAC Accreditation renewed — Committed to quality education and continuous improvement."
            ],
            about: {
              title: "A Legacy of Quality Education & Christian Values",
              text1: "Established in 1994 by the Diocese of Coimbatore, Bishop Ambrose College stands as a beacon of quality higher education in Tamil Nadu. Affiliated to Bharathiar University and granted Autonomous status, we offer a rich academic environment with modern infrastructure and dedicated faculty.",
              text2: "Through comprehensive academic training, robust student activities, and focused placement support, Bishop Ambrose College has consistently produced graduates who are academically competent, ethically grounded, and professionally ready.",
              stats: [
                { label: "Years of Excellence", value: "32+" },
                { label: "Students Enrolled", value: "5,000+" },
                { label: "Programmes", value: "12" },
                { label: "Placement Rate", value: "90%" }
              ]
            },
            footer: {
              ctaBadge: "Admissions Open 2026-27",
              ctaTitle: "Begin Your Journey at Bishop Ambrose College",
              ctaDescription: "Join thousands of students who chose Bishop Ambrose College for quality education, vibrant campus life, and excellent career opportunities in Coimbatore.",
              aboutText: "Bishop Ambrose College, Coimbatore, is an Autonomous Institution affiliated to Bharathiar University, offering quality education in Science, Commerce and Arts. Established in 1994, the college is committed to academic excellence and holistic student development.",
              address: "56, Sungam Bypass Road, Sungam, Alwin Nagar, Coimbatore, Tamil Nadu – 641045",
              phone: "0422-2316731",
              email: "bishopambrosecollege1@gmail.com",
              infoEmail: "bishopambrosecollege1@gmail.com",
              facebook: "#",
              twitter: "#",
              instagram: "#",
              linkedin: "#",
              youtube: "#"
            },
            departments: mock.departments,
            events: mock.universityEvents,
            guestSpeakers: mock.guestSpeakers,
            eventGallery: mock.eventGallery,
            erpModules: mock.erpModules,
            admissionsPortalFeatures: mock.admissionsPortalFeatures,
            statistics: defaultHomepageStatistics,
            aboutPage: defaultAboutPageData,
            heroSection: defaultHeroSectionConfig,
            virtualTour: defaultVirtualTourConfig,
            news: [],
            newsConfig: defaultNewsEventsConfig,
            location: defaultLocationConfig,
          };
        });
      } catch (mockErr) {
        console.error("Mock data import failed:", mockErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateGeneralSettings = async (updates: any) => {
    try {
      await apiClient.put("/content", updates);
      await refresh();
      return true;
    } catch (e) {
      console.error("updateGeneralSettings error:", e);
      return false;
    }
  };

  const updateStatistics = async (statistics: HomepageStatistics) => {
    try {
      await apiClient.put("/content", { statistics });
      await refresh();
      return true;
    } catch (e) {
      console.error("updateStatistics error:", e);
      return false;
    }
  };

  const updateAboutPage = async (aboutData: AboutPageData) => {
    try {
      await apiClient.put("/about", aboutData);
      await refresh();
      return true;
    } catch (e) {
      console.error("updateAboutPage error:", e);
      return false;
    }
  };

  const updateHeroSection = async (heroSection: HeroSectionConfig) => {
    try {
      await apiClient.put("/content", { heroSection });
      await refresh();
      return true;
    } catch (e) {
      console.error("updateHeroSection error:", e);
      return false;
    }
  };

  const updateVirtualTour = async (virtualTour: VirtualTourConfig) => {
    try {
      await apiClient.put("/content", { virtualTour });
      await refresh();
      return true;
    } catch (e) {
      console.error("updateVirtualTour error:", e);
      return false;
    }
  };

  const updateLocation = async (location: Partial<LocationConfig>) => {
    try {
      await apiClient.put("/content", { location });
      await refresh();
      return true;
    } catch (e) {
      console.error("updateLocation error:", e);
      return false;
    }
  };

  const saveDepartment = async (dept: Department, isNew: boolean) => {
    try {
      const url = isNew ? "/departments" : `/departments/${dept.slug}`;
      if (isNew) {
        await apiClient.post(url, dept);
      } else {
        await apiClient.put(url, dept);
      }
      await refresh();
      return true;
    } catch (e) {
      console.error("saveDepartment error:", e);
      return false;
    }
  };

  const deleteDepartment = async (slug: string) => {
    try {
      await apiClient.delete(`/departments/${slug}`);
      await refresh();
      return true;
    } catch (e) {
      console.error("deleteDepartment error:", e);
      return false;
    }
  };

  const saveEvent = async (eventData: any, isNew: boolean) => {
    try {
      const url = isNew ? "/events" : `/events/${eventData.id || eventData.slug}`;
      const payload = { type: "event", id: eventData.id || eventData.slug, data: eventData };
      if (isNew) {
        await apiClient.post(url, payload);
      } else {
        await apiClient.put(url, payload);
      }
      await refresh();
      return true;
    } catch (e) {
      console.error("saveEvent error:", e);
      return false;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await apiClient.delete(`/events/${id}?type=event`);
      await refresh();
      return true;
    } catch (e) {
      console.error("deleteEvent error:", e);
      return false;
    }
  };

  const saveSpeaker = async (speakerData: any, isNew: boolean) => {
    try {
      const speakerId = speakerData.id || speakerData.name;
      const url = isNew ? "/events" : `/events/${encodeURIComponent(speakerId)}`;
      const payload = { type: "speaker", id: speakerId, data: speakerData };
      if (isNew) {
        await apiClient.post(url, payload);
      } else {
        await apiClient.put(url, payload);
      }
      await refresh();
      return true;
    } catch (e) {
      console.error("saveSpeaker error:", e);
      return false;
    }
  };

  const deleteSpeaker = async (name: string) => {
    try {
      await apiClient.delete(`/events/${encodeURIComponent(name)}?type=speaker`);
      await refresh();
      return true;
    } catch (e) {
      console.error("deleteSpeaker error:", e);
      return false;
    }
  };

  const saveGalleryItem = async (itemData: any) => {
    try {
      await apiClient.post("/events", { type: "gallery", data: itemData });
      await refresh();
      return true;
    } catch (e) {
      console.error("saveGalleryItem error:", e);
      return false;
    }
  };

  const deleteGalleryItem = async (title: string) => {
    try {
      await apiClient.delete(`/events/${encodeURIComponent(title)}?type=gallery`);
      await refresh();
      return true;
    } catch (e) {
      console.error("deleteGalleryItem error:", e);
      return false;
    }
  };

  const submitApplication = async (app: any) => {
    try {
      await apiClient.post("/admissions", app);
      return true;
    } catch (e) {
      console.error("submitApplication error:", e);
      return false;
    }
  };

  const saveNewsArticle = async (article: Partial<NewsArticle>, isNew: boolean): Promise<boolean> => {
    try {
      const url = isNew ? "/news" : `/news/${article.id}`;
      if (isNew) {
        await apiClient.post(url, article);
      } else {
        await apiClient.put(url, article);
      }
      await refresh();
      return true;
    } catch (e) {
      console.error("saveNewsArticle error:", e);
      return false;
    }
  };

  const deleteNewsArticle = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/news/${id}`);
      await refresh();
      return true;
    } catch (e) {
      console.error("deleteNewsArticle error:", e);
      return false;
    }
  };

  const updateNewsEventsConfig = async (config: Partial<NewsEventsConfig>): Promise<boolean> => {
    try {
      await apiClient.put("/news/config", config);
      await refresh();
      return true;
    } catch (e) {
      console.error("updateNewsEventsConfig error:", e);
      return false;
    }
  };

  const resetAllData = async (): Promise<boolean> => {
    console.warn(
      "[CMS Security] Web database reset is disabled. Database seeding and migration must be run via the server CLI: npm run migrate:execute -- --confirm"
    );
    if (typeof window !== "undefined") {
      alert(
        "Notice: Web-based database reset is disabled for security. Database seeding is a controlled server CLI operation: npm run migrate:execute -- --confirm"
      );
    }
    return false;
  };

  return (
    <SiteContext.Provider
      value={{
        data,
        loading,
        error,
        refresh,
        updateGeneralSettings,
        updateStatistics,
        updateAboutPage,
        updateHeroSection,
        updateVirtualTour,
        saveDepartment,
        deleteDepartment,
        saveEvent,
        deleteEvent,
        saveSpeaker,
        deleteSpeaker,
        saveGalleryItem,
        deleteGalleryItem,
        submitApplication,
        resetAllData,
        saveNewsArticle,
        deleteNewsArticle,
        updateNewsEventsConfig,
        updateLocation,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}
