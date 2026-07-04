"use client";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaTrashAlt, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart, FaCity, FaPhoneAlt, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaTruck, FaBoxOpen, FaGift, FaShieldAlt, FaCheck, FaCheckCircle, FaHome } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { createCashOrder, createCheckoutSession, getCart } from "@/services/clientApi";
import { useLanguage } from "@/components/LanguageProvider";
import { resolveMediaUrl } from "@/lib/media";

type Step = 'cart' | 'checkout' | 'success';

export default function CartPage() {
  const { cartItems, cartTotal, cartTotalAfterDiscount, appliedCoupon, applyCoupon, removeCoupon, updateCartItem, removeFromCart, clearCart, loading, refreshCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { dir, isArabic } = useLanguage();

  const [step, setStep] = useState<Step>('cart');
  const [savedTotal, setSavedTotal] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({ details: "", phone: "", city: "", postalCode: "", name: "", country: "Oman" });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('cash');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [needsWrapping, setNeedsWrapping] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [orderRef] = useState(`OMN-${Date.now().toString().slice(-6)}`);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Re-fetch the cart from the server on mount so items always show fully
  // populated data (incl. product images). The add-to-cart response returns
  // un-populated products, so without this a soft-navigation to the cart shows
  // blank images until a hard reload.
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const shippingFee = deliveryMethod === 'delivery' ? 2 : 0;
  const wrappingFee = needsWrapping ? 5 : 0;
  // Use the coupon-discounted subtotal when a coupon is applied.
  const hasCoupon = typeof cartTotalAfterDiscount === 'number' && cartTotalAfterDiscount < cartTotal;
  const effectiveSubtotal = hasCoupon ? (cartTotalAfterDiscount as number) : cartTotal;
  const couponSavings = hasCoupon ? cartTotal - (cartTotalAfterDiscount as number) : 0;
  const taxAmount = effectiveSubtotal * 0.05;
  const finalTotal = effectiveSubtotal + shippingFee + taxAmount + wrappingFee;

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError(isArabic ? 'يرجى إدخال كود الخصم' : 'Please enter a coupon code'); return; }
    if (code === appliedCoupon) { setCouponError(isArabic ? 'هذا الكوبون مُطبَّق بالفعل' : 'This coupon is already applied'); return; }
    setApplyingCoupon(true);
    setCouponError("");
    try {
      await applyCoupon(code);
      setCouponInput("");
    } catch (error: any) {
      const msg: string = error?.message || "";
      if (/expired/i.test(msg) || /انتهت/i.test(msg)) {
        setCouponError(isArabic ? 'هذا الكوبون منتهي الصلاحية' : 'This coupon has expired');
      } else if (/not found|invalid/i.test(msg)) {
        setCouponError(isArabic ? 'كود الخصم غير صحيح أو غير موجود' : 'Invalid or unknown coupon code');
      } else {
        setCouponError(msg || (isArabic ? 'تعذر تطبيق الكوبون' : 'Could not apply coupon'));
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput("");
    setCouponError("");
  };

  const handleUpdateQuantity = async (id: string, qty: number) => {
    if (qty <= 0) return;
    try { await updateCartItem(id, qty); } catch {}
  };
  const handleRemove = async (id: string) => { try { await removeFromCart(id); } catch {} };
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleConfirmOrder = async () => {
    if (!isAuthenticated) { alert(t('cart.loginRequired')); router.push('/login'); return; }
    if (deliveryMethod === 'delivery' && (!shippingAddress.city || !shippingAddress.phone || !shippingAddress.details)) {
      alert(t('cart.shippingAndPayment')); return;
    }
    if (deliveryMethod === 'pickup' && (!shippingAddress.name || !shippingAddress.phone)) {
      alert(t('cart.shippingAndPayment')); return;
    }
    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }

      // Resolve the server-side cart id
      let cartId: string | undefined;
      try { cartId = (await getCart(token)).data?._id; } catch {}
      if (!cartId) {
        throw new Error(isArabic ? 'تعذّر الوصول إلى سلتك، حدّث الصفحة وحاول مجدداً' : 'Could not access your cart. Please refresh and try again.');
      }

      if (paymentMethod === 'cash') {
        await createCashOrder(cartId, { shippingAddress }, token);
        setSavedTotal(finalTotal);
        await clearCart();
        setStep('success');
        return;
      }

      // Card payment → redirect to the Stripe-hosted checkout session
      const session = await createCheckoutSession(cartId, token);
      const url = session?.session?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      throw new Error(isArabic ? 'تعذّر بدء جلسة الدفع الإلكتروني' : 'Could not start the online payment session.');
    } catch (e: any) {
      alert(e.message || t('common.retry'));
    } finally { setCheckoutLoading(false); }
  };


  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F5]">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-[#5C2E3A]/20 border-t-[#5C2E3A] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#5C2E3A] font-bold">{t('common.loading')}</p>
      </div>
    </div>
  );

  // ── SUCCESS SCREEN ──────────────────────────────────────────────
  if (step === 'success') return (
    <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center px-4" dir={dir}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-amber-500 text-5xl" />
        </div>
        <h2 className="text-2xl font-black text-[#1F2937] mb-2">{t('cart.orderConfirmed')}</h2>
        <p className="text-gray-500 mb-2">{t('home.heroSubtitle')}</p>
        <div className="bg-[#5C2E3A]/5 rounded-2xl px-6 py-4 mb-8">
          <p className="text-xs text-gray-400 mb-1">{t('cart.orderRef')}</p>
          <p className="text-xl font-black text-[#5C2E3A]">{orderRef}</p>
          <p className="text-sm text-gray-500 mt-2">{t('cart.total')}: <span className="font-black text-[#D4AF37]">{savedTotal.toFixed(3)} {t('common.egp')}</span></p>
        </div>
        <div className="space-y-3">
          <button onClick={() => router.push('/products')} className="w-full h-12 bg-[#5C2E3A] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4A2330] transition-all">
            <FaHome /> {t('home.browseAllProducts')}
          </button>
          <button onClick={() => router.push('/')} className="w-full h-12 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all">
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );

  // ── EMPTY CART ──────────────────────────────────────────────────
  if (step === 'cart' && cartItems.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F5] px-4" dir={dir}>
      <div className="max-w-md text-center py-20">
        <div className="w-28 h-28 bg-gradient-to-br from-[#5C2E3A]/10 to-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <FaShoppingCart className="text-[#5C2E3A] text-5xl" />
        </div>
        <h2 className="text-3xl font-black text-[#1F2937] mb-3">{t('cart.emptyTitle')}</h2>
        <p className="text-gray-500 mb-10 leading-loose">{t('cart.emptyDescription')}</p>
        <button onClick={() => router.push('/products')} className="inline-flex items-center gap-3 bg-[#5C2E3A] text-white font-bold h-14 px-10 rounded-2xl hover:bg-[#4A2330] transition-all shadow-lg">
          <FaArrowLeft /> {t('cart.startShopping')}
        </button>
      </div>
    </div>
  );

  const sel = (active: boolean) => `flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${active ? 'border-[#5C2E3A] bg-[#5C2E3A]/15 shadow-md' : 'border-gray-200 bg-gray-50 hover:border-[#5C2E3A]/40 hover:bg-white'}`;
  const iconBox = (active: boolean) => `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-[#5C2E3A] text-white shadow-md' : 'bg-gray-200 text-gray-600'}`;
  const inputCls = "h-14 w-full rounded-xl border border-gray-200 bg-white px-4 font-medium text-[#1F2937] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all placeholder:text-gray-400";

  const steps = ['cart', 'checkout', 'success'];
  const currentIdx = steps.indexOf(step);
  const stepLabels = [t('cart.title'), t('cart.shippingAndPayment'), t('cart.orderConfirmed')];

  return (
    <div className="min-h-screen bg-[#F8F7F5] pb-20" dir={dir}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => step === 'checkout' ? setStep('cart') : router.back()} className="flex items-center gap-2 text-[#5C2E3A] font-bold hover:opacity-70 transition-opacity text-sm">
            <FaArrowLeft /><span>{t('common.back')}</span>
          </button>
          <h1 className="text-lg font-black text-[#1F2937]">{step === 'cart' ? t('cart.title') : t('cart.checkout')}</h1>
          <div className="flex items-center gap-2 bg-[#5C2E3A]/10 text-[#5C2E3A] rounded-full px-3 py-1">
            <FaShoppingCart className="text-xs" /><span className="text-xs font-black">{cartItems.length}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-0 max-w-xs mx-auto">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${i <= currentIdx ? 'bg-[#5C2E3A] border-[#5C2E3A] text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'}`}>
                    {i < currentIdx ? <FaCheck className="text-xs" /> : i + 1}
                  </div>
                  <span className={`mt-1 text-[10px] font-bold ${i <= currentIdx ? 'text-[#5C2E3A]' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`w-12 h-0.5 mx-1 mb-4 ${i < currentIdx ? 'bg-[#5C2E3A]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-5">

        {/* ── STEP: CART ── */}
        {step === 'cart' && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#5C2E3A] text-white flex items-center justify-center text-xs font-black">01</div>
                <h2 className="text-lg font-black text-[#1F2937]">{t('cart.title')}</h2>
              </div>
              <button onClick={() => { if (confirm(t('cart.clearCart') + '?')) clearCart(); }} className="text-xs font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <FaTrashAlt size={10} /> {t('cart.clearCart')}
              </button>
            </div>

            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item._id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                    <img src={resolveMediaUrl((item.product as any).imageCover || (item.product as any).image, (item as any).gift ? "gifts" : "products")} alt={(item.product as any).title || (item.product as any).name} className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[#1F2937] truncate">{(item.product as any).title || (item.product as any).name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{(item.product as any).description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border border-gray-200">
                        <button onClick={() => handleUpdateQuantity(item._id, item.count - 1)} disabled={item.count <= 1} className="w-11 h-11 rounded-lg bg-white shadow flex items-center justify-center text-gray-600 hover:text-[#5C2E3A] disabled:opacity-40 transition-colors"><FaMinus size={10} /></button>
                        <span className="w-10 text-center font-black text-sm">{item.count}</span>
                        <button onClick={() => handleUpdateQuantity(item._id, item.count + 1)} className="w-11 h-11 rounded-lg bg-white shadow flex items-center justify-center text-gray-600 hover:text-[#5C2E3A] transition-colors"><FaPlus size={10} /></button>
                      </div>
                      {(() => {
                        // A product-/category-scoped coupon lowers this line's unit
                        // price below the product's own price. Show the original
                        // struck-through when the server has discounted the line.
                        const p: any = item.product || {};
                        const origUnit = p.priceAfterDiscount || p.price || 0;
                        const lineDiscounted = origUnit > 0 && item.price < origUnit;
                        return (
                          <span className="flex items-center gap-2">
                            {lineDiscounted && (
                              <span className="text-gray-400 text-[11px] line-through font-medium">{origUnit.toLocaleString()}</span>
                            )}
                            <span className="font-black text-[#5C2E3A]">{item.price.toLocaleString()}</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <button onClick={() => handleRemove(item._id)} className="w-11 h-11 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center shrink-0 transition-colors"><FaTrashAlt size={14} /></button>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <p className="text-sm font-black text-[#5C2E3A] mb-3 flex items-center gap-2">
                <FaGift size={13} /> {isArabic ? 'كود الخصم' : 'Discount code'}
              </p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <span className="flex items-center gap-2 font-black text-amber-700">
                    <FaCheckCircle /> {appliedCoupon}
                  </span>
                  <button type="button" onClick={handleRemoveCoupon} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                    {isArabic ? 'إزالة' : 'Remove'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                    placeholder={isArabic ? 'أدخل كود الخصم' : 'Enter coupon code'}
                    className="flex-1 h-12 rounded-xl border border-gray-200 bg-white px-4 font-bold text-[#1F2937] uppercase focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all placeholder:normal-case placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="h-12 px-5 bg-[#5C2E3A] text-white rounded-xl font-black text-sm hover:bg-[#4A2330] transition-all disabled:opacity-50 shrink-0"
                  >
                    {applyingCoupon ? (isArabic ? '...' : '...') : (isArabic ? 'تطبيق' : 'Apply')}
                  </button>
                </form>
              )}
              {couponError && <p className="text-xs font-bold text-red-500 mt-2">{couponError}</p>}
            </div>

            {/* Mini summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{t('cart.total')} ({cartItems.length})</span>
                <span className="font-bold">{cartTotal.toLocaleString()} {t('common.egp')}</span>
              </div>
              {hasCoupon && (
                <>
                  <div className="flex justify-between text-sm text-amber-600 mb-2">
                    <span>{isArabic ? 'خصم الكوبون' : 'Coupon discount'}</span>
                    <span className="font-bold">- {couponSavings.toLocaleString()} {t('common.egp')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#5C2E3A] border-t border-gray-100 pt-2 mb-2">
                    <span className="font-black">{isArabic ? 'الإجمالي بعد الخصم' : 'Total after discount'}</span>
                    <span className="font-black">{effectiveSubtotal.toLocaleString()} {t('common.egp')}</span>
                  </div>
                </>
              )}
              <button onClick={() => setStep('checkout')} className="w-full h-13 mt-3 bg-[#5C2E3A] text-white rounded-xl font-black text-base flex items-center justify-center gap-3 hover:bg-[#4A2330] transition-all shadow-lg py-3.5">
                {t('cart.checkout')} ←
              </button>
            </div>
          </>
        )}

        {/* ── STEP: CHECKOUT ── */}
        {step === 'checkout' && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 space-y-7">

                {/* 1. Delivery */}
                <div className="space-y-3">
                  <p className="text-sm font-black text-[#5C2E3A] uppercase tracking-widest mb-1">{t('cart.deliveryMethodTitle')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div onClick={() => setDeliveryMethod('delivery')} className={sel(deliveryMethod === 'delivery')}>
                      <div className={iconBox(deliveryMethod === 'delivery')}><FaTruck size={16} /></div>
                      <div><p className="font-black text-base">{t('cart.deliveryOptionDelivery')}</p><p className="text-sm text-[#D4AF37] font-bold">{shippingFee} {t('common.egp')}</p></div>
                    </div>
                    <div onClick={() => setDeliveryMethod('pickup')} className={sel(deliveryMethod === 'pickup')}>
                      <div className={iconBox(deliveryMethod === 'pickup')}><FaBoxOpen size={16} /></div>
                      <div><p className="font-black text-base">{t('cart.deliveryOptionPickup')}</p><p className="text-sm text-amber-500 font-bold">{t('cart.free')}</p></div>
                    </div>
                  </div>
                </div>

                {/* 2. Address */}
                {deliveryMethod === 'delivery' && (
                  <div className="space-y-3">
                    <p className="text-sm font-black text-[#5C2E3A] uppercase tracking-widest mb-1">{t('cart.deliveryInfoTitle')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <FaCity className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 pointer-events-none" size={14} />
                        <input type="text" name="city" value={shippingAddress.city} onChange={handleInput} autoComplete="address-level2" enterKeyHint="next" className={inputCls + " pl-11"} placeholder={t('cart.cityPlaceholder')} />
                      </div>
                      <div className="relative">
                        <FaPhoneAlt className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 pointer-events-none" size={14} />
                        <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleInput} inputMode="tel" autoComplete="tel" enterKeyHint="next" className={inputCls + " pl-11"} placeholder={t('cart.phonePlaceholder')} />
                      </div>
                      <div className="relative sm:col-span-2">
                        <FaMapMarkerAlt className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 pointer-events-none" size={14} />
                        <input type="text" name="details" value={shippingAddress.details} onChange={handleInput} autoComplete="street-address" enterKeyHint="next" className={inputCls + " pl-11"} placeholder={t('cart.addressPlaceholder')} />
                      </div>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 pointer-events-none" size={14} />
                        <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleInput} inputMode="numeric" autoComplete="postal-code" enterKeyHint="next" className={inputCls + " pl-11"} placeholder={isArabic ? 'الرمز البريدي (اختياري)' : 'Postal code (optional)'} />
                      </div>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 pointer-events-none" size={14} />
                        <input type="text" name="country" value={shippingAddress.country} onChange={handleInput} autoComplete="country-name" enterKeyHint="done" className={inputCls + " pl-11"} placeholder={isArabic ? 'الدولة' : 'Country'} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2b. Pickup Contact Info */}
                {deliveryMethod === 'pickup' && (
                  <div className="space-y-3">
                    <p className="text-sm font-black text-[#5C2E3A] uppercase tracking-widest mb-1">{t('cart.pickupContactInfoTitle')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <svg className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z"/></svg>
                        <input type="text" name="name" value={shippingAddress.name} onChange={handleInput} autoComplete="name" enterKeyHint="next" className={inputCls + " pl-11"} placeholder={t('cart.namePlaceholder')} />
                      </div>
                      <div className="relative">
                        <FaPhoneAlt className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 pointer-events-none" size={14} />
                        <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleInput} inputMode="tel" autoComplete="tel" enterKeyHint="next" className={inputCls + " pl-11"} placeholder={t('cart.phonePlaceholder')} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Wrapping */}
                <div className="space-y-3">
                  <p className="text-sm font-black text-[#5C2E3A] uppercase tracking-widest mb-1">{t('cart.additionalOptionsTitle')}</p>
                  <div onClick={() => setNeedsWrapping(!needsWrapping)} className={sel(needsWrapping) + (needsWrapping ? ' !border-[#D4AF37] !bg-[#D4AF37]/5' : '')}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${needsWrapping ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-400'}`}><FaGift size={16} /></div>
                    <div className="flex-1"><p className="font-black text-base">{t('cart.wrappingLabel')}</p><p className="text-sm text-gray-500">+{wrappingFee} {t('common.egp')}</p></div>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${needsWrapping ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-gray-300'}`}>{needsWrapping && <FaCheck className="text-white" size={8} />}</div>
                  </div>
                </div>

                {/* 4. Payment */}
                <div className="space-y-3">
                  <p className="text-sm font-black text-[#5C2E3A] uppercase tracking-widest mb-1">{t('cart.paymentMethodTitle')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div onClick={() => setPaymentMethod('card')} className={sel(paymentMethod === 'card')}>
                      <div className={iconBox(paymentMethod === 'card')}><FaCreditCard size={16} /></div>
                      <div><p className="font-black text-base">{t('cart.cardPayment')}</p><p className="text-sm text-gray-500">{t('cart.cardPaymentDesc')}</p></div>
                    </div>
                    <div onClick={() => setPaymentMethod('cash')} className={sel(paymentMethod === 'cash')}>
                      <div className={iconBox(paymentMethod === 'cash')}><FaMoneyBillWave size={16} /></div>
                      <div><p className="font-black text-base">{t('cart.codPayment')}</p><p className="text-sm text-gray-500">{t('cart.codPaymentDesc')}</p></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary + CTA */}
              <div className="bg-[#5C2E3A] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">{t('cart.summaryTitle')}</p>
                <div className="space-y-2.5 mb-6">
                  {[
                    { label: t('cart.subtotalLabel'), val: `${cartTotal.toLocaleString()} ${t('common.egp')}` },
                    { label: t('cart.taxLabel'), val: `${taxAmount.toFixed(3)} ${t('common.egp')}` },
                    { label: t('cart.shippingLabel'), val: shippingFee === 0 ? t('cart.free') : `${shippingFee} ${t('common.egp')}`, gold: shippingFee > 0, green: shippingFee === 0 },
                    ...(needsWrapping ? [{ label: t('cart.giftWrapLabel'), val: `${wrappingFee.toFixed(3)} ${t('common.egp')}`, gold: true }] : []),
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between text-sm text-white/70">
                      <span>{r.label}</span>
                      <span className={`font-bold ${r.gold ? 'text-[#D4AF37]' : r.green ? 'text-amber-400' : ''}`}>{r.val}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-3 flex justify-between items-end">
                    <span className="font-black text-lg">{t('cart.finalTotalLabel')}</span>
                    <div className="text-end">
                      <span className="text-4xl font-black text-[#D4AF37]">{finalTotal.toFixed(3)}</span>
                      <span className="text-xs text-white/40 block">{t('cart.currencyName')}</span>
                    </div>
                  </div>
                </div>
                <button onClick={handleConfirmOrder} disabled={checkoutLoading} className="w-full h-14 bg-white text-[#5C2E3A] rounded-xl font-black text-base flex items-center justify-center gap-3 hover:bg-[#D4AF37] hover:text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-60">
                  {checkoutLoading
                    ? <div className="w-6 h-6 border-2 border-[#5C2E3A] border-t-transparent rounded-full animate-spin" />
                    : <><FaShieldAlt className="text-sm" />{paymentMethod === 'card' ? t('cart.proceedToPayment') : t('cart.confirmOrderNow')}</>
                  }
                </button>
                <p className="text-center text-[10px] text-white/30 mt-8 flex items-center justify-center gap-1">
                  <FaShieldAlt size={9} /> {t('cart.transactionsSecure')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
