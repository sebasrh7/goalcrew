import { getCurrentLanguage } from "./i18n";

export interface CurrencyConfig {
  code: string;
  symbol: string;
  /** Approximate scale vs USD — used only for quick-amount suggestions */
  scale: number;
  /** Whether this currency typically omits decimal places */
  noDecimals: boolean;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", scale: 1, noDecimals: false },
  EUR: { code: "EUR", symbol: "€", scale: 1, noDecimals: false },
  GBP: { code: "GBP", symbol: "£", scale: 1, noDecimals: false },
  COP: { code: "COP", symbol: "$", scale: 4000, noDecimals: true },
  MXN: { code: "MXN", symbol: "$", scale: 17, noDecimals: true },
  ARS: { code: "ARS", symbol: "$", scale: 900, noDecimals: true },
  CLP: { code: "CLP", symbol: "$", scale: 950, noDecimals: true },
  PEN: { code: "PEN", symbol: "S/", scale: 3.7, noDecimals: false },
  BRL: { code: "BRL", symbol: "R$", scale: 5, noDecimals: false },
};

// Mapeo de idioma a locale para Intl.NumberFormat
const LANGUAGE_TO_LOCALE: Record<string, string> = {
  es: "es",
  en: "en-US",
  fr: "fr-FR",
};

// Formatear cantidad con símbolo de moneda
// Los valores se guardan en moneda local en la base de datos — no se convierte al mostrar
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = CURRENCIES[currencyCode];
  if (!currency) return `$${amount.toFixed(2)}`;

  const lang = getCurrentLanguage();
  const locale = LANGUAGE_TO_LOCALE[lang] || "es";

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: currency.noDecimals ? 0 : 2,
    maximumFractionDigits: currency.noDecimals ? 0 : 2,
  }).format(amount);

  return `${currency.symbol}${formatted}`;
};

// Quick amounts adapted to currency scale
export function getQuickAmounts(currencyCode: string): number[] {
  const scale = CURRENCIES[currencyCode]?.scale ?? 1;
  if (scale >= 500) {
    // High-value currencies: COP, ARS, CLP
    return [5000, 10000, 20000, 50000];
  }
  if (scale >= 10) {
    // Medium: MXN
    return [50, 100, 200, 500];
  }
  // Low scale: USD, EUR, GBP, PEN, BRL
  return [5, 10, 25, 50];
}

/**
 * Placeholder amount for goal inputs — gives a sensible example value
 * depending on the currency scale.
 */
export function getPlaceholderAmount(currencyCode: string): string {
  const scale = CURRENCIES[currencyCode]?.scale ?? 1;
  if (scale >= 500) {
    return "500000"; // e.g. COP, ARS, CLP
  }
  if (scale >= 10) {
    return "5000"; // e.g. MXN
  }
  return "250"; // USD, EUR, GBP, PEN, BRL
}
