export interface FooterTranslation {
  en?: string;
  ar?: string;
}

export interface FooterLink {
  _id?: string;
  href: string;
  labelEn: string;
  labelAr: string;
  order?: number;
  isActive?: boolean;
}

export interface FooterSettings {
  _id?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  addressAr?: string;
  hours?: string;
  hoursAr?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  brand?: FooterTranslation;
  description?: FooterTranslation;
  quickLinks?: FooterTranslation;
  contactInfo?: FooterTranslation;
  home?: FooterTranslation;
  products?: FooterTranslation;
  reviews?: FooterTranslation;
  favorites?: FooterTranslation;
  cart?: FooterTranslation;
  rights?: FooterTranslation;
  links?: FooterLink[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export function pickTranslation(
  value: FooterTranslation | undefined,
  isRtl: boolean
): string {
  if (!value) return "";
  return isRtl ? value.ar || value.en || "" : value.en || value.ar || "";
}
