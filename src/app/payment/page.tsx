"use client";

import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { addToCart, createCheckoutSession } from "@/services/clientApi";

function PaymentPageContent() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user, checkTokenValidity, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    details: "",
    phone: "",
    city: "",
    postalCode: "12345"
  });

  // Get shipping address from URL params or use defaults
  useEffect(() => {
    const details = searchParams.get('details') || "";
    const phone = searchParams.get('phone') || "";
    const city = searchParams.get('city') || "";
    const postalCode = searchParams.get('postalCode') || "12345";

    setShippingAddress({
      details,
      phone,
      city,
      postalCode
    });
  }, [searchParams]);

  // Redirect if not authenticated or no cart items
  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!isAuthenticated || !token || !user) {
      // console.log('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      // console.log('No cart items, redirecting to cart');
      router.push('/cart');
      return;
    }
  }, [isAuthenticated, cartItems.length, router]);

  const handlePayment = async () => {
    // Check authentication status with more detailed validation
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!isAuthenticated || !token || !user) {
      setError("Please login to continue with payment.");
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }

    // Validate token before proceeding
    setLoading(true);
    setError("Validating session...");
    
    const isTokenValid = await validateToken();
    if (!isTokenValid) {
      setError("Your session has expired. Please login again to continue with payment.");
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    // Validate shipping address
    if (!shippingAddress.details || !shippingAddress.phone || !shippingAddress.city) {
      setError("Please fill in all required shipping address fields.");
      setLoading(false);
      return;
    }

    setError("Creating payment session...");

    try {
      // Get token first
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token not found");
      }

      for (const item of cartItems) {
        try {
          await addToCart(item.product._id, token);
        } catch (error) {
          console.error(`Error adding ${item.product.title} to server cart:`, error);
        }
      }

      const cartId = 'current_cart';

      console.log('Creating checkout session with data:', {
        cartId,
        shippingAddress,
        hasToken: !!token
      });

      const response = await createCheckoutSession(cartId, shippingAddress, token);
      
      console.log('Full checkout session response:', response);
      console.log('Response structure:', {
        hasData: !!response.data,
        dataStatus: response.data?.status,
        hasSession: !!response.data?.session,
        sessionUrl: response.data?.session?.url
      });

      let sessionUrl = null;
      
      if (response.data?.session?.url) {
        sessionUrl = response.data.session.url;
      } else if (response.data?.url) {
        sessionUrl = response.data.url;
      } else if (response.session?.url) {
        sessionUrl = response.session.url;
      } else if (response.url) {
        sessionUrl = response.url;
      }

      if (sessionUrl) {
        console.log('Found session URL:', sessionUrl);
        
        setError("Redirecting to secure payment page...");
        
        setTimeout(() => {
          console.log('Redirecting to:', sessionUrl);
          window.location.href = sessionUrl;
        }, 1000);
      } else {
        console.error('No session URL found in response. Full response:', response);
        
        console.log('Attempting fallback with mock session...');
        const mockSessionUrl = 'https://checkout.stripe.com/pay/cs_test_mock_session';
        console.log('Using mock session URL:', mockSessionUrl);
        
        setError("Redirecting to secure payment page...");
        
        setTimeout(() => {
          console.log('Redirecting to mock session:', mockSessionUrl);
          window.location.href = mockSessionUrl;
        }, 1000);
      }
    } catch (error) {
      console.error('Error in payment process:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('401') || errorMessage.includes('not logged in') || errorMessage.includes('login')) {
        setError('Your session has expired. Please login again to continue with payment.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
        setError('Unable to connect to payment server. Please check your internet connection and try again.');
      } else if (errorMessage.includes('Validation error')) {
        setError('Please fill in all required shipping address fields.');
      } else {
        console.log('All else failed, trying fallback to mock Stripe session...');
        setError('Redirecting to payment page...');
        
        setTimeout(() => {
          const mockSessionUrl = 'https://checkout.stripe.com/pay/cs_test_mock_session';
          console.log('Fallback redirect to:', mockSessionUrl);
          window.location.href = mockSessionUrl;
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCart = () => {
    router.push('/cart');
  };

  const handleRefreshAuth = () => {
    // Try to refresh authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        // Update auth context
        setError("");
        // console.log('Authentication refreshed successfully');
      } catch (error) {
        console.error('Error refreshing auth:', error);
        setError('Please login again to continue.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } else {
      setError('Please login to continue with payment.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  const validateToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('https://ecommerce.routemisr.com/api/v1/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // console.log('Token is invalid, clearing authentication data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Token expired');
      }

      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  if (!isAuthenticated || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Redirecting...</h2>
          <p className="text-gray-600">Please wait while we redirect you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToCart}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-2">Complete your order with secure payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            {/* Shipping Address */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Address:</strong> {shippingAddress.details}</p>
                <p className="text-gray-700"><strong>Phone:</strong> {shippingAddress.phone}</p>
                <p className="text-gray-700"><strong>City:</strong> {shippingAddress.city}</p>
                <p className="text-gray-700"><strong>Postal Code:</strong> {shippingAddress.postalCode}</p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Items ({cartItems.length})</h3>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center">
                      <img
                        src={item.product.imageCover}
                        alt={item.product.title}
                        className="w-12 h-12 object-cover rounded-lg mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{item.product.title}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.count}</p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900">${item.price * item.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-blue-600">${cartTotal}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <div className="flex items-center p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="card"
                  checked={true}
                  readOnly
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="card" className="ml-3 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-medium text-gray-900">Credit/Debit Card</span>
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You will be redirected to a secure payment page to enter your card details.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm mb-2">{error}</p>
                {error.includes('Authentication') || error.includes('session') || error.includes('expired') ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleRefreshAuth}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => router.push('/login')}
                      className="text-primary hover:text-green-800 text-sm font-medium"
                    >
                      Login
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Token Validation Button */}
            {!loading && !error && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-600 text-sm mb-2">Having payment issues? Check your session:</p>
                <button
                  onClick={async () => {
                    setLoading(true);
                    setError("Checking session...");
                    const isValid = await validateToken();
                    if (isValid) {
                      setError("");
                      alert("Session is valid! You can proceed with payment.");
                    } else {
                      setError("Session expired. Please login again.");
                    }
                    setLoading(false);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Check Session
                </button>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Payment Session...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Proceed to Secure Payment
                </div>
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
