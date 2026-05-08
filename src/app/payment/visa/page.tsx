"use client";

import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { addToCart, createMockVisaOrder } from "@/services/clientApi";

function VisaPaymentPageContent() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  
  const [shippingAddress, setShippingAddress] = useState({
    details: "",
    phone: "",
    city: "",
    postalCode: "12345"
  });

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: ""
  });

  // Demo card details for testing
  const fillDemoData = () => {
    setCardDetails({
      cardNumber: "4111 1111 1111 1111",
      expiryMonth: "12",
      expiryYear: "25",
      cvv: "123",
      cardholderName: "John Doe"
    });
  };

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
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Visa Payment Page - Auth Check:', {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      cartItemsLength: cartItems.length
    });
    
    if (!isAuthenticated || !token || !user) {
      console.log('Redirecting to login - authentication failed');
      router.push('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      console.log('Redirecting to cart - no items');
      router.push('/cart');
      return;
    }
    
    console.log('Visa Payment Page - All checks passed');
  }, [isAuthenticated, cartItems.length, router]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 '); // Add spaces every 4 digits
    if (value.length <= 19) { // Limit to 16 digits + 3 spaces
      setCardDetails(prev => ({ ...prev, cardNumber: value }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    if (e.target.name === 'expiryMonth') {
      setCardDetails(prev => ({ ...prev, expiryMonth: value.split('/')[0] || '' }));
    } else {
      setCardDetails(prev => ({ ...prev, expiryYear: value.split('/')[1] || '' }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardDetails(prev => ({ ...prev, cvv: value }));
  };

  const validateForm = () => {
    if (!shippingAddress.details || !shippingAddress.phone || !shippingAddress.city) {
      setError("Please fill in all shipping address fields.");
      return false;
    }

    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length !== 16) {
      setError("Please enter a valid 16-digit card number.");
      return false;
    }

    // Validate expiry date
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expiryYear = parseInt(cardDetails.expiryYear);
    const expiryMonth = parseInt(cardDetails.expiryMonth);

    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      setError("Please enter card expiry date.");
      return false;
    }

    if (expiryMonth < 1 || expiryMonth > 12) {
      setError("Please enter a valid expiry month (01-12).");
      return false;
    }

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      setError("Card has expired. Please use a valid card.");
      return false;
    }

    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      setError("Please enter a valid CVV (3-4 digits).");
      return false;
    }

    if (!cardDetails.cardholderName || cardDetails.cardholderName.trim().length < 2) {
      setError("Please enter a valid cardholder name.");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
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

      const paymentData = {
        shippingAddress,
        cardDetails: {
          ...cardDetails,
          cardNumber: cardDetails.cardNumber.replace(/\s/g, '')
        }
      };

      console.log('Processing visa payment with data:', {
        cartId,
        paymentData: {
          shippingAddress,
          cardDetails: {
            ...cardDetails,
            cardNumber: cardDetails.cardNumber.replace(/\s/g, '')
          }
        }
      });

      const response = await createMockVisaOrder(cartId, paymentData, token);
      
      console.log('Visa payment response:', response);
      
      if (response.status === "success") {
        setSuccess(true);
        setOrderId(response.data.orderId);
        
        clearCart();
        
        console.log('Payment successful, redirecting to success page');
        
        setTimeout(() => {
          router.push(`/payment/success?orderId=${response.data.orderId}`);
        }, 3000);
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCart = () => {
    router.push('/cart');
  };

  if (!isAuthenticated || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Redirecting...</h2>
          <p className="text-gray-600 mb-2">Please wait while we redirect you.</p>
          <p className="text-sm text-gray-500">
            {!isAuthenticated ? 'Authentication required' : 'No items in cart'}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your order has been processed successfully.</p>
            <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Redirecting to confirmation page...</p>
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Visa Payment</h1>
          <p className="text-gray-600 mt-2">Complete your order with secure visa payment</p>
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

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Card Details</h2>
              <button
                type="button"
                onClick={fillDemoData}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Fill Demo Data
              </button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number *
                </label>
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  value={cardDetails.cardholderName}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Expiry Date and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="expiryMonth"
                      value={cardDetails.expiryMonth}
                      onChange={handleExpiryChange}
                      placeholder="MM"
                      maxLength={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <span className="flex items-center text-gray-500">/</span>
                    <input
                      type="text"
                      name="expiryYear"
                      value={cardDetails.expiryYear}
                      onChange={handleExpiryChange}
                      placeholder="YY"
                      maxLength={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Payment Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay ${cartTotal}
                  </div>
                )}
              </button>
            </form>

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

export default function VisaPaymentPage() {
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
      <VisaPaymentPageContent />
    </Suspense>
  );
}
