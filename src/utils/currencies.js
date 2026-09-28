export const CURRENCIES = [
  {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    flag: "🇮🇳",
    locale: "en-IN",
  },
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    locale: "en-US",
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
    locale: "de-DE",
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    locale: "en-GB",
  },
  {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    flag: "🇦🇪",
    locale: "ar-AE",
  },
  {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    locale: "en-CA",
  },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    flag: "🇦🇺",
    locale: "en-AU",
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    flag: "🇯🇵",
    locale: "ja-JP",
  },
  {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    flag: "🇸🇬",
    locale: "en-SG",
  },
];

export const DEFAULT_CURRENCY = CURRENCIES[0]; // INR ₹

export const getCurrencySymbol = (currencyCode = "INR") => {
  const found = CURRENCIES.find(
    (c) => c.code?.toUpperCase() === String(currencyCode)?.toUpperCase()
  );
  return found ? found.symbol : "₹";
};

export const getCurrencyConfig = (currencyCode = "INR") => {
  return (
    CURRENCIES.find(
      (c) => c.code?.toUpperCase() === String(currencyCode)?.toUpperCase()
    ) || DEFAULT_CURRENCY
  );
};
