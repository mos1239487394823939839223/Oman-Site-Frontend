
export const API_BASE = "https://ecommerce.routemisr.com/api/v1";

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
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
  product: Product;
  count: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}


export async function getProducts() {
  const res = await fetch(`/api/admin/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProduct(productId: string) {
  const res = await fetch(`/api/admin/products/${productId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
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
  const res = await fetch(`/api/admin/categories`, { cache: 'no-store' });
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
  try {
    const res = await fetch(`${API_BASE}/banners`);
    if (!res.ok) {
      throw new Error("Failed to fetch banners");
    }
    return res.json();
  } catch (error) {
    return {
      status: "success",
      data: [
        {
          _id: "1",
          name: "Luxury Mussar Collection",
          image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&h=600&fit=crop",
          link: "/products"
        },
        {
          _id: "2", 
          name: "Premium Omani Dishdasha",
          image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1200&h=600&fit=crop",
          link: "/products"
        },
        {
          _id: "3",
          name: "Handmade Shal & Accessories",
          image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&h=600&fit=crop",
          link: "/products"
        }
      ]
    };
  }
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
  rePassword: string;
  phone: string;
}) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
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
    } catch (parseError) {
      console.error('Error reading response:', parseError);
    }
    
    console.error('Signup error:', {
      status: res.status,
      statusText: res.statusText,
      errorData: errorData || {},
      errorText: errorText || 'No error text',
      url: res.url
    });
    
    if (res.status === 409) {
      throw new Error("Email already exists. Please use a different email or try logging in.");
    } else if (res.status === 400) {
      throw new Error("Invalid data. Please check your information and try again.");
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
  const res = await fetch(`${API_BASE}/auth/signin`, {
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
    } catch (parseError) {
      console.error('Error reading response:', parseError);
    }
    
    const errorMessage = errorData?.message || errorData?.errors?.[0]?.msg || errorText || res.statusText || 'Unknown error';
    
    console.error(`Signin error (${res.status}): ${errorMessage}`, {
      status: res.status,
      statusText: res.statusText,
      errorData: errorData,
      errorText: errorText,
      url: res.url
    });
    
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

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE}/auth/forgotPasswords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('Forgot password error:', {
      status: res.status,
      statusText: res.statusText,
      errorData
    });
    
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
    console.error('Verify reset code error:', {
      status: res.status,
      statusText: res.statusText,
      errorData
    });
    
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
  if (!res.ok) throw new Error("Failed to fetch wishlist");
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


export async function addToCart(productId: string, token: string) {
  try {
    // Check if token is a local admin token (mock token)
    if (token && token.startsWith('local_admin_token_')) {
      console.warn("addToCart: Local admin token detected - cart operations require real API authentication");
      return {
        status: "success",
        message: "Cart operations require real API authentication. Please login with a real account for cart features."
      };
    }


    
    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ productId }),
    });
    

    
    if (!res.ok) {
      if (res.status === 401) {
        console.warn("addToCart: Authentication failed - returning success for localStorage fallback");
        return {
          status: "success",
          message: "Product added to local cart"
        };
      } else {
        console.error(`addToCart: API error: ${res.status} ${res.statusText}`);
        throw new Error(`Failed to add product to cart: ${res.status} ${res.statusText}`);
      }
    }
    
    const data = await res.json();

    return data;
  } catch (error) {
    console.error('addToCart: Error occurred:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error. Please check your connection.");
  }
}

export async function getCart(token: string) {
  try {
    // Check if token is a local admin token (mock token)
    if (token && token.startsWith('local_admin_token_')) {
      console.warn("getCart: Local admin token detected - returning empty cart (cart features require real API authentication)");
      return {
        status: "success",
        data: []
      };
    }


    
    const res = await fetch(`${API_BASE}/cart`, { 
      headers: { "Authorization": `Bearer ${token}` } 
    });
    

    
    if (!res.ok) {
      if (res.status === 401) {
        console.warn("getCart: Authentication failed for cart API call - returning empty cart");
        // Instead of throwing error, return empty cart data
        return {
          status: "success",
          data: []
        };
      } else if (res.status === 404) {
        console.warn("getCart: Cart not found - returning empty cart");
        return {
          status: "success", 
          data: []
        };
      } else {
        console.error(`getCart: API error: ${res.status} ${res.statusText}`);
        throw new Error(`Failed to fetch cart: ${res.status} ${res.statusText}`);
      }
    }
    
    const data = await res.json();

    return data;
  } catch (error) {
    console.error('getCart: Error occurred:', error);
    if (error instanceof Error) {
      throw error;
    }
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
      body: JSON.stringify({ count }),
    });
    

    
    if (!res.ok) {
      if (res.status === 401) {
        console.warn("updateCartItem: Authentication failed - returning success for localStorage fallback");
        return {
          status: "success",
          message: "Cart item updated in local cart"
        };
      } else {
        console.error(`updateCartItem: API error: ${res.status} ${res.statusText}`);
        throw new Error(`Failed to update cart item: ${res.status} ${res.statusText}`);
      }
    }
    
    const data = await res.json();

    return data;
  } catch (error) {
    console.error('updateCartItem: Error occurred:', error);
    if (error instanceof Error) {
      throw error;
    }
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
        console.warn("removeCartItem: Authentication failed - returning success for localStorage fallback");
        return {
          status: "success",
          message: "Item removed from local cart"
        };
      } else {
        console.error(`removeCartItem: API error: ${res.status} ${res.statusText}`);
        throw new Error(`Failed to remove item from cart: ${res.status} ${res.statusText}`);
      }
    }
    
    const data = await res.json();

    return data;
  } catch (error) {
    console.error('removeCartItem: Error occurred:', error);
    if (error instanceof Error) {
      throw error;
    }
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
        console.warn("clearCart: Authentication failed - returning success for localStorage fallback");
        return {
          status: "success",
          message: "Cart cleared in local storage"
        };
      } else {
        console.error(`clearCart: API error: ${res.status} ${res.statusText}`);
        throw new Error(`Failed to clear cart: ${res.status} ${res.statusText}`);
      }
    }
    
    const data = await res.json();

    return data;
  } catch (error) {
    console.error('clearCart: Error occurred:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error. Please check your connection.");
  }
}


export async function createCart(token?: string) {
  console.warn('createCart: Cart creation is not needed - cart is created automatically when items are added');
  
  return {
    status: "success",
    data: {
      _id: `cart_${Date.now()}`,
      message: "Cart will be created automatically when items are added"
    }
  };
}

export async function createCashOrder(cartId: string, data: any, token: string) {
  const res = await fetch(`${API_BASE}/orders/${cartId}`, {
    method: "POST",
        headers: {
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create cash order");
  return res.json();
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

export async function createCheckoutSession(cartId: string, data: any, token: string) {
  try {
    const url = `${API_BASE}/orders/checkout-session/${cartId}?url=${window.location.origin}`;
    
    const res: Response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      let errorData = {};
      try {
        const errorText = await res.text();
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        // Silently fail parse
      }
      
      console.error('createCheckoutSession: API error:', {
        status: res.status,
        statusText: res.statusText,
        errorData,
        url: res.url
      });
      throw new Error(`Failed to create checkout session: ${res.status} ${res.statusText}`);
    }
    
    const responseData = await res.json();
    return responseData;
  } catch (error) {
    console.error('createCheckoutSession: Error occurred:', error);
    if (error instanceof Error) {
      throw error;
    }
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
  
  return res.json();
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
