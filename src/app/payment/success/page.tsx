"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { FaCheckCircle, FaShoppingBag, FaHistory, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import styles from "./PaymentSuccess.module.css";

function PaymentSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className="max-w-xl mx-auto px-4">
        <div className={styles.glassCard + " p-10 md:p-16 text-center relative overflow-hidden"}>
          {/* Success Decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4AF37] via-[#5a1832] to-[#D4AF37]"></div>
          
          {/* Success Icon */}
          <div className="relative mb-10 inline-block">
            <div className="absolute inset-0 animate-ping bg-[#D4AF37] rounded-full opacity-20"></div>
            <div className="relative w-24 h-24 bg-[#5a1832] rounded-full flex items-center justify-center text-[#D4AF37] shadow-2xl">
              <FaCheckCircle size={48} />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-black text-[#5a1832] mb-4 tracking-tighter">شكراً لطلبك!</h1>
          <p className="text-gray-600 font-medium mb-10 leading-relaxed">
            تم استلام طلبك بنجاح وجاري تجهيزه بكل عناية وحب. نتطلع لوصول منتجاتنا إليك لتضفي لمسة من الأناقة العمانية على مظهرك.
          </p>

          {/* Order ID Card */}
          {orderId && (
            <div className="bg-[#5a1832]/[0.03] border border-[#5a1832]/10 rounded-3xl p-6 mb-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">رقم الطلب الخاص بك</p>
              <p className="font-black text-2xl text-[#5a1832] tracking-widest">{orderId}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/products')}
              className="flex items-center justify-center gap-3 bg-[#5a1832] text-white py-4 px-6 rounded-2xl font-black hover:bg-[#D4AF37] hover:text-[#5a1832] transition-all transform hover:-translate-y-1 shadow-lg"
            >
              <FaShoppingBag /> استمر بالتسوق
            </button>
            <button
              onClick={() => router.push('/orders')}
              className="flex items-center justify-center gap-3 bg-white text-[#5a1832] border-2 border-[#5a1832]/10 py-4 px-6 rounded-2xl font-black hover:bg-gray-50 transition-all transform hover:-translate-y-1"
            >
              <FaHistory /> تتبع طلباتي
            </button>
          </div>

          {/* Support Section */}
          <div className="mt-12 pt-10 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-bold mb-4">هل لديك أي استفسار؟ تواصل معنا مباشرة</p>
            <div className="flex justify-center gap-4">
              <a href="mailto:support@alnaseej.com" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-[#5a1832] hover:text-white transition-all">
                <FaEnvelope size={20} />
              </a>
              <a href="https://wa.me/00968" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white transition-all">
                <FaWhatsapp size={22} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5a1832]"></div>
      </div>
    }>
      <PaymentSuccessPageContent />
    </Suspense>
  );
}
