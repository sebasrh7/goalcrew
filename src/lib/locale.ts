import { getCalendars, getLocales } from "expo-localization";
import { Language } from "./i18n";

// Mapeo de locale del dispositivo a idiomas soportados
const LANGUAGE_MAP: Record<string, Language> = {
  es: "es",
  en: "en",
  fr: "fr",
};

// Mapeo de región/país a moneda
const REGION_CURRENCY_MAP: Record<string, string> = {
  // América Latina
  CO: "COP", // Colombia
  MX: "MXN", // México
  AR: "ARS", // Argentina
  CL: "CLP", // Chile
  PE: "PEN", // Perú
  BR: "BRL", // Brasil

  // Norteamérica
  US: "USD", // Estados Unidos
  CA: "USD", // Canadá (default USD)

  // Europa
  FR: "EUR", // Francia
  DE: "EUR", // Alemania
  ES: "EUR", // España
  IT: "EUR", // Italia
  PT: "EUR", // Portugal
  NL: "EUR", // Países Bajos
  BE: "EUR", // Bélgica
  AT: "EUR", // Austria
  IE: "EUR", // Irlanda

  // Reino Unido
  GB: "GBP", // Gran Bretaña

  // Asia
  JP: "JPY", // Japón
};

// Monedas que soportamos activamente
const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "COP",
  "MXN",
  "ARS",
  "CLP",
  "PEN",
  "BRL",
  "GBP",
];

export interface DetectedLocale {
  language: Language;
  currency: string;
  region: string | null;
  languageCode: string;
}

/**
 * Detecta el idioma y moneda del dispositivo
 */
export function detectDeviceLocale(): DetectedLocale {
  try {
    const locales = getLocales();
    const primaryLocale = locales[0];

    if (!primaryLocale) {
      return {
        language: "es",
        currency: "USD",
        region: null,
        languageCode: "es",
      };
    }

    // Detectar idioma
    const langCode = primaryLocale.languageCode?.toLowerCase() ?? "es";
    const language: Language = LANGUAGE_MAP[langCode] ?? "es";

    // Detectar moneda basada en región
    const region = primaryLocale.regionCode?.toUpperCase() ?? null;
    let currency = "USD"; // Default

    if (region && REGION_CURRENCY_MAP[region]) {
      const detectedCurrency = REGION_CURRENCY_MAP[region];
      // Solo asignar si está en nuestras monedas soportadas
      if (SUPPORTED_CURRENCIES.includes(detectedCurrency)) {
        currency = detectedCurrency;
      }
    }

    // También intentar con la moneda del calendario/locale
    try {
      const calendars = getCalendars();
      // Algunos dispositivos reportan la moneda directamente
    } catch {
      // Ignorar si no está disponible
    }

    console.log(
      `🌍 Detected locale: lang=${language}, currency=${currency}, region=${region}`,
    );

    return { language, currency, region, languageCode: langCode };
  } catch (error) {
    console.warn("⚠️ Could not detect device locale:", error);
    return {
      language: "es",
      currency: "USD",
      region: null,
      languageCode: "es",
    };
  }
}
