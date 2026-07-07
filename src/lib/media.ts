const BACKEND_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
).replace(/\/api\/v1.*$/, "");

type MediaFolder = "gifts" | "products" | "categories" | "subcategories" | "banners" | "brands";

function toProxiedUploadPath(pathname: string): string {
  const normalized = pathname.replace(/^\/+/, "");
  if (normalized.startsWith("uploads/")) {
    return `/${normalized}`;
  }
  return `/uploads/${normalized}`;
}

/** Normalize gift/product/category image URLs from the API for Next.js /uploads proxy */
export function resolveMediaUrl(url?: string, folder?: MediaFolder): string {
  if (!url) return "/placeholder.svg";

  // Absolute backend or external URL. We strip the host and keep the path so the
  // browser loads it through the Next.js /uploads proxy — this works no matter
  // what host the API baked in (localhost, an api subdomain, the public domain).
  if (/^https?:\/\//i.test(url)) {
    // Pull out just the pathname, whether or not the host matches BACKEND_ORIGIN.
    let pathname: string | null = null;
    if (url.startsWith(BACKEND_ORIGIN)) {
      pathname = url.slice(BACKEND_ORIGIN.length);
    } else {
      try {
        pathname = new URL(url).pathname;
      } catch {
        pathname = null;
      }
    }

    if (pathname !== null) {
      const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
      if (p.startsWith("/uploads/")) return p;
      if (p.startsWith("/banners/")) return p.replace(/^\/banners\//, "/uploads/banners/");
      if (p.startsWith("/categories/")) return p.replace(/^\/categories\//, "/uploads/categories/");
      if (p.startsWith("/products/")) return p.replace(/^\/products\//, "/uploads/products/");
      if (p.startsWith("/gifts/")) return p.replace(/^\/gifts\//, "/uploads/gifts/");
      // Host matched but path is something else — keep the stripped path.
      if (url.startsWith(BACKEND_ORIGIN)) return p;
    }
    // Genuinely external image (different host, not an uploads path) — leave it.
    return url;
  }

  if (url.startsWith("/uploads/")) return url;

  // Legacy backend paths without /uploads prefix
  if (url.startsWith("/banners/")) {
    return url.replace(/^\/banners\//, "/uploads/banners/");
  }
  if (url.startsWith("/categories/")) {
    return url.replace(/^\/categories\//, "/uploads/categories/");
  }
  if (url.startsWith("/products/")) {
    return url.replace(/^\/products\//, "/uploads/products/");
  }
  if (url.startsWith("/gifts/")) {
    return url.replace(/^\/gifts\//, "/uploads/gifts/");
  }

  if (folder) {
    return toProxiedUploadPath(`${folder}/${url.replace(/^\//, "")}`);
  }

  return url.startsWith("/") ? url : `/${url}`;
}
