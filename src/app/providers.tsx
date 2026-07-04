"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { LanguageProvider, useLanguage } from "@/components/LanguageProvider";
import AppMuiProvider from "@/components/mui/AppMuiProvider";
import { AppSnackbarProvider } from "@/components/mui/AppSnackbarProvider";

interface ProvidersProps {
  children: ReactNode;
  initialLanguage: "ar" | "en";
}

function MuiBoundProviders({ children }: { children: ReactNode }) {
  const { dir, language } = useLanguage();

  return (
    <AppMuiProvider direction={dir} language={language}>
      <AppSnackbarProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </AppSnackbarProvider>
    </AppMuiProvider>
  );
}

export default function Providers({ children, initialLanguage }: ProvidersProps) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <MuiBoundProviders>{children}</MuiBoundProviders>
    </LanguageProvider>
  );
}



