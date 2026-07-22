"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  CurrencyCode,
  BASE_CURRENCY,
  isSupportedCurrency,
  formatPrice,
  effectivePrice,
  priceForCurrency,
  PricedProduct,
} from "@/lib/currency";
import { setCartCurrency } from "@/services/clientApi";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Format a bare number in the active currency, e.g. "45.000 ر.ع.". */
  format: (amount: number | undefined | null) => string;
  /** Effective (discounted if present) price of a product, as a number. */
  amountFor: (product: PricedProduct) => number;
  /** Non-discounted base price of a product in the active currency, as a number. */
  baseAmountFor: (product: PricedProduct) => number;
  /** Effective price of a product, formatted with symbol. */
  formatProduct: (product: PricedProduct) => string;
};

const STORAGE_KEY = "app_currency";

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

function readInitialCurrency(): CurrencyCode {
  if (typeof window === "undefined") return BASE_CURRENCY;
  const stored = localStorage.getItem(STORAGE_KEY);
  return isSupportedCurrency(stored || undefined)
    ? (stored as CurrencyCode)
    : BASE_CURRENCY;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Start at the base currency on both server and first client render to avoid
  // a hydration mismatch; read the persisted choice after mount.
  const [currency, setCurrencyState] = useState<CurrencyCode>(BASE_CURRENCY);

  useEffect(() => {
    setCurrencyState(readInitialCurrency());
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (!isSupportedCurrency(code)) return;
    setCurrencyState(code);
    if (typeof window === "undefined") return;

    localStorage.setItem(STORAGE_KEY, code);
    const token = localStorage.getItem("token");
    if (token) {
      // Re-resolve the server cart into the new currency, then notify the cart.
      setCartCurrency(code, token)
        .catch(() => {})
        .finally(() => window.dispatchEvent(new CustomEvent("currencyChanged")));
    } else {
      window.dispatchEvent(new CustomEvent("currencyChanged"));
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      format: (amount) => formatPrice(amount, currency),
      amountFor: (product) => effectivePrice(product, currency),
      baseAmountFor: (product) => priceForCurrency(product, currency).amount,
      formatProduct: (product) =>
        formatPrice(effectivePrice(product, currency), currency),
    }),
    [currency, setCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
}
