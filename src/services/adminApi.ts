// Use local API routes instead of external API
const LOCAL_API_BASE = "/api/admin";

// Helper function for authenticated requests to local JSON files
async function authenticatedRequest(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    const res = await fetch(`${LOCAL_API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      let errorMessage = `Request failed ${res.status}`;
      let errorDetails = "";

      try {
        const errorData = await res.json();
        errorDetails = errorData.message || errorData.error || "";
      } catch (e) {
        const text = await res.text().catch(() => "");
        errorDetails = text;
      }

      if (errorDetails) {
        errorMessage += `: ${errorDetails}`;
      }

      throw new Error(errorMessage);
    }

    return res.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to server");
    }
    throw error;
  }
}

export const adminApi = {
  // Products Management
  getAllProducts: () => authenticatedRequest("/products"),
  getProduct: (id: string) => authenticatedRequest(`/products/${id}`),
  createProduct: (data: any) =>
    authenticatedRequest("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: any) =>
    authenticatedRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    authenticatedRequest(`/products/${id}`, {
      method: "DELETE",
    }),

  // Orders Management
  getAllOrders: () => authenticatedRequest("/orders"),
  getOrder: (id: string) => authenticatedRequest(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    authenticatedRequest(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ orderStatus: status }),
    }),

  // Users Management
  getAllUsers: () => authenticatedRequest("/users"),
  getUser: (id: string) => authenticatedRequest(`/users/${id}`),
  createUser: (data: any) =>
    authenticatedRequest("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: any) =>
    authenticatedRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    authenticatedRequest(`/users/${id}`, {
      method: "DELETE",
    }),
  toggleUserActive: (id: string) =>
    authenticatedRequest(`/users/${id}/toggle-active`, {
      method: "PUT",
    }),

  // Categories Management
  getAllCategories: () => authenticatedRequest("/categories"),
  getCategory: (id: string) => authenticatedRequest(`/categories/${id}`),
  createCategory: (data: any) =>
    authenticatedRequest("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: any) =>
    authenticatedRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    authenticatedRequest(`/categories/${id}`, {
      method: "DELETE",
    }),

  // Brands Management
  getAllBrands: () => authenticatedRequest("/brands"),
  getBrand: (id: string) => authenticatedRequest(`/brands/${id}`),
  createBrand: (data: any) =>
    authenticatedRequest("/brands", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBrand: (id: string, data: any) =>
    authenticatedRequest(`/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteBrand: (id: string) =>
    authenticatedRequest(`/brands/${id}`, {
      method: "DELETE",
    }),

  // Subcategories Management
  getAllSubcategories: () => authenticatedRequest("/subcategories"),
  getSubcategory: (id: string) => authenticatedRequest(`/subcategories/${id}`),
  createSubcategory: (data: any) =>
    authenticatedRequest("/subcategories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSubcategory: (id: string, data: any) =>
    authenticatedRequest(`/subcategories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSubcategory: (id: string) =>
    authenticatedRequest(`/subcategories/${id}`, {
      method: "DELETE",
    }),

  // Dashboard Statistics
  getDashboardStats: () => authenticatedRequest("/dashboard/stats"),
};

