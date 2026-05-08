"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/CartProvider";

export default function PaymentStepComponent() {
  const { cartItems } = useCart(); // Get cart data from CartProvider
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

  const steps = [
    { id: 1, name: "Shipping Information", icon: "📍", completed: true },
    { id: 2, name: "Payment Information", icon: "💳", active: true },
    { id: 3, name: "Order Review", icon: "✓", pending: true }
  ];

  useEffect(() => {
    // Calculate totals from cartItems provided by CartProvider
    const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.count), 0);
    const cartTax = cartSubtotal * 0.1;
    const cartTotal = cartSubtotal + cartTax;
    
    setSubtotal(cartSubtotal);
    setTax(cartTax);
    setTotal(cartTotal);
    
    console.log('PaymentStepComponent: Using cart data from CartProvider', {
      items: cartItems.length,
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal
    });
  }, [cartItems]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setFormData(prev => ({
      ...prev,
      expiryDate: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to complete payment');
        window.location.href = '/login';
        return;
      }

      const paymentResult = await api.processPayment({
        amount: total,
        currency: 'EGP',
        method: 'card',
        cardDetails: formData
      });

      if (paymentResult.success) {
        const orderData = {
          shippingAddress: {
            details: "Default address",
            phone: "Default phone",
            city: "Default city"
          },
          paymentMethod: "card",
          transactionId: paymentResult.transactionId
        };

        await api.createOrder(orderData, token);
        alert('Payment successful! Order placed.');
        window.location.href = "/orders";
      } else {
        alert(paymentResult.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <span className="font-semibold">fresh cart</span>
              </button>
              
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
                <a href="/products" className="text-gray-600 hover:text-gray-900">Products</a>
                <a href="/categories" className="text-gray-600 hover:text-gray-900">Categories</a>
                <a href="/brands" className="text-gray-600 hover:text-gray-900">Brands</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">TU</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Test User</span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.active 
                    ? 'bg-primary border-primary text-white' 
                    : step.completed
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <span className="text-sm font-medium">{step.icon}</span>
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.active || step.completed ? 'text-primary' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.active || step.completed ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Order</h1>
          <a href="/cart" className="flex items-center text-primary hover:text-primary/90">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">💳</span>
                <h2 className="text-xl font-semibold">Payment Information</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={handleExpiryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 3))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
                      placeholder="123"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                      isProcessing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-primary hover:opacity-90'
                    } text-white`}
                  >
                    {isProcessing ? 'Processing...' : 'Next'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center space-x-3">
                  <img 
                    src={item.product?.imageCover || "/placeholder.svg"} 
                    alt={item.product?.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{item.product?.title}</h3>
                    <p className="text-gray-600 text-sm">Quantity: {item.count}</p>
                    <p className="font-semibold text-primary">{item.price} EGP</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{subtotal.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-primary">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{tax.toFixed(2)} EGP</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{total.toFixed(2)} EGP</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-primary">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                Secure and encrypted payment
              </div>
              <div className="flex items-center text-sm text-primary">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                Customer data protection
              </div>
              <div className="flex items-center text-sm text-primary">
                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                Money back guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

