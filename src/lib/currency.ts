// Sistema de conversión de monedas
export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate vs USD
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0 },
  EUR: { code: "EUR", name: "Euro", symbol: "€", rate: 0.92 },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", rate: 0.79 },
  COP: { code: "COP", name: "Colombian Peso", symbol: "$", rate: 4120.0 },
  MXN: { code: "MXN", name: "Mexican Peso", symbol: "$", rate: 17.25 },
  ARS: { code: "ARS", name: "Argentine Peso", symbol: "$", rate: 875.0 },
  CLP: { code: "CLP", name: "Chilean Peso", symbol: "$", rate: 940.0 },
  PEN: { code: "PEN", name: "Peruvian Sol", symbol: "S/", rate: 3.72 },
  BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", rate: 4.97 },
};

// Convertir de USD a otra moneda
export const convertFromUSD = (
  amountUSD: number,
  toCurrency: string,
): number => {
  const currency = CURRENCIES[toCurrency];
  if (!currency) return amountUSD;
  return amountUSD * currency.rate;
};

// Convertir de cualquier moneda a USD
export const convertToUSD = (amount: number, fromCurrency: string): number => {
  const currency = CURRENCIES[fromCurrency];
  if (!currency) return amount;
  return amount / currency.rate;
};

// Convertir entre dos monedas
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): number => {
  if (fromCurrency === toCurrency) return amount;
  const usdAmount = convertToUSD(amount, fromCurrency);
  return convertFromUSD(usdAmount, toCurrency);
};

// Formatear cantidad con símbolo de moneda
// Los valores se guardan en USD en la base de datos, así que convertimos al mostrar
export const formatCurrency = (
  amount: number,
  currencyCode: string,
  skipConversion = false,
): string => {
  const currency = CURRENCIES[currencyCode];
  if (!currency) return `$${amount.toFixed(2)}`;

  // Convertir de USD a la moneda seleccionada (a menos que ya esté convertido)
  const convertedAmount = skipConversion
    ? amount
    : convertFromUSD(amount, currencyCode);

  const useDecimals = !["COP", "MXN", "ARS", "CLP"].includes(currencyCode);

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: useDecimals ? 2 : 0,
    maximumFractionDigits: useDecimals ? 2 : 0,
  }).format(convertedAmount);

  return `${currency.symbol}${formatted}`;
};

// Solo formatear sin convertir (para valores que ya están en la moneda correcta)
export const formatCurrencyRaw = (
  amount: number,
  currencyCode: string,
): string => {
  return formatCurrency(amount, currencyCode, true);
};

// Actualizar tasas de cambio (en producción, conectar a API real)
export const updateExchangeRates = async (): Promise<void> => {
  try {
    // En producción, usar API como exchangerate-api.com
    // Por ahora, tasas fijas actualizadas manualmente
    // Rates updated successfully
  } catch (_error) {
    // Silent fail — rates stay at defaults
  }
};
