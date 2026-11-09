/**
 * navigation-security.ts — Security Guards for Navigation Menus & Links
 *
 * Guarantees:
 *  1. Only safe internal routes ('/...', '#...') and strictly HTTP/HTTPS external links are allowed.
 *  2. Dangerous schemes (javascript:, data:, vbscript:, file:) are strictly rejected.
 *  3. Protocol-relative URLs ('//') are blocked to prevent open redirect vulnerabilities.
 *  4. All target="_blank" links automatically enforce rel="noopener noreferrer".
 *  5. Menu labels and icons are sanitized and rendered strictly as text nodes, never raw HTML.
 */

const DANGEROUS_URI_REGEX = /^(?:\s*javascript:|\s*data:|\s*vbscript:|\s*file:)/i;
const DANGEROUS_TAG_REGEX = /<\s*script[^>]*>|<\s*\/\s*script\s*>|on\w+\s*=/i;

export const ALLOWED_HTTP_DOMAINS = [
  "bac.edu.in",
  "b-u.ac.in",
  "localhost",
  "127.0.0.1",
];

function isAllowedHttpDomain(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return ALLOWED_HTTP_DOMAINS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

/**
 * Validates whether an external media asset URL is safe:
 *  - Must be HTTPS, or HTTP restricted to verified institutional domains (bac.edu.in, b-u.ac.in)
 *  - Rejects dangerous schemes, protocol-relative URLs, and control characters
 */
export function isSafeMediaUrl(val?: string | null): boolean {
  if (!val || typeof val !== "string" || val.trim() === "") return false;
  const trimmed = val.trim();

  if (DANGEROUS_URI_REGEX.test(trimmed)) return false;
  if (DANGEROUS_TAG_REGEX.test(trimmed)) return false;
  if (trimmed.startsWith("//")) return false;
  if (/[\r\n\t\0]/.test(trimmed)) return false;

  if (!trimmed.startsWith("https://") && !trimmed.startsWith("http://")) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:") {
      return true;
    }
    if (parsed.protocol === "http:") {
      return isAllowedHttpDomain(parsed.hostname);
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Validates whether a navigation URL or route path is safe to navigate to.
 */
export function isSafeNavigationUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed === "") return false;

  // Reject dangerous schemes and scripts
  if (DANGEROUS_URI_REGEX.test(trimmed)) return false;
  if (DANGEROUS_TAG_REGEX.test(trimmed)) return false;

  // Strictly block protocol-relative URLs (e.g. //phishing.com)
  if (trimmed.startsWith("//")) return false;

  // Safe internal routes (e.g. /events, #admissions)
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return !/[\r\n\t\0]/.test(trimmed);
  }

  // Safe external URLs: must use explicit http: or https:
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Generates safe anchor properties for external links or new-tab destinations.
 */
export function getSafeNavigationProps(path: string, target: "_self" | "_blank" = "_self") {
  const safe = isSafeNavigationUrl(path);
  const href = safe ? path : "#";

  if (target === "_blank" || href.startsWith("http://") || href.startsWith("https://")) {
    return {
      href,
      target: "_blank" as const,
      rel: "noopener noreferrer",
    };
  }

  return {
    href,
    target: "_self" as const,
    rel: undefined,
  };
}

/**
 * Sanitizes menu label text to guarantee it cannot contain raw HTML or event handlers.
 */
export function sanitizeMenuLabel(label?: string | null): string {
  if (!label || typeof label !== "string") return "";
  return label.replace(DANGEROUS_TAG_REGEX, "").trim();
}
