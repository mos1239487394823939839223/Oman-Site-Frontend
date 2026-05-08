"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFacebook, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  const [contact, setContact] = useState({
    phone: "0096899559437",
    whatsapp: "",
    email: "info@alnaseej.com",
    address: "Muscat, Sultanate of Oman",
    addressAr: "مسقط، سلطنة عمان",
    hours: "Sun-Thu: 9AM-10PM",
    hoursAr: "الأحد-الخميس: 9 ص - 10 م",
    instagram: "https://instagram.com",
    facebook: "",
    twitter: ""
  });

  useEffect(() => {
    const loadContact = () => {
      try {
        const saved = localStorage.getItem("admin_contact");
        if (saved) {
          setContact(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (e) {
        console.error("Error loading contact info:", e);
      }
    };
    loadContact();
  }, []);

  return (
    <footer className="relative overflow-hidden bg-[#0a2121] text-white pt-20 pb-0">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(161,123,54,0.1)_0%,_transparent_70%)]" />
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Brand Section Card */}
          <div className="lg:col-span-4 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-10 flex flex-col shadow-2xl transition-all duration-500 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-2 group">
            <h3 className="text-[2.5rem] font-bold mb-6 tracking-tight text-white transition-colors group-hover:text-[#c5a059]">
              {t('footer.brand')}
            </h3>
            <p className="text-gray-300 leading-relaxed mb-10 text-[1rem] font-medium opacity-90 max-w-[320px]">
              {t('footer.description')}
            </p>
            <div className="flex gap-4 mt-auto flex-wrap">
              <LanguageSwitcher />
              
              {contact.instagram && (
                <a
                  href={contact.instagram}
                  target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-white/[0.07] hover:bg-white/[0.15] border border-white/10 rounded-xl transition-all duration-300"
                >
                  <FaInstagram size={22} className="text-white/80" />
                </a>
              )}
              {contact.whatsapp && (
                <a
                  href={contact.whatsapp.startsWith('http') ? contact.whatsapp : `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-white/[0.07] hover:bg-white/[0.15] border border-white/10 rounded-xl transition-all duration-300"
                >
                  <FaWhatsapp size={22} className="text-white/80" />
                </a>
              )}
              {contact.facebook && (
                <a
                  href={contact.facebook}
                  target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-white/[0.07] hover:bg-white/[0.15] border border-white/10 rounded-xl transition-all duration-300"
                >
                  <FaFacebook size={22} className="text-white/80" />
                </a>
              )}
              {contact.twitter && (
                <a
                  href={contact.twitter}
                  target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-white/[0.07] hover:bg-white/[0.15] border border-white/10 rounded-xl transition-all duration-300"
                >
                  <FaTwitter size={22} className="text-white/80" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-10 shadow-2xl transition-all duration-500 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-2 group">
            <div className="relative mb-8">
              <h4 className="text-xl font-bold tracking-wide transition-colors group-hover:text-[#c5a059]">{t('footer.quickLinks')}</h4>
              <div className={`absolute -bottom-2 ${isRtl ? 'right-0' : 'left-0'} w-10 h-[2px] bg-[#c5a059] rounded-full`} />
            </div>
            <ul className="space-y-6">
              {[
                { name: t('footer.home'), href: "/" },
                { name: t('footer.products'), href: "/products" },
                { name: t('footer.reviews'), href: "/reviews" },
                { name: t('footer.favorites'), href: "/wishlist" },
                { name: t('footer.cart'), href: "/cart" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    href={link.href} 
                    className={`text-gray-300 hover:text-white transition-all duration-300 font-medium text-[1rem] ${isRtl ? 'hover:pr-2' : 'hover:pl-2'}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information Card */}
          <div className="lg:col-span-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-10 shadow-2xl transition-all duration-500 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-2 group">
            <div className="relative mb-8">
              <h4 className="text-xl font-bold tracking-wide transition-colors group-hover:text-[#c5a059]">{t('footer.contactInfo')}</h4>
              <div className={`absolute -bottom-2 ${isRtl ? 'right-0' : 'left-0'} w-10 h-[2px] bg-[#c5a059] rounded-full`} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <FaMapMarkerAlt />, text: isRtl ? contact.addressAr : contact.address },
                { icon: <FaPhoneAlt />, text: contact.phone, href: `tel:${contact.phone}` },
                { icon: <FaEnvelope />, text: contact.email, href: `mailto:${contact.email}` },
                { icon: <FaClock />, text: isRtl ? contact.hoursAr : contact.hours },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white/[0.04] border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.1] transition-all duration-300">
                  <div className="w-10 h-10 flex items-center justify-center text-lg text-[#c5a059]/80 group-hover:text-[#c5a059] transition-colors">
                    {item.icon}
                  </div>
                  {item.href ? (
                    <a href={item.href} className="text-gray-300 hover:text-white transition-colors font-medium text-[0.9rem] break-all">{item.text}</a>
                  ) : (
                    <p className="text-gray-300 font-medium text-[0.9rem]">{item.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-black/30 border-t border-white/10 py-6">
        <div className="max-w-[1400px] mx-auto px-8">
          <p className="text-gray-400 text-sm font-medium text-center">
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
