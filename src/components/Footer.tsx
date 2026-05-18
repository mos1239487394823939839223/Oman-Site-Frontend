"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./Footer.module.css";
import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const isRtl = isArabic;
  
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
    try {
      const saved = localStorage.getItem("admin_contact");
      if (saved) {
        setContact(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.error("Error loading contact info:", e);
    }
  }, []);

  const quickLinks = useMemo(() => [
    { name: t('footer.home'), href: "/" },
    { name: t('footer.products'), href: "/products" },
    { name: t('footer.reviews'), href: "/reviews" },
    { name: t('footer.favorites'), href: "/wishlist" },
    { name: t('footer.cart'), href: "/cart" }
  ], [t]);

  const contactItems = useMemo(() => [
    { icon: <FaMapMarkerAlt />, text: isRtl ? contact.addressAr : contact.address },
    { icon: <FaPhoneAlt />, text: contact.phone, href: `tel:${contact.phone}` },
    { icon: <FaEnvelope />, text: contact.email, href: `mailto:${contact.email}` },
    { icon: <FaClock />, text: isRtl ? contact.hoursAr : contact.hours },
  ], [isRtl, contact]);

  return (
    <footer className={styles.footerContainer} role="contentinfo">
      {/* Background Glows */}
      <div className={styles.backgroundGlow}>
        <div className={styles.glowCircle} />
      </div>
      
      <div className="relative z-10 max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand Section */}
          <div className={`${styles.sectionCard} lg:col-span-4 h-full flex flex-col`}>
            <h3 className={styles.brandTitle}>
              {t('footer.brand')}
            </h3>
            <p className={styles.description}>
              {t('footer.description')}
            </p>
            <div className="flex gap-4 mt-auto flex-wrap pt-6">
              <LanguageSwitcher />
              
              <a href={contact.instagram || "https://instagram.com"} target="_blank" rel="noopener noreferrer" 
                 className={styles.socialButton}
                 aria-label="Instagram">
                <FaInstagram size={22} />
              </a>

              <a href={`https://wa.me/${(contact.whatsapp || contact.phone).replace(/\D/g, '')}`} 
                 target="_blank" rel="noopener noreferrer"
                 className={`${styles.socialButton} ${styles.socialButtonWhatsapp}`}
                 aria-label="Whatsapp">
                <FaWhatsapp size={22} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`${styles.sectionCard} lg:col-span-2`}>
            <h4 className={styles.sectionHeading}>{t('footer.quickLinks')}</h4>
            <ul className="space-y-5">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className={styles.linkItem}>
                    <span className={`w-1.5 h-1.5 bg-[#D4AF37] rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className={`${styles.sectionCard} lg:col-span-6`}>
            <h4 className={styles.sectionHeading}>{t('footer.contactInfo')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {contactItems.map((item, idx) => (
                <div key={idx} className={styles.contactCard}>
                  <div className={styles.contactIcon}>
                    {item.icon}
                  </div>
                  {item.href ? (
                    <a href={item.href} className={styles.contactText}>{item.text}</a>
                  ) : (
                    <p className={styles.contactText}>{item.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className={styles.copyrightBar}>
        <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-center">
          <p className={styles.copyrightText}>
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
