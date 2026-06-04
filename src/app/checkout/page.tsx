"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { createCashOrder, createCheckoutSession, getCart } from "@/services/clientApi";
import { FaTruck, FaPhone, FaMapMarkerAlt, FaPostageStamp, FaChevronLeft, FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaTag, FaCheckCircle, FaTimesCircle, FaTimes } from "react-icons/fa";
import Image from "next/image";
import styles from "./CheckoutPage.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, cartTotalAfterDiscount, appliedCoupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("يرجى إدخال كود الخصم أولاً");
      return;
    }
    if (code === appliedCoupon) {
      setCouponError("هذا الكوبون مُطبَّق بالفعل");
      return;
    }

    setApplyingCoupon(true);
    setCouponError("");
    setCouponDiscount(null);

    try {
      const { discount } = await applyCoupon(code);
      setCouponDiscount(discount);
      setCouponInput("");
    } catch (error: any) {
      // Surface human-readable messages for common coupon failures
      const msg: string = error?.message || "";
      if (/expired/i.test(msg) || /انتهت/i.test(msg)) {
        setCouponError("هذا الكوبون منتهي الصلاحية");
      } else if (/not found|invalid/i.test(msg)) {
        setCouponError("كود الخصم غير صحيح أو غير موجود");
      } else {
        setCouponError(msg || "تعذر تطبيق الكوبون، يرجى المحاولة مجدداً");
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponDiscount(null);
    setCouponError("");
    setCouponInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.details || !formData.phone || !formData.city) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Step 1: Ensure we have the real Cart ID
      const cartResponse = await getCart(token);
      if (cartResponse.status === "fail" || !cartResponse.data?._id) {
        router.push('/login');
        return;
      }

      const cartId = cartResponse.data._id;

      if (paymentMethod === 'card') {
        const query = new URLSearchParams({
          ...formData,
          cartId: cartId
        }).toString();
        router.push(`/payment?${query}`);
      } else {
        const response = await createCashOrder(cartId, { shippingAddress: formData }, token);
        if (response.status === "success") {
          clearCart();
          router.push('/payment/success');
        } else {
          throw new Error("تعذر إنشاء الطلب");
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      if (error.message?.includes('401')) {
        alert('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
        router.push('/login');
      } else {
        alert('حدث خطأ أثناء إتمام الطلب: ' + (error.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5a1832]"></div>
      </div>
    );
  }

  const hasDiscount = typeof cartTotalAfterDiscount === "number" && cartTotalAfterDiscount < cartTotal;
  const finalTotal = hasDiscount ? cartTotalAfterDiscount : cartTotal;
  const discountValue = hasDiscount ? (cartTotal - cartTotalAfterDiscount) : 0;

  return (
    <div className={styles.container}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[#5a1832] font-black hover:translate-x-[-4px] transition-all mb-4">
              <FaChevronLeft className="rotate-180" /> العودة للحقيبة
            </button>
            <h1 className="text-4xl font-black text-[#5a1832] tracking-tighter">إنهاء الطلب</h1>
            <p className="text-gray-500 font-medium mt-1">أدخل بيانات الشحن لإتمام عملية الشراء</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <div className={styles.glassCard + " p-8 md:p-12"}>
              <h2 className="text-2xl font-black text-[#5a1832] mb-8 flex items-center gap-3">
                <FaTruck className="text-[#D4AF37]" /> معلومات الشحن
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className={styles.inputGroup}>
                  <label className={styles.label}>تفاصيل العنوان بالتفصيل *</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      placeholder="اسم الشارع، رقم البناية، الشقة"
                      autoComplete="street-address"
                      enterKeyHint="next"
                      className={styles.inputField + " pl-12"}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>رقم الهاتف للتواصل *</label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="00968XXXXXXX"
                        inputMode="tel"
                        autoComplete="tel"
                        enterKeyHint="next"
                        className={styles.inputField + " pl-12"}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>المدينة / المنطقة *</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="مسقط"
                        autoComplete="address-level2"
                        enterKeyHint="next"
                        className={styles.inputField + " pl-12"}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>الرمز البريدي (اختياري)</label>
                  <div className="relative">
                    <FaPostageStamp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      enterKeyHint="done"
                      className={styles.inputField + " pl-12"}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-black text-[#5a1832] mb-6">اختر طريقة الدفع</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`${styles.methodCard} ${paymentMethod === 'card' ? styles.methodCardActive : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <FaCreditCard className={paymentMethod === 'card' ? 'text-[#5a1832]' : 'text-gray-400'} size={24} />
                      <div>
                        <p className="font-black text-sm text-gray-900">بطاقة بنكية</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">دفع إلكتروني آمن</p>
                      </div>
                    </div>
                    <div 
                      className={`${styles.methodCard} ${paymentMethod === 'cash' ? styles.methodCardActive : ''}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <FaMoneyBillWave className={paymentMethod === 'cash' ? 'text-[#5a1832]' : 'text-gray-400'} size={24} />
                      <div>
                        <p className="font-black text-sm text-gray-900">الدفع عند الاستلام</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">متوفر لبعض المناطق</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitButton}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>{paymentMethod === 'card' ? 'متابعة للدفع آمن' : 'تأكيد الطلب الآن'}</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <div className={styles.glassCard + " p-8"}>
              <h2 className="text-xl font-black text-[#5a1832] mb-8 border-b pb-4">ملخص حقيبتك</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100 hover:bg-white transition-all">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                      <Image
                        src={item.product.imageCover || '/placeholder.svg'}
                        alt={item.product.title}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-gray-900 text-sm truncate">{item.product.title}</h4>
                      <p className="text-xs text-gray-500 font-bold">الكمية: {item.count} × {item.price} ر.ع</p>
                    </div>
                    <div className="font-black text-[#5a1832] text-sm">
                      {item.price * item.count} ر.ع
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Coupon Section ─────────────────────────────── */}
              {appliedCoupon ? (
                /* Applied coupon badge */
                <div className="mb-6">
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                    <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">كوبون مفعّل</p>
                      <p className="font-black text-emerald-800 text-sm mt-0.5">
                        {appliedCoupon}
                        {couponDiscount !== null && (
                          <span className="mr-2 text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            خصم {couponDiscount}%
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-100 transition-colors"
                      aria-label="إزالة الكوبون"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Coupon entry form */
                <form onSubmit={handleApplyCoupon} className="mb-6">
                  <div className={`flex items-center gap-2 border rounded-2xl p-1.5 transition-colors ${couponError ? "border-red-300 bg-red-50/40" : "border-gray-200 bg-gray-50/70"}`}>
                    <div className="pl-2 flex-shrink-0">
                      <FaTag className={`text-sm ${couponError ? "text-red-400" : "text-gray-400"}`} />
                    </div>
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (couponError) setCouponError("");
                      }}
                      placeholder="أدخل كود الخصم"
                      maxLength={30}
                      autoCapitalize="characters"
                      autoComplete="off"
                      spellCheck={false}
                      className="flex-1 bg-transparent outline-none font-bold text-sm text-gray-700 placeholder:text-gray-400 placeholder:font-medium tracking-widest uppercase"
                      aria-label="كود الخصم"
                    />
                    <button
                      type="submit"
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 rounded-xl bg-[#5a1832] text-white text-xs font-black hover:bg-[#4a1429] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 min-w-[72px] justify-center"
                    >
                      {applyingCoupon ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : "تطبيق"}
                    </button>
                  </div>
                  {couponError && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <FaTimesCircle className="text-red-500 text-xs flex-shrink-0" />
                      <p className="text-xs font-bold text-red-600">{couponError}</p>
                    </div>
                  )}
                </form>
              )}

              <div className={styles.totalBox}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70 font-bold">المجموع الفرعي</span>
                  <span className="font-black text-white">{cartTotal} ر.ع</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70 font-bold">الشحن والتوصيل</span>
                  <span className="text-[#D4AF37] font-black">مجاني</span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70 font-bold">الخصم</span>
                    <span className="font-black text-emerald-200">- {discountValue} ر.ع</span>
                  </div>
                )}
                <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                  <span className="text-white font-black text-lg">الإجمالي النهائي</span>
                  <span className="text-[#D4AF37] font-black text-2xl">{finalTotal} ر.ع</span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <FaShieldAlt className="text-gray-400" />
                  <span className="text-[8px] font-black uppercase">ضمان الجودة</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <FaLock className="text-gray-400" />
                  <span className="text-[8px] font-black uppercase">دفع مشفر</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <FaTruck className="text-gray-400" />
                  <span className="text-[8px] font-black uppercase">توصيل سريع</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
