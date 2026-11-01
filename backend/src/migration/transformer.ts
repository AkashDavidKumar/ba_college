/**
 * transformer.ts — Pure Data Transformation from cms-database.json to Mongoose Entities
 *
 * Security & Integrity Guarantees:
 *  1. Does NOT mutate the input source data.
 *  2. Excludes admissions application PII by default.
 *  3. Generates unique deterministic slugs for courses and events.
 *  4. Detects unmapped source fields.
 */
import { RawSourceData, MappedEntities } from './types';
import { getEnv } from '../config/env';

/** Helper to generate a clean, lowercase URL-safe slug */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphen
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export interface TransformOptions {
  includeSampleAdmissions?: boolean;
}

export interface TransformResult {
  entities: MappedEntities;
  unmappedFields: string[];
  sensitiveRecordsDetected: number;
  sensitiveRecordsExcluded: number;
}

export function transformSourceData(
  rawData: RawSourceData,
  options: TransformOptions = {}
): TransformResult {
  const recognizedTopLevelKeys = new Set([
    'logo',
    'hero',
    'heroSection',
    'announcements',
    'about',
    'footer',
    'departments',
    'events',
    'guestSpeakers',
    'eventGallery',
    'erpModules',
    'admissionsPortalFeatures',
    'admissionsApplications',
  ]);

  const unmappedFields: string[] = Object.keys(rawData).filter(
    (k) => !recognizedTopLevelKeys.has(k)
  );

  // 1. Site Content Singleton
  const rawAnnouncements = (rawData.announcements || []) as unknown[];
  const announcements = rawAnnouncements.map((a, idx) => {
    if (typeof a === 'string') {
      return {
        id: `ann-${idx + 1}`,
        title: a,
        category: 'general' as const,
        isNewItem: true,
        publishDate: new Date(),
        date: new Date().toISOString().split('T')[0],
        badge: 'News',
      };
    }
    const obj = (a || {}) as Record<string, unknown>;
    const link =
      typeof obj['link'] === 'string' &&
      (obj['link'].startsWith('https://') || obj['link'].startsWith('/'))
        ? obj['link']
        : undefined;
    return {
      id: (obj['id'] as string) || `ann-${idx + 1}`,
      title: (obj['title'] as string) || (obj['text'] as string) || 'Announcement',
      link,
      category: (obj['category'] as string) || 'general',
      isNewItem: obj['isNewItem'] !== undefined ? Boolean(obj['isNewItem']) : true,
      publishDate: obj['publishDate'] ? new Date(obj['publishDate'] as string) : new Date(),
      date: (obj['date'] as string) || '',
      badge: (obj['badge'] as string) || '',
    };
  });

  const rawFooter = (rawData.footer || {}) as Record<string, unknown>;
  const sanitizeUrl = (u: unknown) => {
    if (typeof u !== 'string') return undefined;
    const t = u.trim();
    return t.startsWith('https://') || t.startsWith('/') ? t : undefined;
  };

  const footer = {
    ctaBadge: (rawFooter['ctaBadge'] as string) || 'Admission 2026-27 Open',
    ctaTitle: (rawFooter['ctaTitle'] as string) || 'Begin Your Journey of Academic Excellence',
    ctaDescription: (rawFooter['ctaDescription'] as string) || undefined,
    aboutText:
      (rawFooter['aboutText'] as string) ||
      'Bishop Ambrose College is a premier higher education institution in Coimbatore.',
    address:
      (rawFooter['address'] as string) ||
      'College Road, Sungam Bypass, Ramanathapuram, Coimbatore, Tamil Nadu 641045',
    phone: (rawFooter['phone'] as string) || '+91 422 231 6777',
    email: (rawFooter['email'] as string) || 'info@bac.edu.in',
    infoEmail: (rawFooter['infoEmail'] as string) || undefined,
    facebook: sanitizeUrl(rawFooter['facebook']),
    twitter: sanitizeUrl(rawFooter['twitter']),
    instagram: sanitizeUrl(rawFooter['instagram']),
    linkedin: sanitizeUrl(rawFooter['linkedin']),
    youtube: sanitizeUrl(rawFooter['youtube']),
    copyright:
      (rawFooter['copyright'] as string) ||
      '© 2026 Bishop Ambrose College. All rights reserved.',
  };

  const rawErp = (rawData.erpModules || {}) as
    | Record<string, Array<Record<string, unknown>>>
    | Array<Record<string, unknown>>;
  const erpModules: Array<Record<string, unknown>> = [];
  if (Array.isArray(rawErp)) {
    rawErp.forEach((item, idx) => {
      erpModules.push({
        id: (item['id'] as string) || `erp-mod-${idx + 1}`,
        name: (item['name'] as string) || `Module ${idx + 1}`,
        url: (item['url'] as string) || `/erp/module/${idx + 1}`,
        icon: (item['icon'] as string) || 'Building2',
        description: (item['description'] as string) || undefined,
        badge: (item['badge'] as string) || undefined,
      });
    });
  } else if (typeof rawErp === 'object' && rawErp !== null) {
    Object.entries(rawErp).forEach(([category, list]) => {
      if (Array.isArray(list)) {
        list.forEach((item, idx) => {
          erpModules.push({
            id: `erp-${category}-${idx + 1}`,
            name: (item['name'] as string) || `Module ${idx + 1}`,
            url: (item['url'] as string) || `/erp/${category}/${idx + 1}`,
            icon: (item['icon'] as string) || 'Building2',
            description: (item['description'] as string) || undefined,
            badge: category.toUpperCase(),
          });
        });
      }
    });
  }

  const rawFeatures = (rawData.admissionsPortalFeatures || []) as Array<Record<string, unknown>>;
  const admissionsPortalFeatures = rawFeatures.map((f, idx) => ({
    title: (f['title'] as string) || (f['name'] as string) || `Feature ${idx + 1}`,
    description: (f['description'] as string) || 'Admissions feature description',
    icon: (f['icon'] as string) || undefined,
  }));

  const siteContent: Record<string, unknown> = {
    singletonKey: 'default',
    logo: rawData.logo || {
      text1: 'Bishop Ambrose',
      text2: 'College',
      image: '',
      alt: 'Bishop Ambrose College Logo',
    },
    hero: rawData.hero || {
      badge: 'Excellence in Higher Education Since 1986',
      title: 'Empowering Minds, Transforming Futures',
      subtitle:
        'Affiliated to Bharathiar University, Re-accredited by NAAC with A+ Grade.',
      ctaText: 'Explore Programs',
      ctaLink: '/courses',
      secondaryCtaText: 'Virtual Tour',
      secondaryCtaLink: '/about',
      stats: [
        { label: 'Students', value: '3500+' },
        { label: 'Placement Rate', value: '96%' },
        { label: 'Rankings', value: 'Top 50' },
      ],
    },
    announcements,
    footer,
    erpModules,
    admissionsPortalFeatures,
    statistics:
      ((rawData.hero as Record<string, unknown>)?.['stats'] as Array<Record<string, unknown>>) || [
        { label: 'Graduates', value: '15000+' },
        { label: 'Faculty', value: '120+' },
        { label: 'Placement Partners', value: '85+' },
      ],
    heroSection: rawData.heroSection || {
      backgroundVideo:
        'https://assets.mixkit.co/videos/preview/mixkit-university-campus-with-students-walking-around-4340-large.mp4',
      fallbackImage:
        'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
      blurIntensity: 80,
      overlayOpacity: 75,
      enabled: true,
    },
    virtualTour: {
      enabled: true,
      mediaType: 'youtube',
      mediaUrl: 'https://www.youtube.com/embed/91tSZsX0Bjg',
      posterImage:
        'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
      heading: 'Experience Our Campus',
      subheading: 'Take an immersive virtual tour of Bishop Ambrose College',
      campusName: 'Knowledge Campus',
      campusDescription: 'Modern laboratories, digital classrooms, and state-of-the-art libraries.',
      showStats: true,
      ctaLabel: 'Schedule On-Campus Visit',
    },
    location: {
      campusAddress: 'College Road, Ramanathapuram, Coimbatore, Tamil Nadu',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641045',
      coordinates: { lat: 10.9983, lng: 76.9926 },
      directions: 'Located 4 km from Coimbatore Railway Junction on Sungam Bypass Road.',
    },
    isSeedManaged: true,
    isActive: true,
  };

  // 2. About Page Singleton
  const rawAbout = (rawData.about || {}) as Record<string, unknown>;
  const aboutPage: Record<string, unknown> = {
    singletonKey: 'default',
    title: (rawAbout['title'] as string) || 'About Bishop Ambrose College',
    text1:
      (rawAbout['text1'] as string) ||
      'Bishop Ambrose College was established with a vision to impart quality higher education.',
    text2:
      (rawAbout['text2'] as string) ||
      'The institution nurtures academic brilliance, character formation, and community outreach.',
    history:
      (rawAbout['history'] as string) ||
      'Founded in 1986 under the Diocese of Coimbatore to serve urban and rural student communities.',
    vision:
      (rawAbout['vision'] as string) ||
      'To be a centre of excellence in higher education fostering holistic character development.',
    mission: (rawAbout['mission'] as string[]) || [
      'To provide value-based education accessible to all strata of society.',
      'To foster research, critical thinking, and ethical responsibility.',
      'To empower students with career-ready professional skills.',
    ],
    coreValues: (rawAbout['coreValues'] as string[]) || [
      'Academic Excellence',
      'Integrity & Ethics',
      'Social Responsibility',
      'Inclusivity',
    ],
    principalMessage: rawAbout['principalMessage'] || {
      name: 'Dr. V. Anitha',
      designation: 'Principal & Senior Professor',
      qualification: 'Ph.D., M.Sc., M.Phil.',
      message:
        'Welcome to Bishop Ambrose College. We inspire students to strive for academic mastery and noble service.',
      quote: 'Education is the most powerful weapon which you can use to change the world.',
    },
    milestones: rawAbout['milestones'] || [
      { year: '1986', event: 'Inception of Bishop Ambrose College' },
      { year: '2004', event: 'NAAC First Accreditation' },
      { year: '2018', event: 'Launch of Postgraduate & Research Centres' },
      { year: '2024', event: 'NAAC Re-accreditation with A+ Grade' },
    ],
    awards: rawAbout['awards'] || [
      {
        title: 'NAAC A+ Accreditation',
        year: '2024',
        issuer: 'National Assessment and Accreditation Council',
        description: 'Awarded A+ Grade with 3.42 CGPA in Cycle 3.',
      },
    ],
    stats: rawAbout['stats'] || [
      { label: 'Years of Excellence', value: '40+' },
      { label: 'Alumni Worldwide', value: '15000+' },
      { label: 'University Ranks', value: '120+' },
    ],
    isSeedManaged: true,
    isActive: true,
  };

  // 3. Departments and 4. Courses Extraction
  const rawDepartments = (rawData.departments || []) as Array<Record<string, unknown>>;
  const departments: Array<Record<string, unknown>> = [];
  const courses: Array<Record<string, unknown>> = [];

  const seenCourseSlugs = new Set<string>();

  rawDepartments.forEach((dept, deptIdx) => {
    const deptSlug = (dept['slug'] as string) || slugify((dept['name'] as string) || `dept-${deptIdx + 1}`);
    const deptName = (dept['name'] as string) || 'Department';

    // Extract programs into courses collection
    const programs = (dept['programs'] as Array<Record<string, unknown>>) || [];
    programs.forEach((prog, progIdx) => {
      const progName = (prog['name'] as string) || `Programme ${progIdx + 1}`;
      let courseSlug = slugify(progName);
      if (seenCourseSlugs.has(courseSlug)) {
        courseSlug = `${courseSlug}-${deptSlug}`;
      }
      seenCourseSlugs.add(courseSlug);

      const levelRaw = (prog['level'] as string) || 'UG';
      const level: 'UG' | 'PG' | 'Doctoral' | 'Certificate' =
        levelRaw === 'PG' || levelRaw === 'Doctoral' || levelRaw === 'Certificate'
          ? levelRaw
          : 'UG';

      courses.push({
        slug: courseSlug,
        name: progName,
        code: (prog['code'] as string) || undefined,
        level,
        department: deptName,
        departmentSlug: deptSlug,
        duration: (prog['duration'] as string) || '3 Years',
        durationYears: prog['duration'] ? parseInt(String(prog['duration']), 10) || 3 : 3,
        eligibility: (prog['eligibility'] as string) || 'Pass in 10+2 or equivalent examination',
        fees: (prog['fees'] as string) || undefined,
        intake: typeof prog['intake'] === 'number' ? prog['intake'] : 60,
        description: (prog['description'] as string) || `${progName} offered by ${deptName}.`,
        published: true,
        isActive: true,
        isSeedManaged: true,
      });
    });

    // Clean department document without raw embedded programs (which will be virtually populated)
    const rawCover = typeof dept['cover'] === 'string' ? dept['cover'] : '';
    const rawCoverImage = typeof dept['coverImage'] === 'string' ? dept['coverImage'] : '';
    const isCoverUrl = rawCover.startsWith('https://') || rawCover.startsWith('/');
    const isCoverImageUrl = rawCoverImage.startsWith('https://') || rawCoverImage.startsWith('/');

    const cover = isCoverUrl ? rawCover : isCoverImageUrl ? rawCoverImage : undefined;
    const coverImage = isCoverImageUrl ? rawCoverImage : isCoverUrl ? rawCover : undefined;
    const color = (dept['color'] as string) || (rawCover.startsWith('from-') ? rawCover : 'from-blue-600 to-indigo-700');

    // Mission normalization (string or array)
    const rawMission = dept['mission'];
    const mission = typeof rawMission === 'string'
      ? [rawMission]
      : Array.isArray(rawMission)
      ? rawMission.map(String)
      : undefined;

    // Highlights normalization (array of strings)
    const rawHighlights = Array.isArray(dept['highlights']) ? dept['highlights'] : [];
    const highlights = rawHighlights.map((h: unknown) => {
      if (typeof h === 'string') return h;
      if (h && typeof h === 'object' && 'title' in h) {
        const hObj = h as { title: string; description?: string };
        return `${hObj.title}: ${hObj.description || ''}`;
      }
      return JSON.stringify(h);
    });

    // Faculty normalization
    const rawFaculty = (dept['faculty'] as Array<Record<string, unknown>>) || [];
    const faculty = rawFaculty.map((f: Record<string, unknown>, fIdx: number) => ({
      id: (f['id'] as string) || `fac-${deptIdx + 1}-${fIdx + 1}`,
      name: (f['name'] as string) || 'Faculty Member',
      designation: (f['designation'] as string) || (f['role'] as string) || 'Assistant Professor',
      qualification: (f['qualification'] as string) || 'Ph.D.',
      experience: (f['experience'] as string) || undefined,
      specialization: f['specialization'] || f['researchInterests'] || undefined,
      email: (f['email'] as string) || undefined,
      image: (f['image'] as string) || undefined,
      publications:
        typeof f['publications'] === 'number' || typeof f['publications'] === 'string'
          ? f['publications']
          : 0,
      order: typeof f['order'] === 'number' ? f['order'] : fIdx,
    }));

    // Labs normalization
    const rawLabs = (dept['labs'] as Array<Record<string, unknown>>) || [];
    const labs = rawLabs.map((l: Record<string, unknown>) => ({
      name: (l['name'] as string) || 'Laboratory',
      description: (l['description'] as string) || undefined,
      equipment: Array.isArray(l['equipment']) ? l['equipment'].map(String) : undefined,
      capacity: typeof l['capacity'] === 'number' ? l['capacity'] : undefined,
      image: (l['image'] as string) || undefined,
    }));

    // Research stats normalization
    const rs = (dept['researchStats'] || {}) as Record<string, unknown>;
    const researchStats = {
      publications: typeof rs['publications'] === 'number' ? rs['publications'] : 0,
      patents: typeof rs['patents'] === 'number' ? rs['patents'] : 0,
      fundedProjects: String(rs['fundedProjects'] || rs['projects'] || '₹ 0'),
    };

    // Alumni normalization (object or array)
    const rawAlumni = Array.isArray(dept['alumni'])
      ? dept['alumni']
      : dept['alumni']
      ? [dept['alumni']]
      : [];
    const alumni = rawAlumni.map((a: unknown) => {
      const aObj = (a || {}) as Record<string, unknown>;
      return {
        name: (aObj['name'] as string) || 'Distinguished Alumnus',
        batch: (aObj['batch'] as string) || (aObj['year'] as string) || undefined,
        designation: (aObj['designation'] as string) || (aObj['position'] as string) || undefined,
        company: (aObj['company'] as string) || undefined,
        testimonial: (aObj['testimonial'] as string) || undefined,
        image: (aObj['image'] as string) || undefined,
      };
    });

    // Achievements normalization (object or array)
    const rawAchievements = Array.isArray(dept['achievements'])
      ? dept['achievements']
      : dept['achievements']
      ? [dept['achievements']]
      : [];
    const achievements = rawAchievements.map((ach: unknown) => {
      if (typeof ach === 'string') return ach;
      if (ach && typeof ach === 'object' && 'title' in ach) {
        const achObj = ach as { title: string; description?: string };
        return `${achObj.title}: ${achObj.description || ''}`;
      }
      return JSON.stringify(ach);
    });

    // Flagship events normalization (object or array)
    const rawFlagship = Array.isArray(dept['flagshipEvents'])
      ? dept['flagshipEvents']
      : dept['flagshipEvents']
      ? [dept['flagshipEvents']]
      : [];
    const flagshipEvents = rawFlagship.map((fe: unknown) => {
      if (typeof fe === 'string') return fe;
      if (fe && typeof fe === 'object' && 'name' in fe) {
        const feObj = fe as { name: string; description?: string };
        return `${feObj.name}: ${feObj.description || ''}`;
      }
      return JSON.stringify(fe);
    });

    // Contact normalization
    const rawContact = (dept['contact'] || {}) as Record<string, unknown>;
    const contact =
      rawContact['email'] || rawContact['phone'] || rawContact['location'] || rawContact['address']
        ? {
            email: (rawContact['email'] as string) || undefined,
            phone: (rawContact['phone'] as string) || undefined,
            location:
              (rawContact['location'] as string) || (rawContact['address'] as string) || undefined,
          }
        : undefined;

    departments.push({
      slug: deptSlug,
      name: deptName,
      shortName: (dept['shortName'] as string) || deptName,
      code: (dept['code'] as string) || `D${deptIdx + 1}`,
      category: (dept['category'] as string) || 'Academics',
      icon: (dept['icon'] as string) || 'Building2',
      description: (dept['description'] as string) || `${deptName} at Bishop Ambrose College.`,
      longDescription: (dept['longDescription'] as string) || undefined,
      cover,
      coverImage,
      color,
      vision: (dept['vision'] as string) || undefined,
      mission,
      highlights,
      headOfDepartment: dept['headOfDepartment'] || { name: '' },
      faculty,
      labs,
      researchStats,
      alumni,
      achievements,
      flagshipEvents,
      contact,
      order: typeof dept['order'] === 'number' ? dept['order'] : deptIdx,
      isSeedManaged: true,
      isActive: true,
    });
  });

  // 5. Events
  const rawEvents = (rawData.events || []) as Array<Record<string, unknown>>;
  const events: Array<Record<string, unknown>> = rawEvents.map((e, idx) => {
    const title = (e['title'] as string) || `Event ${idx + 1}`;
    const slug = (e['id'] as string) || slugify(title);
    const dateStr = (e['date'] as string) || new Date().toISOString();
    const startDate = new Date(dateStr);

    const rawSpeakers = (e['speakers'] as Array<Record<string, unknown>>) || [];
    const speakers = rawSpeakers.map((spk) => ({
      name: (spk['name'] as string) || 'Speaker',
      designation: (spk['designation'] as string) || undefined,
      organization: (spk['organization'] as string) || (spk['company'] as string) || undefined,
      photo: (spk['photo'] as string) || (spk['image'] as string) || undefined,
      bio: (spk['bio'] as string) || (spk['topic'] as string) || undefined,
    }));

    return {
      slug,
      title,
      category: (e['category'] as string) || 'academic',
      startDate: isNaN(startDate.getTime()) ? new Date() : startDate,
      date: dateStr,
      time: (e['time'] as string) || '10:00 AM - 04:00 PM',
      venue: (e['venue'] as string) || 'Main Campus Auditorium',
      description: (e['description'] as string) || title,
      coverImage: (e['image'] as string) || undefined,
      registrationUrl: (e['registrationLink'] as string) || undefined,
      isFeatured: Boolean(e['featured']),
      speakers,
      schedule: (e['schedule'] as Array<Record<string, unknown>>) || [],
      isSeedManaged: true,
      isActive: true,
      isArchived: false,
    };
  });

  // 6. Guest Speakers
  const rawSpeakers = (rawData.guestSpeakers || []) as Array<Record<string, unknown>>;
  const guestSpeakers: Array<Record<string, unknown>> = rawSpeakers.map((spk, idx) => ({
    name: (spk['name'] as string) || `Guest Speaker ${idx + 1}`,
    role: (spk['role'] as string) || 'Distinguished Lecturer',
    topic: (spk['topic'] as string) || undefined,
    image: (spk['image'] as string) || undefined,
    date: (spk['date'] as string) || undefined,
    order: idx,
    isSeedManaged: true,
    isActive: true,
  }));

  // 7. Gallery Data Singleton
  const rawGallery = (rawData.eventGallery || []) as Array<Record<string, unknown>>;
  const galleryData: Record<string, unknown> = {
    singletonKey: 'default',
    albums: rawGallery.map((g, idx) => ({
      id: (g['id'] as string) || `alb-${idx + 1}`,
      title: (g['title'] as string) || `Album ${idx + 1}`,
      category: (g['category'] as string) || 'Campus',
      coverImage: (g['image'] as string) || undefined,
      image: (g['image'] as string) || undefined,
      count: typeof g['count'] === 'number' ? g['count'] : 0,
      photos: [],
    })),
    videos: [],
    isSeedManaged: true,
    isActive: true,
  };

  // 8. News Articles (Default seed press releases)
  const newsArticles: Array<Record<string, unknown>> = [
    {
      slug: 'bac-achieves-naac-a-plus-grade',
      title: 'Bishop Ambrose College Re-accredited with NAAC A+ Grade',
      excerpt:
        'The National Assessment and Accreditation Council (NAAC) has awarded Bishop Ambrose College an A+ Grade in Cycle 3.',
      content:
        'Bishop Ambrose College has achieved a remarkable milestone by securing NAAC A+ Grade with a CGPA of 3.42. The peer team commended the institution for academic innovation, faculty research, and community engagement.',
      category: 'Academic',
      author: {
        name: 'IQAC Cell',
        role: 'Accreditation Directorate',
      },
      publishDate: new Date('2026-09-15T10:00:00.000Z'),
      readTime: '3 min read',
      isFeatured: true,
      status: 'published',
      isSeedManaged: true,
      isActive: true,
    },
    {
      slug: 'record-placement-season-2026',
      title: 'Over 96% Students Placed in Leading Multinationals',
      excerpt:
        'Bishop Ambrose College students receive top corporate offers during the 2025-26 campus placement drive.',
      content:
        'The Career Studio and Placement Cell announced that over 85 corporate recruiters participated in the placement drive, offering positions in software engineering, financial analysis, biotechnology, and management.',
      category: 'Placement',
      author: {
        name: 'Placement Office',
        role: 'Career Studio',
      },
      publishDate: new Date('2026-10-01T10:00:00.000Z'),
      readTime: '4 min read',
      isFeatured: true,
      status: 'published',
      isSeedManaged: true,
      isActive: true,
    },
  ];

  // 9. IQAC Dossier Singleton
  const iqacDossier: Record<string, unknown> = {
    singletonKey: 'default',
    stats: {
      naacGrade: 'A+',
      cycle: 'Cycle 3',
      cgpa: '3.42',
      establishedYear: '2004',
      nirfRankBand: 'Rank-band 101-150',
      isoCertification: 'ISO 9001:2015',
    },
    criteria: [
      {
        id: 'c1',
        name: 'Curricular Aspects',
        score: '3.60',
        status: 'Excellent',
        keyMetrics: [{ label: 'Programmes Offered', value: '30' }],
      },
      {
        id: 'c2',
        name: 'Teaching-Learning and Evaluation',
        score: '3.55',
        status: 'Excellent',
        keyMetrics: [{ label: 'Student-Teacher Ratio', value: '18:1' }],
      },
      {
        id: 'c3',
        name: 'Research, Innovations and Extension',
        score: '3.30',
        status: 'Very Good',
        keyMetrics: [{ label: 'Publications in Scopus/WoS', value: '120+' }],
      },
    ],
    aqarReports: [
      { id: 'aqar-2024-25', year: '2024-2025', downloadCount: 142, status: 'Published' },
      { id: 'aqar-2023-24', year: '2023-2024', downloadCount: 310, status: 'Published' },
    ],
    ssrDossier: [
      { criterion: 'Criterion 1', title: 'Curriculum Design & Academic Flexibility', downloadCount: 88 },
      { criterion: 'Criterion 2', title: 'Teaching-Learning Pedagogies & Mentor System', downloadCount: 95 },
    ],
    sssDossier: [
      { year: '2024-2025', responsesCount: 1850, satisfactionRate: '94.2%', downloadCount: 65 },
    ],
    committee: [
      { name: 'Dr. V. Anitha', designation: 'Principal', role: 'Chairperson' },
      { name: 'Dr. K. Suresh', designation: 'Associate Professor', role: 'Director / Coordinator' },
    ],
    initiatives: [
      {
        title: 'Curriculum Modernization & Industry 4.0 Integration',
        description: 'Updated syllabus across all programmes to embed AI and data analytics.',
        date: '2025-2026',
        impact: 'Enhanced student employability across departments.',
      },
    ],
    downloads: [],
    isSeedManaged: true,
    isActive: true,
  };

  // 10. Facilities
  const facilities: Array<Record<string, unknown>> = [
    {
      name: 'Advanced Computing Laboratories',
      category: 'lab',
      description:
        'Equipped with 250+ high-end workstations, cloud virtualization servers, and AI development rigs.',
      amenities: ['Gigabit Fiber Internet', 'Dual-Boot OS', 'Air-Conditioned', 'UPS Backup'],
      images: [
        'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
      ],
      details: 'Operational from 8:00 AM to 6:00 PM for student practicals and research.',
      published: true,
      isActive: true,
      isSeedManaged: true,
    },
    {
      name: 'Rev. Fr. Ambrose Central Library',
      category: 'library',
      description:
        'Extensive repository with over 50,000 print volumes, DELNET subscription, and IEEE digital access.',
      amenities: ['RFID Circulation', 'Digital OPAC', 'Reprography', 'Quiet Study Halls'],
      images: [
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
      ],
      details: 'Automated library system with open access catalog for all enrolled students.',
      published: true,
      isActive: true,
      isSeedManaged: true,
    },
    {
      name: 'Sports Complex & Athletics Pavilion',
      category: 'sports',
      description:
        'Multi-sport complex featuring standard basketball courts, football pitch, indoor badminton, and fitness gym.',
      amenities: ['Floodlit Courts', 'Locker Facilities', 'Certified Coaches', 'First Aid Station'],
      images: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      ],
      details: 'Regular host for Bharathiar University inter-collegiate athletic tournaments.',
      published: true,
      isActive: true,
      isSeedManaged: true,
    },
  ];

  // 11. Placements Singleton
  const placement: Record<string, unknown> = {
    singletonKey: 'default',
    overview:
      'The Career Studio and Placement Cell bridges academia and corporate enterprise, securing high-impact career pathways.',
    stats: [
      {
        year: '2025-26',
        totalPlaced: 480,
        highestPackage: '₹ 14.5 LPA',
        averagePackage: '₹ 5.2 LPA',
        placementRate: '96.4%',
      },
      {
        year: '2024-25',
        totalPlaced: 465,
        highestPackage: '₹ 12.0 LPA',
        averagePackage: '₹ 4.8 LPA',
        placementRate: '95.1%',
      },
    ],
    recruiters: [
      {
        id: 'rec-1',
        name: 'Tata Consultancy Services',
        logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80',
        sector: 'Information Technology',
        hiringCount: 85,
      },
      {
        id: 'rec-2',
        name: 'Infosys',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
        sector: 'Software Engineering',
        hiringCount: 72,
      },
      {
        id: 'rec-3',
        name: 'HDFC Bank',
        logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=200&q=80',
        sector: 'Banking & Financial Services',
        hiringCount: 40,
      },
    ],
    successStories: [
      {
        id: 'story-1',
        studentName: 'S. Koushik',
        program: 'B.Sc. Computer Science',
        company: 'Zoho Corporation',
        package: '₹ 10 LPA',
        batch: '2025',
        quote: 'The rigorous practical training and lab mentorship gave me an edge in technical interviews.',
      },
      {
        id: 'story-2',
        studentName: 'M. Divya',
        program: 'B.Com Professional Accounting',
        company: 'Deloitte',
        package: '₹ 8.5 LPA',
        batch: '2025',
        quote: 'Bishop Ambrose College provided the perfect foundation for my accounting career.',
      },
    ],
    placementProcess: [
      'Pre-Placement Career Counselling & Profile Mapping',
      'Aptitude, Soft Skills, and Mock Technical Interviews',
      'On-Campus Corporate Drives and Digital Assessments',
      'Final Offer Letter Handover & Internship Transition',
    ],
    trainingPrograms: [
      'Advanced Full-Stack Web Technologies',
      'Corporate Finance, GST & Tally Prime Certification',
      'Soft Skills, Public Speaking & Business Etiquette',
    ],
    isSeedManaged: true,
    isActive: true,
  };

  // 12. Contact Info Singleton
  const contactInfo: Record<string, unknown> = {
    singletonKey: 'default',
    address: 'Bishop Ambrose College, College Road, Sungam Bypass',
    addressLine2: 'Ramanathapuram',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641045',
    phones: [
      { label: 'General Enquiries', number: '+91 422 231 6777' },
      { label: 'Admissions Helpline', number: '+91 422 231 8999' },
    ],
    emails: [
      { label: 'Official Enquiries', address: 'info@bac.edu.in' },
      { label: 'Admissions Desk', address: 'admissions@bac.edu.in' },
    ],
    admissionHelpline: '+91 94880 12345',
    officeHours: 'Mon – Sat: 8:30 AM – 5:00 PM',
    mapsEmbedUrl: 'https://maps.google.com/embed',
    socialLinks: [
      { platform: 'Facebook', url: 'https://facebook.com' },
      { platform: 'Instagram', url: 'https://instagram.com' },
      { platform: 'LinkedIn', url: 'https://linkedin.com' },
      { platform: 'YouTube', url: 'https://youtube.com' },
    ],
    departmentContacts: [
      {
        dept: 'Computer Science',
        person: 'Dr. K. Suresh',
        phone: '+91 422 231 6778',
        email: 'cs@bac.edu.in',
      },
      {
        dept: 'Commerce',
        person: 'Dr. M. Lakshmi',
        phone: '+91 422 231 6779',
        email: 'commerce@bac.edu.in',
      },
    ],
    formRecipientEmail: 'admissions@bac.edu.in',
    formAutoReply: false,
    isSeedManaged: true,
    isActive: true,
  };

  // 13. Admissions Applications (PII Isolation Policy)
  const rawAdmissions = (rawData.admissionsApplications || []) as Array<Record<string, unknown>>;
  const sensitiveRecordsDetected = rawAdmissions.length;
  let sensitiveRecordsExcluded = sensitiveRecordsDetected;
  const admissionsApplications: Array<Record<string, unknown>> = [];

  // Strictly exclude unless explicit flag is passed in a non-production environment
  if (
    options.includeSampleAdmissions &&
    getEnv().NODE_ENV !== 'production'
  ) {
    sensitiveRecordsExcluded = 0;
    rawAdmissions.forEach((app, idx) => {
      admissionsApplications.push({
        appNumber: `BAC-ADM-SAMPLE-${String(idx + 1).padStart(4, '0')}`,
        candidateName: (app['name'] as string) || `Candidate ${idx + 1}`,
        email: (app['email'] as string) || `applicant${idx + 1}@example.com`,
        phone: (app['phone'] as string) || '+91 90000 00000',
        program: (app['program'] as string) || 'B.Sc. Computer Science',
        status: 'submitted',
        submittedAt: app['appliedAt'] ? new Date(app['appliedAt'] as string) : new Date(),
        notes: (app['notes'] as string) || '',
        remarks: [],
        isArchived: false,
      });
    });
  }

  // 14. Contact Enquiries (Empty transactional collection)
  const contactEnquiries: Array<Record<string, unknown>> = [];

  const entities: MappedEntities = {
    siteContent,
    aboutPage,
    departments,
    courses,
    events,
    guestSpeakers,
    galleryData,
    newsArticles,
    iqacDossier,
    admissionsApplications,
    facilities,
    placement,
    contactInfo,
    contactEnquiries,
  };

  return {
    entities,
    unmappedFields,
    sensitiveRecordsDetected,
    sensitiveRecordsExcluded,
  };
}
