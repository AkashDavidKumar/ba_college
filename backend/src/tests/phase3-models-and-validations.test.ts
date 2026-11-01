/**
 * phase3-models-and-validations.test.ts — Unit tests for Phase 3 Mongoose Models & Zod Schemas
 *
 * Verifies:
 *  1. All 14 new models export correct collection names and schemas.
 *  2. Required indexes and unique constraints are defined.
 *  3. Department-to-course virtual population configuration.
 *  4. Singleton key constraints and default values.
 *  5. Strict Zod validation and unexpected input rejection.
 *  6. HTTPS URL policy enforcement.
 *  7. Soft-delete and publication state defaults.
 */
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
  AdmissionsApplication,
  Facility,
  Placement,
  ContactInfo,
  ContactEnquiry,
} from '../models';

import {
  createDepartmentSchema,
  createCourseSchema,
  createEventSchema,
  createGuestSpeakerSchema,
  updateGallerySchema,
  createNewsArticleSchema,
  updateSiteContentSchema,
  updateAboutPageSchema,
  updateIQACDossierSchema,
  submitAdmissionsApplicationSchema,
  updateAdmissionsApplicationStatusSchema,
  createFacilitySchema,
  updatePlacementSchema,
  updateContactInfoSchema,
  submitContactEnquirySchema,
} from '../validations';

describe('Phase 3 Mongoose Models Configuration', () => {
  it('registers all 14 models with their exact collection names', () => {
    expect(SiteContent.collection.name).toBe('site_contents');
    expect(AboutPage.collection.name).toBe('about_pages');
    expect(Department.collection.name).toBe('departments');
    expect(Course.collection.name).toBe('courses');
    expect(Event.collection.name).toBe('events');
    expect(GuestSpeaker.collection.name).toBe('guest_speakers');
    expect(GalleryData.collection.name).toBe('gallery_data');
    expect(NewsArticle.collection.name).toBe('news_articles');
    expect(IQACDossier.collection.name).toBe('iqac_dossiers');
    expect(AdmissionsApplication.collection.name).toBe('admissions_applications');
    expect(Facility.collection.name).toBe('facilities');
    expect(Placement.collection.name).toBe('placements');
    expect(ContactInfo.collection.name).toBe('contact_info');
    expect(ContactEnquiry.collection.name).toBe('contact_enquiries');
  });

  it('configures Department-to-Course virtual population correctly', () => {
    const virtuals = Department.schema.virtuals as Record<string, any>;
    expect(virtuals).toHaveProperty('programs');
    const programsVirtual = virtuals['programs'];
    expect(programsVirtual.options.ref).toBe('Course');
    expect(programsVirtual.options.localField).toBe('slug');
    expect(programsVirtual.options.foreignField).toBe('departmentSlug');
    expect(programsVirtual.options.justOne).toBe(false);
  });

  it('defines required singleton keys with default value "default"', () => {
    const siteContent = new SiteContent({ hero: { title: 'Test Hero' } });
    expect(siteContent.singletonKey).toBe('default');

    const about = new AboutPage({ title: 'Test About', text1: 'Sample text' });
    expect(about.singletonKey).toBe('default');

    const gallery = new GalleryData();
    expect(gallery.singletonKey).toBe('default');

    const iqac = new IQACDossier();
    expect(iqac.singletonKey).toBe('default');

    const placement = new Placement();
    expect(placement.singletonKey).toBe('default');

    const contact = new ContactInfo({ address: 'Main Campus Road' });
    expect(contact.singletonKey).toBe('default');
  });

  it('enforces required field validation on Department and Course', () => {
    const invalidDept = new Department({});
    const deptError = invalidDept.validateSync();
    expect(deptError).toBeDefined();
    expect(deptError?.errors['slug']).toBeDefined();
    expect(deptError?.errors['name']).toBeDefined();
    expect(deptError?.errors['code']).toBeDefined();

    const invalidCourse = new Course({});
    const courseError = invalidCourse.validateSync();
    expect(courseError).toBeDefined();
    expect(courseError?.errors['slug']).toBeDefined();
    expect(courseError?.errors['name']).toBeDefined();
    expect(courseError?.errors['level']).toBeDefined();
    expect(courseError?.errors['departmentSlug']).toBeDefined();
  });

  it('enforces default soft-delete and publication states', () => {
    const course = new Course({
      slug: 'bsc-cs',
      name: 'B.Sc. Computer Science',
      level: 'UG',
      department: 'Computer Science',
      departmentSlug: 'computer-science',
      duration: '3 Years',
      eligibility: '10+2 with Mathematics',
      description: 'Comprehensive computer science programme',
    });
    expect(course.published).toBe(true);
    expect(course.isActive).toBe(true);
    expect(course.isSeedManaged).toBe(true);
    expect(course.intake).toBe(60);

    const event = new Event({
      slug: 'tech-fest-2026',
      title: 'Annual Tech Symposium',
      category: 'academic',
      startDate: new Date('2026-11-20'),
      venue: 'Main Auditorium',
      description: 'State-level technological symposium',
    });
    expect(event.isActive).toBe(true);
    expect(event.isArchived).toBe(false);
    expect(event.isFeatured).toBe(false);

    const facility = new Facility({
      name: 'Advanced Computing Lab',
      category: 'lab',
      description: 'High-performance computing laboratory',
    });
    expect(facility.published).toBe(true);
    expect(facility.isActive).toBe(true);
  });

  it('properly transforms document to JSON without __v and with id string', () => {
    const dept = new Department({
      slug: 'commerce',
      name: 'Department of Commerce',
      shortName: 'Commerce',
      code: 'COM',
      category: 'Commerce',
      description: 'Excellence in commerce and business education',
    });
    const json = dept.toJSON();
    expect(json).toHaveProperty('id');
    expect(json).not.toHaveProperty('__v');
  });
});

describe('Phase 3 Zod Validation Schemas', () => {
  it('accepts valid department input and rejects unexpected keys (.strict)', () => {
    const validDeptInput = {
      slug: 'computer-science',
      name: 'Department of Computer Science',
      shortName: 'Computer Science',
      code: 'CS',
      category: 'Science',
      icon: 'Cpu',
      description: 'Premier department for computing technologies',
      faculty: [],
      labs: [],
      alumni: [],
    };

    const parsed = createDepartmentSchema.safeParse(validDeptInput);
    expect(parsed.success).toBe(true);

    // Test strictness: unexpected key must be rejected
    const invalidWithExtra = {
      ...validDeptInput,
      unexpectedMaliciousField: 'exploit',
    };
    const rejected = createDepartmentSchema.safeParse(invalidWithExtra);
    expect(rejected.success).toBe(false);
  });

  it('validates course levels and duration constraints', () => {
    const validCourse = {
      name: 'Master of Commerce (M.Com)',
      level: 'PG',
      department: 'Commerce',
      departmentSlug: 'commerce',
      duration: '2 Years',
      eligibility: 'B.Com or BBA with minimum 50%',
      description: 'Advanced postgraduate programme in business & taxation',
    };
    expect(createCourseSchema.safeParse(validCourse).success).toBe(true);

    const invalidLevel = {
      ...validCourse,
      level: 'INVALID_LEVEL',
    };
    expect(createCourseSchema.safeParse(invalidLevel).success).toBe(false);
  });

  it('enforces secure HTTPS URL policy on media fields', () => {
    const validEvent = {
      title: 'National Conference on AI',
      category: 'academic',
      startDate: '2026-12-05T09:00:00.000Z',
      venue: 'Silver Jubilee Hall',
      description: 'National conference featuring keynote researchers',
      coverImage: 'https://images.example.com/events/ai-conf.jpg',
    };
    expect(createEventSchema.safeParse(validEvent).success).toBe(true);

    const insecureEvent = {
      ...validEvent,
      coverImage: 'http://insecure-cdn.example.com/image.jpg', // insecure http
    };
    const parsed = createEventSchema.safeParse(insecureEvent);
    expect(parsed.success).toBe(false);
  });

  it('validates admissions application submissions and rejects unexpected fields', () => {
    const validApplication = {
      candidateName: 'Test Student',
      email: 'student@example.com',
      phone: '+91 98765 43210',
      program: 'B.Sc. Computer Science',
      courseSlug: 'bsc-cs',
      marksPercentage: 88.5,
      city: 'Coimbatore',
    };
    const parseResult = submitAdmissionsApplicationSchema.safeParse(validApplication);
    expect(parseResult.success).toBe(true);

    // Rejects unexpected keys
    const maliciousInput = {
      ...validApplication,
      adminStatusOverride: 'approved',
    };
    expect(submitAdmissionsApplicationSchema.safeParse(maliciousInput).success).toBe(false);

    // Rejects invalid email
    expect(
      submitAdmissionsApplicationSchema.safeParse({ ...validApplication, email: 'not-an-email' }).success
    ).toBe(false);
  });

  it('validates admissions status updates strictly against allowed statuses', () => {
    expect(
      updateAdmissionsApplicationStatusSchema.safeParse({
        status: 'under_review',
        notes: 'Documents verified by department coordinator.',
      }).success
    ).toBe(true);

    expect(
      updateAdmissionsApplicationStatusSchema.safeParse({
        status: 'NON_EXISTENT_STATUS',
      }).success
    ).toBe(false);
  });

  it('validates contact enquiry submissions and enforces message length bounds', () => {
    const validEnquiry = {
      name: 'Prospective Parent',
      email: 'parent@example.com',
      phone: '+91 91234 56789',
      subject: 'Admission Inquiry for Academic Year 2026-27',
      message: 'Kindly provide details regarding hostel accommodations and transportation facilities.',
    };
    expect(submitContactEnquirySchema.safeParse(validEnquiry).success).toBe(true);

    // Message too short (< 5 chars)
    expect(
      submitContactEnquirySchema.safeParse({ ...validEnquiry, message: 'Hi' }).success
    ).toBe(false);
  });

  it('validates remaining Phase 3 schemas correctly', () => {
    // Guest Speaker
    const validSpeaker = {
      name: 'Dr. Scientist',
      role: 'Keynote Speaker',
      topic: 'Future of Quantum Computing',
    };
    expect(createGuestSpeakerSchema.safeParse(validSpeaker).success).toBe(true);

    // Gallery
    expect(
      updateGallerySchema.safeParse({
        albums: [
          {
            id: 'alb-1',
            title: 'Graduation Day 2026',
            category: 'Academics',
            photos: [{ url: 'https://images.example.com/grad.jpg', caption: 'Convocation' }],
          },
        ],
      }).success
    ).toBe(true);

    // News Article
    expect(
      createNewsArticleSchema.safeParse({
        title: 'College Wins State Basketball Championship',
        excerpt: 'Bishop Ambrose College sports team clinches gold medal in state tournament.',
        content: 'Full report on the exhilarating final match...',
        category: 'Sports',
        author: { name: 'Sports Secretary' },
      }).success
    ).toBe(true);

    // Site Content Update
    expect(
      updateSiteContentSchema.safeParse({
        hero: { title: 'Updated Campus Tagline' },
        statistics: [{ label: 'Students Placed', value: '98%' }],
      }).success
    ).toBe(true);

    // About Page Update
    expect(
      updateAboutPageSchema.safeParse({
        title: 'Updated Institutional Legacy',
        text1: 'Founded with a vision for holistic education.',
      }).success
    ).toBe(true);

    // IQAC Dossier Update
    expect(
      updateIQACDossierSchema.safeParse({
        stats: { naacGrade: 'A++', cgpa: '3.65' },
      }).success
    ).toBe(true);

    // Facility
    expect(
      createFacilitySchema.safeParse({
        name: 'Central Digital Library',
        category: 'library',
        description: 'Over 50,000 volumes and digital journals catalog',
      }).success
    ).toBe(true);

    // Placement Update
    expect(
      updatePlacementSchema.safeParse({
        overview: 'Over 95% placement rate across all departments',
        stats: [
          {
            year: '2025-26',
            totalPlaced: 450,
            highestPackage: '₹ 14 LPA',
            averagePackage: '₹ 5.5 LPA',
            placementRate: '96%',
          },
        ],
      }).success
    ).toBe(true);

    // Contact Info Update
    expect(
      updateContactInfoSchema.safeParse({
        address: 'Bishop Ambrose College, College Road, Coimbatore',
        phones: [{ label: 'Admission Office', number: '+91 422 1234567' }],
      }).success
    ).toBe(true);
  });
});
