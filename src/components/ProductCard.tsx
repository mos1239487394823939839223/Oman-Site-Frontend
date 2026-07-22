"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Heart from "./Heart";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Product } from "@/services/clientApi";
import { resolveMediaUrl } from "@/lib/media";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/components/CurrencyProvider";
import { priceForCurrency } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { currency, format } = useCurrency();
  const [imgSrc, setImgSrc] = useState(resolveMediaUrl(product.imageCover, "products"));
  const [imageLoading, setImageLoading] = useState(true);

  const handleViewDetails = () => {
    router.push(`/products/${product._id}`);
  };

  // Resolve price in the active currency (falls back to base OMR).
  const { amount: baseAmount, amountAfterDiscount } = priceForCurrency(product, currency);
  const hasDiscount =
    amountAfterDiscount !== undefined &&
    amountAfterDiscount > 0 &&
    amountAfterDiscount < baseAmount;

  const discountPercent = hasDiscount
    ? Math.round(((baseAmount - (amountAfterDiscount || 0)) / baseAmount) * 100)
    : 0;

  const displayPrice = hasDiscount ? amountAfterDiscount : baseAmount;

  return (
    <Card
      onClick={handleViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleViewDetails();
        }
      }}
      sx={{
        minHeight: { xs: 360, sm: 420 },
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "primary.light",
          boxShadow: "0 14px 30px rgba(92, 46, 58, 0.16)",
        },
      }}
    >
      <Box sx={{ position: "relative", width: "100%", bgcolor: "common.white", aspectRatio: "4 / 3" }}>
        {imageLoading && (
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{ position: "absolute", inset: 0, zIndex: 1 }}
          />
        )}
        <CardMedia sx={{ position: "absolute", inset: 0 }}>
        <Image
          src={imgSrc}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          quality={90}
          className="object-contain"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPwUjaoBwACdQEdOZjhLQAAAABJRU5ErkJggg=="
          onError={() => setImgSrc("/placeholder.svg")}
          onLoad={() => setImageLoading(false)}
        />
        </CardMedia>

        {hasDiscount && (
          <Chip
            label={`-${discountPercent}%`}
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 2,
              fontWeight: 800,
              bgcolor: "secondary.main",
              color: "primary.main",
              "& .MuiChip-label": {
                color: "primary.main",
              },
            }}
          />
        )}

        <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
          <Heart
            productId={product._id}
            className="w-11 h-11 bg-[#1a1f2e]/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10"
            size="sm"
          />
        </Box>
      </Box>

      <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1, p: 2, gap: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: "primary.main",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.category?.name || t('seo.siteName')}
          </Typography>
          {product.brand?.name && (
            <Chip
              label={product.brand.name}
              size="small"
              variant="outlined"
              sx={{
                flexShrink: 0,
                height: 20,
                borderColor: "divider",
                color: "text.secondary",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                "& .MuiChip-label": { px: 0.9, fontSize: "0.62rem" },
              }}
            />
          )}
        </Stack>

        <Box sx={{ minHeight: 42 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.35,
            }}
          >
            {product.title}
          </Typography>
        </Box>

        <Box sx={{ minHeight: 24, display: "flex", alignItems: "center" }}>
          {product.ratingsAverage > 0 ? (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <Rating value={Math.min(5, product.ratingsAverage)} precision={0.1} readOnly size="small" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                ({product.ratingsQuantity || 0})
              </Typography>
            </Stack>
          ) : (
            <Box sx={{ height: 16 }} />
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ minHeight: 30, alignItems: "center" }}>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {format(displayPrice)}
          </Typography>
          {hasDiscount && (
            <Typography variant="caption" color="text.disabled" sx={{ textDecoration: "line-through" }}>
              {format(baseAmount)}
            </Typography>
          )}
        </Stack>

        <Box sx={{ mt: "auto", pt: 1 }}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            fullWidth
            variant="contained"
            startIcon={<ShoppingCartOutlinedIcon />}
            aria-label={`${t('common.viewDetails')} ${product.title}`}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              py: 1.1,
              transition: "transform 180ms ease",
              "&:active": { transform: "scale(0.98)" },
            }}
          >
            {t('common.viewDetails')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
