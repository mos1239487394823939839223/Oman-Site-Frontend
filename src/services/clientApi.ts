
export const API_BASE =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1")
    : "";

function clearStoredAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function handleSessionExpiry() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?session_expired=1&redirect=${redirect}`;
}

async function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof window === "undefined") {
    return globalThis.fetch(input, init);
  }

  const url = typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  if (/^https?:\/\//i.test(url)) {
    return globalThis.fetch(input, init);
  }

  const headers = new Headers(init?.headers);
  headers.set("x-api-request", "1");

  return globalThis.fetch(input, {
    ...init,
    headers,
  });
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  couponCode?: string;
  imageCover: string;
  images: string[];
  category: {
    _id: string;
    name: string;
    image: string;
  };
  brand: {
    _id: string;
    name: string;
    image: string;
  };
  ratingsAverage: number;
  ratingsQuantity: number;
  sold: number;
  quantity: number;
  bestSeller?: boolean;
  isRecommended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  _id: string;
  name: string;
  image: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  _id: string;
  name: string;
  image: string;
  category: string | { _id: string; name: string; image?: string };
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  addresses: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product?: Product;
  gift?: Product;
  count: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}


export async function getProducts(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_BASE}/products${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getServices() {
  const res = await fetch(`${API_BASE}/services`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

export async function getProduct(productId: string) {
  const res = await fetch(`${API_BASE}/products/${productId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function getGift(giftId: string) {
  const res = await fetch(`${API_BASE}/gifts/${giftId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch gift");
  return res.json();
}

/** Fetch product first, then gift — gifts share the same response shape */
export async function getProductOrGift(id: string) {
  try {
    return await getProduct(id);
  } catch {
    return await getGift(id);
  }
}

export async function getProductsByCategory(categoryId: string) {
  const res = await fetch(`${API_BASE}/products?category=${categoryId}`);
  if (!res.ok) throw new Error("Failed to fetch products by category");
  return res.json();
}

export async function getProductsByBrand(brandId: string) {
  const res = await fetch(`${API_BASE}/products?brand=${brandId}`);
  if (!res.ok) throw new Error("Failed to fetch products by brand");
  return res.json();
}

export async function searchProducts(query: string) {
  const res = await fetch(`${API_BASE}/products?search=${query}`);
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
}


export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getCategory(categoryId: string) {
  const res = await fetch(`${API_BASE}/categories/${categoryId}`);
  if (!res.ok) throw new Error("Failed to fetch category");
  return res.json();
}


export async function getSubCategories() {
  const res = await fetch(`${API_BASE}/subcategories`);
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  return res.json();
}

export async function getBanners() {
  const res = await fetch(`${API_BASE}/banners`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch banners");
  return res.json();
}

export async function getFooter() {
  const res = await fetch(`${API_BASE}/footer`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch footer settings");
  return res.json();
}

export async function getGifts(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_BASE}/gifts${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch gifts");
  return res.json();
}

export async function getSubCategory(subCategoryId: string) {
  const res = await fetch(`${API_BASE}/subcategories/${subCategoryId}`);
  if (!res.ok) throw new Error("Failed to fetch subcategory");
  return res.json();
}


export async function getBrands() {
  const res = await fetch(`${API_BASE}/brands`);
  if (!res.ok) throw new Error("Failed to fetch brands");
  return res.json();
}

export async function getBrand(brandId: string) {
  const res = await fetch(`${API_BASE}/brands/${brandId}`);
  if (!res.ok) throw new Error("Failed to fetch brand");
  return res.json();
}


export async function signup(data: {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
}) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      phone: data.phone,
    }),
  });
  
  if (!res.ok) {
    let errorData: any = {};
    let errorText = '';
    
    try {
      errorText = await res.text();
      if (errorText) {
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          // Keep raw text if JSON parsing fails
          errorData = { raw: errorText };
        }
      }
    } catch {
      // Keep raw text if response body is unreadable
    }
    
    if (res.status === 409) {
      throw new Error("Email already exists. Please use a different email or try logging in.");
    } else if (res.status === 400) {
      const validationMsg = Array.isArray(errorData?.error)
        ? errorData.error.map((e: { msg?: string }) => e.msg).filter(Boolean).join('. ')
        : null;
      throw new Error(validationMsg || errorData?.message || "Invalid data. Please check your information and try again.");
    } else if (res.status === 404) {
      throw new Error("Registration service not found. Please try again later.");
    } else if (res.status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      const errorMessage = errorData?.message || errorData?.error || errorText || res.statusText;
      throw new Error(`Signup failed: ${res.status} - ${errorMessage || 'Unknown error'}`);
    }
  }
  
  return res.json();
}

export async function signin(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    let errorData: any = {};
    let errorText = '';
    
    try {
      errorText = await res.text();
      if (errorText) {
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          // Keep raw text if JSON parsing fails
          errorData = { raw: errorText };
        }
      }
    } catch {
      // Keep raw text if response body is unreadable
    }
    
    if (res.status === 401) {
      throw new Error("Invalid email or password. Please check your credentials and try again.");
    } else if (res.status === 400) {
      throw new Error("Invalid data. Please check your email and password format.");
    } else if (res.status === 404) {
      throw new Error("Authentication service not found. Please try again later.");
    } else if (res.status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      const errorMessage = errorData?.message || errorData?.error || errorText || res.statusText;
      throw new Error(`Signin failed: ${res.status} - ${errorMessage || 'Unknown error'}`);
    }
  }
  
  return res.json();
}

export async function logout(token: string) {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to log out");
  return readJsonSafe(res);
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE}/auth/forgetPassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 404) {
      throw new Error("Email not found. Please check your email address and try again.");
    } else if (res.status === 400) {
      throw new Error("Invalid email format. Please enter a valid email address.");
    } else {
      throw new Error(`Failed to send reset email: ${res.status} - ${errorData.message || res.statusText}`);
    }
  }
  
  return res.json();
}

export async function verifyResetCode(resetCode: string) {
  const res = await fetch(`${API_BASE}/auth/verifyResetCode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetCode }),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 400) {
      throw new Error("Invalid reset code. Please check the code and try again.");
    } else if (res.status === 404) {
      throw new Error("Reset code not found or expired. Please request a new reset code.");
    } else {
      throw new Error(`Failed to verify reset code: ${res.status} - ${errorData.message || res.statusText}`);
    }
  }
  
  return res.json();
}


export async function addToWishlist(productId: string, token: string) {
  const res = await fetch(`${API_BASE}/wishlist`, {
    method: "POST",
        headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error("Failed to add product to wishlist");
  return res.json();
}

export async function getWishlist(token: string) {
  const res = await fetch(`${API_BASE}/wishlist`, {
    headers: { "Authorization": `Bearer ${token}` } 
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      handleSessionExpiry();
      return { status: "success", data: [] };
    }
    console.warn(`getWishlist: API returned ${res.status} - returning empty wishlist`);
    return { status: "success", data: [] };
  }

  return res.json();
}

export async function removeFromWishlist(productId: string, token: string) {
  const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove product from wishlist");
  return res.json();
}


export async function addAddress(data: any, token: string) {
  const res = await fetch(`${API_BASE}/addresses`, {
    method: "POST",
        headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add address");
  return res.json();
}

export async function getAddresses(token: string) {
  const res = await fetch(`${API_BASE}/addresses`, { 
    headers: { "Authorization": `Bearer ${token}` } 
  });
  if (!res.ok) throw new Error("Failed to fetch addresses");
  return res.json();
}

export async function getAddress(addressId: string, token: string) {
  const res = await fetch(`${API_BASE}/addresses/${addressId}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch address");
  return res.json();
}

export async function removeAddress(addressId: string, token: string) {
  const res = await fetch(`${API_BASE}/addresses/${addressId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove address");
  return res.json();
}


export async function addToCart(
  itemId: string,
  token: string,
  options?: { isGift?: boolean; color?: string }
) {
  try {
    // Send either productId or giftId (never both), plus optional color.
    const body: Record<string, string> = options?.isGift
      ? { giftId: itemId }
      : { productId: itemId };
    if (options?.color) body.color = options.color;

    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(body),
    });
    

    
    if (!res.ok) {
      if (res.status === 401) {
        handleSessionExpiry();
        throw new Error('Session expired. Please log in again.');
      } else {
        throw new Error(`Failed to add item to cart: ${res.status} ${res.statusText}`);
      }
    }
    
    const data = await res.json();

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Network error. Please check your connection.");
  }
}

export async function getCart(token: string) {
  try {

    const res = await fetch(`${API_BASE}/cart`, { 
      headers: { "Authorization": `Bearer ${token}` } 
    });
    

    
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        handleSessionExpiry();
        return { status: "success", data: { cartItems: [], totalCartPrice: 0 } };
      } else if (res.status === 404) {
        return {
          status: "success", 
          data: { cartItems: [], totalCartPrice: 0 }
        };
      } else {
        console.warn(`getCart: API returned ${res.status} - returning empty cart`);
        return { status: "success", data: { cartItems: [], totalCartPrice: 0 } };
      }
    }
    
    const data = await res.json();

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Network error. Please check your connection.");
  }
}

export async function updateCartItem(productId: string, count: number, token: string) {
  try {

    
    const res = await fetch(`${API_BASE}/cart/${productId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ quantity: count }),
    });
    

    
    if (!res.ok) {
      if (res.status === 401) {
        handleSessionExpiry();
        throw new Error('Session expired. Please log in again.');
      } else {
        throw new Error(`Failed to update cart item: ${res.status} ${res.statusText}`);
      }
    }
    
    const data = await res.json();

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Network error. Please check your connection.");
  }
}

export async function removeCartItem(productId: string, token: string) {
  try {

    
    const res = await fetch(`${API_BASE}/cart/${productId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    

    
    if (!res.ok) {
      if (res.status === 401) {
        handleSessionExpiry();
        throw new Error('Session expired. Please log in again.');
      } else {
        throw new Error(`Failed to remove item from cart: ${res.status} ${res.statusText}`);
      }
    }
    
    const data = await res.json();

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Network error. Please check your connection.");
  }
}

export async function clearCart(token: string) {
  try {

    
    const res = await fetch(`${API_BASE}/cart`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    

    
    if (!res.ok) {
      if (res.status === 401) {
        handleSessionExpiry();
        throw new Error('Session expired. Please log in again.');
      } else {
        throw new Error(`Failed to clear cart: ${res.status} ${res.statusText}`);
      }
    }

    // DELETE /cart returns 204 No Content (empty body) — don't call res.json().
    return readJsonSafe(res);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Network error. Please check your connection.");
  }
}


/**
 * Parse a response body as JSON, tolerating an empty body.
 * Some order/payment endpoints return 200/201 with no content on success,
 * which makes a bare `res.json()` throw "Unexpected end of JSON input".
 * Falls back to a `{ status: "success" }` shape so callers that check
 * `response.status === "success"` still work.
 */
async function readJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return { status: "success", data: {} };
  try {
    return JSON.parse(text);
  } catch {
    return { status: "success", data: {} };
  }
}

/**
 * Map a frontend shipping address (which uses `details`, `phone`, `name`, …)
 * into the shape the backend order API expects: `{ address, city, postalCode, country }`.
 */
export function toBackendShippingAddress(sa: any = {}): {
  address: string;
  city: string;
  postalCode: string;
  country: string;
} {
  return {
    address: sa.address || sa.details || "",
    city: sa.city || "",
    postalCode: sa.postalCode || "",
    country: sa.country || "Oman",
  };
}

export async function createCashOrder(
  cartId: string,
  data: { shippingAddress?: any },
  token: string
) {
  const res = await fetch(`${API_BASE}/orders/${cartId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      shippingAddress: toBackendShippingAddress(data?.shippingAddress),
    }),
  });
  if (!res.ok) throw new Error("Failed to create cash order");
  const raw = await readJsonSafe(res);
  // Backend returns `{ message, debugger: <order> }`; normalize to the
  // `{ status, data }` shape the rest of the app expects.
  const order = raw?.debugger ?? raw?.data ?? {};
  return { status: "success", data: order, message: raw?.message };
}

export async function getAllOrders() {
  const res = await fetch(`${API_BASE}/orders/`);
  if (!res.ok) throw new Error("Failed to fetch all orders");
  return res.json();
}

export async function getUserOrders(userId: string, token: string) {
  const res = await fetch(`${API_BASE}/orders/user/${userId}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user orders");
  return res.json();
}

/**
 * Create a Stripe checkout session for the card-payment flow.
 * Backend: `GET /orders/checkout-session/:cartId` → `{ session: { url, ... } }`.
 * Returns the raw `{ session }` payload; caller redirects to `session.url`.
 */
export async function createCheckoutSession(cartId: string, token: string) {
  try {
    const res: Response = await fetch(
      `${API_BASE}/orders/checkout-session/${cartId}`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({} as any));
      throw new Error(
        err?.message || `Failed to create checkout session: ${res.status} ${res.statusText}`
      );
    }

    return readJsonSafe(res);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Network error. Please check your connection.");
  }
}

// Visa Card Payment API
export async function createVisaOrder(cartId: string, paymentData: {
  shippingAddress: {
    details: string;
    phone: string;
    city: string;
    postalCode: string;
  };
  cardDetails: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
  };
}, token: string) {
  const res = await fetch(`${API_BASE}/orders/visa/${cartId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(paymentData),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to process visa payment");
  }

  return readJsonSafe(res);
}

// Mock Visa Payment API (for testing)
export async function createMockVisaOrder(cartId: string, paymentData: {
  shippingAddress: {
    details: string;
    phone: string;
    city: string;
    postalCode: string;
  };
  cardDetails: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
  };
}, token: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock validation
  const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = paymentData.cardDetails;
  
  // Basic validation
  if (!cardNumber || cardNumber.length < 16) {
    throw new Error("Invalid card number");
  }
  
  if (!expiryMonth || !expiryYear) {
    throw new Error("Invalid expiry date");
  }
  
  if (!cvv || cvv.length < 3) {
    throw new Error("Invalid CVV");
  }
  
  if (!cardholderName) {
    throw new Error("Cardholder name is required");
  }
  
  // Mock successful payment
  return {
    status: "success",
    data: {
      orderId: `ORD_${Date.now()}`,
      paymentId: `PAY_${Date.now()}`,
      amount: 1000, // Mock amount
      status: "completed",
      message: "Payment processed successfully"
    }
  };
}

// ─── User Profile ────────────────────────────────────────────────────────────

export async function getMe(token: string) {
  const res = await fetch(`${API_BASE}/users/getMe`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateMyData(data: any, token: string) {
  const isFormData = data instanceof FormData;
  const res = await fetch(`${API_BASE}/users/updateMyData`, {
    method: "PUT",
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      "Authorization": `Bearer ${token}`,
    },
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function changeMyPassword(data: { currentPassword: string; password: string; rePassword: string }, token: string) {
  const res = await fetch(`${API_BASE}/users/changeMyPassword`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to change password");
  return res.json();
}

export async function deactivateMyAccount(token: string) {
  const res = await fetch(`${API_BASE}/users/deactivateMyAccount`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to deactivate account");
  // DELETE returns 204 No Content (empty body).
  return readJsonSafe(res);
}

// ─── Auth – Reset Password ────────────────────────────────────────────────────

export async function resetPassword(
  email: string,
  newPassword: string,
  newPasswordConfirm: string
) {
  const res = await fetch(`${API_BASE}/auth/resetPassword`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword, newPasswordConfirm }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to reset password");
  }
  return res.json();
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function getReviews() {
  const res = await fetch(`${API_BASE}/reviews`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function getProductReviews(productId: string) {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`);
  if (!res.ok) throw new Error("Failed to fetch product reviews");
  return res.json();
}

export async function createReview(productId: string, data: { rating: number; title?: string }, token: string) {
  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create review");
  return res.json();
}

export async function updateReview(reviewId: string, data: { rating?: number; title?: string }, token: string) {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update review");
  return res.json();
}

export async function deleteReview(reviewId: string, token: string) {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete review");
  // DELETE returns 204 No Content (empty body).
  return readJsonSafe(res);
}

// ─── Cart – Apply Coupon ──────────────────────────────────────────────────────

export async function applyCoupon(coupon: string, token: string) {
  const res = await fetch(`${API_BASE}/cart/applyCoupon`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ coupon }),
  });
  if (!res.ok) throw new Error("Failed to apply coupon");
  return res.json();
}

// ─── Subcategories by Category ────────────────────────────────────────────────

export async function getSubcategoriesByCategory(categoryId: string) {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/subcategories`);
  if (!res.ok) throw new Error("Failed to fetch subcategories for category");
  return res.json();
}

