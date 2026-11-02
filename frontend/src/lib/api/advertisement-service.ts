import {
  Advertisement,
  AdvertisementFilter,
  AdvertisementStats,
  CreateAdvertisementDto,
  UpdateAdvertisementDto,
  AdvertisementStatus,
} from "@/types/advertisement";

/**
 * ============================================================================
 * EXPECTED BACKEND API ENDPOINTS SPECIFICATION
 * ============================================================================
 * Base URL: /api/v1/advertisements
 *
 * 1. GET    /api/v1/advertisements
 *    - Query params: ?search=...&status=...&position=...&startDate=...&endDate=...
 *    - Description: Retrieve paginated/filtered list of advertisement records.
 *
 * 2. GET    /api/v1/advertisements/active
 *    - Query params: ?position=popup_overlay
 *    - Description: Retrieve the highest-priority active advertisement valid for current datetime.
 *
 * 3. GET    /api/v1/advertisements/:id
 *    - Description: Retrieve a single advertisement record by ID.
 *
 * 4. POST   /api/v1/advertisements
 *    - Body: CreateAdvertisementDto JSON
 *    - Description: Create a new advertisement.
 *
 * 5. PUT    /api/v1/advertisements/:id
 *    - Body: UpdateAdvertisementDto JSON
 *    - Description: Full/partial update of an advertisement.
 *
 * 6. PATCH  /api/v1/advertisements/:id/status
 *    - Body: { status: "active" | "inactive" | "draft" }
 *    - Description: Toggle or change advertisement status.
 *
 * 7. DELETE /api/v1/advertisements/:id
 *    - Description: Soft/hard delete an advertisement record.
 *
 * 8. POST   /api/v1/advertisements/upload-image
 *    - Body: FormData (file: File)
 *    - Description: Upload ad image banner to media server and return hosted URL.
 *
 * 9. POST   /api/v1/advertisements/:id/track-impression
 *    - Description: Increment impression counter for analytics.
 *
 * 10. POST  /api/v1/advertisements/:id/track-click
 *    - Description: Increment click counter for analytics.
 * ============================================================================
 */

const STORAGE_KEY = "bac_advertisements_v2";

// Initial realistic seed advertisements for BAC Global University
const INITIAL_ADVERTISEMENTS: Advertisement[] = [
  {
    id: "ad-001",
    title: "Admissions 2026-27 Open — Apply Now for UG & PG Programs",
    description: "Explore world-class programs in Artificial Intelligence, Computer Science, Biotechnology, and Business Administration. 100% placement support & merit scholarships available.",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    imageAltText: "Students at BAC Campus - Admissions 2026 Open",
    destinationUrl: "https://admissions.bishopambrose.edu.in",
    openInNewTab: true,
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    displayDuration: 10,
    displayFrequency: "once_per_session",
    displayPosition: "popup_overlay",
    priority: 1,
    status: "active",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "Master Admin",
    clickCount: 248,
    impressionCount: 1850,
  },
  {
    id: "ad-002",
    title: "International Research & AI Symposium 2026",
    description: "Join leading global researchers, IEEE fellows, and industry visionaries. Register now to present your paper and interact with AI experts.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    imageAltText: "BAC AI Research Symposium 2026 Banner",
    destinationUrl: "/events",
    openInNewTab: false,
    startDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    displayDuration: 10,
    displayFrequency: "every_visit",
    displayPosition: "popup_overlay",
    priority: 2,
    status: "active",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "Sub Admin",
    clickCount: 114,
    impressionCount: 920,
  },
  {
    id: "ad-003",
    title: "Annual Mega Placement Drive 2026 — 100+ Top Recruiters",
    description: "Fortune 500 companies & leading tech MNCs recruiting across all engineering, commerce, and science streams. Highest package $45 LPA.",
    imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
    imageAltText: "Mega Placement Drive Banner",
    destinationUrl: "/placements",
    openInNewTab: true,
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    displayDuration: 12,
    displayFrequency: "once_per_session",
    displayPosition: "popup_overlay",
    priority: 3,
    status: "scheduled",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "Placement Cell Head",
    clickCount: 0,
    impressionCount: 0,
  },
  {
    id: "ad-004",
    title: "Global Merit Scholarship & Financial Aid Scheme 2026",
    description: "Up to 100% tuition fee waiver for top academic achievers and national sports medalists.",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    imageAltText: "BAC Merit Scholarship Banner",
    destinationUrl: "/scholarships",
    openInNewTab: true,
    startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    displayDuration: 8,
    displayFrequency: "once_per_session",
    displayPosition: "popup_overlay",
    priority: 4,
    status: "expired",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "Sub Admin",
    clickCount: 195,
    impressionCount: 2100,
  },
  {
    id: "ad-005",
    title: "Inter-College Cultural Fest 'AMBROSIAL 2026' - Draft",
    description: "3 days of electrifying music concerts, battle of bands, dance shows, and celebrity guest performances.",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    imageAltText: "Ambrosial 2026 Fest",
    destinationUrl: "",
    openInNewTab: false,
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    displayDuration: 10,
    displayFrequency: "once_per_session",
    displayPosition: "popup_overlay",
    priority: 5,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "Content Editor",
    clickCount: 0,
    impressionCount: 0,
  },
  {
    id: "ad-006",
    title: "Ph.D. Research Admissions & Full University Fellowships",
    description: "Applications invited for full-time Ph.D. scholars with monthly stipend and laboratory research grants.",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    imageAltText: "Research & Labs at BAC",
    destinationUrl: "https://research.bishopambrose.edu.in",
    openInNewTab: true,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    displayDuration: 10,
    displayFrequency: "once_per_session",
    displayPosition: "popup_overlay",
    priority: 6,
    status: "active",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "Master Admin",
    clickCount: 87,
    impressionCount: 740,
  }
];

// Helper to compute effective dynamic status based on date range
export function computeEffectiveStatus(ad: Advertisement): AdvertisementStatus {
  if (ad.status === "draft" || ad.status === "inactive") {
    return ad.status;
  }
  const now = new Date();
  const start = new Date(ad.startDate);
  const end = new Date(ad.endDate);

  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return "active";
}

class AdvertisementService {
  private getStoredAdvertisements(): Advertisement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Advertisement[];
        return parsed.map((item) => ({
          ...item,
          status: computeEffectiveStatus(item),
        }));
      }
    } catch (e) {
      console.warn("Failed to read advertisements from localStorage", e);
    }
    // Save seeds initially
    this.saveToStorage(INITIAL_ADVERTISEMENTS);
    return INITIAL_ADVERTISEMENTS.map((item) => ({
      ...item,
      status: computeEffectiveStatus(item),
    }));
  }

  private saveToStorage(ads: Advertisement[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
    } catch (e) {
      console.warn("Failed to save advertisements to localStorage", e);
    }
  }

  /**
   * Fetch all advertisements with optional filtering
   */
  async getAdvertisements(filter?: AdvertisementFilter): Promise<Advertisement[]> {
    // Attempt backend API if available, fallback to localStorage
    try {
      const response = await fetch("/api/v1/advertisements", {
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      // Backend endpoint not active, using local store service
    }

    let list = this.getStoredAdvertisements();

    if (filter) {
      if (filter.search && filter.search.trim() !== "") {
        const query = filter.search.toLowerCase().trim();
        list = list.filter(
          (ad) =>
            ad.title.toLowerCase().includes(query) ||
            (ad.description && ad.description.toLowerCase().includes(query)) ||
            (ad.displayPosition && ad.displayPosition.toLowerCase().includes(query))
        );
      }

      if (filter.status && filter.status !== "all") {
        list = list.filter((ad) => computeEffectiveStatus(ad) === filter.status);
      }

      if (filter.position && filter.position !== "all") {
        list = list.filter((ad) => ad.displayPosition === filter.position);
      }

      if (filter.startDate) {
        const filterStart = new Date(filter.startDate).getTime();
        list = list.filter((ad) => new Date(ad.startDate).getTime() >= filterStart);
      }

      if (filter.endDate) {
        const filterEnd = new Date(filter.endDate).getTime();
        list = list.filter((ad) => new Date(ad.endDate).getTime() <= filterEnd);
      }
    }

    // Sort by priority (1 highest), then by created date
    return list.sort((a, b) => a.priority - b.priority || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Fetch the eligible active popup advertisement for public visitors
   */
  async getActiveAdvertisement(): Promise<Advertisement | null> {
    try {
      const response = await fetch("/api/v1/advertisements/active?position=popup_overlay");
      if (response.ok) {
        const json = await response.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // fallback
    }

    const ads = this.getStoredAdvertisements();
    const activeAds = ads.filter((ad) => {
      const status = computeEffectiveStatus(ad);
      return status === "active" && ad.displayPosition === "popup_overlay";
    });

    if (activeAds.length === 0) return null;

    // Pick ad with highest priority (lowest priority number)
    activeAds.sort((a, b) => a.priority - b.priority);
    return activeAds[0];
  }

  /**
   * Fetch advertisement by ID
   */
  async getAdvertisementById(id: string): Promise<Advertisement | null> {
    const ads = this.getStoredAdvertisements();
    return ads.find((a) => a.id === id) || null;
  }

  /**
   * Create a new advertisement
   */
  async createAdvertisement(dto: CreateAdvertisementDto, authorName = "Admin"): Promise<Advertisement> {
    const ads = this.getStoredAdvertisements();
    const nowIso = new Date().toISOString();

    const newAd: Advertisement = {
      id: `ad-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: dto.title.trim(),
      description: dto.description?.trim(),
      imageUrl: dto.imageUrl.trim(),
      imageAltText: dto.imageAltText?.trim() || dto.title.trim(),
      destinationUrl: dto.destinationUrl?.trim(),
      openInNewTab: dto.openInNewTab ?? true,
      startDate: dto.startDate,
      endDate: dto.endDate,
      displayDuration: dto.displayDuration || 10,
      displayFrequency: dto.displayFrequency || "once_per_session",
      displayPosition: dto.displayPosition || "popup_overlay",
      priority: dto.priority || 1,
      status: dto.status || "active",
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: authorName,
      clickCount: 0,
      impressionCount: 0,
    };

    // calculate dynamic status
    newAd.status = computeEffectiveStatus(newAd);

    const updated = [newAd, ...ads];
    this.saveToStorage(updated);

    // Note: Backend advertisement mutations are unconfigured in current API version.
    // Changes are preserved in client-side storage for preview and session management.
    return newAd;
  }

  /**
   * Update an existing advertisement
   */
  async updateAdvertisement(id: string, dto: UpdateAdvertisementDto): Promise<Advertisement> {
    const ads = this.getStoredAdvertisements();
    const index = ads.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error(`Advertisement with ID ${id} not found.`);
    }

    const current = ads[index];
    const updatedAd: Advertisement = {
      ...current,
      ...dto,
      title: dto.title !== undefined ? dto.title.trim() : current.title,
      imageUrl: dto.imageUrl !== undefined ? dto.imageUrl.trim() : current.imageUrl,
      updatedAt: new Date().toISOString(),
    };

    updatedAd.status = computeEffectiveStatus(updatedAd);
    ads[index] = updatedAd;
    this.saveToStorage(ads);

    return updatedAd;
  }

  /**
   * Toggle or update status of advertisement
   */
  async updateStatus(id: string, status: AdvertisementStatus): Promise<Advertisement> {
    const ad = await this.getAdvertisementById(id);
    if (!ad) throw new Error("Advertisement not found");
    return this.updateAdvertisement(id, { status });
  }

  /**
   * Delete advertisement
   */
  async deleteAdvertisement(id: string): Promise<boolean> {
    const ads = this.getStoredAdvertisements();
    const filtered = ads.filter((a) => a.id !== id);
    this.saveToStorage(filtered);

    return true;
  }

  /**
   * Calculate overview statistics
   */
  async getStats(): Promise<AdvertisementStats> {
    const ads = this.getStoredAdvertisements();
    const stats: AdvertisementStats = {
      total: ads.length,
      active: 0,
      scheduled: 0,
      expired: 0,
      draft: 0,
    };

    ads.forEach((ad) => {
      const status = computeEffectiveStatus(ad);
      if (status === "active") stats.active++;
      else if (status === "scheduled") stats.scheduled++;
      else if (status === "expired") stats.expired++;
      else if (status === "draft") stats.draft++;
    });

    return stats;
  }

  /**
   * Track ad impression
   */
  async trackImpression(id: string): Promise<void> {
    const ads = this.getStoredAdvertisements();
    const item = ads.find((a) => a.id === id);
    if (item) {
      item.impressionCount = (item.impressionCount || 0) + 1;
      this.saveToStorage(ads);
    }
  }

  /**
   * Track ad click
   */
  async trackClick(id: string): Promise<void> {
    const ads = this.getStoredAdvertisements();
    const item = ads.find((a) => a.id === id);
    if (item) {
      item.clickCount = (item.clickCount || 0) + 1;
      this.saveToStorage(ads);
    }
  }
}

export const advertisementService = new AdvertisementService();
