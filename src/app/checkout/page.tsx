"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import DiscountRoundedIcon from "@mui/icons-material/DiscountRounded";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useAppSnackbar } from "@/components/mui/AppSnackbarProvider";
import { createCashOrder, createCheckoutSession, getCart } from "@/services/clientApi";
import { resolveMediaUrl } from "@/lib/media";

type CheckoutFormValues = {
  details: string;
  phone: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: "standard" | "express";
  paymentMethod: "card" | "cash";
};

const STEPS = ["Shipping Address", "Shipping Method", "Payment"];

export default function CheckoutPage() {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { showSnackbar } = useAppSnackbar();

  const {
    cartItems,
    cartTotal,
    cartTotalAfterDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();
  const { isAuthenticated } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    mode: "onTouched",
    defaultValues: {
      details: "",
      phone: "",
      city: "",
      postalCode: "",
      country: "Oman",
      shippingMethod: "standard",
      paymentMethod: "card",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  const hasDiscount =
    typeof cartTotalAfterDiscount === "number" &&
    cartTotalAfterDiscount < cartTotal;

  const subtotal = hasDiscount ? (cartTotalAfterDiscount as number) : cartTotal;
  const shippingFee = 0;
  const finalTotal = useMemo(() => subtotal + shippingFee, [subtotal, shippingFee]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    if (code === appliedCoupon) {
      setCouponError("This coupon is already applied.");
      return;
    }

    setApplyingCoupon(true);
    setCouponError("");

    try {
      const { discount } = await applyCoupon(code);
      setCouponDiscount(discount);
      setCouponInput("");
      showSnackbar("Coupon applied successfully.", "success");
    } catch (error: any) {
      const msg: string = error?.message || "Could not apply coupon.";
      setCouponError(msg);
      showSnackbar(msg, "error");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponDiscount(null);
    setCouponError("");
    setCouponInput("");
    showSnackbar("Coupon removed.", "info");
  };

  const handleNext = async () => {
    const stepFields: Array<Array<keyof CheckoutFormValues>> = [
      ["details", "phone", "city", "postalCode", "country"],
      ["shippingMethod"],
      ["paymentMethod"],
    ];

    const valid = await trigger(stepFields[activeStep]);
    if (!valid) {
      showSnackbar("Please fix the highlighted fields.", "warning");
      return;
    }

    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const cartResponse = await getCart(token);
      if (cartResponse.status === "fail" || !cartResponse.data?._id) {
        router.push("/login");
        return;
      }

      const cartId = cartResponse.data._id;
      const shippingAddress = {
        details: values.details,
        phone: values.phone,
        city: values.city,
        postalCode: values.postalCode,
        country: values.country,
      };

      if (values.paymentMethod === "card") {
        const session = await createCheckoutSession(cartId, token);
        const url = session?.session?.url;
        if (!url) {
          throw new Error("Could not start the secure payment session.");
        }
        showSnackbar("Redirecting to secure payment...", "info");
        window.location.href = url;
        return;
      }

      const response = await createCashOrder(cartId, { shippingAddress }, token);
      if (response.status === "success") {
        await clearCart();
        showSnackbar("Order placed successfully.", "success");
        router.push("/payment/success");
        return;
      }

      throw new Error("Could not create order.");
    } catch (error: any) {
      const message = error?.message || "Checkout failed. Please try again.";
      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          px: 2,
          bgcolor: "background.default",
        }}
      >
        <Card sx={{ maxWidth: 520, width: "100%" }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
              Your cart is empty
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Add products to continue checkout.
            </Typography>
            <Button variant="contained" onClick={() => router.push("/products")}>Browse Products</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1320, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIosNewRoundedIcon />}
            onClick={() => router.back()}
            aria-label="Back to cart"
          >
            Back to Cart
          </Button>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "text.secondary" }}>
            <LockRoundedIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>SSL Secured Checkout</Typography>
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                  Checkout
                </Typography>

                <Stepper
                  activeStep={activeStep}
                  orientation={isSmallScreen ? "vertical" : "horizontal"}
                  sx={{ mb: 3 }}
                >
                  {STEPS.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                  {activeStep === 0 && (
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Shipping Address
                      </Typography>

                      <Controller
                        name="details"
                        control={control}
                        rules={{ required: "Address details are required." }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Address details"
                            aria-label="Address details"
                            autoComplete="street-address"
                            error={Boolean(errors.details)}
                            helperText={errors.details?.message}
                          />
                        )}
                      />

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller
                            name="phone"
                            control={control}
                            rules={{
                              required: "Phone number is required.",
                              minLength: { value: 8, message: "Phone number is too short." },
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Phone"
                                aria-label="Phone"
                                autoComplete="tel"
                                error={Boolean(errors.phone)}
                                helperText={errors.phone?.message}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller
                            name="city"
                            control={control}
                            rules={{ required: "City is required." }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="City"
                                aria-label="City"
                                autoComplete="address-level2"
                                error={Boolean(errors.city)}
                                helperText={errors.city?.message}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller
                            name="postalCode"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Postal code"
                                aria-label="Postal code"
                                autoComplete="postal-code"
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller
                            name="country"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Country"
                                aria-label="Country"
                                autoComplete="country-name"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  )}

                  {activeStep === 1 && (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <LocalShippingRoundedIcon color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Shipping Method
                        </Typography>
                      </Stack>

                      <Controller
                        name="shippingMethod"
                        control={control}
                        rules={{ required: "Choose a shipping method." }}
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.shippingMethod)}>
                            <FormLabel aria-label="Shipping method">Delivery options</FormLabel>
                            <RadioGroup {...field}>
                              <FormControlLabel value="standard" control={<Radio />} label="Standard delivery (2-4 days)" />
                              <FormControlLabel value="express" control={<Radio />} label="Express delivery (next day)" />
                            </RadioGroup>
                            {errors.shippingMethod?.message && (
                              <FormHelperText>{errors.shippingMethod.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Stack>
                  )}

                  {activeStep === 2 && (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <PaymentsRoundedIcon color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Payment Method
                        </Typography>
                      </Stack>

                      <Controller
                        name="paymentMethod"
                        control={control}
                        rules={{ required: "Choose a payment method." }}
                        render={({ field }) => (
                          <FormControl error={Boolean(errors.paymentMethod)}>
                            <FormLabel aria-label="Payment method">Select one</FormLabel>
                            <RadioGroup {...field}>
                              <FormControlLabel value="card" control={<Radio />} label="Card payment (secure gateway)" />
                              <FormControlLabel value="cash" control={<Radio />} label="Cash on delivery" />
                            </RadioGroup>
                            {errors.paymentMethod?.message && (
                              <FormHelperText>{errors.paymentMethod.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />

                      <Alert severity="info" variant="outlined">
                        You will only be charged once your order is confirmed.
                      </Alert>
                    </Stack>
                  )}

                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between", mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={activeStep === 0 || loading}
                      aria-label="Go to previous checkout step"
                    >
                      Back
                    </Button>

                    {activeStep < STEPS.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={loading}
                        aria-label="Go to next checkout step"
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        aria-label="Place order now"
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
                      >
                        {loading ? "Processing..." : "Place Order"}
                      </Button>
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={2}>
              <Card>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    Order Summary
                  </Typography>

                  <Stack spacing={1.25} sx={{ maxHeight: 360, overflowY: "auto", pr: 0.5 }}>
                    {cartItems.map((item) => {
                      const product: any = item.product || item.gift;
                      const title = product?.title || product?.name || "Product";

                      return (
                        <Box
                          key={item._id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "64px 1fr auto",
                            alignItems: "center",
                            gap: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            p: 1,
                          }}
                        >
                          <Box sx={{ position: "relative", width: 64, height: 64, borderRadius: 2, overflow: "hidden", bgcolor: "grey.50" }}>
                            <Image
                              src={resolveMediaUrl(product?.imageCover || product?.image, item.gift ? "gifts" : "products")}
                              alt={title}
                              fill
                              sizes="64px"
                              className="object-contain"
                            />
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                              {title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Qty: {item.count} x {item.price.toLocaleString()}
                            </Typography>
                          </Box>

                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 800 }}>
                            {(item.count * item.price).toLocaleString()}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>

                  <Box sx={{ mt: 2.5 }}>
                    {appliedCoupon ? (
                      <Alert
                        severity="success"
                        action={
                          <Button color="inherit" size="small" onClick={handleRemoveCoupon}>
                            Remove
                          </Button>
                        }
                      >
                        Coupon {appliedCoupon} applied
                        {couponDiscount !== null ? ` (${couponDiscount}% off)` : ""}
                      </Alert>
                    ) : (
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: "stretch" }}>
                        <TextField
                          value={couponInput}
                          onChange={(event) => {
                            setCouponInput(event.target.value.toUpperCase());
                            if (couponError) setCouponError("");
                          }}
                          placeholder="Coupon code"
                          aria-label="Coupon code"
                          size="small"
                          error={Boolean(couponError)}
                          helperText={couponError}
                          slotProps={{
                            input: {
                              startAdornment: <DiscountRoundedIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />,
                            },
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponInput.trim()}
                          aria-label="Apply coupon code"
                        >
                          {applyingCoupon ? "Applying..." : "Apply"}
                        </Button>
                      </Stack>
                    )}
                  </Box>

                  <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography color="text.secondary">Subtotal</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{cartTotal.toLocaleString()}</Typography>
                    </Stack>

                    {hasDiscount && (
                      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Typography color="success.main">Discount</Typography>
                        <Typography color="success.main" sx={{ fontWeight: 700 }}>
                          -{(cartTotal - (cartTotalAfterDiscount as number)).toLocaleString()}
                        </Typography>
                      </Stack>
                    )}

                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography color="text.secondary">Shipping</Typography>
                      <Typography sx={{ fontWeight: 700 }}>Free</Typography>
                    </Stack>

                    <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1.25 }}>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total</Typography>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                          {finalTotal.toLocaleString()}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
