"use client";

import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaTrashAlt, FaPlus, FaMinus, FaLock, FaCreditCard, FaMapMarkerAlt, FaPhoneAlt, FaCity, FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function CartPage() {
  const { cartItems, cartTotal, updateCartItem, removeFromCart, clearCart, loading, refreshCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  
  const [shippingAddress, setShippingAddress] = useState({
    details: "",
    phone: "",
    city: "",
    postalCode: "12345"
  });

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleCheckout = (paymentType: 'stripe' | 'visa') => {
    if (!isAuthenticated) {
      alert("Please login to proceed to checkout");
      router.push('/login');
      return;
    }
    
    if (!shippingAddress.details || !shippingAddress.phone || !shippingAddress.city) {
      alert("Please fill in all required shipping address fields.");
      return;
    }
    
    const params = new URLSearchParams(shippingAddress);
    const path = paymentType === 'stripe' ? '/payment' : '/payment/visa';
    router.push(`${path}?${params.toString()}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a202c] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Preparing your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center py-20">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <FaShoppingCart className="text-gray-300 text-4xl" />
          </div>
          <h2 className="text-3xl font-black text-[#1a202c] mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            Looks like you haven't added anything to your cart yet. Explore our Omani traditional collection and find something special.
          </p>
          <button
            onClick={() => router.push('/products')}
            className="inline-flex items-center gap-3 bg-[#1a202c] hover:bg-[#c5a059] text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-[#1a202c]/20"
          >
            <FaArrowLeft className="text-sm" />
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-24 pt-12">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-[#1a202c] tracking-tight">Shopping Bag</h1>
            <p className="text-gray-500 font-medium">You have {cartItems.length} items in your bag</p>
          </div>
          <button
            onClick={() => { if(confirm('Clear all items?')) clearCart() }}
            className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-2 transition-colors border-b border-transparent hover:border-red-200 pb-1"
          >
            <FaTrashAlt size={14} /> Clear entire bag
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Product List */}
          <div className="lg:col-span-8 space-y-6">
            {cartItems.map((item) => (
              <div 
                key={item.product._id} 
                className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col sm:flex-row gap-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group"
              >
                <div className="w-full sm:w-48 h-56 rounded-xl overflow-hidden bg-gray-50 relative shrink-0">
                  <img
                    src={item.product.imageCover}
                    alt={item.product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                
                <div className="flex-1 flex flex-col py-2">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#1a202c] mb-2 group-hover:text-[#c5a059] transition-colors leading-snug">
                        {item.product.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                        {item.product.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.product._id)}
                      className="text-gray-300 hover:text-red-500 p-2 transition-all duration-300 hover:bg-red-50 rounded-lg"
                    >
                      <FaTrashAlt size={18} />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.product._id, item.count - 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-[#1a202c]"
                        disabled={item.count <= 1}
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="w-12 text-center font-black text-[#1a202c]">{item.count}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product._id, item.count + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-[#1a202c]"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400 font-medium mb-1">Item Total</p>
                      <p className="text-2xl font-black text-[#1a202c]">
                        {item.price.toLocaleString()} <span className="text-xs font-bold text-gray-400 ml-1">EGP</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary & Form */}
          <div className="lg:col-span-4 space-y-8 sticky top-12">
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50">
              <h2 className="text-2xl font-black text-[#1a202c] mb-8 flex items-center gap-3">
                Order Summary
              </h2>

              {/* Shipping Form */}
              <div className="space-y-6 mb-10">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#4A5568]">
                    <FaCity />
                  </div>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:bg-white focus:border-[#c5a059] focus:ring-4 focus:ring-[#c5a059]/10 outline-none transition-all text-sm font-bold text-[#1a202c] placeholder:text-[#4A5568] shadow-sm"
                    placeholder="City / Region"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#4A5568]">
                    <FaPhoneAlt />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:bg-white focus:border-[#c5a059] focus:ring-4 focus:ring-[#c5a059]/10 outline-none transition-all text-sm font-bold text-[#1a202c] placeholder:text-[#4A5568] shadow-sm"
                    placeholder="Phone Number"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#4A5568]">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    id="details"
                    name="details"
                    value={shippingAddress.details}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:bg-white focus:border-[#c5a059] focus:ring-4 focus:ring-[#c5a059]/10 outline-none transition-all text-sm font-bold text-[#1a202c] placeholder:text-[#4A5568] shadow-sm"
                    placeholder="Full Address Details"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Bag Subtotal</span>
                  <span className="text-[#1a202c]">{cartTotal.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Standard Shipping</span>
                  <span className="text-green-600 font-bold">Calculated at next step</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-xl font-black text-[#1a202c]">Total Amount</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#c5a059]">{cartTotal.toLocaleString()}</span>
                    <span className="text-xs font-bold text-gray-400 ml-1 uppercase">EGP</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-10">
                <button
                  onClick={() => handleCheckout('stripe')}
                  className="w-full bg-[#1a202c] hover:bg-[#2d3748] text-white font-black py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-[#1a202c]/20 hover:scale-[1.02] active:scale-95"
                >
                  <FaLock size={14} className="opacity-50" />
                  Proceed with Stripe
                </button>
                
                <button
                  onClick={() => handleCheckout('visa')}
                  className="w-full bg-white border-2 border-[#1a202c] text-[#1a202c] hover:bg-[#1a202c] hover:text-white font-black py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
                >
                  <FaCreditCard size={14} />
                  Pay with Credit Card
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                <FaLock size={10} /> Secure checkout guaranteed
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 px-4">
               <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <FaCity size={14} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Omani Craft</p>
               </div>
               <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <FaMapMarkerAlt size={14} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Fast Delivery</p>
               </div>
               <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <FaPhoneAlt size={14} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">24/7 Support</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


