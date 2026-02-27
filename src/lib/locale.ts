import { getLocales } from "expo-localization";
import { Language } from "./i18n";

// Mapeo de locale del dispositivo a idiomas soportados
const LANGUAGE_MAP: Record<string, Language> = {
  es: "es",
  en: "en",
  fr: "fr",
};

// Mapeo de región/país a moneda (fallback si currencyCode no está disponible)
const REGION_CURRENCY_MAP: Record<string, string> = {
  CO: "COP",
  MX: "MXN",
  AR: "ARS",
  CL: "CLP",
  PE: "PEN",
  BR: "BRL",
  US: "USD",
  CA: "USD",
  FR: "EUR",
  DE: "EUR",
  ES: "EUR",
  IT: "EUR",
  PT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  GB: "GBP",
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
 * Extrae un código de región ISO de 2 letras de un languageTag BCP 47.
 * Ej: "es-CO" → "CO", "es-Latn-CO" → "CO", "es-419" → null
 */
function extractRegionFromTag(tag: string): string | null {
  const parts = tag.split("-");
  // Recorrer de derecha a izquierda buscando un código de 2 letras mayúsculas
  for (let i = parts.length - 1; i >= 1; i--) {
    const part = parts[i].toUpperCase();
    if (part.length === 2 && /^[A-Z]{2}$/.test(part)) {
      return part;
    }
  }
  return null;
}

/**
 * Detecta el idioma y moneda del dispositivo.
 *
 * Estrategia de detección de moneda (en orden de prioridad):
 * 1. `currencyCode` del locale primario (directo del sistema)
 * 2. `languageCurrencyCode` (moneda asociada al idioma regional, ej: es-CO → COP)
 * 3. Mapeo por `regionCode` del dispositivo
 * 4. Mapeo por región extraída de `languageTag` (ej: "es-CO" → CO → COP)
 * 5. Recorrer todos los locales del dispositivo buscando una moneda soportada
 * 6. Default: USD
 */
export function detectDeviceLocale(): DetectedLocale {
  try {
    const locales = getLocales();
    const primaryLocale = locales[0];

    console.log("[locale] getLocales() full:", JSON.stringify(locales));

    if (!primaryLocale) {
      return {
        language: "es",
        currency: "USD",
        region: null,
        languageCode: "es",
      };
    }

    // --- Idioma ---
    const langCode = primaryLocale.languageCode?.toLowerCase() ?? "es";
    const language: Language = LANGUAGE_MAP[langCode] ?? "es";

    // --- Región ---
    // Prioridad: regionCode del dispositivo > languageRegionCode > languageTag parsing
    let region = primaryLocale.regionCode?.toUpperCase() ?? null;
    if (!region) {
      region = primaryLocale.languageRegionCode?.toUpperCase() ?? null;
    }
    if (!region && primaryLocale.languageTag) {
      region = extractRegionFromTag(primaryLocale.languageTag);
    }
    // Si aún no hay region, buscar en otros locales del dispositivo
    if (!region) {
      for (let i = 1; i < locales.length; i++) {
        const loc = locales[i];
        if (loc.regionCode) {
          region = loc.regionCode.toUpperCase();
          break;
        }
        if (loc.languageTag) {
          const r = extractRegionFromTag(loc.languageTag);
          if (r) {
            region = r;
            break;
          }
        }
      }
    }

    // --- Moneda ---
    let currency = "USD";

    // 1. currencyCode directo del locale primario
    const deviceCurrency = primaryLocale.currencyCode?.toUpperCase();
    if (deviceCurrency && SUPPORTED_CURRENCIES.includes(deviceCurrency)) {
      currency = deviceCurrency;
    }

    // 2. languageCurrencyCode (moneda del idioma-región, ej: es-CO → COP)
    if (currency === "USD") {
      const langCurrency = primaryLocale.languageCurrencyCode?.toUpperCase();
      if (
        langCurrency &&
        langCurrency !== "USD" &&
        SUPPORTED_CURRENCIES.includes(langCurrency)
      ) {
        currency = langCurrency;
      }
    }

    // 3. Mapeo por región
    if (currency === "USD" && region && REGION_CURRENCY_MAP[region]) {
      const mapped = REGION_CURRENCY_MAP[region];
      if (SUPPORTED_CURRENCIES.includes(mapped)) {
        currency = mapped;
      }
    }

    // 4. Buscar en otros locales del dispositivo
    if (currency === "USD") {
      for (let i = 1; i < locales.length; i++) {
        const loc = locales[i];
        const cc = loc.currencyCode?.toUpperCase();
        if (cc && cc !== "USD" && SUPPORTED_CURRENCIES.includes(cc)) {
          currency = cc;
          break;
        }
      }
    }

    console.log("[locale] detected:", {
      language,
      currency,
      region,
      langCode,
      deviceCurrency,
    });
    return { language, currency, region, languageCode: langCode };
  } catch (error) {
    console.error("[locale] detection error:", error);
    return {
      language: "es",
      currency: "USD",
      region: null,
      languageCode: "es",
    };
  }
}
