const BACKEND_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
).replace(/\/api\/v1.*$/, "");

type MediaFolder = "gifts" | "products" | "categories" | "banners" | "brands";

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

  // Absolute backend or external URL
  if (/^https?:\/\//i.test(url)) {
    if (url.startsWith(BACKEND_ORIGIN)) {
      const pathname = url.slice(BACKEND_ORIGIN.length);
      if (pathname.startsWith("/uploads/")) {
        return pathname;
      }
      if (pathname.startsWith("/banners/")) {
        return pathname.replace(/^\/banners\//, "/uploads/banners/");
      }
      if (pathname.startsWith("/categories/")) {
        return pathname.replace(/^\/categories\//, "/uploads/categories/");
      }
      if (pathname.startsWith("/products/")) {
        return pathname.replace(/^\/products\//, "/uploads/products/");
      }
      if (pathname.startsWith("/gifts/")) {
        return pathname.replace(/^\/gifts\//, "/uploads/gifts/");
      }
      return pathname.startsWith("/") ? pathname : `/${pathname}`;
    }
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
