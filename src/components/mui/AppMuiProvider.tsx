"use client";

import { ReactNode, useMemo } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { Direction } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { buildAppTheme } from "@/theme/createAppTheme";

type AppMuiProviderProps = {
  children: ReactNode;
  direction: Direction;
  language: "ar" | "en";
};

export default function AppMuiProvider({ children, direction, language }: AppMuiProviderProps) {
  const theme = useMemo(() => {
    const fontFamily =
      language === "ar"
        ? "var(--font-cairo), var(--font-inter), ui-sans-serif, system-ui, sans-serif"
        : "var(--font-inter), var(--font-cairo), ui-sans-serif, system-ui, sans-serif";

    return buildAppTheme({ direction, fontFamily });
  }, [direction, language]);

  const cacheOptions = useMemo(
    () => ({
      key: direction === "rtl" ? "muirtl" : "mui",
      prepend: true,
      ...(direction === "rtl" && { stylisPlugins: [rtlPlugin] }),
    }),
    [direction]
  );

  return (
    <AppRouterCacheProvider options={cacheOptions}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}