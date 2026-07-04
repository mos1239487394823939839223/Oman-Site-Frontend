"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { useLanguage } from "@/components/LanguageProvider";
import { buildAppTheme } from "@/theme/createAppTheme";

/**
 * Admin area theme wrapper.
 * Root App Router cache provider is already mounted at app level.
 */
export default function MuiThemeProvider({ children }: { children: ReactNode }) {
  const { dir, language } = useLanguage();

  const fontFamily =
    language === "ar"
      ? "var(--font-cairo), var(--font-inter), ui-sans-serif, system-ui, sans-serif"
      : "var(--font-inter), var(--font-cairo), ui-sans-serif, system-ui, sans-serif";

  const theme = buildAppTheme({ direction: dir, fontFamily });

  return (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );
}
