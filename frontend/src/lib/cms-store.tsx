"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Department, departments as initialDepartments } from "./university-data";
import { apiClient } from "./api-client";

// ─── Data Types ───────────────────────────────────────────────────────────────

export type ContentStatus = "draft" | "submitted" | "under_review" | "approved" | "published" | "rejected" | "archived";

export type RoleType = "master_admin" | "sub_admin" | "hod" | "club_head" | "content_editor" | "staff";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  departmentId?: string; // e.g. "computer-science", "commerce"
  clubId?: string;       // e.g. "cultural-club", "sports-club"
  permissions: string[];
  status: "active" | "deactivated";
  lastLogin?: string;
  avatar?: string;
  phone?: string;
};

export type AuditLogEntry = {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "APPROVE" | "REJECT" | "LOGIN";
  module: string;
  recordId: string;
  recordTitle: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress?: string;
};

export type ApprovalItem = {
  id: string;
  entityType: "page" | "event" | "notice" | "news" | "department" | "club" | "achievement";
  entityId: string;
  title: string;
  departmentId?: string;
  clubId?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  previewData?: any;
};

export type PageBlock = {
  id: string;
  type: "heading" | "text" | "rich_text" | "image" | "gallery" | "video" | "cards" | "stats" | "faq" | "table" | "documents" | "events" | "faculty" | "courses" | "contact" | "cta" | "timeline";
  content: any;
  order: number;
  visible: boolean;
};

export type DynamicPage = {
  id: string;
  title: string;
  slug: string;
  parentMenuId?: string;
  pageType: "standard" | "landing" | "academic" | "department_custom" | "club_custom";
  description: string;
  bannerImage: string;
  blocks: PageBlock[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    robots?: string;
  };
  status: ContentStatus;
  departmentId?: string;
  clubId?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type MenuItem = {
  id: string;
  label: string;
  path: string;
  icon?: string;
  order: number;
  parentId?: string;
  target?: "_self" | "_blank";
  isCustom?: boolean;
  visible: boolean;
  pageId?: string;
};

export type MediaAsset = {
  id: string;
  title: string;
  fileName: string;
  fileType: "image" | "video" | "document";
  mimeType: string;
  size: string;
  url: string;
  category: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  altText?: string;
};

export type CollegeDocument = {
  id: string;
  title: string;
  category: "Academic" | "Admission" | "Examination" | "IQAC" | "NIRF" | "Autonomous" | "Library" | "Policies" | "Reports" | "Forms" | "Circulars" | "General";
  departmentId?: string;
  fileSize: string;
  fileFormat: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  status: ContentStatus;
  year?: string;
  downloadCount: number;
  isPublic: boolean;
};

export type AdmissionApplication = {
  id: string;
  appNumber: string;
  studentName: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  bloodGroup?: string;
  parentName: string;
  parentPhone: string;
  appliedCourse: string;
  departmentSlug: string;
  qualifyingExam: string;
  marksPercentage: number;
  schoolName: string;
  address: string;
  city: string;
  state: string;
  status: "new" | "under_review" | "shortlisted" | "approved" | "rejected";
  submittedAt: string;
  remarks: { author: string; text: string; date: string }[];
  documentsAttached: string[];
};

export type AlumniMember = {
  id: string;
  fullName: string;
  gender: string;
  degree: string;
  departmentSlug: string;
  registerNumber: string;
  passingYear: string;
  employmentType: "Salaried" | "Entrepreneur" | "Homemaker" | "Yet to be Placed" | "Higher Studies";
  presentEmployer?: string;
  designation?: string;
  workCity?: string;
  workCountry?: string;
  higherStudiesStatus?: "None" | "Pursuing" | "Completed";
  higherStudiesUniversity?: string;
  specialAchievements?: string;
  mobile: string;
  email: string;
  city: string;
  country: string;
  linkedin?: string;
  verified: boolean;
  registeredAt: string;
  avatarUrl?: string;
};

export type CollegeNotice = {
  id: string;
  title: string;
  content: string;
  departmentId?: string; // "all" or specific slug
  category: "General" | "Examination" | "Academic" | "Admissions" | "Fee" | "Holiday" | "Emergency";
  priority: "High" | "Medium" | "Low";
  attachmentUrl?: string;
  attachmentName?: string;
  publishDate: string;
  expiryDate?: string;
  status: ContentStatus;
  targetAudience: "All" | "Students" | "Faculty" | "Staff";
  authorName: string;
};

export type ClubItem = {
  id: string;
  name: string;
  code: string;
  category: "Cultural" | "Sports" | "Academic" | "Social Service" | "Leadership";
  description: string;
  facultyCoordinator: string;
  studentHead: string;
  contactEmail: string;
  memberCount: number;
  bannerImage: string;
  logoUrl?: string;
  achievements: string[];
  status: ContentStatus;
};

export type ContactEnquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: "unread" | "read" | "in_progress" | "resolved";
  assignedTo?: string;
  notes?: string;
};

export type CollegeNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  category: "admission" | "event" | "approval" | "alumni" | "enquiry" | "system";
  link?: string;
};

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_USERS: AdminUser[] = [
  {
    id: "user-1",
    name: "Dr. V. Anitha",
    email: "admin@bac.edu.in",
    role: "master_admin",
    permissions: ["all"],
    status: "active",
    lastLogin: "Just now",
    phone: "0422-2316731",
  },
  {
    id: "user-2",
    name: "Dr. K. Suresh",
    email: "hod.cs@bac.edu.in",
    role: "hod",
    departmentId: "computer-science",
    permissions: ["dept_manage", "faculty_manage", "course_manage", "notice_create", "event_create"],
    status: "active",
    lastLogin: "2 hours ago",
    phone: "0422-2310655",
  },
  {
    id: "user-3",
    name: "Dr. M. Lakshmi",
    email: "hod.commerce@bac.edu.in",
    role: "hod",
    departmentId: "commerce-general",
    permissions: ["dept_manage", "faculty_manage", "course_manage", "notice_create", "event_create"],
    status: "active",
    lastLogin: "Yesterday",
    phone: "0422-2310656",
  },
  {
    id: "user-4",
    name: "Prof. R. David",
    email: "cultural@bac.edu.in",
    role: "club_head",
    clubId: "fine-arts-club",
    permissions: ["club_manage", "event_create", "gallery_upload"],
    status: "active",
    lastLogin: "3 days ago",
    phone: "0422-2310657",
  },
  {
    id: "user-5",
    name: "Mrs. S. Renuka",
    email: "editor@bac.edu.in",
    role: "content_editor",
    permissions: ["content_edit", "news_create", "media_upload"],
    status: "active",
    lastLogin: "1 day ago",
    phone: "0422-2310658",
  },
];

const INITIAL_CLUBS: ClubItem[] = [
  {
    id: "fine-arts-club",
    name: "Fine Arts & Cultural Club",
    code: "FACC",
    category: "Cultural",
    description: "Organizes inter-collegiate arts fests, music ensembles, theatre dramas, and annual Ambrose Fiesta celebrations.",
    facultyCoordinator: "Prof. R. David",
    studentHead: "Siddharth Menon (III BCA)",
    contactEmail: "cultural@bac.edu.in",
    memberCount: 140,
    bannerImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    achievements: ["Overall Trophy at Bharathiar Cultural Fest 2025", "First Prize in Western Group Singing"],
    status: "published",
  },
  {
    id: "nss-club",
    name: "National Service Scheme (NSS)",
    code: "NSS",
    category: "Social Service",
    description: "Engages in rural community adoption, blood donation camps, free eye screening, and tree plantation drives.",
    facultyCoordinator: "Dr. A. Joseph",
    studentHead: "M. Deepika (III B.Com)",
    contactEmail: "nss@bac.edu.in",
    memberCount: 200,
    bannerImage: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    achievements: ["Best NSS Unit Award 2024", "1,200+ Units Blood Donated"],
    status: "published",
  },
  {
    id: "sports-club",
    name: "Sports & Athletics Association",
    code: "SAA",
    category: "Sports",
    description: "Fosters excellence in football, cricket, volleyball, athletics, table tennis, and powerlifting tournaments.",
    facultyCoordinator: "Physical Director P. Ravi",
    studentHead: "V. Gokul (III B.Sc CS)",
    contactEmail: "sports@bac.edu.in",
    memberCount: 180,
    bannerImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    achievements: ["Bharathiar University Football Champions 2025", "Gold Medal in State 200m Sprint"],
    status: "published",
  },
];

const INITIAL_DOCUMENTS: CollegeDocument[] = [
  {
    id: "doc-1",
    title: "Autonomous CBCS Academic Regulations 2024-25",
    category: "Academic",
    fileSize: "2.8 MB",
    fileFormat: "PDF",
    fileUrl: "/downloads/academic-regulations-2024.pdf",
    uploadedBy: "Dr. V. Anitha",
    uploadedAt: "2024-06-15",
    status: "published",
    year: "2024-2025",
    downloadCount: 1420,
    isPublic: true,
  },
  {
    id: "doc-2",
    title: "Continuous Internal Assessment (CIA) Guidelines",
    category: "Examination",
    fileSize: "1.4 MB",
    fileFormat: "PDF",
    fileUrl: "/downloads/cia-guidelines.pdf",
    uploadedBy: "COE Office",
    uploadedAt: "2024-08-10",
    status: "published",
    year: "2024-2025",
    downloadCount: 890,
    isPublic: true,
  },
  {
    id: "doc-3",
    title: "Annual Quality Assurance Report (AQAR) 2023-24",
    category: "IQAC",
    fileSize: "4.2 MB",
    fileFormat: "PDF",
    fileUrl: "/downloads/aqar-2023-24.pdf",
    uploadedBy: "IQAC Coordinator",
    uploadedAt: "2024-11-20",
    status: "published",
    year: "2023-2024",
    downloadCount: 650,
    isPublic: true,
  },
  {
    id: "doc-4",
    title: "BAC College Prospectus 2026-27",
    category: "Admission",
    fileSize: "5.1 MB",
    fileFormat: "PDF",
    fileUrl: "/downloads/prospectus-2026.pdf",
    uploadedBy: "Admissions Office",
    uploadedAt: "2026-01-10",
    status: "published",
    year: "2026-2027",
    downloadCount: 2840,
    isPublic: true,
  },
  {
    id: "doc-5",
    title: "UGC Autonomy Extension Order Notification",
    category: "Autonomous",
    fileSize: "1.9 MB",
    fileFormat: "PDF",
    fileUrl: "/downloads/ugc-autonomy-order.pdf",
    uploadedBy: "Principal's Office",
    uploadedAt: "2023-04-12",
    status: "published",
    year: "2023",
    downloadCount: 510,
    isPublic: true,
  },
];

const INITIAL_APPLICATIONS: AdmissionApplication[] = [
  {
    id: "app-1001",
    appNumber: "BAC-2026-00101",
    studentName: "Arun Kumar S.",
    email: "arun.kumar@gmail.com",
    phone: "9876543210",
    gender: "Male",
    dob: "2008-04-12",
    parentName: "S. Sundaram",
    parentPhone: "9876543211",
    appliedCourse: "B.Sc Computer Science",
    departmentSlug: "computer-science",
    qualifyingExam: "HSC (+2 State Board)",
    marksPercentage: 88.5,
    schoolName: "Stanes Anglo Indian Hr Sec School, Coimbatore",
    address: "14/2 Ramanathapuram",
    city: "Coimbatore",
    state: "Tamil Nadu",
    status: "shortlisted",
    submittedAt: "2026-05-02",
    remarks: [{ author: "Admissions Officer", text: "Merit candidate with 92% in Mathematics and Physics.", date: "2026-05-03" }],
    documentsAttached: ["10th Marksheet", "12th Marksheet", "TC", "Community Cert"],
  },
  {
    id: "app-1002",
    appNumber: "BAC-2026-00102",
    studentName: "Priyanka Fernandez",
    email: "priya.fernandez@yahoo.com",
    phone: "9845612345",
    gender: "Female",
    dob: "2008-07-24",
    parentName: "J. Fernandez",
    parentPhone: "9845612340",
    appliedCourse: "B.Com Professional Accounting",
    departmentSlug: "commerce-general",
    qualifyingExam: "CBSE XII",
    marksPercentage: 91.2,
    schoolName: "Carmel Garden Matric Hr Sec School, Coimbatore",
    address: "45 Sungam Bypass Road",
    city: "Coimbatore",
    state: "Tamil Nadu",
    status: "approved",
    submittedAt: "2026-05-04",
    remarks: [{ author: "HOD Commerce", text: "Approved for admission under First Merit List.", date: "2026-05-05" }],
    documentsAttached: ["10th Marksheet", "12th Marksheet", "Conduct Cert"],
  },
  {
    id: "app-1003",
    appNumber: "BAC-2026-00103",
    studentName: "Mohamed Tariq",
    email: "tariq.m@outlook.com",
    phone: "9789012345",
    gender: "Male",
    dob: "2007-11-15",
    parentName: "M. Abdul Rahman",
    parentPhone: "9789012340",
    appliedCourse: "BCA (Computer Applications)",
    departmentSlug: "computer-science",
    qualifyingExam: "HSC (+2 State Board)",
    marksPercentage: 79.0,
    schoolName: "Al-Ameen Matric Hr Sec School, Coimbatore",
    address: "112 Ukkadam Main Rd",
    city: "Coimbatore",
    state: "Tamil Nadu",
    status: "under_review",
    submittedAt: "2026-05-06",
    remarks: [],
    documentsAttached: ["12th Marksheet"],
  },
];

const INITIAL_ALUMNI: AlumniMember[] = [
  {
    id: "alum-1",
    fullName: "Dr. Stephen Raj",
    gender: "Male",
    degree: "B.Sc Computer Science",
    departmentSlug: "computer-science",
    registerNumber: "94BCS012",
    passingYear: "1997",
    employmentType: "Salaried",
    presentEmployer: "Tech Mahindra",
    designation: "VP of Engineering, Cloud Architecture",
    workCity: "San Jose",
    workCountry: "USA",
    higherStudiesStatus: "Completed",
    higherStudiesUniversity: "University of Texas",
    specialAchievements: "Published 12 patents in cloud systems",
    mobile: "+1 408 555 0192",
    email: "stephen.raj@techmahindra.com",
    city: "San Jose",
    country: "USA",
    verified: true,
    registeredAt: "2024-01-15",
  },
  {
    id: "alum-2",
    fullName: "Priya Sundaram",
    gender: "Female",
    degree: "B.Com",
    departmentSlug: "commerce-general",
    registerNumber: "02BCO045",
    passingYear: "2005",
    employmentType: "Salaried",
    presentEmployer: "Deloitte India",
    designation: "Senior Director – Financial Advisory",
    workCity: "Bangalore",
    workCountry: "India",
    higherStudiesStatus: "Completed",
    higherStudiesUniversity: "IIM Bangalore (Executive)",
    specialAchievements: "Chartered Accountant All India Rank 24",
    mobile: "+91 98450 11223",
    email: "priya.sundaram@deloitte.com",
    city: "Bangalore",
    country: "India",
    verified: true,
    registeredAt: "2024-03-20",
  },
];

const INITIAL_NOTICES: CollegeNotice[] = [
  {
    id: "not-1",
    title: "Autonomous Semester Examinations (April/May 2026) Schedule Notification",
    content: "All UG and PG students are hereby notified that the Autonomous End Semester Examinations will commence from May 2, 2026. Detailed timetables are published on the COE portal.",
    departmentId: "all",
    category: "Examination",
    priority: "High",
    attachmentName: "Exam_Timetable_April2026.pdf",
    attachmentUrl: "/downloads/timetable-2026.pdf",
    publishDate: "2026-04-15",
    expiryDate: "2026-05-30",
    status: "published",
    targetAudience: "Students",
    authorName: "Controller of Examinations",
  },
  {
    id: "not-2",
    title: "Faculty Development Programme (FDP) on AI & Hybrid Pedagogy",
    content: "IQAC is organizing a week-long national FDP for faculty members. Registration is open until May 10, 2026.",
    departmentId: "all",
    category: "Academic",
    priority: "Medium",
    publishDate: "2026-04-20",
    expiryDate: "2026-05-15",
    status: "published",
    targetAudience: "Faculty",
    authorName: "IQAC Coordinator",
  },
];

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: "appr-1",
    entityType: "event",
    entityId: "evt-new-1",
    title: "National Cyber Security & Ethical Hacking Hackathon 2026",
    departmentId: "computer-science",
    authorId: "user-2",
    authorName: "Dr. K. Suresh",
    authorRole: "HOD Computer Science",
    status: "pending",
    submittedAt: "2026-05-08 10:30 AM",
    previewData: { venue: "CS Lab 3", dates: "July 12-13, 2026", budget: "₹ 45,000" },
  },
  {
    id: "appr-2",
    entityType: "notice",
    entityId: "not-new-2",
    title: "Commerce Department Special Guest Lecture on GST Reforms",
    departmentId: "commerce-general",
    authorId: "user-3",
    authorName: "Dr. M. Lakshmi",
    authorRole: "HOD Commerce",
    status: "pending",
    submittedAt: "2026-05-09 02:15 PM",
    previewData: { speaker: "CA Sundaresan", date: "May 25, 2026" },
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    userId: "user-1",
    userName: "Dr. V. Anitha",
    userRole: "Master Admin",
    action: "UPDATE",
    module: "Website Settings",
    recordId: "settings-general",
    recordTitle: "College Admission Helpline updated",
    timestamp: "2026-05-09 09:12 AM",
    ipAddress: "192.168.1.10",
  },
  {
    id: "log-2",
    userId: "user-2",
    userName: "Dr. K. Suresh",
    userRole: "HOD Computer Science",
    action: "CREATE",
    module: "Events",
    recordId: "evt-new-1",
    recordTitle: "National Cyber Security Hackathon submitted for review",
    timestamp: "2026-05-08 10:30 AM",
    ipAddress: "192.168.1.45",
  },
  {
    id: "log-3",
    userId: "user-1",
    userName: "Dr. V. Anitha",
    userRole: "Master Admin",
    action: "APPROVE",
    module: "Admissions",
    recordId: "app-1002",
    recordTitle: "Admission approved for Priyanka Fernandez (B.Com PA)",
    timestamp: "2026-05-05 11:00 AM",
    ipAddress: "192.168.1.10",
  },
];

// ─── Store Context Definition ─────────────────────────────────────────────────

type CMSStoreContextType = {
  // Current user & Auth
  currentUser: AdminUser;
  switchUser: (roleOrEmail: string) => void;
  users: AdminUser[];
  saveUser: (user: Partial<AdminUser>, isNew?: boolean) => void;
  deleteUser: (id: string) => void;

  // Scoping helpers
  canAccessDepartment: (deptSlug?: string) => boolean;
  canAccessClub: (clubId?: string) => boolean;
  hasPermission: (perm: string) => boolean;

  // Content Workflow & Approvals
  approvals: ApprovalItem[];
  submitForApproval: (item: Omit<ApprovalItem, "id" | "submittedAt" | "status">) => void;
  approveItem: (id: string) => void;
  rejectItem: (id: string, reason: string) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  logAction: (entry: Omit<AuditLogEntry, "id" | "timestamp" | "userId" | "userName" | "userRole">) => void;

  // Dynamic Pages & Page Builder
  pages: DynamicPage[];
  savePage: (page: Partial<DynamicPage>, isNew?: boolean) => void;
  deletePage: (id: string) => void;
  getPageBySlug: (slug: string) => DynamicPage | undefined;

  // Menu Builder
  menuItems: MenuItem[];
  saveMenuItem: (item: Partial<MenuItem>, isNew?: boolean) => void;
  deleteMenuItem: (id: string) => void;
  reorderMenuItems: (items: MenuItem[]) => void;

  // Media Library
  mediaAssets: MediaAsset[];
  saveMediaAsset: (asset: Partial<MediaAsset>, isNew?: boolean) => void;
  deleteMediaAsset: (id: string) => void;

  // Document Center
  documents: CollegeDocument[];
  saveDocument: (doc: Partial<CollegeDocument>, isNew?: boolean) => void;
  deleteDocument: (id: string) => void;

  // Admissions
  applications: AdmissionApplication[];
  updateApplicationStatus: (id: string, status: AdmissionApplication["status"], remark?: string) => void;
  saveApplication: (app: Partial<AdmissionApplication>, isNew?: boolean) => void;

  // Alumni
  alumni: AlumniMember[];
  verifyAlumni: (id: string, verified: boolean) => void;
  saveAlumni: (member: Partial<AlumniMember>, isNew?: boolean) => void;

  // Notices
  notices: CollegeNotice[];
  saveNotice: (notice: Partial<CollegeNotice>, isNew?: boolean) => void;
  deleteNotice: (id: string) => void;

  // Clubs
  clubs: ClubItem[];
  saveClub: (club: Partial<ClubItem>, isNew?: boolean) => void;
  deleteClub: (id: string) => void;

  // Enquiries
  enquiries: ContactEnquiry[];
  updateEnquiryStatus: (id: string, status: ContactEnquiry["status"], notes?: string) => void;
  saveEnquiry: (enquiry: Partial<ContactEnquiry>) => void;

  // Notifications
  notifications: CollegeNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
};

const CMSStoreContext = createContext<CMSStoreContextType | null>(null);

export function useCMSStore() {
  const ctx = useContext(CMSStoreContext);
  if (!ctx) throw new Error("useCMSStore must be used within CMSStoreProvider");
  return ctx;
}

const STORAGE_PREFIX = "bac_cms_";

export function CMSStoreProvider({ children }: { children: React.ReactNode }) {
  // Helper to load/save state to localStorage
  const loadState = <T,>(key: string, defaultVal: T): T => {
    if (typeof window === "undefined") return defaultVal;
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + key);
      return saved ? JSON.parse(saved) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [users, setUsers] = useState<AdminUser[]>(() => loadState("users", INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<AdminUser>(() => {
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("bac_admin_user") : null;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const match = INITIAL_USERS.find((u) => u.email === parsed.email || u.role === parsed.role);
        if (match) return match;
      } catch {}
    }
    return INITIAL_USERS[0];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadState("audit_logs", INITIAL_AUDIT_LOGS));
  const [approvals, setApprovals] = useState<ApprovalItem[]>(() => loadState("approvals", INITIAL_APPROVALS));
  const [pages, setPages] = useState<DynamicPage[]>(() => loadState("pages", []));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => loadState("menus", []));
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => loadState("media", []));
  const [documents, setDocuments] = useState<CollegeDocument[]>(() => loadState("documents", INITIAL_DOCUMENTS));
  const [applications, setApplications] = useState<AdmissionApplication[]>(() => loadState("applications", INITIAL_APPLICATIONS));
  const [alumni, setAlumni] = useState<AlumniMember[]>(() => loadState("alumni", INITIAL_ALUMNI));
  const [notices, setNotices] = useState<CollegeNotice[]>(() => loadState("notices", INITIAL_NOTICES));
  const [clubs, setClubs] = useState<ClubItem[]>(() => loadState("clubs", INITIAL_CLUBS));
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>(() => loadState("enquiries", []));
  const [notifications, setNotifications] = useState<CollegeNotification[]>(() => [
    { id: "n-1", title: "New Admission Application", description: "Arun Kumar applied for B.Sc Computer Science", time: "10m ago", unread: true, category: "admission" },
    { id: "n-2", title: "Event Pending Approval", description: "Dr. Suresh submitted National Cyber Hackathon", time: "1h ago", unread: true, category: "approval" },
    { id: "n-3", title: "New Alumni Registered", description: "Priya Sundaram verified her corporate profile", time: "3h ago", unread: false, category: "alumni" },
  ]);

  // Persist helpers
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "audit_logs", JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "approvals", JSON.stringify(approvals)); }, [approvals]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "pages", JSON.stringify(pages)); }, [pages]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "menus", JSON.stringify(menuItems)); }, [menuItems]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "media", JSON.stringify(mediaAssets)); }, [mediaAssets]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "documents", JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "applications", JSON.stringify(applications)); }, [applications]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "alumni", JSON.stringify(alumni)); }, [alumni]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "notices", JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "clubs", JSON.stringify(clubs)); }, [clubs]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + "enquiries", JSON.stringify(enquiries)); }, [enquiries]);

  // ── Live Backend Authentication & Session Sync ──────────────────────────────
  useEffect(() => {
    let active = true;
    async function verifyLiveSession() {
      try {
        const res = await apiClient.get<any>("/auth/me");
        const liveUser = res?.data?.user || res?.user;
        if (liveUser && active) {
          setCurrentUser({
            id: liveUser.id || String(liveUser._id),
            name: liveUser.name,
            email: liveUser.email,
            role: liveUser.role,
            departmentId: liveUser.departmentId,
            clubId: liveUser.clubId,
            permissions: liveUser.permissions || [],
            status: liveUser.status || "active",
            phone: liveUser.phone,
          });
        }
      } catch {
        // Backend offline or unauthenticated; fall back to local stored state
      }
    }
    verifyLiveSession();
    return () => { active = false; };
  }, []);

  // ── Live Backend Admissions Sync ────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    async function fetchLiveApplications() {
      if (
        currentUser.role !== "master_admin" &&
        !currentUser.permissions.includes("admissions:read") &&
        !currentUser.permissions.includes("all")
      ) {
        return;
      }
      try {
        const res = await apiClient.get<any>("/admissions?limit=100");
        const appList = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(appList) && appList.length > 0 && active) {
          const mapped: AdmissionApplication[] = appList.map((doc: any) => ({
            id: doc.appNumber || doc.id || String(doc._id),
            appNumber: doc.appNumber || "BAC-ADM-2026-0000",
            studentName: doc.candidateName || doc.name || "Applicant",
            email: doc.email || "",
            phone: doc.phone || "",
            gender: doc.gender === "female" ? "Female" : doc.gender === "other" ? "Other" : "Male",
            dob: doc.dateOfBirth ? new Date(doc.dateOfBirth).toISOString().split("T")[0] : "2008-01-01",
            parentName: doc.parentOrGuardianName || "",
            parentPhone: "",
            appliedCourse: doc.program || "B.Sc Computer Science",
            departmentSlug: doc.courseSlug || "computer-science",
            qualifyingExam: doc.qualifyingExam || "HSC (+2)",
            marksPercentage: doc.marksPercentage || (doc.gpa ? parseFloat(doc.gpa) : 80),
            schoolName: doc.schoolName || "",
            address: doc.address || "",
            city: doc.city || "Coimbatore",
            state: doc.state || "Tamil Nadu",
            status: doc.status || "submitted",
            submittedAt: doc.submittedAt ? new Date(doc.submittedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            remarks: Array.isArray(doc.remarks)
              ? doc.remarks.map((r: any) => ({
                  author: r.author || "Admin",
                  text: r.remark || r.text || "",
                  date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
                }))
              : [],
            documentsAttached: ["Marksheet", "ID Proof"],
          }));
          setApplications(mapped);
        }
      } catch {
        // Fall back to local applications state
      }
    }
    fetchLiveApplications();
    return () => { active = false; };
  }, [currentUser]);

  // ── Live Backend Contact Enquiries Sync ─────────────────────────────────────
  useEffect(() => {
    let active = true;
    async function fetchLiveEnquiries() {
      if (
        currentUser.role !== "master_admin" &&
        !currentUser.permissions.includes("enquiries:read") &&
        !currentUser.permissions.includes("all")
      ) {
        return;
      }
      try {
        const res = await apiClient.get<any>("/contact/enquiries?limit=100");
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0 && active) {
          const mapped: ContactEnquiry[] = list.map((doc: any) => ({
            id: String(doc._id || doc.id),
            name: doc.name || "Anonymous",
            email: doc.email || "",
            phone: doc.phone || "",
            category: doc.department || "General",
            subject: doc.subject || "Inquiry",
            message: doc.message || "",
            submittedAt: doc.submittedAt ? new Date(doc.submittedAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN"),
            status: doc.status === "new" ? "unread" : doc.status === "resolved" ? "resolved" : "read",
            notes: doc.responseNotes || "",
          }));
          setEnquiries(mapped);
        }
      } catch {
        // Fall back to local enquiries state
      }
    }
    fetchLiveEnquiries();
    return () => { active = false; };
  }, [currentUser]);

  // ── Switch User ─────────────────────────────────────────────────────────────
  const switchUser = useCallback((identifier: string) => {
    const found = users.find((u) => u.email === identifier || u.role === identifier || u.id === identifier);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem("bac_admin_user", JSON.stringify({
        name: found.name,
        role: found.role === "master_admin" ? "Master Admin" : found.role === "hod" ? `HOD (${found.departmentId})` : found.role,
        email: found.email,
        initials: found.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      }));
    }
  }, [users]);

  // ── Audit Log Action ────────────────────────────────────────────────────────
  const logAction = useCallback((entry: Omit<AuditLogEntry, "id" | "timestamp" | "userId" | "userName" | "userRole">) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }),
      ipAddress: "192.168.1." + Math.floor(Math.random() * 50 + 10),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  }, [currentUser]);

  // ── Scoping Checks ──────────────────────────────────────────────────────────
  const canAccessDepartment = useCallback((deptSlug?: string) => {
    if (currentUser.role === "master_admin" || currentUser.role === "sub_admin") return true;
    if (!deptSlug) return true;
    if (currentUser.role === "hod") {
      return currentUser.departmentId === deptSlug;
    }
    return false;
  }, [currentUser]);

  const canAccessClub = useCallback((clubId?: string) => {
    if (currentUser.role === "master_admin" || currentUser.role === "sub_admin") return true;
    if (!clubId) return true;
    if (currentUser.role === "club_head") {
      return currentUser.clubId === clubId;
    }
    return false;
  }, [currentUser]);

  const hasPermission = useCallback((perm: string) => {
    if (currentUser.role === "master_admin") return true;
    if (currentUser.permissions.includes("all")) return true;
    return currentUser.permissions.includes(perm);
  }, [currentUser]);

  // ── Workflow & Approvals ────────────────────────────────────────────────────
  const submitForApproval = useCallback((item: Omit<ApprovalItem, "id" | "submittedAt" | "status">) => {
    const newApproval: ApprovalItem = {
      ...item,
      id: "appr-" + Date.now(),
      status: "pending",
      submittedAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }),
    };
    setApprovals((prev) => [newApproval, ...prev]);
    logAction({
      action: "CREATE",
      module: "Approvals",
      recordId: newApproval.id,
      recordTitle: `Submitted for review: ${newApproval.title}`,
    });
  }, [logAction]);

  const approveItem = useCallback((id: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved", reviewedAt: new Date().toLocaleString(), reviewerId: currentUser.id } : a))
    );
    const item = approvals.find((a) => a.id === id);
    if (item) {
      logAction({
        action: "APPROVE",
        module: "Approvals",
        recordId: id,
        recordTitle: `Approved: ${item.title}`,
      });
    }
  }, [approvals, currentUser.id, logAction]);

  const rejectItem = useCallback((id: string, reason: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected", rejectionReason: reason, reviewedAt: new Date().toLocaleString(), reviewerId: currentUser.id } : a))
    );
    const item = approvals.find((a) => a.id === id);
    if (item) {
      logAction({
        action: "REJECT",
        module: "Approvals",
        recordId: id,
        recordTitle: `Rejected: ${item.title} (Reason: ${reason})`,
      });
    }
  }, [approvals, currentUser.id, logAction]);

  // ── Dynamic Pages ───────────────────────────────────────────────────────────
  const savePage = useCallback((page: Partial<DynamicPage>, isNew = false) => {
    if (isNew) {
      const newPage: DynamicPage = {
        id: "page-" + Date.now(),
        title: page.title || "Untitled Page",
        slug: page.slug || "page-" + Date.now(),
        pageType: page.pageType || "standard",
        description: page.description || "",
        bannerImage: page.bannerImage || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
        blocks: page.blocks || [],
        seo: page.seo || { metaTitle: page.title || "BAC", metaDescription: page.description || "" },
        status: currentUser.role === "master_admin" ? "published" : "submitted",
        authorId: currentUser.id,
        authorName: currentUser.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        ...page,
      } as DynamicPage;
      setPages((prev) => [newPage, ...prev]);
      logAction({ action: "CREATE", module: "Page Builder", recordId: newPage.id, recordTitle: newPage.title });
    } else {
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, ...page, updatedAt: new Date().toISOString(), version: p.version + 1 } : p))
      );
      logAction({ action: "UPDATE", module: "Page Builder", recordId: page.id || "", recordTitle: page.title || "Page Update" });
    }
  }, [currentUser, logAction]);

  const deletePage = useCallback((id: string) => {
    const page = pages.find((p) => p.id === id);
    setPages((prev) => prev.filter((p) => p.id !== id));
    if (page) logAction({ action: "DELETE", module: "Page Builder", recordId: id, recordTitle: page.title });
  }, [pages, logAction]);

  const getPageBySlug = useCallback((slug: string) => pages.find((p) => p.slug === slug), [pages]);

  // ── Menu Builder ────────────────────────────────────────────────────────────
  const saveMenuItem = useCallback((item: Partial<MenuItem>, isNew = false) => {
    if (isNew) {
      const newItem: MenuItem = {
        id: "menu-" + Date.now(),
        label: item.label || "Menu Item",
        path: item.path || "/",
        order: menuItems.length + 1,
        visible: true,
        ...item,
      };
      setMenuItems((prev) => [...prev, newItem]);
      logAction({ action: "CREATE", module: "Menu Builder", recordId: newItem.id, recordTitle: newItem.label });
    } else {
      setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, ...item } : m)));
      logAction({ action: "UPDATE", module: "Menu Builder", recordId: item.id || "", recordTitle: item.label || "Menu" });
    }
  }, [menuItems.length, logAction]);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    logAction({ action: "DELETE", module: "Menu Builder", recordId: id, recordTitle: "Deleted menu item" });
  }, [logAction]);

  const reorderMenuItems = useCallback((items: MenuItem[]) => {
    setMenuItems(items);
    logAction({ action: "UPDATE", module: "Menu Builder", recordId: "reorder", recordTitle: "Reordered navigation menus" });
  }, [logAction]);

  // ── Media Library ───────────────────────────────────────────────────────────
  const saveMediaAsset = useCallback((asset: Partial<MediaAsset>, isNew = false) => {
    if (isNew) {
      const newAsset: MediaAsset = {
        id: "media-" + Date.now(),
        title: asset.title || "Asset",
        fileName: asset.fileName || "upload.jpg",
        fileType: asset.fileType || "image",
        mimeType: asset.mimeType || "image/jpeg",
        size: asset.size || "1.2 MB",
        url: asset.url || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
        category: asset.category || "General",
        tags: asset.tags || ["campus"],
        uploadedBy: currentUser.name,
        uploadedAt: new Date().toLocaleDateString("en-IN"),
        ...asset,
      };
      setMediaAssets((prev) => [newAsset, ...prev]);
      logAction({ action: "CREATE", module: "Media Library", recordId: newAsset.id, recordTitle: newAsset.title });
    } else {
      setMediaAssets((prev) => prev.map((m) => (m.id === asset.id ? { ...m, ...asset } : m)));
    }
  }, [currentUser.name, logAction]);

  const deleteMediaAsset = useCallback((id: string) => {
    setMediaAssets((prev) => prev.filter((m) => m.id !== id));
    logAction({ action: "DELETE", module: "Media Library", recordId: id, recordTitle: "Deleted media file" });
  }, [logAction]);

  // ── Document Center ─────────────────────────────────────────────────────────
  const saveDocument = useCallback((doc: Partial<CollegeDocument>, isNew = false) => {
    if (isNew) {
      const newDoc: CollegeDocument = {
        id: "doc-" + Date.now(),
        title: doc.title || "Official Document",
        category: doc.category || "General",
        fileSize: doc.fileSize || "1.8 MB",
        fileFormat: doc.fileFormat || "PDF",
        fileUrl: doc.fileUrl || "/downloads/sample.pdf",
        uploadedBy: currentUser.name,
        uploadedAt: new Date().toISOString().split("T")[0],
        status: currentUser.role === "master_admin" ? "published" : "submitted",
        downloadCount: 0,
        isPublic: doc.isPublic ?? true,
        ...doc,
      };
      setDocuments((prev) => [newDoc, ...prev]);
      logAction({ action: "CREATE", module: "Document Center", recordId: newDoc.id, recordTitle: newDoc.title });
    } else {
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, ...doc } : d)));
      logAction({ action: "UPDATE", module: "Document Center", recordId: doc.id || "", recordTitle: doc.title || "Doc" });
    }
  }, [currentUser, logAction]);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    logAction({ action: "DELETE", module: "Document Center", recordId: id, recordTitle: "Deleted document" });
  }, [logAction]);

  // ── Admissions ──────────────────────────────────────────────────────────────
  const updateApplicationStatus = useCallback((id: string, status: AdmissionApplication["status"], remark?: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const newRemarks = remark
          ? [...app.remarks, { author: currentUser.name, text: remark, date: new Date().toLocaleDateString("en-IN") }]
          : app.remarks;
        return { ...app, status, remarks: newRemarks };
      })
    );
    logAction({
      action: "UPDATE",
      module: "Admissions",
      recordId: id,
      recordTitle: `Updated application status to ${status.toUpperCase()}`,
    });

    // Synchronize to protected backend API
    apiClient.put("/admissions", { id, status, notes: remark || "" }).catch((err: any) => {
      console.warn("[CMS Store] Backend admissions update failed, stored locally:", err?.message);
    });
  }, [currentUser.name, logAction]);

  const saveApplication = useCallback((app: Partial<AdmissionApplication>, isNew = false) => {
    if (isNew) {
      const newApp: AdmissionApplication = {
        id: "app-" + Date.now(),
        appNumber: "BAC-2026-" + Math.floor(10000 + Math.random() * 90000),
        studentName: app.studentName || "Applicant",
        email: app.email || "",
        phone: app.phone || "",
        gender: app.gender || "Male",
        dob: app.dob || "2008-01-01",
        parentName: app.parentName || "",
        parentPhone: app.parentPhone || "",
        appliedCourse: app.appliedCourse || "B.Sc Computer Science",
        departmentSlug: app.departmentSlug || "computer-science",
        qualifyingExam: app.qualifyingExam || "HSC (+2)",
        marksPercentage: app.marksPercentage || 80,
        schoolName: app.schoolName || "",
        address: app.address || "",
        city: app.city || "Coimbatore",
        state: app.state || "Tamil Nadu",
        status: "new",
        submittedAt: new Date().toISOString().split("T")[0],
        remarks: [],
        documentsAttached: app.documentsAttached || ["10th Marksheet", "12th Marksheet"],
        ...app,
      };
      setApplications((prev) => [newApp, ...prev]);
    } else {
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, ...app } : a)));
    }
  }, []);

  // ── Alumni ──────────────────────────────────────────────────────────────────
  const verifyAlumni = useCallback((id: string, verified: boolean) => {
    setAlumni((prev) => prev.map((a) => (a.id === id ? { ...a, verified } : a)));
    logAction({
      action: "UPDATE",
      module: "Alumni",
      recordId: id,
      recordTitle: verified ? "Verified alumni registration" : "Revoked alumni verification",
    });
  }, [logAction]);

  const saveAlumni = useCallback((member: Partial<AlumniMember>, isNew = false) => {
    if (isNew) {
      const newMember: AlumniMember = {
        id: "alum-" + Date.now(),
        fullName: member.fullName || "Alumnus",
        gender: member.gender || "Male",
        degree: member.degree || "B.Sc Computer Science",
        departmentSlug: member.departmentSlug || "computer-science",
        registerNumber: member.registerNumber || "BAC" + Math.floor(1000 + Math.random() * 9000),
        passingYear: member.passingYear || "2020",
        employmentType: member.employmentType || "Salaried",
        mobile: member.mobile || "",
        email: member.email || "",
        city: member.city || "Coimbatore",
        country: member.country || "India",
        verified: false,
        registeredAt: new Date().toISOString().split("T")[0],
        ...member,
      };
      setAlumni((prev) => [newMember, ...prev]);
    } else {
      setAlumni((prev) => prev.map((a) => (a.id === member.id ? { ...a, ...member } : a)));
    }
  }, []);

  // ── Notices ─────────────────────────────────────────────────────────────────
  const saveNotice = useCallback((notice: Partial<CollegeNotice>, isNew = false) => {
    if (isNew) {
      const newNotice: CollegeNotice = {
        id: "not-" + Date.now(),
        title: notice.title || "Circular / Notice",
        content: notice.content || "",
        departmentId: notice.departmentId || "all",
        category: notice.category || "General",
        priority: notice.priority || "Medium",
        publishDate: new Date().toISOString().split("T")[0],
        status: currentUser.role === "master_admin" ? "published" : "submitted",
        targetAudience: notice.targetAudience || "Students",
        authorName: currentUser.name,
        ...notice,
      };
      setNotices((prev) => [newNotice, ...prev]);
      logAction({ action: "CREATE", module: "Notices", recordId: newNotice.id, recordTitle: newNotice.title });
    } else {
      setNotices((prev) => prev.map((n) => (n.id === notice.id ? { ...n, ...notice } : n)));
      logAction({ action: "UPDATE", module: "Notices", recordId: notice.id || "", recordTitle: notice.title || "Notice" });
    }
  }, [currentUser, logAction]);

  const deleteNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    logAction({ action: "DELETE", module: "Notices", recordId: id, recordTitle: "Deleted notice" });
  }, [logAction]);

  // ── Clubs ───────────────────────────────────────────────────────────────────
  const saveClub = useCallback((club: Partial<ClubItem>, isNew = false) => {
    if (isNew) {
      const newClub: ClubItem = {
        id: "club-" + Date.now(),
        name: club.name || "Student Club",
        code: club.code || "CLUB",
        category: club.category || "Cultural",
        description: club.description || "",
        facultyCoordinator: club.facultyCoordinator || currentUser.name,
        studentHead: club.studentHead || "",
        contactEmail: club.contactEmail || "",
        memberCount: club.memberCount || 10,
        bannerImage: club.bannerImage || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        achievements: club.achievements || [],
        status: currentUser.role === "master_admin" ? "published" : "submitted",
        ...club,
      };
      setClubs((prev) => [newClub, ...prev]);
      logAction({ action: "CREATE", module: "Clubs", recordId: newClub.id, recordTitle: newClub.name });
    } else {
      setClubs((prev) => prev.map((c) => (c.id === club.id ? { ...c, ...club } : c)));
      logAction({ action: "UPDATE", module: "Clubs", recordId: club.id || "", recordTitle: club.name || "Club" });
    }
  }, [currentUser, logAction]);

  const deleteClub = useCallback((id: string) => {
    setClubs((prev) => prev.filter((c) => c.id !== id));
    logAction({ action: "DELETE", module: "Clubs", recordId: id, recordTitle: "Deleted club" });
  }, [logAction]);

  // ── Users Management ────────────────────────────────────────────────────────
  const saveUser = useCallback((user: Partial<AdminUser>, isNew = false) => {
    if (isNew) {
      const newUser: AdminUser = {
        id: "user-" + Date.now(),
        name: user.name || "Administrator",
        email: user.email || "user@bac.edu.in",
        role: user.role || "staff",
        departmentId: user.departmentId,
        clubId: user.clubId,
        permissions: user.permissions || ["view"],
        status: "active",
        phone: user.phone,
        ...user,
      };
      setUsers((prev) => [...prev, newUser]);
      logAction({ action: "CREATE", module: "User Management", recordId: newUser.id, recordTitle: `Created user ${newUser.name}` });
    } else {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...user } : u)));
      logAction({ action: "UPDATE", module: "User Management", recordId: user.id || "", recordTitle: `Updated user ${user.name || ""}` });
    }
  }, [logAction]);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAction({ action: "DELETE", module: "User Management", recordId: id, recordTitle: "Deactivated user" });
  }, [logAction]);

  // ── Enquiries ───────────────────────────────────────────────────────────────
  const updateEnquiryStatus = useCallback((id: string, status: ContactEnquiry["status"], notes?: string) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status, notes: notes ?? e.notes } : e)));
    logAction({ action: "UPDATE", module: "Enquiries", recordId: id, recordTitle: `Enquiry status: ${status}` });

    // Synchronize to protected backend API
    const backendStatus = status === "unread" ? "new" : status === "resolved" ? "resolved" : "in_progress";
    apiClient.put(`/contact/enquiries/${id}`, { status: backendStatus, responseNotes: notes || "" }).catch((err: any) => {
      console.warn("[CMS Store] Backend enquiry update failed, stored locally:", err?.message);
    });
  }, [logAction]);

  const saveEnquiry = useCallback((enquiry: Partial<ContactEnquiry>) => {
    const newEnquiry: ContactEnquiry = {
      id: "enq-" + Date.now(),
      name: enquiry.name || "Anonymous",
      email: enquiry.email || "",
      phone: enquiry.phone || "",
      category: enquiry.category || "General",
      subject: enquiry.subject || "Inquiry",
      message: enquiry.message || "",
      submittedAt: new Date().toLocaleString("en-IN"),
      status: "unread",
      ...enquiry,
    };
    setEnquiries((prev) => [newEnquiry, ...prev]);
  }, []);

  // ── Notifications ───────────────────────────────────────────────────────────
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  return (
    <CMSStoreContext.Provider
      value={{
        currentUser,
        switchUser,
        users,
        saveUser,
        deleteUser,
        canAccessDepartment,
        canAccessClub,
        hasPermission,
        approvals,
        submitForApproval,
        approveItem,
        rejectItem,
        auditLogs,
        logAction,
        pages,
        savePage,
        deletePage,
        getPageBySlug,
        menuItems,
        saveMenuItem,
        deleteMenuItem,
        reorderMenuItems,
        mediaAssets,
        saveMediaAsset,
        deleteMediaAsset,
        documents,
        saveDocument,
        deleteDocument,
        applications,
        updateApplicationStatus,
        saveApplication,
        alumni,
        verifyAlumni,
        saveAlumni,
        notices,
        saveNotice,
        deleteNotice,
        clubs,
        saveClub,
        deleteClub,
        enquiries,
        updateEnquiryStatus,
        saveEnquiry,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </CMSStoreContext.Provider>
  );
}
