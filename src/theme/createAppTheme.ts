import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import type { Direction, Theme } from "@mui/material/styles";

type BuildThemeOptions = {
  direction: Direction;
  fontFamily: string;
};

export function buildAppTheme({ direction, fontFamily }: BuildThemeOptions): Theme {
  const theme = createTheme({
    direction,
    shape: {
      borderRadius: 14,
    },
    palette: {
      mode: "light",
      primary: {
        main: "#5C2E3A",
        dark: "#4A2330",
        light: "#8A5A67",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#D4AF37",
        dark: "#B9972E",
        light: "#E8C865",
        contrastText: "#1F2937",
      },
      success: {
        main: "#B07F00",
        dark: "#8A5D00",
        light: "#D4AF37",
        contrastText: "#FFFFFF",
      },
      error: {
        main: "#B91C1C",
        dark: "#991B1B",
        light: "#EF4444",
        contrastText: "#FFFFFF",
      },
      background: {
        default: "#F5F5F5",
        paper: "#FFFFFF",
      },
      text: {
        primary: "#1F2937",
        secondary: "#6B7280",
      },
    },
    typography: {
      fontFamily,
      h1: { fontWeight: 800, letterSpacing: "-0.02em" },
      h2: { fontWeight: 800, letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, letterSpacing: "-0.01em" },
      h4: { fontWeight: 700 },
      button: {
        fontWeight: 700,
        textTransform: "none",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollBehavior: "smooth",
          },
          body: {
            backgroundColor: "#F5F5F5",
          },
          "*:focus-visible": {
            outline: "2px solid #D4AF37",
            outlineOffset: 2,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          size: "large",
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            paddingInline: 18,
            minHeight: 44,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          fullWidth: true,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 700,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderTopLeftRadius: 18,
            borderBottomLeftRadius: 18,
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme, { factor: 2.2 });
}