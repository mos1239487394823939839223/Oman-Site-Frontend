const API_BASE = "https://ecommerce.routemisr.com/api/v1";

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
    });
    
    if (!res.ok) {
      // Handle 401 errors gracefully for cart operations
      if (res.status === 401 && path.includes('/cart')) {
        console.warn(`api.js: Authentication failed for ${path} - returning empty data`);
        return { status: "success", data: { cartItems: [] } };
      }
      
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
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      throw error;
    }
}

export const api = {
  // Products API
  getProducts: (params = {}) => {
    let url = "/products";
    const queryParams = new URLSearchParams();
    
    // Handle different parameter types
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (key === "keyword") {
          queryParams.append("keyword", value);
        } else if (key === "category") {
          queryParams.append("category", value);
        } else if (key === "brand") {
          queryParams.append("brand", value);
        } else if (key === "sort") {
          queryParams.append("sort", value);
        } else if (key === "price") {
          if (value.gte) queryParams.append("price[gte]", value.gte);
          if (value.lte) queryParams.append("price[lte]", value.lte);
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    return request(url);
  },
  
  getProduct: (id) => request(`/products/${id}`),
  
  // Categories API
  getCategories: () => request("/categories"),
  getCategory: (id) => request(`/categories/${id}`),
  getSubcategories: (categoryId) => request(`/categories/${categoryId}/subcategories`),
  
  // Brands API
  getBrands: () => request("/brands"),
  getBrand: (id) => request(`/brands/${id}`),

  // Auth API
  signup: (body) => request("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/signin", { method: "POST", body: JSON.stringify(body) }),
  forgotPassword: (body) => request("/auth/forgotPasswords", { method: "POST", body: JSON.stringify(body) }),
  verifyResetCode: (body) => request("/auth/verifyResetCode", { method: "POST", body: JSON.stringify(body) }),
  resetPassword: (body) => request("/auth/resetPassword", { method: "PUT", body: JSON.stringify(body) }),

  // Payment & Orders API
  createCheckoutSession: (cartId, body) => request(`/orders/checkout-session/${cartId}`, { 
    method: "POST", 
    body: JSON.stringify(body),
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  }),
  createCashOrder: (cartId, body) => request(`/orders/${cartId}`, { 
    method: "POST", 
    body: JSON.stringify(body),
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  }),
  getUserOrders: () => request("/orders/myOrders", { 
    method: "GET",
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  }),

  // Cart API
  getCart: (token) => request("/cart", { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
  addToCart: (productId, count = 1, token) => request("/cart", { 
    method: "POST", 
    body: JSON.stringify({ productId, count }), 
    headers: { Authorization: token ? `Bearer ${token}` : "" } 
  }),
  updateCartItem: (itemId, count, token) => request(`/cart/${itemId}`, { 
    method: "PUT", 
    body: JSON.stringify({ count }), 
    headers: { Authorization: token ? `Bearer ${token}` : "" } 
  }),
  removeFromCart: (itemId, token) => request(`/cart/${itemId}`, { 
    method: "DELETE", 
    headers: { Authorization: token ? `Bearer ${token}` : "" } 
  }),
  clearCart: (token) => request("/cart", { 
    method: "DELETE", 
    headers: { Authorization: token ? `Bearer ${token}` : "" } 
  }),

  // Orders API
  createOrder: (body, token) => request("/orders", { method: "POST", body: JSON.stringify(body), headers: { Authorization: token ? `Bearer ${token}` : "" } }),

  // Wishlist API
  getWishlist: (token) => request("/wishlist", { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
  addToWishlist: (productId, token) => request("/wishlist", { 
    method: "POST", 
    body: JSON.stringify({ productId }), 
    headers: { Authorization: token ? `Bearer ${token}` : "" } 
  }),
  removeFromWishlist: (productId, token) => request(`/wishlist/${productId}`, { 
    method: "DELETE", 
    headers: { Authorization: token ? `Bearer ${token}` : "" } 
  }),
};



