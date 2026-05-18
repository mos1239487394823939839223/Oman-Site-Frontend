"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaCopy,
  FaCreditCard,
  FaHashtag,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPrint,
  FaSyncAlt,
  FaTag,
  FaTimes,
  FaTimesCircle,
  FaTruck,
  FaUser,
  FaClock,
} from "react-icons/fa";

interface Order {
  _id: string;
  user?: { name: string; email: string };
  totalOrderPrice: number;
  orderStatus: string;
  createdAt: string;
  paymentMethod?: string;
  deliveryMethod?: string;
  shippingAddress?: {
    details?: string;
    city?: string;
    phone?: string;
    name?: string;
  };
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  order: Order | null;
  isLoading?: boolean;
  onClose: () => void;
  onPrint: () => void;
  onUpdateStatus: () => void;
}

const statusConfig: Record<string, { label: string; classes: string; dot: string; icon: React.ReactNode }> = {
  delivered: {
    label: "تم التسليم",
    classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    icon: <FaCheckCircle className="text-xs" />,
  },
  completed: {
    label: "مكتمل",
    classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    icon: <FaCheckCircle className="text-xs" />,
  },
  pending: {
    label: "قيد الانتظار",
    classes: "bg-amber-50 text-amber-900 border-amber-200",
    dot: "bg-amber-500",
    icon: <FaClock className="text-xs" />,
  },
  confirmed: {
    label: "مؤكد",
    classes: "bg-[#5C2E3A]/10 text-[#5C2E3A] border-[#5C2E3A]/20",
    dot: "bg-[#5C2E3A]",
    icon: <FaCheckCircle className="text-xs" />,
  },
  processing: {
    label: "جاري التجهيز",
    classes: "bg-sky-50 text-sky-800 border-sky-200",
    dot: "bg-sky-500",
    icon: <FaClock className="text-xs" />,
  },
  shipped: {
    label: "تم الشحن",
    classes: "bg-indigo-50 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
    icon: <FaTruck className="text-xs" />,
  },
  cancelled: {
    label: "ملغي",
    classes: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
    icon: <FaTimesCircle className="text-xs" />,
  },
};

export default function OrderDetailsModal({
  isOpen,
  order,
  isLoading = false,
  onClose,
  onPrint,
  onUpdateStatus,
}: OrderDetailsModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }

    setIsVisible(false);
    const timer = setTimeout(() => setShouldRender(false), 220);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

  const status = useMemo(() => {
    const key = order?.orderStatus?.toLowerCase() || "";
    return statusConfig[key] || {
      label: order?.orderStatus || "-",
      classes: "bg-gray-100 text-gray-700 border-gray-200",
      dot: "bg-gray-400",
      icon: <FaClock className="text-xs" />,
    };
  }, [order]);

  const detailValues = useMemo(() => {
    if (!order) return null;

    const delivery = order.deliveryMethod === "pickup" ? "استلام من المصنع" : "توصيل للمنزل";
    const address = order.deliveryMethod === "pickup"
      ? `${order.shippingAddress?.name || "-"} • ${order.shippingAddress?.phone || "-"}`
      : `${order.shippingAddress?.city || "-"} • ${order.shippingAddress?.details || "-"}`;
    const paymentMethod = order.paymentMethod === "card" || order.paymentMethod === "online"
      ? "بطاقة بنكية"
      : "عند الاستلام";

    return {
      orderNumber: `#${order._id.slice(-8).toUpperCase()}`,
      customerName: order.user?.name || "عميل",
      totalPrice: `${order.totalOrderPrice?.toFixed(3)} ر.ع`,
      status: status.label,
      deliveryMethod: delivery,
      address,
      date: new Date(order.createdAt).toLocaleString("ar-OM"),
      paymentMethod,
    };
  }, [order, status.label]);

  const handleCopy = async () => {
    if (!order?._id) return;

    try {
      await navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center px-4 py-8 transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        aria-label="Close modal"
        className={`absolute inset-0 w-full h-full bg-[#0f1623]/70 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        aria-describedby="order-modal-desc"
        className={`relative w-full max-w-3xl overflow-hidden rounded-[22px] border border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_30px_80px_rgba(10,15,25,0.35)] transition-all duration-300 ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        dir="rtl"
      >
        <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-white/60 bg-gradient-to-l from-white/40 via-white/70 to-[#f7f0e7]/70">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-black tracking-[0.35em] text-[#5C2E3A]/70">تفاصيل الطلب</p>
              <h3 id="order-modal-title" className="text-2xl font-black text-[#1F2937] mt-1">
                نافذة تفاصيل الطلب
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border ${status.classes}`}
              >
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                {status.icon}
                {status.label}
              </span>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-white/60 bg-white/70 text-[#5C2E3A] hover:text-[#4A2330] hover:bg-white transition-all"
                aria-label="Close"
              >
                <FaTimes className="mx-auto" />
              </button>
            </div>
          </div>
          <p id="order-modal-desc" className="sr-only">
            نافذة تعرض تفاصيل الطلب بشكل منظم.
          </p>
        </div>

        <div className="px-6 sm:px-8 py-6 max-h-[70vh] overflow-y-auto">
          {isLoading || !detailValues ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-1/2 rounded-full bg-gray-200" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="h-20 rounded-2xl bg-gray-200" />
                ))}
              </div>
              <div className="h-12 rounded-2xl bg-gray-200" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#5C2E3A]/10 bg-white/70 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#5C2E3A]/10 text-[#5C2E3A] flex items-center justify-center">
                    <FaHashtag />
                  </span>
                  <div>
                    <p className="text-[11px] text-gray-500 font-bold">رقم الطلب</p>
                    <p className="text-lg font-black text-[#1F2937] tracking-wide">
                      {detailValues.orderNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#5C2E3A]/20 text-[#5C2E3A] text-xs font-bold hover:bg-[#5C2E3A]/10 transition-all"
                >
                  <FaCopy className="text-[11px]" />
                  {copied ? "تم النسخ" : "نسخ رقم الطلب"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailCard label="اسم العميل" value={detailValues.customerName} icon={<FaUser />} />
                <DetailCard label="المبلغ الإجمالي" value={detailValues.totalPrice} icon={<FaMoneyBillWave />} />
                <DetailCard label="الحالة" value={detailValues.status} icon={<FaTag />} />
                <DetailCard label="طريقة الاستلام" value={detailValues.deliveryMethod} icon={<FaTruck />} />
                <DetailCard label="العنوان" value={detailValues.address} icon={<FaMapMarkerAlt />} />
                <DetailCard label="التاريخ" value={detailValues.date} icon={<FaCalendarAlt />} />
                <DetailCard label="طريقة الدفع" value={detailValues.paymentMethod} icon={<FaCreditCard />} />
                <DetailCard label="رقم الطلب الكامل" value={order?._id || "-"} icon={<FaHashtag />} isMono />
              </div>

              <div className="border-t border-dashed border-[#5C2E3A]/15 pt-4">
                <div className="rounded-2xl bg-gradient-to-l from-white/80 via-white/60 to-[#f7f0e7]/80 border border-white/60 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#B8902F] flex items-center justify-center">
                      <FaTag />
                    </span>
                    <div>
                      <p className="text-[11px] text-gray-500 font-bold">ملاحظات الطلب</p>
                      <p className="text-sm font-semibold text-[#1F2937]">
                        لا توجد ملاحظات إضافية لهذا الطلب.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 py-5 border-t border-white/60 bg-white/70">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#5C2E3A]/20 text-[#5C2E3A] font-bold text-sm hover:bg-[#5C2E3A]/10 transition-all"
            >
              إغلاق
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={onPrint}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#D4AF37] text-[#2C2C2C] font-bold text-sm hover:bg-[#E8C547] transition-all flex items-center justify-center gap-2"
              >
                <FaPrint className="text-sm" />
                طباعة الفاتورة
              </button>
              <button
                onClick={onUpdateStatus}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#5C2E3A] text-white font-bold text-sm hover:bg-[#4A2330] transition-all flex items-center justify-center gap-2"
              >
                <FaSyncAlt className="text-sm" />
                تحديث الحالة
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailCard({
  label,
  value,
  icon,
  isMono = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  isMono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-4 shadow-[0_6px_20px_rgba(15,22,35,0.08)]">
      <div className="flex flex-row-reverse items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-[#5C2E3A]/10 text-[#B8902F] flex items-center justify-center">
          {icon}
        </span>
        <div className="flex-1 text-right">
          <p className="text-[11px] text-gray-500 font-bold mb-1">{label}</p>
          <p className={`text-sm sm:text-base font-black text-[#1F2937] ${isMono ? "font-mono" : ""}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
