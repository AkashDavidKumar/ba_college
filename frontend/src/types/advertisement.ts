export type AdvertisementStatus = "active" | "scheduled" | "draft" | "inactive" | "expired";

export type DisplayFrequency = "once_per_session" | "every_visit";

export type TargetTab = "new_tab" | "same_tab";

export type DisplayPosition = "popup_overlay" | "homepage_banner" | "sidebar_banner";

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageAltText?: string;
  destinationUrl?: string;
  openInNewTab: boolean;
  startDate: string; // ISO string YYYY-MM-DDTHH:mm
  endDate: string;   // ISO string YYYY-MM-DDTHH:mm
  displayDuration: number; // in seconds, default 10
  displayFrequency: DisplayFrequency;
  displayPosition: DisplayPosition;
  priority: number; // 1 (Highest Priority) to 10 (Lowest Priority)
  status: AdvertisementStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  clickCount?: number;
  impressionCount?: number;
}

export interface AdvertisementStats {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
  draft: number;
}

export interface AdvertisementFilter {
  search?: string;
  status?: AdvertisementStatus | "all";
  position?: DisplayPosition | "all";
  startDate?: string;
  endDate?: string;
}

export interface CreateAdvertisementDto {
  title: string;
  description?: string;
  imageUrl: string;
  imageAltText?: string;
  destinationUrl?: string;
  openInNewTab?: boolean;
  startDate: string;
  endDate: string;
  displayDuration?: number;
  displayFrequency?: DisplayFrequency;
  displayPosition?: DisplayPosition;
  priority?: number;
  status?: AdvertisementStatus;
}

export type UpdateAdvertisementDto = Partial<CreateAdvertisementDto>;
