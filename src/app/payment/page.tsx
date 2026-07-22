"use client";

import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { addToCart, createCheckoutSession, getCart, createCashOrder } from "@/services/clientApi";
import { FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaTruck, FaLock, FaCheckCircle } from "react-icons/fa";
import Image from "next/image";
import styles from "./PaymentPage.module.css";

function PaymentPageContent() {
  const { cartItems, cartTotal, cartTotalAfterDiscount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { format } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("card");
  
  const [shippingAddress, setShippingAddress] = useState({
    details: "",
    phone: "",
    city: "",
    postalCode: "12345"
  });

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

  const handleProceed = async () => {
    if (selectedMethod === 'card') {
      const query = new URLSearchParams(shippingAddress).toString();
      router.push(`/payment/visa?${query}`);
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

      // Step 1: Get the real Cart ID from the server
      setError("جاري التحقق من السلة...");
      const cartResponse = await getCart(token);
      
      if (cartResponse.status === "fail" || !cartResponse.data?._id) {
        // If cart fetch fails with 401, redirect to login
        router.push('/login');
        return;
      }

      const cartId = cartResponse.data._id;
      
      if (selectedMethod === 'card') {
        const query = new URLSearchParams({
          ...shippingAddress,
          cartId: cartId
        }).toString();
        router.push(`/payment/visa?${query}`);
        return;
      }

      // Handle Cash on Delivery
      setError("جاري إتمام الطلب...");
      const response = await createCashOrder(cartId, { shippingAddress }, token);
      
      if (response.status === "success") {
        clearCart();
        router.push('/payment/success');
      } else {
        throw new Error("فشلت عملية الدفع");
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setError("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى");
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(error.message || "حدث خطأ أثناء معالجة الطلب");
      }
    } finally {
      setLoading(false);
    }
  };

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
              <FaArrowLeft /> العودة للحقيبة
            </button>
            <h1 className="text-4xl font-black text-[#5a1832] tracking-tighter">إتمام الطلب</h1>
            <p className="text-gray-500 font-medium mt-1">اختر وسيلة الدفع المناسبة لك</p>
          </div>
          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <FaLock />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تشفير آمن</p>
              <p className="text-sm font-black text-gray-800">حماية كاملة لبياناتك</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-8">
            {/* Payment Methods */}
            <div className={styles.glassCard + " p-8 md:p-10"}>
              <h2 className="text-2xl font-black text-[#5a1832] mb-8 flex items-center gap-3">
                <FaCreditCard className="text-[#D4AF37]" /> وسيلة الدفع
              </h2>
              
              <div className="space-y-4">
                <div 
                  className={`${styles.methodCard} ${selectedMethod === 'card' ? styles.methodCardActive : ''}`}
                  onClick={() => setSelectedMethod('card')}
                >
                  <div className={styles.methodIcon}>
                    <FaCreditCard />
                  </div>
                  <div className="flex-1">
                    <h3 className={styles.methodTitle}>بطاقة ائتمان / خصم (Visa / MasterCard)</h3>
                    <p className={styles.methodDesc}>دفع آمن وفوري عبر بطاقتك البنكية</p>
                  </div>
                  {selectedMethod === 'card' && <FaCheckCircle className="text-[#5a1832] text-xl" />}
                </div>

                <div 
                  className={`${styles.methodCard} ${selectedMethod === 'cod' ? styles.methodCardActive : ''}`}
                  onClick={() => setSelectedMethod('cod')}
                >
                  <div className={styles.methodIcon}>
                    <FaMoneyBillWave />
                  </div>
                  <div className="flex-1">
                    <h3 className={styles.methodTitle}>الدفع عند الاستلام</h3>
                    <p className={styles.methodDesc}>قم بالدفع نقداً عند وصول طلبك لباب منزلك</p>
                  </div>
                  {selectedMethod === 'cod' && <FaCheckCircle className="text-[#5a1832] text-xl" />}
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-xl text-red-700 font-bold text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleProceed}
                disabled={loading}
                className={styles.actionButton}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>متابعة للدفع <FaArrowLeft className="rotate-180" /></>
                )}
              </button>
            </div>

            {/* Shipping Info Card */}
            <div className={styles.glassCard + " p-8"}>
              <h2 className="text-xl font-black text-[#5a1832] mb-6 flex items-center gap-3">
                <FaTruck className="text-[#D4AF37]" /> تفاصيل الشحن
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">العنوان بالتفصيل</p>
                  <p className="font-bold text-gray-800">{shippingAddress.details || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">المدينة</p>
                  <p className="font-bold text-gray-800">{shippingAddress.city || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">رقم التواصل</p>
                  <p className="font-bold text-gray-800">{shippingAddress.phone || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">الرمز البريدي</p>
                  <p className="font-bold text-gray-800">{shippingAddress.postalCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5">
            <div className={styles.glassCard + " p-8 sticky top-8"}>
              <h2 className="text-xl font-black text-[#5a1832] mb-8 border-b pb-4">ملخص طلبك</h2>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                {cartItems.map((item) => {
                  const product = item.product || item.gift;
                  return (
                  <div key={item._id} className="flex gap-4 items-center bg-gray-50/30 p-3 rounded-2xl border border-gray-100 hover:bg-white transition-colors group">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
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
                    <div className="font-black text-[#5a1832] text-sm whitespace-nowrap">
                      {format(item.price * item.count)}
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div className={styles.summaryRow}>
                  <span className="text-gray-500 font-bold">المجموع الفرعي</span>
                  <span className="font-black text-gray-900">{format(cartTotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className="text-gray-500 font-bold">رسوم الشحن</span>
                  <span className="text-amber-600 font-black">مجاني</span>
                </div>
                {hasDiscount && (
                  <div className={styles.summaryRow}>
                    <span className="text-gray-500 font-bold">الخصم</span>
                    <span className="text-amber-600 font-black">- {format(discountValue as number)}</span>
                  </div>
                )}
                <div className={styles.totalBox}>
                  <span className="font-black text-lg">المبلغ الإجمالي</span>
                  <span className="text-[#D4AF37] font-black text-3xl">{format(finalTotal as number)}</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
                  <FaShieldAlt />
                  <span className="text-[10px] font-black uppercase tracking-widest">ضمان النسيج الذهبي</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium italic">نقوم بتغليف طلباتكم بأعلى معايير الجودة لضمان وصولها بسلام وفخامة.</p>
              </div>
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5a1832]"></div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
