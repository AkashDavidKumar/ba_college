/**
 * public-read.test.ts — Automated Integration & Unit Tests for Phase 3 Sub-Phase 3C
 *
 * Verifies:
 *  1. Dual-route public architecture: Legacy (/api/...) and Versioned REST (/api/v1/...).
 *  2. Public cache headers (Cache-Control) and deterministic ETag generation.
 *  3. Conditional HTTP request handling (If-None-Match returning 304 Not Modified).
 *  4. Data serialization, shape compatibility, and field renaming (e.g. programs).
 *  5. Strict privacy guards (Placements candidate PII exclusion, internal notes redaction).
 *  6. Safe 404 error handling for non-existent entities.
 *  7. Active advertisements fallback endpoint compatibility.
 */
import request from 'supertest';
import { createApp } from '../app';
import {
  SiteContent,
  AboutPage,
  Department,
  Course,
  Event,
  GuestSpeaker,
  GalleryData,
  NewsArticle,
  IQACDossier,
  Facility,
  Placement,
  ContactInfo,
} from '../models';

const app = createApp({
  corsOrigins: ['http://localhost:3000'],
  trustProxy: false,
});

/**
 * Helper to mock Mongoose chained query methods (.sort, .populate, .select, .lean)
 */
function mockMongooseQuery<T>(data: T) {
  const query: any = {
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(data),
    exec: jest.fn().mockResolvedValue(data),
    then: (resolve: (val: T) => void) => Promise.resolve(data).then(resolve),
  };
  return query;
}

describe('Sub-Phase 3C — Public Read Controllers & Compatibility Layer', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── 1. HTTP Caching & ETag Negotiation ────────────────────────────────────
  describe('1. Caching & ETag Negotiation Middleware', () => {
    it('sets public Cache-Control headers and deterministic ETag on public GET routes', async () => {
      const mockContact = {
        email: 'info@bac.edu.in',
        phone: '+91 422 2410145',
        address: {
          street: 'Ambrose Nagar, Chettipalayam Road',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641024',
        },
        socialLinks: { facebook: 'https://facebook.com/bac' },
      };
      jest.spyOn(ContactInfo, 'findOne').mockReturnValue(mockMongooseQuery(mockContact) as any);

      const res = await request(app).get('/api/contact');

      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toBe('public, max-age=60, stale-while-revalidate=300');
      expect(res.headers['etag']).toBeDefined();
      expect(res.headers['etag']).toMatch(/^W\/"[a-f0-9]{64}"$/);
    });

    it('returns 304 Not Modified when If-None-Match header matches response ETag', async () => {
      const mockContact = {
        email: 'info@bac.edu.in',
        phone: '+91 422 2410145',
        address: {
          street: 'Ambrose Nagar',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641024',
        },
      };
      jest.spyOn(ContactInfo, 'findOne').mockReturnValue(mockMongooseQuery(mockContact) as any);

      // Initial request to capture ETag
      const firstRes = await request(app).get('/api/contact');
      expect(firstRes.status).toBe(200);
      const etag = firstRes.headers['etag'];
      expect(etag).toBeDefined();

      // Conditional request with matching If-None-Match
      const secondRes = await request(app)
        .get('/api/contact')
        .set('If-None-Match', etag);

      expect(secondRes.status).toBe(304);
      expect(secondRes.text).toBe('');
    });

    it('returns 200 with new data when If-None-Match does not match', async () => {
      const mockContact = { email: 'info@bac.edu.in' };
      jest.spyOn(ContactInfo, 'findOne').mockReturnValue(mockMongooseQuery(mockContact) as any);

      const res = await request(app)
        .get('/api/contact')
        .set('If-None-Match', 'W/"different_hash"');

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('info@bac.edu.in');
    });
  });

  // ── 2. Site Content & Navigation Dossier ──────────────────────────────────
  describe('2. Site Content & Navigation Dossier', () => {
    const mockContent = {
      hero: { title: 'Excellence in Education', subtitle: 'Empowering minds' },
      announcements: [{ id: 'a1', text: 'Admissions Open 2026-27' }],
      statistics: [{ value: '95%', label: 'Placement Rate' }],
      location: { city: 'Coimbatore', address: 'Ambrose Nagar' },
      footer: { copyright: '© 2026 Bishop Ambrose College' },
    };
    const mockAbout = {
      history: 'Founded in 1997 by the Diocese of Coimbatore.',
      vision: 'To provide quality higher education to rural and urban youth.',
      mission: 'To foster intellectual competence and moral values.',
      coreValues: ['Integrity', 'Excellence', 'Service'],
      leadership: [{ name: 'Dr. V. Anitha', designation: 'Principal' }],
    };

    it('legacy GET /api/content returns direct content dictionary', async () => {
      jest.spyOn(SiteContent, 'findOne').mockReturnValue(mockMongooseQuery(mockContent) as any);
      jest.spyOn(AboutPage, 'findOne').mockReturnValue(mockMongooseQuery(mockAbout) as any);

      const res = await request(app).get('/api/content');

      expect(res.status).toBe(200);
      expect(res.body.hero.title).toBe('Excellence in Education');
      expect(res.body.announcements).toHaveLength(1);
      expect(res.body.statistics[0].value).toBe('95%');
    });

    it('versioned GET /api/v1/content returns { success: true, data: ... }', async () => {
      jest.spyOn(SiteContent, 'findOne').mockReturnValue(mockMongooseQuery(mockContent) as any);
      jest.spyOn(AboutPage, 'findOne').mockReturnValue(mockMongooseQuery(mockAbout) as any);

      const res = await request(app).get('/api/v1/content');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hero.title).toBe('Excellence in Education');
    });

    it('returns 404 when SiteContent document is not found', async () => {
      jest.spyOn(SiteContent, 'findOne').mockReturnValue(mockMongooseQuery(null) as any);
      jest.spyOn(AboutPage, 'findOne').mockReturnValue(mockMongooseQuery(null) as any);

      const res = await request(app).get('/api/content');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ── 3. About Page Dossier ─────────────────────────────────────────────────
  describe('3. About Page Dossier', () => {
    const mockAbout = {
      history: 'Founded in 1997 by the Diocese of Coimbatore.',
      vision: 'To provide quality higher education to rural and urban youth.',
      mission: 'To foster intellectual competence and moral values.',
      coreValues: ['Integrity', 'Excellence', 'Service'],
      leadership: [{ name: 'Dr. V. Anitha', designation: 'Principal' }],
    };

    it('legacy GET /api/about returns direct about page dictionary', async () => {
      jest.spyOn(AboutPage, 'findOne').mockReturnValue(mockMongooseQuery(mockAbout) as any);

      const res = await request(app).get('/api/about');

      expect(res.status).toBe(200);
      expect(res.body.vision).toContain('quality higher education');
      expect(res.body.leadership[0].designation).toBe('Principal');
    });

    it('versioned GET /api/v1/about returns wrapped envelope', async () => {
      jest.spyOn(AboutPage, 'findOne').mockReturnValue(mockMongooseQuery(mockAbout) as any);

      const res = await request(app).get('/api/v1/about');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vision).toContain('quality higher education');
    });
  });

  // ── 4. Departments & Course Virtual Population ────────────────────────────
  describe('4. Departments & Course Parallel Read Queries (Option A Approved)', () => {
    const mockDeptCS = {
      _id: '672000000000000000000001',
      name: 'Department of Computer Science',
      code: 'CS',
      slug: 'computer-science',
      description: 'Department of Computer Science',
      order: 1,
      isActive: true,
      deletedAt: null,
    };

    const mockDeptCommerce = {
      _id: '672000000000000000000002',
      name: 'Department of Commerce',
      code: 'COM',
      slug: 'commerce',
      description: 'Department of Commerce',
      order: 2,
      isActive: true,
      deletedAt: null,
    };

    const mockDeptMath = {
      _id: '672000000000000000000003',
      name: 'Department of Mathematics',
      code: 'MATH',
      slug: 'mathematics',
      description: 'Department of Mathematics',
      order: 3,
      isActive: true,
      deletedAt: null,
    };

    const mockCourses = [
      {
        _id: '672000000000000000000011',
        name: 'B.Sc Computer Science',
        title: 'B.Sc Computer Science',
        code: 'BSC-CS',
        slug: 'bsc-cs',
        departmentSlug: 'computer-science',
        level: 'UG',
        duration: '3 Years',
        eligibility: 'Higher Secondary with Maths',
        description: 'Undergraduate Computer Science',
        published: true,
        isActive: true,
      },
      {
        _id: '672000000000000000000012',
        name: 'M.Sc Computer Science',
        title: 'M.Sc Computer Science',
        code: 'MSC-CS',
        slug: 'msc-cs',
        departmentSlug: 'computer-science',
        level: 'PG',
        duration: '2 Years',
        eligibility: 'B.Sc Computer Science',
        description: 'Postgraduate Computer Science',
        published: true,
        isActive: true,
      },
      {
        _id: '672000000000000000000013',
        name: 'B.Com General',
        title: 'B.Com General',
        code: 'BCOM-GEN',
        slug: 'bcom-gen',
        departmentSlug: 'commerce',
        level: 'UG',
        duration: '3 Years',
        eligibility: 'Higher Secondary Commerce',
        description: 'Undergraduate Commerce',
        published: true,
        isActive: true,
      },
    ];

    it('legacy GET /api/departments returns array with parallel populated programs', async () => {
      jest.spyOn(Department, 'find').mockReturnValue(mockMongooseQuery([mockDeptCS]) as any);
      jest.spyOn(Course, 'find').mockReturnValue(mockMongooseQuery([mockCourses[0]]) as any);

      const res = await request(app).get('/api/departments');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].slug).toBe('computer-science');
      expect(res.body[0].programs).toHaveLength(1);
      expect(res.body[0].programs[0].title).toBe('B.Sc Computer Science');
    });

    it('correctly associates courses across multiple departments and handles departments with no courses', async () => {
      jest.spyOn(Department, 'find').mockReturnValue(
        mockMongooseQuery([mockDeptCS, mockDeptCommerce, mockDeptMath]) as any
      );
      jest.spyOn(Course, 'find').mockReturnValue(mockMongooseQuery(mockCourses) as any);

      const res = await request(app).get('/api/departments');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);

      // Computer Science has 2 programs
      const csDept = res.body.find((d: any) => d.slug === 'computer-science');
      expect(csDept.programs).toHaveLength(2);
      expect(csDept.programs.map((p: any) => p.slug)).toEqual(['bsc-cs', 'msc-cs']);

      // Commerce has 1 program
      const comDept = res.body.find((d: any) => d.slug === 'commerce');
      expect(comDept.programs).toHaveLength(1);
      expect(comDept.programs[0].slug).toBe('bcom-gen');

      // Mathematics has 0 programs (empty array, never undefined or null)
      const mathDept = res.body.find((d: any) => d.slug === 'mathematics');
      expect(mathDept.programs).toEqual([]);
    });

    it('returns empty array when no active departments exist', async () => {
      jest.spyOn(Department, 'find').mockReturnValue(mockMongooseQuery([]) as any);
      jest.spyOn(Course, 'find').mockReturnValue(mockMongooseQuery(mockCourses) as any);

      const res = await request(app).get('/api/departments');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('returns departments with empty programs when no published courses exist', async () => {
      jest.spyOn(Department, 'find').mockReturnValue(mockMongooseQuery([mockDeptCS, mockDeptCommerce]) as any);
      jest.spyOn(Course, 'find').mockReturnValue(mockMongooseQuery([]) as any);

      const res = await request(app).get('/api/departments');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].programs).toEqual([]);
      expect(res.body[1].programs).toEqual([]);
    });

    it('enforces queries filter for active departments and published active courses', async () => {
      const deptFindSpy = jest.spyOn(Department, 'find').mockReturnValue(mockMongooseQuery([mockDeptCS]) as any);
      const courseFindSpy = jest.spyOn(Course, 'find').mockReturnValue(mockMongooseQuery([mockCourses[0]]) as any);

      await request(app).get('/api/departments');

      // Department filter must exclude inactive and deleted records
      expect(deptFindSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          deletedAt: null,
        })
      );

      // Course filter must enforce published and active
      expect(courseFindSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          published: true,
          isActive: true,
        })
      );
    });

    it('legacy GET /api/departments?slug=computer-science filters single department with courses concurrently', async () => {
      jest.spyOn(Department, 'findOne').mockReturnValue(mockMongooseQuery(mockDeptCS) as any);
      jest.spyOn(Course, 'find').mockReturnValue(mockMongooseQuery([mockCourses[0], mockCourses[1]]) as any);

      const res = await request(app).get('/api/departments?slug=computer-science');

      expect(res.status).toBe(200);
      expect(res.body.slug).toBe('computer-science');
      expect(res.body.programs).toHaveLength(2);
      expect(res.body.programs[0].title).toBe('B.Sc Computer Science');
      expect(res.body.programs[1].title).toBe('M.Sc Computer Science');
    });

    it('versioned GET /api/v1/departments returns envelope with count and populated programs', async () => {
      jest.spyOn(Department, 'find').mockReturnValue(mockMongooseQuery([mockDeptCS, mockDeptCommerce]) as any);
      jest.spyOn(Course, 'find').mockReturnValue(mockMongooseQuery(mockCourses) as any);

      const res = await request(app).get('/api/v1/departments');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].slug).toBe('computer-science');
      expect(res.body.data[0].programs).toHaveLength(2);
      expect(res.body.data[1].slug).toBe('commerce');
      expect(res.body.data[1].programs).toHaveLength(1);
    });

    it('versioned GET /api/v1/departments/:slug returns department envelope with programs', async () => {
      jest.spyOn(Department, 'findOne').mockReturnValue(mockMongooseQuery(mockDeptCS) as any);
      jest.spyOn(Course, 'find').mockReturnValue(mockMongooseQuery([mockCourses[0]]) as any);

      const res = await request(app).get('/api/v1/departments/computer-science');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('computer-science');
      expect(res.body.data.programs).toHaveLength(1);
      expect(res.body.data.programs[0].title).toBe('B.Sc Computer Science');
    });

    it('returns 404 for non-existent department slug', async () => {
      jest.spyOn(Department, 'findOne').mockReturnValue(mockMongooseQuery(null) as any);
      jest.spyOn(Course, 'find').mockReturnValue(mockMongooseQuery([]) as any);

      const res = await request(app).get('/api/v1/departments/non-existent-dept');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ── 5. Courses ────────────────────────────────────────────────────────────
  describe('5. Courses', () => {
    const mockCourse = {
      _id: '672000000000000000000003',
      title: 'B.Com Computer Applications',
      departmentSlug: 'commerce',
      level: 'UG',
      duration: '3 Years',
      slug: 'bcom-ca',
      feeStructure: '₹18,000 / semester',
      order: 2,
      published: true,
    };

    it('legacy GET /api/courses returns array of courses', async () => {
      jest.spyOn(Course, 'find').mockReturnValue(mockMongooseQuery([mockCourse]) as any);

      const res = await request(app).get('/api/courses');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].title).toBe('B.Com Computer Applications');
    });

    it('versioned GET /api/v1/courses/:id retrieves course by slug or ID', async () => {
      jest.spyOn(Course, 'findOne').mockReturnValue(mockMongooseQuery(mockCourse) as any);

      const res = await request(app).get('/api/v1/courses/bcom-ca');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('bcom-ca');
    });
  });

  // ── 6. Events & Polymorphic Events Bundle ─────────────────────────────────
  describe('6. Events & Polymorphic Bundle', () => {
    const mockEvent = {
      _id: '672000000000000000000004',
      title: 'Annual Sports Meet 2026',
      slug: 'annual-sports-meet-2026',
      eventType: 'sports',
      eventDate: '2026-03-15T09:00:00.000Z',
      isActive: true,
      isArchived: false,
    };

    const mockSpeaker = {
      _id: '672000000000000000000005',
      name: 'Dr. APJ Abdul Kalam Memorial Guest',
      designation: 'Eminent Scientist',
      isActive: true,
      order: 1,
    };

    const mockGallery = {
      albums: [{ id: 'album1', title: 'Sports Meet', category: 'Events', images: [] }],
      videos: [],
      isActive: true,
    };

    it('legacy GET /api/events returns polymorphic bundle { events, guestSpeakers, eventGallery }', async () => {
      jest.spyOn(Event, 'find').mockReturnValue(mockMongooseQuery([mockEvent]) as any);
      jest.spyOn(GuestSpeaker, 'find').mockReturnValue(mockMongooseQuery([mockSpeaker]) as any);
      jest.spyOn(GalleryData, 'findOne').mockReturnValue(mockMongooseQuery(mockGallery) as any);

      const res = await request(app).get('/api/events');

      expect(res.status).toBe(200);
      expect(res.body.events).toHaveLength(1);
      expect(res.body.events[0].title).toBe('Annual Sports Meet 2026');
      expect(res.body.guestSpeakers).toHaveLength(1);
      expect(res.body.guestSpeakers[0].name).toContain('Guest');
      expect(res.body.eventGallery).toHaveLength(1);
    });

    it('versioned GET /api/v1/events/:slug returns single event envelope', async () => {
      jest.spyOn(Event, 'findOne').mockReturnValue(mockMongooseQuery(mockEvent) as any);

      const res = await request(app).get('/api/v1/events/annual-sports-meet-2026');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('annual-sports-meet-2026');
    });

    it('versioned GET /api/v1/guest-speakers returns speakers array envelope', async () => {
      jest.spyOn(GuestSpeaker, 'find').mockReturnValue(mockMongooseQuery([mockSpeaker]) as any);

      const res = await request(app).get('/api/v1/guest-speakers');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].designation).toBe('Eminent Scientist');
    });
  });

  // ── 7. Gallery Albums & Video Links ───────────────────────────────────────
  describe('7. Gallery Albums & Videos', () => {
    const mockGallery = {
      albums: [{ id: 'a1', title: 'Graduation Day', category: 'Academics', images: [] }],
      videos: [{ id: 'v1', title: 'Campus Tour', url: 'https://youtube.com/watch?v=123' }],
      isActive: true,
    };

    it('legacy GET /api/gallery returns { albums, videos }', async () => {
      jest.spyOn(GalleryData, 'findOne').mockReturnValue(mockMongooseQuery(mockGallery) as any);

      const res = await request(app).get('/api/gallery');

      expect(res.status).toBe(200);
      expect(res.body.albums).toHaveLength(1);
      expect(res.body.videos).toHaveLength(1);
    });

    it('versioned GET /api/v1/gallery returns wrapped envelope', async () => {
      jest.spyOn(GalleryData, 'findOne').mockReturnValue(mockMongooseQuery(mockGallery) as any);

      const res = await request(app).get('/api/v1/gallery');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.albums[0].title).toBe('Graduation Day');
    });
  });

  // ── 8. News & Press Releases ──────────────────────────────────────────────
  describe('8. News Articles & Config', () => {
    const mockArticle = {
      _id: '672000000000000000000006',
      title: 'College Wins National Green Campus Award',
      slug: 'green-campus-award-2026',
      category: 'awards',
      content: 'BAC awarded for sustainable campus initiative.',
      status: 'published',
      publishedAt: '2026-02-01T10:00:00.000Z',
    };

    it('legacy GET /api/news returns { articles, config }', async () => {
      jest.spyOn(NewsArticle, 'find').mockReturnValue(mockMongooseQuery([mockArticle]) as any);

      const res = await request(app).get('/api/news');

      expect(res.status).toBe(200);
      expect(res.body.articles).toHaveLength(1);
      expect(res.body.articles[0].slug).toBe('green-campus-award-2026');
      expect(res.body.config).toBeDefined();
      expect(res.body.config.bannerTitle).toBeDefined();
    });

    it('versioned GET /api/v1/news/:slug returns single article envelope', async () => {
      jest.spyOn(NewsArticle, 'findOne').mockReturnValue(mockMongooseQuery(mockArticle) as any);

      const res = await request(app).get('/api/v1/news/green-campus-award-2026');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Green Campus');
    });
  });

  // ── 9. IQAC Dossier ───────────────────────────────────────────────────────
  describe('9. IQAC Accreditation Dossier', () => {
    const mockIqac = {
      overview: 'Internal Quality Assurance Cell ensures continuous improvement.',
      objectives: ['Academic quality enhancement', 'Faculty development'],
      functions: ['Quality benchmarks', 'NAAC coordination'],
      aqarReports: [{ academicYear: '2024-2025', title: 'AQAR 2024-25', fileUrl: 'https://bac.edu.in/aqar.pdf' }],
      isActive: true,
    };

    it('legacy GET /api/iqac returns IQAC document directly', async () => {
      jest.spyOn(IQACDossier, 'findOne').mockReturnValue(mockMongooseQuery(mockIqac) as any);

      const res = await request(app).get('/api/iqac');

      expect(res.status).toBe(200);
      expect(res.body.overview).toContain('Internal Quality Assurance Cell');
      expect(res.body.aqarReports).toHaveLength(1);
    });

    it('versioned GET /api/v1/iqac returns wrapped envelope', async () => {
      jest.spyOn(IQACDossier, 'findOne').mockReturnValue(mockMongooseQuery(mockIqac) as any);

      const res = await request(app).get('/api/v1/iqac');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aqarReports).toHaveLength(1);
    });
  });

  // ── 10. Campus Facilities ─────────────────────────────────────────────────
  describe('10. Campus Facilities', () => {
    const mockFacility = {
      _id: '672000000000000000000007',
      name: 'Digital Library & Resource Center',
      category: 'academic',
      description: 'Over 25,000 volumes with IEEE and DELNET access.',
      features: ['Air conditioned', 'High speed WiFi'],
      published: true,
      isActive: true,
    };

    it('legacy GET /api/facilities returns facility list directly', async () => {
      jest.spyOn(Facility, 'find').mockReturnValue(mockMongooseQuery([mockFacility]) as any);

      const res = await request(app).get('/api/facilities');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].name).toContain('Digital Library');
    });

    it('versioned GET /api/v1/facilities/:id returns facility envelope', async () => {
      jest.spyOn(Facility, 'findOne').mockReturnValue(mockMongooseQuery(mockFacility) as any);

      const res = await request(app).get('/api/v1/facilities/672000000000000000000007');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('Digital Library');
    });
  });

  // ── 11. Placements & Privacy Protection ───────────────────────────────────
  describe('11. Placements & Strict Privacy Protection', () => {
    const mockPlacementWithPii = {
      _id: '672000000000000000000008',
      academicYear: '2023-2024',
      overview: 'Over 85% campus placement achieved.',
      statistics: {
        totalOffers: 180,
        placementPercentage: 88,
        highestPackage: '8.5 LPA',
        averagePackage: '3.6 LPA',
        companiesVisited: 42,
      },
      recruiters: [{ name: 'TCS', logo: 'https://example.com/tcs.png', tier: 'IT' }],
      successStories: [{ studentName: 'R. Kaviya', company: 'TCS', package: '4 LPA', department: 'Computer Science' }],
      partnerships: ['ICT Academy', 'Infosys Springboard'],
      // PRIVACY TEST: Sensistive internal notes & candidate PII that MUST NOT be exposed
      internalNotes: 'Confidential corporate package negotiations',
      studentApplicants: [
        { name: 'John Doe', phone: '9876543210', email: 'john@gmail.com', aadhar: '1234-5678-9012' },
      ],
      interviewerFeedbacks: ['Candidate rejected for attitude'],
      isActive: true,
    };

    it('GET /api/placements strips internal notes, applicant records, and candidate PII', async () => {
      jest.spyOn(Placement, 'findOne').mockReturnValue(mockMongooseQuery(mockPlacementWithPii) as any);

      const res = await request(app).get('/api/placements');

      expect(res.status).toBe(200);
      // Public aggregates must be returned
      expect(res.body.overview).toBe('Over 85% campus placement achieved.');
      expect(res.body.recruiters).toHaveLength(1);
      expect(res.body.successStories).toHaveLength(1);
      expect(res.body.stats).toBeDefined();

      // STRICT PRIVACY VERIFICATION: Internal & candidate fields must be completely undefined
      expect(res.body.internalNotes).toBeUndefined();
      expect(res.body.studentApplicants).toBeUndefined();
      expect(res.body.interviewerFeedbacks).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('Confidential corporate');
      expect(JSON.stringify(res.body)).not.toContain('9876543210');
      expect(JSON.stringify(res.body)).not.toContain('john@gmail.com');
    });

    it('versioned GET /api/v1/placements preserves privacy within envelope', async () => {
      jest.spyOn(Placement, 'findOne').mockReturnValue(mockMongooseQuery(mockPlacementWithPii) as any);

      const res = await request(app).get('/api/v1/placements');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overview).toBe('Over 85% campus placement achieved.');
      expect(res.body.data.internalNotes).toBeUndefined();
      expect(res.body.data.studentApplicants).toBeUndefined();
    });
  });

  // ── 12. Active Advertisements Fallback ────────────────────────────────────
  describe('12. Active Advertisements Compatibility Fallback', () => {
    it('GET /api/v1/advertisements/active returns safe { success: true, data: null }', async () => {
      const res = await request(app).get('/api/v1/advertisements/active?position=popup_overlay');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });
  });
});
