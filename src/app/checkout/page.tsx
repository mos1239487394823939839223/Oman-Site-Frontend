"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { createCashOrder, createCheckoutSession } from "@/services/clientApi";

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    details: "",
    phone: "",
    city: "",
    postalCode: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (mounted && cartItems.length === 0) {
      router.push('/cart');
    }
  }, [mounted, cartItems.length, router]);

  if (!mounted || !isAuthenticated || cartItems.length === 0) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.details || !formData.phone || !formData.city) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'card') {
        // Create checkout session for card payment
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please login to continue');
          return;
        }
        const response = await createCheckoutSession('current_cart', formData, token);
        
        if (response.data.status === 'success') {
          // Redirect to Stripe checkout
          if (typeof window !== 'undefined') {
            window.location.href = response.data.session.url;
          }
        } else {
          alert('Failed to create checkout session');
        }
      } else {
        // Create cash order
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please login to continue');
          return;
        }
        const response = await createCashOrder('current_cart', formData, token);
        
        if (response.data.status === 'success') {
          alert('Order created successfully! You will pay when the order is delivered.');
          clearCart();
          router.push('/orders');
        } else {
          alert('Failed to create order');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Details */}
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Details *
                </label>
                <input
                  type="text"
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="Street 12, Cairo, Egypt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="01012345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Cairo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  required
                />
              </div>

              {/* Postal Code */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                />
              </div>

              {/* Payment Method */}
              <div className="pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                      className="mr-3 text-primary focus:ring-primary/50"
                    />
                    <span className="text-gray-700">Credit/Debit Card (Online Payment)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                      className="mr-3 text-primary focus:ring-primary/50"
                    />
                    <span className="text-gray-700">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : paymentMethod === 'card' ? 'Pay Now' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <img
                    src={item.product.imageCover || "/placeholder.svg"}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.count}</p>
                    <p className="text-primary font-semibold">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">${cartTotal}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                {paymentMethod === 'card' 
                  ? 'You will be redirected to a secure payment page to complete your purchase.'
                  : 'You will pay when your order is delivered to your address.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
