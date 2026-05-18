// Centralized navbar config — read by Header.tsx and written by Admin Dashboard

export interface NavItem {
  key: string;
  labelKey?: string;
  labelEn: string;
  labelAr: string;
  href: string;
  icon: string;        // icon name string (maps to react-icons/fa)
  visible: boolean;
  order: number;
  showBadge?: boolean; // e.g. cart count badge
}

export const NAVBAR_STORAGE_KEY = "admin_navbar_config";

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { key: "home",      labelKey: "header.home",      labelEn: "Home",       labelAr: "الرئيسية", href: "/",          icon: "FaHome",         visible: true, order: 1 },
  { key: "products",  labelKey: "header.products",  labelEn: "Products",   labelAr: "المنتجات", href: "/products",   icon: "FaShoppingBag",  visible: true, order: 2 },
  { key: "gifts",     labelKey: "header.gifts",     labelEn: "Gifts",      labelAr: "الهدايا",  href: "/categories", icon: "FaGift",         visible: true, order: 3 },
  { key: "reviews",   labelKey: "header.reviews",   labelEn: "Reviews",    labelAr: "التقييمات",href: "/reviews",    icon: "FaStar",         visible: true, order: 4 },
  { key: "favorites", labelKey: "header.favorites", labelEn: "Favorites",  labelAr: "المفضلة",  href: "/wishlist",   icon: "FaHeart",        visible: true, order: 5 },
  { key: "cart",      labelKey: "header.cart",      labelEn: "Cart",       labelAr: "السلة",    href: "/cart",       icon: "FaShoppingCart", visible: true, order: 6, showBadge: true },
];

export function loadNavItems(): NavItem[] {
  if (typeof window === "undefined") return DEFAULT_NAV_ITEMS;
  try {
    const saved = localStorage.getItem(NAVBAR_STORAGE_KEY);
    if (saved) {
      const parsed: NavItem[] = JSON.parse(saved);
      // Merge: keep defaults for any missing keys
      const savedKeys = parsed.map(i => i.key);
      const missing = DEFAULT_NAV_ITEMS.filter(d => !savedKeys.includes(d.key));
      return [...parsed, ...missing].sort((a, b) => a.order - b.order);
    }
  } catch {}
  return DEFAULT_NAV_ITEMS;
}

export function saveNavItems(items: NavItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAVBAR_STORAGE_KEY, JSON.stringify(items));
}

// Map icon string → component (used in Header)
export const ICON_OPTIONS = [
  "FaHome", "FaShoppingBag", "FaGift", "FaStar", "FaHeart",
  "FaShoppingCart", "FaBox", "FaTag", "FaUsers", "FaBell",
  "FaPhone", "FaEnvelope", "FaInfo", "FaCog", "FaStore",
];
