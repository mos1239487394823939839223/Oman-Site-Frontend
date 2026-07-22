"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { SUPPORTED_CURRENCIES, CURRENCIES, CurrencyCode } from "@/lib/currency";

/**
 * Compact currency selector for product pages. Changing it updates the global
 * display currency (and re-resolves the cart) via CurrencyProvider.
 */
export default function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <label
      className={`inline-flex items-center gap-2 text-sm font-bold text-[#5C2E3A] ${className}`}
    >
      <span className="text-xs text-gray-500 font-semibold">العملة</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        aria-label="Select currency"
        className="rounded-xl border border-[#5C2E3A]/20 bg-white px-3 py-1.5 text-sm font-bold text-[#5C2E3A] focus:outline-none focus:ring-2 focus:ring-[#5C2E3A]/30"
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code} {CURRENCIES[code].symbol}
          </option>
        ))}
      </select>
    </label>
  );
}
