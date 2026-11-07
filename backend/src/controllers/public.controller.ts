/**
 * public.controller.ts — Public Read Handlers for Bishop Ambrose College Website
 *
 * Performance, Privacy & Compatibility Invariants:
 *  1. Uses `.lean()` and explicit projections for sub-100ms response latencies.
 *  2. Dual support: exact legacy format for existing frontend, standard REST for versioned /api/v1.
 *  3. Filters all inactive, archived, or unpublished records.
 *  4. Populates Department `programs` virtual relation from Course collection.
 *  5. Polymorphic event bundle serialization preserving event, guest speaker, and gallery contracts.
 *  6. Placement PII sanitization strictly preserving corporate privacy.
 */
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
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
import {
  serializeSiteContent,
  serializeAboutPage,
  serializeDepartment,
  serializeCourse,
  serializeEvent,
  serializeGuestSpeaker,
  serializeGallery,
  serializeNewsArticle,
  serializeIQAC,
  serializeFacility,
  serializePlacements,
  serializeContactInfo,
} from '../serializers/public.serializer';
import { ApiError } from '../utils/api-error';

/** Helper to test if a string is a 24-char hex MongoDB ObjectId */
function isObjectId(val: string): boolean {
  return mongoose.Types.ObjectId.isValid(val) && String(new mongoose.Types.ObjectId(val)) === val;
}

// ── 1. Global Site Content & Homepage ────────────────────────────────────────
export async function getPublicSiteContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [siteContentDoc, aboutPageDoc] = await Promise.all([
      SiteContent.findOne({ isActive: true }).lean(),
      AboutPage.findOne({ isActive: true }).lean(),
    ]);

    if (!siteContentDoc) {
      throw ApiError.notFound('Site content');
    }

    const response = serializeSiteContent(
      siteContentDoc as Record<string, unknown>,
      aboutPageDoc as Record<string, unknown> | null
    );

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        data: response,
      });
      return;
    }

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

// ── 2. About Page ────────────────────────────────────────────────────────────
export async function getPublicAboutPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const aboutDoc = await AboutPage.findOne({ isActive: true }).lean();

    if (!aboutDoc) {
      throw ApiError.notFound('About page content');
    }

    const serialized = serializeAboutPage(aboutDoc as Record<string, unknown>);

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        data: serialized,
      });
      return;
    }

    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

// ── 3. Academic Departments ──────────────────────────────────────────────────
export async function getPublicDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slugQuery = req.query['slug'] ? String(req.query['slug']).trim() : undefined;

    if (slugQuery) {
      // Query single department by slug parameter (legacy ?slug= parameter) concurrently with its courses
      const [dept, courses] = await Promise.all([
        Department.findOne({
          slug: slugQuery,
          isActive: true,
          deletedAt: null,
        })
          .select('-__v -isSeedManaged -deletedAt')
          .lean(),
        Course.find({
          departmentSlug: slugQuery,
          published: true,
          isActive: true,
        })
          .select('-__v -isSeedManaged -deletedAt')
          .sort({ level: 1, name: 1 })
          .lean(),
      ]);

      if (!dept) {
        throw ApiError.notFound(`Department '${slugQuery}'`);
      }

      const deptObj = dept as Record<string, unknown>;
      deptObj['programs'] = courses;

      res.status(200).json(serializeDepartment(deptObj));
      return;
    }

    // Concurrently fetch active departments and eligible published courses (approved Option A optimization)
    const [departments, courses] = await Promise.all([
      Department.find({
        isActive: true,
        deletedAt: null,
      })
        .select('-__v -isSeedManaged -deletedAt')
        .sort({ order: 1, name: 1 })
        .lean(),
      Course.find({
        published: true,
        isActive: true,
      })
        .select('-__v -isSeedManaged -deletedAt')
        .sort({ level: 1, name: 1 })
        .lean(),
    ]);

    // Group courses by departmentSlug in an in-memory Map
    const coursesByDept = new Map<string, Array<Record<string, unknown>>>();
    for (const course of courses) {
      const slug = (course as { departmentSlug?: string }).departmentSlug;
      if (slug) {
        let list = coursesByDept.get(slug);
        if (!list) {
          list = [];
          coursesByDept.set(slug, list);
        }
        list.push(course as Record<string, unknown>);
      }
    }

    // Associate matching courses with each department
    for (const dept of departments) {
      const deptObj = dept as Record<string, unknown>;
      const slug = String(deptObj['slug'] || '');
      deptObj['programs'] = coursesByDept.get(slug) || [];
    }

    const serialized = departments.map((d) => serializeDepartment(d as Record<string, unknown>));

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        count: serialized.length,
        data: serialized,
      });
      return;
    }

    // Legacy /api/departments returns array directly
    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

export async function getPublicDepartmentBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params['slug'] || '').trim();

    const [dept, courses] = await Promise.all([
      Department.findOne({
        slug,
        isActive: true,
        deletedAt: null,
      })
        .select('-__v -isSeedManaged -deletedAt')
        .lean(),
      Course.find({
        departmentSlug: slug,
        published: true,
        isActive: true,
      })
        .select('-__v -isSeedManaged -deletedAt')
        .sort({ level: 1, name: 1 })
        .lean(),
    ]);

    if (!dept) {
      throw ApiError.notFound(`Department '${slug}'`);
    }

    const deptObj = dept as Record<string, unknown>;
    deptObj['programs'] = courses;

    const serialized = serializeDepartment(deptObj);

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        data: serialized,
      });
      return;
    }

    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

// ── 4. Courses & Academic Programmes ─────────────────────────────────────────
export async function getPublicCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, unknown> = {
      published: true,
      isActive: true,
    };

    if (req.query['departmentSlug']) {
      filter['departmentSlug'] = String(req.query['departmentSlug']).trim();
    }
    if (req.query['level']) {
      filter['level'] = String(req.query['level']).trim();
    }
    if (req.query['search']) {
      filter['name'] = { $regex: String(req.query['search']).trim(), $options: 'i' };
    }

    const courses = await Course.find(filter)
      .select('-__v -isSeedManaged -deletedAt')
      .sort({ level: 1, name: 1 })
      .lean();

    const serialized = courses.map((c) => serializeCourse(c as Record<string, unknown>));

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        count: serialized.length,
        data: serialized,
      });
      return;
    }

    // Legacy /api/courses returns array directly
    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

export async function getPublicCourseByIdOrSlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const identifier = String(req.params['id'] || '').trim();
    const isId = isObjectId(identifier);

    const query = isId
      ? { _id: identifier, published: true, isActive: true }
      : { slug: identifier, published: true, isActive: true };

    const course = await Course.findOne(query).lean();

    if (!course) {
      throw ApiError.notFound(`Course '${identifier}'`);
    }

    const serialized = serializeCourse(course as Record<string, unknown>);

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        data: serialized,
      });
      return;
    }

    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

// ── 5. Events, Guest Speakers & Gallery Polymorphic Bundle ────────────────────
export async function getPublicEventsBundle(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [events, guestSpeakers, galleryDoc] = await Promise.all([
      Event.find({ isActive: true, isArchived: false })
        .select('-__v -isSeedManaged -deletedAt')
        .sort({ startDate: 1 })
        .lean(),
      GuestSpeaker.find({ isActive: true })
        .select('-__v -isSeedManaged -deletedAt')
        .sort({ order: 1, name: 1 })
        .lean(),
      GalleryData.findOne({ singletonKey: 'default', isActive: true }).select('albums').lean(),
    ]);

    const serializedEvents = events.map((e) => serializeEvent(e as Record<string, unknown>));
    const serializedSpeakers = guestSpeakers.map((s) => serializeGuestSpeaker(s as Record<string, unknown>));

    // Map gallery albums to match legacy eventGallery array format expected in site-context.tsx:456
    const albums = (galleryDoc?.albums || []) as Array<Record<string, unknown>>;
    const eventGallery = albums.map((alb, idx) => ({
      url: alb['coverImage'] || alb['image'] || '/placeholder-album.jpg',
      image: alb['coverImage'] || alb['image'] || '/placeholder-album.jpg',
      category: alb['category'] || 'Campus',
      title: alb['title'] || `Album ${idx + 1}`,
      count: typeof alb['count'] === 'number' ? alb['count'] : 0,
    }));

    res.status(200).json({
      events: serializedEvents,
      guestSpeakers: serializedSpeakers,
      eventGallery,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPublicEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, unknown> = {
      isActive: true,
      isArchived: false,
    };

    if (req.query['category']) {
      filter['category'] = String(req.query['category']).trim();
    }
    if (req.query['upcoming'] === 'true') {
      filter['startDate'] = { $gte: new Date() };
    } else if (req.query['upcoming'] === 'false') {
      filter['startDate'] = { $lt: new Date() };
    }

    const events = await Event.find(filter).sort({ startDate: 1 }).lean();
    const serialized = events.map((e) => serializeEvent(e as Record<string, unknown>));

    res.status(200).json({
      success: true,
      count: serialized.length,
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPublicEventBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = String(req.params['slug'] || '').trim();
    const event = await Event.findOne({ slug, isActive: true, isArchived: false }).lean();

    if (!event) {
      throw ApiError.notFound(`Event '${slug}'`);
    }

    res.status(200).json({
      success: true,
      data: serializeEvent(event as Record<string, unknown>),
    });
  } catch (err) {
    next(err);
  }
}

export async function getPublicGuestSpeakers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const speakers = await GuestSpeaker.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
    const serialized = speakers.map((s) => serializeGuestSpeaker(s as Record<string, unknown>));

    res.status(200).json({
      success: true,
      count: serialized.length,
      data: serialized,
    });
  } catch (err) {
    next(err);
  }
}

// ── 6. Gallery Albums & Video Links ──────────────────────────────────────────
export async function getPublicGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const galleryDoc = await GalleryData.findOne({ isActive: true }).lean();

    if (!galleryDoc) {
      res.status(200).json({ albums: [], videos: [] });
      return;
    }

    const serialized = serializeGallery(galleryDoc as Record<string, unknown>);

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        data: serialized,
      });
      return;
    }

    // Legacy /api/gallery returns { albums: [], videos: [] }
    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

// ── 7. News & Press Releases ─────────────────────────────────────────────────
export async function getPublicNewsBundle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, unknown> = {
      status: 'published',
      isArchived: false,
    };

    if (req.query['category']) {
      filter['category'] = String(req.query['category']).trim();
    }
    if (req.query['featured'] === 'true') {
      filter['featured'] = true;
    }

    const articles = await NewsArticle.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    const serialized = articles.map((a) => serializeNewsArticle(a as Record<string, unknown>));

    const config = {
      bannerTitle: 'Latest News & Happenings',
      featuredArticleId: serialized[0]?.['slug'] || '',
      articlesPerPage: 6,
      enableComments: false,
    };

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        count: serialized.length,
        data: serialized,
        config,
      });
      return;
    }

    // Legacy /api/news returns { articles: [], config: {} }
    res.status(200).json({
      articles: serialized,
      config,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPublicNewsArticleBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idParam = String(req.params['id'] || '').trim();
    const isId = isObjectId(idParam);

    const query = isId
      ? { _id: idParam, status: 'published', isArchived: false }
      : { slug: idParam, status: 'published', isArchived: false };

    const article = await NewsArticle.findOne(query).lean();

    if (!article) {
      throw ApiError.notFound(`News article '${idParam}'`);
    }

    const serialized = serializeNewsArticle(article as Record<string, unknown>);

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        data: serialized,
      });
      return;
    }

    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

// ── 8. IQAC Accreditation Dossier ────────────────────────────────────────────
export async function getPublicIQAC(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const iqacDoc = await IQACDossier.findOne({ singletonKey: 'default', isActive: true }).lean();

    if (!iqacDoc) {
      throw ApiError.notFound('IQAC Dossier');
    }

    const serialized = serializeIQAC(iqacDoc as Record<string, unknown>);

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        data: serialized,
      });
      return;
    }

    // Legacy /api/iqac returns document directly
    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

// ── 9. Campus Facilities ─────────────────────────────────────────────────────
export async function getPublicFacilities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, unknown> = {
      published: true,
      isActive: true,
    };

    if (req.query['category']) {
      filter['category'] = String(req.query['category']).trim();
    }

    const facilities = await Facility.find(filter)
      .sort({ order: 1, name: 1 })
      .lean();

    const serialized = facilities.map((f) => serializeFacility(f as Record<string, unknown>));

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        count: serialized.length,
        data: serialized,
      });
      return;
    }

    // Legacy /api/facilities returns array directly
    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

export async function getPublicFacilityById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idParam = String(req.params['id'] || '').trim();
    const isId = isObjectId(idParam);

    const query = isId
      ? { _id: idParam, published: true, isActive: true }
      : { name: idParam, published: true, isActive: true };

    const facility = await Facility.findOne(query).lean();

    if (!facility) {
      throw ApiError.notFound(`Facility '${idParam}'`);
    }

    const serialized = serializeFacility(facility as Record<string, unknown>);

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        data: serialized,
      });
      return;
    }

    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

// ── 10. Placements & Career Cell (Privacy Guarded) ───────────────────────────
export async function getPublicPlacements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const placementDoc = await Placement.findOne({ isActive: true }).lean();

    if (!placementDoc) {
      res.status(200).json({
        overview: '',
        stats: [],
        recruiters: [],
        successStories: [],
        partnerships: [],
      });
      return;
    }

    const serialized = serializePlacements(placementDoc as Record<string, unknown>);

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        data: serialized,
      });
      return;
    }

    // Legacy /api/placements returns placement data object directly
    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

// ── 11. Contact Info & Directory ─────────────────────────────────────────────
export async function getPublicContactInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contactDoc = await ContactInfo.findOne({ isActive: true }).lean();

    if (!contactDoc) {
      throw ApiError.notFound('Contact information');
    }

    const serialized = serializeContactInfo(contactDoc as Record<string, unknown>);

    if (req.baseUrl.includes('/v1')) {
      res.status(200).json({
        success: true,
        data: serialized,
      });
      return;
    }

    // Legacy /api/contact returns object directly
    res.status(200).json(serialized);
  } catch (err) {
    next(err);
  }
}

// ── 12. Active Advertisements Fallback ───────────────────────────────────────
export async function getPublicActiveAdvertisement(_req: Request, res: Response): Promise<void> {
  // Returns safe empty active advertisement payload for frontend compatibility
  res.status(200).json({
    success: true,
    data: null,
  });
}
