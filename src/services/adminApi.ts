import { API_BASE } from "./clientApi";

function getToken(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || "";
  }
  return "";
}

async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();

  if (!token) {
    console.warn(`[adminApi] No auth token found for ${options.method || 'GET'} ${path}. User may not be logged in.`);
  }

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "x-api-request": "1",
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    let errorData: any = {};

    if (errorText) {
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
    }

    const message =
      errorData?.message ||
      errorData?.error ||
      errorData?.errors?.[0]?.msg ||
      errorText ||
      `Request failed: ${res.status}`;

    // Token expired or missing — clear stored credentials and redirect to login
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?session_expired=1&redirect=${redirect}`;
      }
      throw new Error('Session expired. Please log in again.');
    }

    throw new Error(message);
  }

  // 204 No Content (e.g. delete operations) — no body to parse
  if (res.status === 204) return null;

  return res.json();
}

export const adminApi = {
  // ─── Products ──────────────────────────────────────────────────────────────
  getAllProducts: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiRequest(`/products${query}`);
  },
  getProduct: (id: string) => apiRequest(`/products/${id}`),
  createProduct: (data: FormData | Record<string, any>) =>
    apiRequest("/products", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  updateProduct: (id: string, data: FormData | Record<string, any>) =>
    apiRequest(`/products/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    apiRequest(`/products/${id}`, { method: "DELETE" }),

  // ─── Gifts (same shape as products; price forced to 0 on backend) ──────────
  getAllGifts: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiRequest(`/gifts${query}`);
  },
  getGift: (id: string) => apiRequest(`/gifts/${id}`),
  createGift: (data: FormData | Record<string, unknown>) =>
    apiRequest("/gifts", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  updateGift: (id: string, data: FormData | Record<string, unknown>) =>
    apiRequest(`/gifts/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  deleteGift: (id: string) =>
    apiRequest(`/gifts/${id}`, { method: "DELETE" }),

  // ─── Categories ────────────────────────────────────────────────────────────
  getAllCategories: () => apiRequest("/categories"),
  getCategory: (id: string) => apiRequest(`/categories/${id}`),
  createCategory: (data: FormData | Record<string, any>) =>
    apiRequest("/categories", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  updateCategory: (id: string, data: FormData | Record<string, any>) =>
    apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    apiRequest(`/categories/${id}`, { method: "DELETE" }),

  // ─── Subcategories ─────────────────────────────────────────────────────────
  getAllSubcategories: () => apiRequest("/subcategories"),
  getSubcategory: (id: string) => apiRequest(`/subcategories/${id}`),
  getSubcategoriesByCategory: (categoryId: string) =>
    apiRequest(`/categories/${categoryId}/subcategories`),
  createSubcategory: (data: Record<string, any>) =>
    apiRequest("/subcategories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createSubcategoryUnderCategory: (categoryId: string, data: Record<string, any>) =>
    apiRequest(`/categories/${categoryId}/subcategories`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSubcategory: (id: string, data: Record<string, any>) =>
    apiRequest(`/subcategories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSubcategory: (id: string) =>
    apiRequest(`/subcategories/${id}`, { method: "DELETE" }),

  // ─── Brands ────────────────────────────────────────────────────────────────
  getAllBrands: () => apiRequest("/brands"),
  getBrand: (id: string) => apiRequest(`/brands/${id}`),
  createBrand: (data: FormData | Record<string, any>) =>
    apiRequest("/brands", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  updateBrand: (id: string, data: FormData | Record<string, any>) =>
    apiRequest(`/brands/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  deleteBrand: (id: string) =>
    apiRequest(`/brands/${id}`, { method: "DELETE" }),

  // ─── Banners ───────────────────────────────────────────────────────────────
  getAllBanners: () => apiRequest("/banners"),
  getBanner: (id: string) => apiRequest(`/banners/${id}`),
  createBanner: (data: FormData) =>
    apiRequest("/banners", { method: "POST", body: data }),
  updateBanner: (id: string, data: FormData | Record<string, any>) =>
    apiRequest(`/banners/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  deleteBanner: (id: string) =>
    apiRequest(`/banners/${id}`, { method: "DELETE" }),
  uploadBannerImage: (id: string, data: FormData) =>
    apiRequest(`/banners/${id}/image`, { method: "POST", body: data }),

  // ─── Users ─────────────────────────────────────────────────────────────────
  getAllUsers: () => apiRequest("/users"),
  getUser: (id: string) => apiRequest(`/users/${id}`),
  createUser: (data: FormData | Record<string, any>) =>
    apiRequest("/users", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  updateUser: (id: string, data: FormData | Record<string, any>) =>
    apiRequest(`/users/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    apiRequest(`/users/${id}`, { method: "DELETE" }),
  // The backend uses DELETE /users/:id to deactivate (soft delete).
  // toggleUserActive is kept for UI compatibility — it calls the same endpoint.
  toggleUserActive: (id: string) =>
    apiRequest(`/users/${id}`, { method: "DELETE" }),
  changeUserPassword: (id: string, data: Record<string, any>) =>
    apiRequest(`/users/changePassword/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // ─── Coupons ───────────────────────────────────────────────────────────────
  getAllCoupons: () => apiRequest("/coupons"),
  getCoupon: (id: string) => apiRequest(`/coupons/${id}`),
  createCoupon: (data: { name: string; expire: string; discount: number }) =>
    apiRequest("/coupons", { method: "POST", body: JSON.stringify(data) }),
  updateCoupon: (id: string, data: Record<string, any>) =>
    apiRequest(`/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCoupon: (id: string) =>
    apiRequest(`/coupons/${id}`, { method: "DELETE" }),

  // ─── Orders ────────────────────────────────────────────────────────────────
  getAllOrders: () => apiRequest("/orders"),
  getOrder: (id: string) => apiRequest(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ orderStatus: status }),
    }),

  // ─── Reviews (admin moderation) ────────────────────────────────────────────
  getAllReviews: () => apiRequest("/reviews"),
  getReview: (id: string) => apiRequest(`/reviews/${id}`),
  deleteReview: (id: string) =>
    apiRequest(`/reviews/${id}`, { method: "DELETE" }),

  // ─── Footer (singleton site settings) ──────────────────────────────────────
  getFooter: () => apiRequest("/footer"),
  updateFooter: (data: Record<string, unknown>) =>
    apiRequest("/footer", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
