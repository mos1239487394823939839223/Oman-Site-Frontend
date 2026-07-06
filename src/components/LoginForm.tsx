"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { FaEnvelope, FaLock, FaArrowLeft, FaSignInAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const sessionExpired = searchParams?.get("session_expired") === "1";
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        router.push(redirect || (user.role === 'admin' ? "/admin" : "/"));
      } else {
        router.push(redirect || "/");
      }
    } catch (err: any) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fa]">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-[#5a1832] font-bold mb-8 hover:gap-3 transition-all">
          <FaArrowLeft className="text-sm" /> {t('common.back')}
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[#5a1832] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#5a1832]/20 rotate-3 group hover:rotate-0 transition-transform">
              <FaSignInAlt className="text-3xl text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t('auth.loginTitle')}</h1>
            <p className="text-gray-500 font-medium">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {sessionExpired && !error && (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-sm font-bold border border-amber-200 flex items-center gap-2">
                <span>&#9888;</span> Your session has expired. Please log in again.
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

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
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37] transition-all font-bold text-gray-900 placeholder:text-gray-400"
                  placeholder="name@example.com"
                  aria-label={t('auth.email')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mr-2">
                <label htmlFor="password" className="block text-sm font-black text-gray-700">{t('auth.password')}</label>
                <Link href="/forgot-password" className="text-xs font-black text-[#5a1832] hover:text-[#D4AF37]">{t('auth.forgotPassword')}</Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  enterKeyHint="go"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37] transition-all font-bold text-gray-900 placeholder:text-gray-400"
                  placeholder="••••••••"
                  aria-label={t('auth.password')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#5a1832] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#5a1832]/20 hover:bg-[#D4AF37] hover:text-[#5a1832] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.loadingLogin') : t('auth.submitLogin')}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-bold mb-4">{t('auth.noAccount')}</p>
            <Link 
              href="/register" 
              className="inline-block w-full py-4 border-2 border-[#5a1832] text-[#5a1832] rounded-2xl font-black hover:bg-[#5a1832] hover:text-white transition-all"
            >
              {t('auth.submitRegister')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
