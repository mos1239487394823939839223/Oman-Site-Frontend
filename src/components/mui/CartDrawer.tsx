"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useCart } from "@/components/CartProvider";
import { resolveMediaUrl } from "@/lib/media";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cartItems, cartTotal, updateCartItem, removeFromCart, loading } = useCart();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 430 },
            p: 2,
            display: "flex",
            gap: 2,
          },
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Cart Summary
        </Typography>
        <IconButton aria-label="Close cart drawer" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>

      <Divider />

      <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
        {cartItems.length === 0 ? (
          <Alert severity="info" variant="outlined">
            Your cart is empty.
          </Alert>
        ) : (
          <Stack spacing={1.5}>
            {cartItems.map((item) => {
              const product: any = item.product || item.gift;
              const title = product?.title || product?.name || "Item";
              const imageSrc = resolveMediaUrl(
                product?.imageCover || product?.image,
                item.gift ? "gifts" : "products"
              );

              return (
                <Box
                  key={item._id}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 1.25,
                    display: "grid",
                    gridTemplateColumns: "72px 1fr",
                    gap: 1.25,
                  }}
                >
                  <Box sx={{ position: "relative", width: 72, height: 72, borderRadius: 2, overflow: "hidden", bgcolor: "grey.50" }}>
                    <Image
                      src={imageSrc}
                      alt={title}
                      fill
                      sizes="72px"
                      className="object-contain"
                    />
                  </Box>

                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                      {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Unit: {item.price.toLocaleString()}
                    </Typography>

                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <IconButton
                          size="small"
                          aria-label={`Decrease quantity for ${title}`}
                          onClick={() => updateCartItem(item._id, Math.max(1, item.count - 1))}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>
                          {item.count}
                        </Typography>
                        <IconButton
                          size="small"
                          aria-label={`Increase quantity for ${title}`}
                          onClick={() => updateCartItem(item._id, item.count + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Remove ${title} from cart`}
                        onClick={() => removeFromCart(item._id)}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Divider />

      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
            {cartTotal.toLocaleString()}
          </Typography>
        </Stack>

        <Button
          component={Link}
          href="/checkout"
          variant="contained"
          fullWidth
          disabled={cartItems.length === 0 || loading}
          onClick={onClose}
          aria-label="Proceed to checkout"
        >
          Proceed to Checkout
        </Button>
      </Stack>
    </Drawer>
  );
}