"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FaInstagram,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaFacebook,
  FaTwitter,
} from "react-icons/fa";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./Footer.module.css";
import { useLanguage } from "./LanguageProvider";
import { getFooter } from "@/services/clientApi";
import {
  FooterSettings,
  pickTranslation,
} from "@/types/footer";

export default function Footer() {
  const { isArabic } = useLanguage();
  const isRtl = isArabic;

  const [footer, setFooter] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await getFooter();
        if (!cancelled) {
          setFooter(response.data ?? null);
        }
      } catch (e) {
        console.error("Error loading footer settings:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const quickLinks = useMemo(() => {
    const links = footer?.links ?? [];
    return links
      .filter((link) => link.isActive !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((link) => ({
        name: isRtl ? link.labelAr : link.labelEn,
        href: link.href,
      }));
  }, [footer?.links, isRtl]);

  const contactItems = useMemo(() => {
    if (!footer) return [];
    return [
      {
        icon: <FaMapMarkerAlt />,
        text: isRtl ? footer.addressAr : footer.address,
      },
      {
        icon: <FaPhoneAlt />,
        text: footer.phone,
        href: footer.phone ? `tel:${footer.phone}` : undefined,
      },
      {
        icon: <FaEnvelope />,
        text: footer.email,
        href: footer.email ? `mailto:${footer.email}` : undefined,
      },
      {
        icon: <FaClock />,
        text: isRtl ? footer.hoursAr : footer.hours,
      },
    ].filter((item) => item.text);
  }, [footer, isRtl]);

  const whatsappDigits = (footer?.whatsapp || footer?.phone || "").replace(
    /\D/g,
    ""
  );

  if (loading && !footer) {
    return (
      <footer className={styles.footerContainer} role="contentinfo">
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-16 text-center text-white/40 text-sm">
          Loading...
        </div>
      </footer>
    );
  }

  if (!footer) return null;

  return (
    <footer className={styles.footerContainer} role="contentinfo">
      <div className={styles.backgroundGlow}>
        <div className={styles.glowCircle} />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Section */}
          <div
            className={`${styles.sectionCard} lg:col-span-4 h-full flex flex-col`}
          >
            <h3 className={styles.brandTitle}>
              {pickTranslation(footer.brand, isRtl)}
            </h3>
            <p className={styles.description}>
              {pickTranslation(footer.description, isRtl)}
            </p>
            <div className="flex gap-4 mt-auto flex-wrap pt-6">
              <LanguageSwitcher />

              {footer.instagram ? (
                <a
                  href={footer.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialButton}
                  aria-label="Instagram"
                >
                  <FaInstagram size={22} />
                </a>
              ) : null}

              {whatsappDigits ? (
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.socialButton} ${styles.socialButtonWhatsapp}`}
                  aria-label="Whatsapp"
                >
                  <FaWhatsapp size={22} />
                </a>
              ) : null}

              {footer.facebook ? (
                <a
                  href={footer.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialButton}
                  aria-label="Facebook"
                >
                  <FaFacebook size={22} />
                </a>
              ) : null}

              {footer.twitter ? (
                <a
                  href={footer.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialButton}
                  aria-label="Twitter"
                >
                  <FaTwitter size={22} />
                </a>
              ) : null}
            </div>
          </div>

          {/* Quick Links */}
          {quickLinks.length > 0 ? (
            <div className={`${styles.sectionCard} lg:col-span-2`}>
              <h4 className={styles.sectionHeading}>
                {pickTranslation(footer.quickLinks, isRtl)}
              </h4>
              <ul className="space-y-5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.linkItem}>
                      <span
                        className={`w-1.5 h-1.5 bg-[#D4AF37] rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${isRtl ? "ml-2" : "mr-2"}`}
                      />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Contact Information */}
          {contactItems.length > 0 ? (
            <div
              className={`${styles.sectionCard} ${quickLinks.length > 0 ? "lg:col-span-6" : "lg:col-span-8"}`}
            >
              <h4 className={styles.sectionHeading}>
                {pickTranslation(footer.contactInfo, isRtl)}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {contactItems.map((item, idx) => (
                  <div key={idx} className={styles.contactCard}>
                    <div className={styles.contactIcon}>{item.icon}</div>
                    {item.href ? (
                      <a href={item.href} className={styles.contactText}>
                        {item.text}
                      </a>
                    ) : (
                      <p className={styles.contactText}>{item.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Copyright Bar */}
      <div className={styles.copyrightBar}>
        <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-center">
          <p className={styles.copyrightText}>
            {pickTranslation(footer.rights, isRtl)}
          </p>
        </div>
      </div>
    </footer>
  );
}
