"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowLeft, FaUserPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.rePassword) {
      setError(t('auth.passwordsMismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordMinLength'));
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.rePassword,
        phone: formData.phone
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fa]">
      <div className="w-full max-w-xl">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-[#5a1832] font-bold mb-8 hover:gap-3 transition-all">
          <FaArrowLeft className="text-sm" /> {t('common.back')}
        </Link>

        <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-14 border border-gray-100">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-[#5a1832] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#5a1832]/20 -rotate-3 group hover:rotate-0 transition-transform">
              <FaUserPlus className="text-3xl text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">{t('auth.registerTitle')}</h1>
            <p className="text-gray-500 font-medium">{t('auth.registerSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-black text-gray-700 mr-2">{t('auth.fullName')}</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    enterKeyHint="next"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37] transition-all font-bold text-gray-900"
                    placeholder="الاسم الثلاثي"
                    aria-label={t('auth.fullName')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-black text-gray-700 mr-2">{t('auth.phone')}</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="next"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37] transition-all font-bold text-gray-900"
                    placeholder="9xxxxxxx"
                    aria-label={t('auth.phone')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-black text-gray-700 mr-2">{t('auth.email')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  inputMode="email"
                  autoComplete="email"
                  enterKeyHint="next"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37] transition-all font-bold text-gray-900"
                  placeholder="name@example.com"
                    aria-label={t('auth.email')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-black text-gray-700 mr-2">{t('auth.password')}</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    enterKeyHint="next"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37] transition-all font-bold text-gray-900"
                    placeholder="••••••••"
                    aria-label={t('auth.password')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="rePassword" className="block text-sm font-black text-gray-700 mr-2">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="rePassword"
                    name="rePassword"
                    type="password"
                    required
                    value={formData.rePassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    enterKeyHint="go"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37] transition-all font-bold text-gray-900"
                    placeholder="••••••••"
                    aria-label={t('auth.confirmPassword')}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#5a1832] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#5a1832]/20 hover:bg-[#D4AF37] hover:text-[#5a1832] transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? t('auth.loadingRegister') : t('auth.submitRegister')}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-bold mb-4">{t('auth.alreadyHaveAccount')}</p>
            <Link 
              href="/login" 
              className="inline-block w-full py-4 border-2 border-[#5a1832] text-[#5a1832] rounded-2xl font-black hover:bg-[#5a1832] hover:text-white transition-all"
            >
              {t('auth.submitLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
