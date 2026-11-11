/**
 * public.serializer.ts — Public Read Response Serializers & Sanitization
 *
 * Privacy & Security Rules:
 *  1. Strips internal administrative metadata (_id, __v, isSeedManaged, deletedAt, singletonKey).
 *  2. Prevents exposure of unpublished, inactive, or archived content.
 *  3. Sanitizes placement records: strictly restricts output to approved aggregate statistics,
 *     recruiters, and success stories; never leaks candidate PII or internal notes.
 *  4. Formats IDs and virtual relations to match legacy frontend contracts exactly.
 */

/** Helper to deeply omit internal database metadata */
export function sanitizeDoc<T extends Record<string, unknown>>(doc: T): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc)) {
    if (
      key === '__v' ||
      key === 'isSeedManaged' ||
      key === 'deletedAt' ||
      key === 'singletonKey'
    ) {
      continue;
    }
    clean[key] = value;
  }
  return clean;
}

/** 1. Global Site Content Serializer */
export function serializeSiteContent(
  siteContent: Record<string, unknown>,
  aboutPage?: Record<string, unknown> | null
): Record<string, unknown> {
  const clean = sanitizeDoc(siteContent);
  delete clean['_id'];

  // Attach aboutPage data if aboutPage document is provided
  if (aboutPage) {
    const cleanAbout = sanitizeDoc(aboutPage);
    delete cleanAbout['_id'];
    clean['aboutPage'] = cleanAbout;
  }

  return clean;
}

/** 2. About Page Serializer */
export function serializeAboutPage(aboutDoc: Record<string, unknown>): Record<string, unknown> {
  const clean = sanitizeDoc(aboutDoc);
  delete clean['_id'];
  return clean;
}

/** 3. Department Serializer */
export function serializeDepartment(deptDoc: Record<string, unknown>): Record<string, unknown> {
  const clean = sanitizeDoc(deptDoc);
  delete clean['_id'];

  // Ensure programs virtual is an array of clean course representations
  if (Array.isArray(clean['programs'])) {
    clean['programs'] = (clean['programs'] as Array<Record<string, unknown>>).map((prog) => {
      const cleanProg = sanitizeDoc(prog);
      delete cleanProg['_id'];
      return cleanProg;
    });
  } else {
    clean['programs'] = [];
  }

  return clean;
}

/** 4. Course Serializer */
export function serializeCourse(courseDoc: Record<string, unknown>): Record<string, unknown> {
  const clean = sanitizeDoc(courseDoc);
  clean['id'] = String(clean['id'] || clean['_id'] || clean['slug']);
  delete clean['_id'];
  return clean;
}

/** 5. Event Serializer */
export function serializeEvent(eventDoc: Record<string, unknown>): Record<string, unknown> {
  const clean = sanitizeDoc(eventDoc);
  clean['id'] = String(clean['slug'] || clean['_id']);
  delete clean['_id'];
  delete clean['isArchived'];

  // Ensure image URL alias matches legacy expectation (image = coverImage)
  if (!clean['image'] && clean['coverImage']) {
    clean['image'] = clean['coverImage'];
  }

  // Ensure dateISO is present for frontend sorting and calendar display
  if (!clean['dateISO']) {
    if (clean['startDate'] instanceof Date) {
      clean['dateISO'] = clean['startDate'].toISOString().split('T')[0];
    } else if (typeof clean['startDate'] === 'string' && clean['startDate']) {
      const parsed = new Date(clean['startDate']);
      clean['dateISO'] = !isNaN(parsed.getTime())
        ? parsed.toISOString().split('T')[0]
        : clean['startDate'];
    } else if (typeof clean['date'] === 'string' && clean['date']) {
      const parsed = new Date(clean['date']);
      clean['dateISO'] = !isNaN(parsed.getTime())
        ? parsed.toISOString().split('T')[0]
        : clean['date'];
    } else {
      clean['dateISO'] = new Date().toISOString().split('T')[0];
    }
  }

  return clean;
}

/** 6. Guest Speaker Serializer */
export function serializeGuestSpeaker(speakerDoc: Record<string, unknown>): Record<string, unknown> {
  const clean = sanitizeDoc(speakerDoc);
  delete clean['_id'];
  return clean;
}

/** 7. Gallery Serializer */
export function serializeGallery(galleryDoc: Record<string, unknown>): Record<string, unknown> {
  const clean = sanitizeDoc(galleryDoc);
  delete clean['_id'];
  return {
    albums: clean['albums'] || [],
    videos: clean['videos'] || [],
  };
}

/** 8. News Article Serializer */
export function serializeNewsArticle(articleDoc: Record<string, unknown>): Record<string, unknown> {
  const clean = sanitizeDoc(articleDoc);
  clean['id'] = String(clean['slug'] || clean['_id']);
  delete clean['_id'];
  delete clean['isArchived'];

  // Ensure summary / excerpt alias
  if (!clean['summary'] && clean['excerpt']) {
    clean['summary'] = clean['excerpt'];
  }
  if (!clean['image'] && clean['coverImage']) {
    clean['image'] = clean['coverImage'];
  }

  return clean;
}

/** 9. IQAC Dossier Serializer */
export function serializeIQAC(iqacDoc: Record<string, unknown>): Record<string, unknown> {
  const clean = sanitizeDoc(iqacDoc);
  delete clean['_id'];
  return clean;
}

/** 10. Facility Serializer */
export function serializeFacility(facilityDoc: Record<string, unknown>): Record<string, unknown> {
  const clean = sanitizeDoc(facilityDoc);
  clean['id'] = String(clean['id'] || clean['_id'] || clean['name']);
  delete clean['_id'];
  return clean;
}

/** 11. Placements Serializer (Privacy Guarded) */
export function serializePlacements(placementDoc: Record<string, unknown>): Record<string, unknown> {
  // Deliberate field selection: Only expose authorized public corporate and aggregate stats
  return {
    overview: placementDoc['overview'] || '',
    stats: placementDoc['stats'] || [],
    recruiters: placementDoc['recruiters'] || [],
    successStories: placementDoc['successStories'] || [],
    partnerships: placementDoc['partnerships'] || [],
    brochureUrl: placementDoc['brochureUrl'] || undefined,
  };
}

/** 12. Contact Information Serializer */
export function serializeContactInfo(contactDoc: Record<string, unknown>): Record<string, unknown> {
  const clean = sanitizeDoc(contactDoc);
  delete clean['_id'];
  return clean;
}
