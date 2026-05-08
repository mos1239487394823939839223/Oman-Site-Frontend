// Manages which external API product IDs are hidden from the storefront.
// Stored in localStorage so no backend is needed.

const HIDDEN_KEY = "admin_hidden_products";

export function getHiddenProductIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HIDDEN_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function hideProduct(id: string) {
  const ids = getHiddenProductIds();
  if (!ids.includes(id)) {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify([...ids, id]));
  }
}

export function showProduct(id: string) {
  const ids = getHiddenProductIds().filter(i => i !== id);
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
}

export function isProductHidden(id: string): boolean {
  return getHiddenProductIds().includes(id);
}

export function clearAllHidden() {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([]));
}
