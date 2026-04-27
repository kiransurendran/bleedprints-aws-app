import type { CurrencyCode } from "@/types/catalog";

const currencyByCode: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
};

export function formatMoney(amount: number, currencyCode: CurrencyCode = "INR") {
  return new Intl.NumberFormat(currencyByCode[currencyCode], {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function toSubunits(amount: number) {
  return Math.round(amount * 100);
}
