"use client";

import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { addToCart, createMockVisaOrder, getCart } from "@/services/clientApi";
import { FaLock, FaShieldAlt, FaArrowLeft, FaCreditCard, FaUser, FaCalendarAlt, FaKey, FaTag, FaCheckCircle, FaTimes, FaTimesCircle } from "react-icons/fa";
import Image from "next/image";
import styles from "./VisaPaymentPage.module.css";

function VisaPaymentPageContent() {
  const { cartItems, cartTotal, cartTotalAfterDiscount, appliedCoupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const hasDiscount = typeof cartTotalAfterDiscount === "number" && cartTotalAfterDiscount < cartTotal;
  const finalTotal = hasDiscount ? (cartTotalAfterDiscount as number) : cartTotal;
  const discountValue = hasDiscount ? (cartTotal - (cartTotalAfterDiscount as number)) : 0;

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
    } catch (err: any) {
      const msg: string = err?.message || "";
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

  const fillDemoData = () => {
    setCardDetails({
      cardNumber: "4111 1111 1111 1111",
      expiryMonth: "12",
      expiryYear: "25",
      cvv: "123",
      cardholderName: "GUEST USER"
    });
  };

  useEffect(() => {
    const details = searchParams.get('details') || "";
    const phone = searchParams.get('phone') || "";
    const city = searchParams.get('city') || "";
    const postalCode = searchParams.get('postalCode') || "12345";

    setShippingAddress({ details, phone, city, postalCode });
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isAuthenticated || !token) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    if (value.length <= 19) {
      setCardDetails(prev => ({ ...prev, cardNumber: value }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4);
    
    if (value.length >= 2) {
      setCardDetails(prev => ({ 
        ...prev, 
        expiryMonth: value.substring(0, 2),
        expiryYear: value.substring(2, 4)
      }));
    } else {
      setCardDetails(prev => ({ ...prev, expiryMonth: value, expiryYear: "" }));
    }
  };

  const handlePayment = async () => {
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 16) {
      setError("يرجى إدخال رقم بطاقة صحيح");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Step 1: Ensure we have the real Cart ID
      let cartId = searchParams.get('cartId');
      
      if (!cartId || cartId === 'current_cart') {
        setError("جاري التحقق من السلة...");
        const cartResponse = await getCart(token);
        if (cartResponse.data?._id) {
          cartId = cartResponse.data._id;
        } else {
          router.push('/login');
          return;
        }
      }

      setError("جاري معالجة الدفع...");
      const response = await createMockVisaOrder(cartId as string, {
        shippingAddress,
        cardDetails: { ...cardDetails, cardNumber: cardDetails.cardNumber.replace(/\s/g, '') }
      }, token);
      
      if (response.status === "success") {
        setSuccess(true);
        setOrderId(response.data.orderId);
        clearCart();
        setTimeout(() => {
          router.push(`/payment/success?orderId=${response.data.orderId}`);
        }, 2000);
      } else {
        throw new Error("فشلت عملية الدفع");
      }
    } catch (error: any) {
      console.error('Visa Payment Error:', error);
      if (error.message?.includes('401')) {
        setError("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى");
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(error.message || "حدث خطأ أثناء الدفع");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.paymentContainer + " flex items-center justify-center"}>
        <div className={styles.glassCard + " p-12 text-center max-w-md w-full"}>
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShieldAlt size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 text-[#5a1832]">تم الدفع بنجاح!</h2>
          <p className="text-gray-600 mb-6 font-medium">جاري توجيهك لصفحة تفاصيل الطلب...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5a1832] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.paymentContainer}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#5a1832] font-black hover:translate-x-[-4px] transition-transform">
            <FaArrowLeft /> العودة للحقيبة
          </button>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm">
            <FaLock className="text-amber-600 text-xs" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">دفع آمن ومشفّر 256-bit</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Payment Form */}
          <div className="lg:col-span-7">
            <div className={styles.glassCard + " p-8 md:p-12"}>
              <h1 className="text-3xl font-black text-[#5a1832] mb-8">تفاصيل الدفع</h1>
              
              {/* Card Preview */}
              <div className={styles.visaCardPreview}>
                <div className="flex justify-between items-start mb-8">
                  <div className={styles.chip}></div>
                  <div className="text-2xl font-black italic opacity-80">VISA</div>
                </div>
                <div className={styles.cardNumberDisplay}>
                  {cardDetails.cardNumber || "**** **** **** ****"}
                </div>
                <div className={styles.cardInfoRow}>
                  <div>
                    <div className={styles.cardLabel}>صاحب البطاقة</div>
                    <div className={styles.cardValue}>{cardDetails.cardholderName || "NAME SURNAME"}</div>
                  </div>
                  <div>
                    <div className={styles.cardLabel}>الصلاحية</div>
                    <div className={styles.cardValue}>
                      {cardDetails.expiryMonth || "MM"}/{cardDetails.expiryYear || "YY"}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-xl text-red-700 font-bold text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-6">
                <div className={styles.inputGroup}>
                  <label className="block text-xs font-black text-[#5a1832] uppercase tracking-widest mb-3 px-1">رقم البطاقة</label>
                  <div className="relative">
                    <FaCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="0000 0000 0000 0000"
                      className={styles.inputField + " pl-12"}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className="block text-xs font-black text-[#5a1832] uppercase tracking-widest mb-3 px-1">اسم صاحب البطاقة</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={cardDetails.cardholderName}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value.toUpperCase() }))}
                      placeholder="NAME ON CARD"
                      className={styles.inputField + " pl-12"}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className={styles.inputGroup}>
                    <label className="block text-xs font-black text-[#5a1832] uppercase tracking-widest mb-3 px-1">تاريخ الانتهاء</label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={cardDetails.expiryMonth ? `${cardDetails.expiryMonth}${cardDetails.expiryYear}` : ""}
                        onChange={handleExpiryChange}
                        className={styles.inputField + " pl-12"}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className="block text-xs font-black text-[#5a1832] uppercase tracking-widest mb-3 px-1">رمز التحقق (CVV)</label>
                    <div className="relative">
                      <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        maxLength={3}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                        placeholder="***"
                        className={styles.inputField + " pl-12"}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.payButton}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>أتمم الدفع بقيمة {finalTotal}</>
                  )}
                </button>

                <button type="button" onClick={fillDemoData} className="w-full text-center text-[10px] font-black text-gray-400 hover:text-[#5a1832] transition-colors uppercase tracking-[0.2em]">تعبئة بيانات تجريبية</button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className={styles.glassCard + " p-8"}>
              <h2 className="text-xl font-black text-[#5a1832] mb-6 border-b pb-4">ملخص الطلب</h2>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => {
                  const product = item.product || item.gift;
                  return (
                  <div key={item._id} className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                      <Image
                        src={product?.imageCover || '/placeholder.svg'}
                        alt={product?.title || ''}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-gray-900 text-sm truncate">{product?.title}</h4>
                      <p className="text-xs text-gray-500">الكمية: {item.count}</p>
                    </div>
                    <div className="font-black text-[#5a1832] text-sm">
                      {item.price * item.count}
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Coupon Section */}
              {appliedCoupon ? (
                <div className="mt-4">
                  <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                    <FaCheckCircle className="text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-amber-700 uppercase tracking-widest">كوبون مفعّل</p>
                      <p className="font-black text-amber-800 text-sm mt-0.5">
                        {appliedCoupon}
                        {couponDiscount !== null && (
                          <span className="mr-2 text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            خصم {couponDiscount}%
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-100 transition-colors"
                      aria-label="إزالة الكوبون"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="mt-4">
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

              <div className={styles.totalSection}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 font-bold">المجموع الفرعي</span>
                  <span className="font-black text-gray-900">{cartTotal}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 font-bold">الشحن</span>
                  <span className="text-amber-600 font-black">مجاني</span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 font-bold">الخصم</span>
                    <span className="font-black text-amber-600">- {discountValue}</span>
                  </div>
                )}
                <div className="flex justify-between items-center bg-[#5a1832] p-4 rounded-2xl mt-2">
                  <span className="text-white font-black text-lg">الإجمالي الكلي</span>
                  <span className="text-[#D4AF37] font-black text-2xl">{finalTotal}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-sm border border-white/60 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                <FaShieldAlt className="text-[#D4AF37] text-xl" />
              </div>
              <div>
                <h5 className="font-black text-[#5a1832] text-sm mb-1">تسوق بآمان</h5>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">بياناتك محمية ومشفرة بالكامل لضمان سرية معلوماتك الشخصية والبنكية.</p>
              </div>
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5a1832]"></div>
      </div>
    }>
      <VisaPaymentPageContent />
    </Suspense>
  );
}
