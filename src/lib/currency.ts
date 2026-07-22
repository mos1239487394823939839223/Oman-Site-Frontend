// Shared currency configuration for multi-currency product pricing.
// Base currency is OMR — a product's legacy `price`/`priceAfterDiscount`
// fields are always the OMR amount and act as the fallback.

export type CurrencyCode = "OMR" | "AED" | "SAR" | "USD";

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  /** Native currency label, shown in the switcher. */
  label: string;
  decimals: number;
}

export const BASE_CURRENCY: CurrencyCode = "OMR";

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  OMR: { code: "OMR", symbol: "ر.ع.", label: "ريال عماني", decimals: 3 },
  AED: { code: "AED", symbol: "د.إ", label: "درهم إماراتي", decimals: 2 },
  SAR: { code: "SAR", symbol: "ر.س", label: "ريال سعودي", decimals: 2 },
  USD: { code: "USD", symbol: "$", label: "US Dollar", decimals: 2 },
};

export const SUPPORTED_CURRENCIES: CurrencyCode[] = Object.keys(
  CURRENCIES
) as CurrencyCode[];

export const isSupportedCurrency = (code?: string): code is CurrencyCode =>
  !!code && (SUPPORTED_CURRENCIES as string[]).includes(code);

export interface PriceEntry {
  currency: CurrencyCode | string;
  amount: number;
  amountAfterDiscount?: number;
}

/** A product-shaped object that may carry per-currency prices. */
export interface PricedProduct {
  price?: number;
  priceAfterDiscount?: number;
  prices?: PriceEntry[];
}

/**
 * Resolve a product's price in `code`. Falls back to the base OMR
 * `price`/`priceAfterDiscount` when there's no per-currency entry.
 */
export function priceForCurrency(
  product: PricedProduct = {},
  code: CurrencyCode = BASE_CURRENCY
): { amount: number; amountAfterDiscount?: number } {
  const entry = product.prices?.find((p) => p.currency === code);
  if (entry && typeof entry.amount === "number") {
    return {
      amount: entry.amount,
      amountAfterDiscount:
        typeof entry.amountAfterDiscount === "number"
          ? entry.amountAfterDiscount
          : undefined,
    };
  }
  return {
    amount: typeof product.price === "number" ? product.price : 0,
    amountAfterDiscount:
      typeof product.priceAfterDiscount === "number"
        ? product.priceAfterDiscount
        : undefined,
  };
}

/** Effective (discounted if present) unit price for a currency. */
export function effectivePrice(
  product: PricedProduct,
  code: CurrencyCode = BASE_CURRENCY
): number {
  const { amount, amountAfterDiscount } = priceForCurrency(product, code);
  return typeof amountAfterDiscount === "number" ? amountAfterDiscount : amount;
}

/** Format a bare number with the currency's decimals and symbol, e.g. "45.000 ر.ع.". */
export function formatPrice(
  amount: number | undefined | null,
  code: CurrencyCode = BASE_CURRENCY
): string {
  const cfg = CURRENCIES[code] || CURRENCIES[BASE_CURRENCY];
  const n = typeof amount === "number" ? amount : 0;
  const formatted = n.toLocaleString(undefined, {
    minimumFractionDigits: cfg.decimals,
    maximumFractionDigits: cfg.decimals,
  });
  return `${formatted} ${cfg.symbol}`;
}
