"use client";

import {
  AppBar,
  Toolbar,
  Box,
  InputBase,
  IconButton,
  Badge,
  Avatar,
  Button,
  Typography,
  Divider,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "@/components/AuthProvider";
import { useNotifications } from "@/components/admin/NotificationsProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const MAROON = "#5C2E3A";
const MAROON_DARK = "#4A2330";

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { unreadCount, markAllRead } = useNotifications();
  const { t } = useTranslation();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: MAROON,
        color: "#fff",
        borderBottom: `1px solid ${MAROON_DARK}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: { xs: 72, md: 82 },
          px: { xs: 2, lg: 3 },
          gap: { xs: 1, md: 2 },
        }}
      >
        {/* Mobile menu toggle */}
        <IconButton
          onClick={onMenuToggle}
          edge="start"
          aria-label="Toggle menu"
          sx={{
            display: { xs: "inline-flex", lg: "none" },
            color: alpha("#fff", 0.85),
            "&:hover": { bgcolor: alpha("#fff", 0.1) },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search — grows to fill available space, capped for readability */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1.25,
            flexGrow: 1,
            maxWidth: 520,
            bgcolor: alpha("#fff", 0.12),
            border: `1px solid ${alpha("#fff", 0.2)}`,
            borderRadius: 2,
            px: 2,
            height: 42,
            transition: "all .2s",
            "&:hover": { bgcolor: alpha("#fff", 0.16) },
            "&:focus-within": {
              bgcolor: alpha("#fff", 0.18),
              borderColor: alpha("#fff", 0.45),
            },
          }}
        >
          <SearchIcon sx={{ color: alpha("#fff", 0.7), fontSize: 20 }} />
          <InputBase
            placeholder={String(t("common.search") || "Search")}
            sx={{
              flexGrow: 1,
              width: "100%",
              color: "#fff",
              fontSize: 14,
              "& input::placeholder": { color: alpha("#fff", 0.6), opacity: 1 },
            }}
          />
        </Box>

        {/* Spacer keeps the actions pinned to the end (also on mobile) */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right-side actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <LanguageSwitcher />
          </Box>

          <IconButton
            aria-label="Notifications"
            onClick={markAllRead}
            sx={{ color: alpha("#fff", 0.85), "&:hover": { bgcolor: alpha("#fff", 0.1) } }}
          >
            <Badge
              badgeContent={unreadCount}
              color="secondary"
              max={99}
              invisible={unreadCount === 0}
            >
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ my: 1.25, mx: 0.5, borderColor: alpha("#fff", 0.2) }}
          />

          {/* User */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, pl: 0.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: alpha("#fff", 0.15),
                color: "#fff",
              }}
            >
              <PersonIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
                {user?.name || "Admin"}
              </Typography>
              <Typography sx={{ fontSize: 11, color: alpha("#fff", 0.6), mt: 0.25 }}>
                {t("header.adminDashboard")}
              </Typography>
            </Box>
          </Box>

          {/* Logout */}
          <Button
            onClick={logout}
            startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
            sx={{
              ml: 0.5,
              color: alpha("#fff", 0.9),
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 2,
              px: 1.5,
              minWidth: 0,
              "& .MuiButton-startIcon": { mr: { xs: 0, sm: 0.75 }, ml: 0 },
              "&:hover": { bgcolor: alpha("#fff", 0.1), color: "#fff" },
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              {t("header.logout")}
            </Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
