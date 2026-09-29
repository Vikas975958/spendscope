"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import {
  IoChevronBack,
  IoShareOutline,
  IoCopyOutline,
  IoCheckmark,
  IoCloseCircle,
} from "react-icons/io5";
import {
  HiMagnifyingGlass,
  HiXMark,
  HiChevronUpDown,
  HiCheck,
} from "react-icons/hi2";

const CORAL_COLOR = "#f06557";

// Comprehensive Country & Currency Registry
const COUNTRIES_REGISTRY = [
  {
    id: "in",
    country: "India",
    flag: "🇮🇳",
    formatName: "Indian Format",
    currencyCode: "INR",
    symbol: "₹",
    unitSingular: "Rupee",
    unitPlural: "Rupees",
    subunitSingular: "Paisa",
    subunitPlural: "Paise",
    system: "indian", // Lakhs & Crores
    popular: true,
  },
  {
    id: "us",
    country: "United States",
    flag: "🇺🇸",
    formatName: "US Format",
    currencyCode: "USD",
    symbol: "$",
    unitSingular: "Dollar",
    unitPlural: "Dollars",
    subunitSingular: "Cent",
    subunitPlural: "Cents",
    system: "international", // Millions & Billions
    popular: true,
  },
  {
    id: "gb",
    country: "United Kingdom",
    flag: "🇬🇧",
    formatName: "UK Format",
    currencyCode: "GBP",
    symbol: "£",
    unitSingular: "Pound",
    unitPlural: "Pounds",
    subunitSingular: "Penny",
    subunitPlural: "Pence",
    system: "international",
    popular: true,
  },
  {
    id: "eu",
    country: "Eurozone (European Union)",
    flag: "🇪🇺",
    formatName: "Euro Format",
    currencyCode: "EUR",
    symbol: "€",
    unitSingular: "Euro",
    unitPlural: "Euros",
    subunitSingular: "Cent",
    subunitPlural: "Cents",
    system: "international",
    popular: true,
  },
  {
    id: "ae",
    country: "United Arab Emirates",
    flag: "🇦🇪",
    formatName: "UAE Format",
    currencyCode: "AED",
    symbol: "AED",
    unitSingular: "UAE Dirham",
    unitPlural: "UAE Dirhams",
    subunitSingular: "Fils",
    subunitPlural: "Fils",
    system: "international",
    popular: true,
  },
  {
    id: "sa",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    formatName: "Saudi Format",
    currencyCode: "SAR",
    symbol: "SAR",
    unitSingular: "Saudi Riyal",
    unitPlural: "Saudi Riyals",
    subunitSingular: "Halala",
    subunitPlural: "Halalas",
    system: "international",
    popular: true,
  },
  {
    id: "ca",
    country: "Canada",
    flag: "🇨🇦",
    formatName: "Canada Format",
    currencyCode: "CAD",
    symbol: "C$",
    unitSingular: "Canadian Dollar",
    unitPlural: "Canadian Dollars",
    subunitSingular: "Cent",
    subunitPlural: "Cents",
    system: "international",
    popular: true,
  },
  {
    id: "au",
    country: "Australia",
    flag: "🇦🇺",
    formatName: "Australia Format",
    currencyCode: "AUD",
    symbol: "A$",
    unitSingular: "Australian Dollar",
    unitPlural: "Australian Dollars",
    subunitSingular: "Cent",
    subunitPlural: "Cents",
    system: "international",
    popular: true,
  },
  {
    id: "sg",
    country: "Singapore",
    flag: "🇸🇬",
    formatName: "Singapore Format",
    currencyCode: "SGD",
    symbol: "S$",
    unitSingular: "Singapore Dollar",
    unitPlural: "Singapore Dollars",
    subunitSingular: "Cent",
    subunitPlural: "Cents",
    system: "international",
    popular: true,
  },
  {
    id: "jp",
    country: "Japan",
    flag: "🇯🇵",
    formatName: "Japan Format",
    currencyCode: "JPY",
    symbol: "¥",
    unitSingular: "Japanese Yen",
    unitPlural: "Japanese Yen",
    subunitSingular: "Sen",
    subunitPlural: "Sen",
    system: "international",
    popular: true,
  },
  {
    id: "cn",
    country: "China",
    flag: "🇨🇳",
    formatName: "China Format",
    currencyCode: "CNY",
    symbol: "¥",
    unitSingular: "Chinese Yuan",
    unitPlural: "Chinese Yuan",
    subunitSingular: "Fen",
    subunitPlural: "Fen",
    system: "international",
    popular: true,
  },
  {
    id: "ch",
    country: "Switzerland",
    flag: "🇨🇭",
    formatName: "Swiss Format",
    currencyCode: "CHF",
    symbol: "CHF",
    unitSingular: "Swiss Franc",
    unitPlural: "Swiss Francs",
    subunitSingular: "Rappen",
    subunitPlural: "Rappen",
    system: "international",
    popular: false,
  },
  {
    id: "kw",
    country: "Kuwait",
    flag: "🇰🇼",
    formatName: "Kuwait Format",
    currencyCode: "KWD",
    symbol: "KWD",
    unitSingular: "Kuwaiti Dinar",
    unitPlural: "Kuwaiti Dinars",
    subunitSingular: "Fils",
    subunitPlural: "Fils",
    system: "international",
    popular: false,
  },
  {
    id: "qa",
    country: "Qatar",
    flag: "🇶🇦",
    formatName: "Qatar Format",
    currencyCode: "QAR",
    symbol: "QAR",
    unitSingular: "Qatari Riyal",
    unitPlural: "Qatari Riyals",
    subunitSingular: "Dirham",
    subunitPlural: "Dirhams",
    system: "international",
    popular: false,
  },
  {
    id: "om",
    country: "Oman",
    flag: "🇴🇲",
    formatName: "Oman Format",
    currencyCode: "OMR",
    symbol: "OMR",
    unitSingular: "Omani Rial",
    unitPlural: "Omani Rials",
    subunitSingular: "Baisa",
    subunitPlural: "Baisa",
    system: "international",
    popular: false,
  },
  {
    id: "bh",
    country: "Bahrain",
    flag: "🇧🇭",
    formatName: "Bahrain Format",
    currencyCode: "BHD",
    symbol: "BHD",
    unitSingular: "Bahraini Dinar",
    unitPlural: "Bahraini Dinars",
    subunitSingular: "Fils",
    subunitPlural: "Fils",
    system: "international",
    popular: false,
  },
  {
    id: "pk",
    country: "Pakistan",
    flag: "🇵🇰",
    formatName: "Pakistan Format",
    currencyCode: "PKR",
    symbol: "₨",
    unitSingular: "Pakistani Rupee",
    unitPlural: "Pakistani Rupees",
    subunitSingular: "Paisa",
    subunitPlural: "Paisa",
    system: "indian",
    popular: false,
  },
  {
    id: "bd",
    country: "Bangladesh",
    flag: "🇧🇩",
    formatName: "Bangladesh Format",
    currencyCode: "BDT",
    symbol: "৳",
    unitSingular: "Bangladeshi Taka",
    unitPlural: "Bangladeshi Taka",
    subunitSingular: "Poisha",
    subunitPlural: "Poisha",
    system: "indian",
    popular: false,
  },
  {
    id: "np",
    country: "Nepal",
    flag: "🇳🇵",
    formatName: "Nepal Format",
    currencyCode: "NPR",
    symbol: "रू",
    unitSingular: "Nepalese Rupee",
    unitPlural: "Nepalese Rupees",
    subunitSingular: "Paisa",
    subunitPlural: "Paisa",
    system: "indian",
    popular: false,
  },
  {
    id: "lk",
    country: "Sri Lanka",
    flag: "🇱🇰",
    formatName: "Sri Lanka Format",
    currencyCode: "LKR",
    symbol: "Rs",
    unitSingular: "Sri Lankan Rupee",
    unitPlural: "Sri Lankan Rupees",
    subunitSingular: "Cent",
    subunitPlural: "Cents",
    system: "indian",
    popular: false,
  },
  {
    id: "my",
    country: "Malaysia",
    flag: "🇲🇾",
    formatName: "Malaysia Format",
    currencyCode: "MYR",
    symbol: "RM",
    unitSingular: "Malaysian Ringgit",
    unitPlural: "Malaysian Ringgit",
    subunitSingular: "Sen",
    subunitPlural: "Sen",
    system: "international",
    popular: false,
  },
  {
    id: "id",
    country: "Indonesia",
    flag: "🇮🇩",
    formatName: "Indonesia Format",
    currencyCode: "IDR",
    symbol: "Rp",
    unitSingular: "Indonesian Rupiah",
    unitPlural: "Indonesian Rupiah",
    subunitSingular: "Sen",
    subunitPlural: "Sen",
    system: "international",
    popular: false,
  },
  {
    id: "ph",
    country: "Philippines",
    flag: "🇵🇭",
    formatName: "Philippines Format",
    currencyCode: "PHP",
    symbol: "₱",
    unitSingular: "Philippine Peso",
    unitPlural: "Philippine Pesos",
    subunitSingular: "Sentimo",
    subunitPlural: "Sentimo",
    system: "international",
    popular: false,
  },
  {
    id: "th",
    country: "Thailand",
    flag: "🇹🇭",
    formatName: "Thailand Format",
    currencyCode: "THB",
    symbol: "฿",
    unitSingular: "Thai Baht",
    unitPlural: "Thai Baht",
    subunitSingular: "Satang",
    subunitPlural: "Satang",
    system: "international",
    popular: false,
  },
  {
    id: "vn",
    country: "Vietnam",
    flag: "🇻🇳",
    formatName: "Vietnam Format",
    currencyCode: "VND",
    symbol: "₫",
    unitSingular: "Vietnamese Dong",
    unitPlural: "Vietnamese Dong",
    subunitSingular: "Xu",
    subunitPlural: "Xu",
    system: "international",
    popular: false,
  },
  {
    id: "kr",
    country: "South Korea",
    flag: "🇰🇷",
    formatName: "Korea Format",
    currencyCode: "KRW",
    symbol: "₩",
    unitSingular: "South Korean Won",
    unitPlural: "South Korean Won",
    subunitSingular: "Jeon",
    subunitPlural: "Jeon",
    system: "international",
    popular: false,
  },
  {
    id: "za",
    country: "South Africa",
    flag: "🇿🇦",
    formatName: "South Africa Format",
    currencyCode: "ZAR",
    symbol: "R",
    unitSingular: "South African Rand",
    unitPlural: "South African Rand",
    subunitSingular: "Cent",
    subunitPlural: "Cents",
    system: "international",
    popular: false,
  },
  {
    id: "ng",
    country: "Nigeria",
    flag: "🇳🇬",
    formatName: "Nigeria Format",
    currencyCode: "NGN",
    symbol: "₦",
    unitSingular: "Nigerian Naira",
    unitPlural: "Nigerian Naira",
    subunitSingular: "Kobo",
    subunitPlural: "Kobo",
    system: "international",
    popular: false,
  },
  {
    id: "ke",
    country: "Kenya",
    flag: "🇰🇪",
    formatName: "Kenya Format",
    currencyCode: "KES",
    symbol: "KSh",
    unitSingular: "Kenyan Shilling",
    unitPlural: "Kenyan Shillings",
    subunitSingular: "Cent",
    subunitPlural: "Cents",
    system: "international",
    popular: false,
  },
  {
    id: "eg",
    country: "Egypt",
    flag: "🇪🇬",
    formatName: "Egypt Format",
    currencyCode: "EGP",
    symbol: "E£",
    unitSingular: "Egyptian Pound",
    unitPlural: "Egyptian Pounds",
    subunitSingular: "Piastre",
    subunitPlural: "Piastres",
    system: "international",
    popular: false,
  },
  {
    id: "br",
    country: "Brazil",
    flag: "🇧🇷",
    formatName: "Brazil Format",
    currencyCode: "BRL",
    symbol: "R$",
    unitSingular: "Brazilian Real",
    unitPlural: "Brazilian Reais",
    subunitSingular: "Centavo",
    subunitPlural: "Centavos",
    system: "international",
    popular: false,
  },
  {
    id: "mx",
    country: "Mexico",
    flag: "🇲🇽",
    formatName: "Mexico Format",
    currencyCode: "MXN",
    symbol: "Mex$",
    unitSingular: "Mexican Peso",
    unitPlural: "Mexican Pesos",
    subunitSingular: "Centavo",
    subunitPlural: "Centavos",
    system: "international",
    popular: false,
  },
  {
    id: "ru",
    country: "Russia",
    flag: "🇷🇺",
    formatName: "Russia Format",
    currencyCode: "RUB",
    symbol: "₽",
    unitSingular: "Russian Ruble",
    unitPlural: "Russian Rubles",
    subunitSingular: "Kopek",
    subunitPlural: "Kopeks",
    system: "international",
    popular: false,
  },
  {
    id: "tr",
    country: "Turkey",
    flag: "🇹🇷",
    formatName: "Turkey Format",
    currencyCode: "TRY",
    symbol: "₺",
    unitSingular: "Turkish Lira",
    unitPlural: "Turkish Lira",
    subunitSingular: "Kurus",
    subunitPlural: "Kurus",
    system: "international",
    popular: false,
  },
  {
    id: "nz",
    country: "New Zealand",
    flag: "🇳🇿",
    formatName: "New Zealand Format",
    currencyCode: "NZD",
    symbol: "NZ$",
    unitSingular: "New Zealand Dollar",
    unitPlural: "New Zealand Dollars",
    subunitSingular: "Cent",
    subunitPlural: "Cents",
    system: "international",
    popular: false,
  },
  {
    id: "hk",
    country: "Hong Kong",
    flag: "🇭🇰",
    formatName: "Hong Kong Format",
    currencyCode: "HKD",
    symbol: "HK$",
    unitSingular: "Hong Kong Dollar",
    unitPlural: "Hong Kong Dollars",
    subunitSingular: "Cent",
    subunitPlural: "Cents",
    system: "international",
    popular: false,
  },
  {
    id: "se",
    country: "Sweden",
    flag: "🇸🇪",
    formatName: "Sweden Format",
    currencyCode: "SEK",
    symbol: "kr",
    unitSingular: "Swedish Krona",
    unitPlural: "Swedish Kronor",
    subunitSingular: "Ore",
    subunitPlural: "Ore",
    system: "international",
    popular: false,
  },
  {
    id: "no",
    country: "Norway",
    flag: "🇳🇴",
    formatName: "Norway Format",
    currencyCode: "NOK",
    symbol: "kr",
    unitSingular: "Norwegian Krone",
    unitPlural: "Norwegian Kroner",
    subunitSingular: "Ore",
    subunitPlural: "Ore",
    system: "international",
    popular: false,
  },
  {
    id: "dk",
    country: "Denmark",
    flag: "🇩🇰",
    formatName: "Denmark Format",
    currencyCode: "DKK",
    symbol: "kr",
    unitSingular: "Danish Krone",
    unitPlural: "Danish Kroner",
    subunitSingular: "Ore",
    subunitPlural: "Ore",
    system: "international",
    popular: false,
  },
  {
    id: "pl",
    country: "Poland",
    flag: "🇵🇱",
    formatName: "Poland Format",
    currencyCode: "PLN",
    symbol: "zł",
    unitSingular: "Polish Zloty",
    unitPlural: "Polish Zlotys",
    subunitSingular: "Grosz",
    subunitPlural: "Groszy",
    system: "international",
    popular: false,
  },
  {
    id: "il",
    country: "Israel",
    flag: "🇮🇱",
    formatName: "Israel Format",
    currencyCode: "ILS",
    symbol: "₪",
    unitSingular: "Israeli Shekel",
    unitPlural: "Israeli Shekels",
    subunitSingular: "Agora",
    subunitPlural: "Agorot",
    system: "international",
    popular: false,
  },
  {
    id: "ar",
    country: "Argentina",
    flag: "🇦🇷",
    formatName: "Argentina Format",
    currencyCode: "ARS",
    symbol: "ARS$",
    unitSingular: "Argentine Peso",
    unitPlural: "Argentine Pesos",
    subunitSingular: "Centavo",
    subunitPlural: "Centavos",
    system: "international",
    popular: false,
  },
  {
    id: "cl",
    country: "Chile",
    flag: "🇨🇱",
    formatName: "Chile Format",
    currencyCode: "CLP",
    symbol: "CLP$",
    unitSingular: "Chilean Peso",
    unitPlural: "Chilean Pesos",
    subunitSingular: "Centavo",
    subunitPlural: "Centavos",
    system: "international",
    popular: false,
  },
  {
    id: "co",
    country: "Colombia",
    flag: "🇨🇴",
    formatName: "Colombia Format",
    currencyCode: "COP",
    symbol: "COL$",
    unitSingular: "Colombian Peso",
    unitPlural: "Colombian Pesos",
    subunitSingular: "Centavo",
    subunitPlural: "Centavos",
    system: "international",
    popular: false,
  },
  {
    id: "pe",
    country: "Peru",
    flag: "🇵🇪",
    formatName: "Peru Format",
    currencyCode: "PEN",
    symbol: "S/.",
    unitSingular: "Peruvian Sol",
    unitPlural: "Peruvian Soles",
    subunitSingular: "Centimo",
    subunitPlural: "Centimos",
    system: "international",
    popular: false,
  },
  {
    id: "gh",
    country: "Ghana",
    flag: "🇬🇭",
    formatName: "Ghana Format",
    currencyCode: "GHS",
    symbol: "GH₵",
    unitSingular: "Ghanaian Cedi",
    unitPlural: "Ghanaian Cedis",
    subunitSingular: "Pesewa",
    subunitPlural: "Pesewas",
    system: "international",
    popular: false,
  },
  {
    id: "ma",
    country: "Morocco",
    flag: "🇲🇦",
    formatName: "Morocco Format",
    currencyCode: "MAD",
    symbol: "MAD",
    unitSingular: "Moroccan Dirham",
    unitPlural: "Moroccan Dirhams",
    subunitSingular: "Centime",
    subunitPlural: "Centimes",
    system: "international",
    popular: false,
  },
];

// Vocabulary for number to words conversion
const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

// Helper to convert small integer (< 1000) to words
function convertThreeDigit(n) {
  let str = "";
  const hundred = Math.floor(n / 100);
  const remainder = n % 100;

  if (hundred > 0) {
    str += ONES[hundred] + " Hundred";
    if (remainder > 0) str += " ";
  }

  if (remainder > 0) {
    if (remainder < 20) {
      str += ONES[remainder];
    } else {
      const ten = Math.floor(remainder / 10);
      const unit = remainder % 10;
      str += TENS[ten] + (unit > 0 ? " " + ONES[unit] : "");
    }
  }

  return str.trim();
}

// Helper to convert small integer (< 100) to words
function convertTwoDigit(n) {
  if (n <= 0) return "";
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const unit = n % 10;
  return TENS[ten] + (unit > 0 ? " " + ONES[unit] : "");
}

// Convert BigInt / integer part using Indian System (Lakhs & Crores)
function integerToIndianWords(numStr) {
  // Strip non-digits and leading zeros
  const clean = numStr.replace(/^0+/, "") || "0";
  if (clean === "0") return "Zero";

  try {
    let n = BigInt(clean);
    if (n === 0n) return "Zero";

    // Split into Indian chunks: last 3 digits, then groups of 2 digits
    const parts = [];

    const hundredPart = Number(n % 1000n);
    n = n / 1000n;
    if (hundredPart > 0) {
      parts.push(convertThreeDigit(hundredPart));
    }

    const units = [
      { name: "Thousand", mod: 100n },
      { name: "Lakh", mod: 100n },
      { name: "Crore", mod: 100n },
      { name: "Arab", mod: 100n },
      { name: "Kharab", mod: 100n },
      { name: "Nil", mod: 100n },
      { name: "Padma", mod: 100n },
      { name: "Shankh", mod: 100n },
    ];

    let unitIdx = 0;
    while (n > 0n && unitIdx < units.length) {
      const unitInfo = units[unitIdx];
      const chunk = Number(n % unitInfo.mod);
      n = n / unitInfo.mod;
      if (chunk > 0) {
        parts.unshift(`${convertTwoDigit(chunk)} ${unitInfo.name}`);
      }
      unitIdx++;
    }

    // In case number is even larger than Shankh
    if (n > 0n) {
      parts.unshift(`${convertTwoDigit(Number(n))} Super Crore`);
    }

    return parts.filter(Boolean).join(" ");
  } catch {
    return "Number too large";
  }
}

// Convert BigInt / integer part using International System (Millions & Billions)
function integerToInternationalWords(numStr) {
  const clean = numStr.replace(/^0+/, "") || "0";
  if (clean === "0") return "Zero";

  try {
    let n = BigInt(clean);
    if (n === 0n) return "Zero";

    const scales = [
      "",
      "Thousand",
      "Million",
      "Billion",
      "Trillion",
      "Quadrillion",
      "Quintillion",
      "Sextillion",
    ];

    const parts = [];
    let scaleIdx = 0;

    while (n > 0n && scaleIdx < scales.length) {
      const chunk = Number(n % 1000n);
      n = n / 1000n;
      if (chunk > 0) {
        const chunkWords = convertThreeDigit(chunk);
        const scaleName = scales[scaleIdx];
        parts.unshift(scaleName ? `${chunkWords} ${scaleName}` : chunkWords);
      }
      scaleIdx++;
    }

    if (n > 0n) {
      parts.unshift(`${convertThreeDigit(Number(n))} Zillion`);
    }

    return parts.filter(Boolean).join(" ");
  } catch {
    return "Number too large";
  }
}

// Format number with commas according to system
function formatAmountNumber(valStr, system = "international", decimals = 2) {
  if (!valStr || isNaN(Number(valStr))) return "0";
  const num = Number(valStr);
  const locale = system === "indian" ? "en-IN" : "en-US";

  // Check if valStr has decimal
  if (valStr.includes(".")) {
    const parts = valStr.split(".");
    const intPart = BigInt(parts[0] || "0");
    const intFormatted = intPart.toLocaleString(locale);
    const decFormatted = (parts[1] || "").slice(0, 2).padEnd(2, "0");
    return `${intFormatted}.${decFormatted}`;
  }

  return num.toLocaleString(locale);
}

// Master function to convert amount string into country currency words
function convertAmountToWords(amountStr, countryConfig, withOnlySuffix = false) {
  if (!amountStr || amountStr.trim() === "") {
    return `Zero ${countryConfig.unitPlural}${withOnlySuffix ? " Only" : ""}`;
  }

  // Clean input string
  const cleanInput = amountStr.replace(/,/g, "").trim();
  if (isNaN(Number(cleanInput))) {
    return "Invalid Number";
  }

  const parts = cleanInput.split(".");
  const integerPart = parts[0] || "0";
  let fractionPart = parts[1] ? parts[1].slice(0, 2) : "";

  // Normalize fraction to 2 digits if 1 digit provided
  if (fractionPart.length === 1) {
    fractionPart += "0";
  }

  const isIndian = countryConfig.system === "indian";
  const integerWords = isIndian
    ? integerToIndianWords(integerPart)
    : integerToInternationalWords(integerPart);

  // Check singular vs plural for main unit
  let isOneUnit = false;
  try {
    isOneUnit = BigInt(integerPart || "0") === 1n;
  } catch {
    isOneUnit = false;
  }
  const mainUnit = isOneUnit ? countryConfig.unitSingular : countryConfig.unitPlural;

  // Process fraction / sub-unit (cents, paise, fils, pence, etc.)
  let fractionWords = "";
  if (fractionPart && fractionPart !== "00") {
    const fractionNum = parseInt(fractionPart, 10);
    if (fractionNum > 0) {
      const fracWord = convertTwoDigit(fractionNum);
      const isOneSub = fractionNum === 1;
      const subUnit = isOneSub
        ? countryConfig.subunitSingular
        : countryConfig.subunitPlural;
      fractionWords = `${fracWord} ${subUnit}`;
    }
  }

  let finalWords = "";
  const isZeroInteger = integerWords === "Zero" || !integerWords;

  if (isZeroInteger && fractionWords) {
    finalWords = fractionWords;
  } else if (!isZeroInteger && fractionWords) {
    finalWords = `${integerWords} ${mainUnit} and ${fractionWords}`;
  } else {
    finalWords = `${integerWords} ${mainUnit}`;
  }

  if (withOnlySuffix) {
    finalWords += " Only";
  }

  return finalWords.trim();
}

const AmountToWord = ({ showBack = true }) => {
  const router = useRouter();

  // Dynamic Theme Integration
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;

  const primaryColor =
    currentTheme?.colors?.primary ||
    themeState?.colors?.primary ||
    defaultTheme?.colors?.primary ||
    CORAL_COLOR;

  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  // Form input states
  const [amount, setAmount] = useState("10");
  const [selectedCountryId, setSelectedCountryId] = useState("all"); // 'all' or country id
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [withOnlySuffix, setWithOnlySuffix] = useState(false);
  const [allCountriesCardFilter, setAllCountriesCardFilter] = useState("");

  // Feedback states
  const [copiedKey, setCopiedKey] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const searchInputRef = useRef(null);

  // Quick Amount additions
  const handleAddAmount = (addVal) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  // Trigger feedback toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2200);
  };

  // Copy to clipboard
  const handleCopy = async (text, key) => {
    if (!text) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        triggerToast("Copied to clipboard!");
        setTimeout(() => setCopiedKey(null), 1800);
      }
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // Share calculation
  const handleShare = async (title, text) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Amount to Word",
          text: text,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share error:", err);
        }
      }
    }
    // Fallback to copy
    handleCopy(text, "shared");
  };

  // Filter countries for modal
  const filteredCountries = useMemo(() => {
    const q = countrySearchQuery.toLowerCase().trim();
    if (!q) return COUNTRIES_REGISTRY;
    return COUNTRIES_REGISTRY.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.currencyCode.toLowerCase().includes(q) ||
        c.formatName.toLowerCase().includes(q) ||
        c.unitPlural.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [countrySearchQuery]);

  // Selected country object
  const currentCountryConfig = useMemo(() => {
    if (selectedCountryId === "all") return null;
    return (
      COUNTRIES_REGISTRY.find((c) => c.id === selectedCountryId) ||
      COUNTRIES_REGISTRY[0]
    );
  }, [selectedCountryId]);

  // When viewing "All Countries", list of cards to display
  const allCountriesToDisplay = useMemo(() => {
    if (!allCountriesCardFilter.trim()) {
      return COUNTRIES_REGISTRY;
    }
    const q = allCountriesCardFilter.toLowerCase().trim();
    return COUNTRIES_REGISTRY.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.currencyCode.toLowerCase().includes(q) ||
        c.formatName.toLowerCase().includes(q)
    );
  }, [allCountriesCardFilter]);

  // Focus modal search when modal opens
  useEffect(() => {
    if (isCountryModalOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isCountryModalOpen]);

  // Theme styling helpers
  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200/80";
  const labelColor = isDark ? "text-slate-300" : "text-gray-800";
  const titleColor = isDark ? "text-white" : "text-gray-900";
  const subtextColor = isDark ? "text-slate-400" : "text-gray-500";

  return (
    <div className="w-full max-w-[480px] mx-auto pb-16 px-3 sm:px-0 transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-xs flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
          <IoCheckmark className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar matching the reference UI */}
      <div className="grid grid-cols-[80px_1fr_80px] items-center py-2.5 mb-2">
        <div className="flex justify-start">
          {showBack ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-0.5 text-[#f06557] hover:opacity-80 transition-opacity font-medium text-sm sm:text-base cursor-pointer"
            >
              <IoChevronBack className="w-5 h-5 text-[#f06557]" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-5" />
          )}
        </div>

        <div className="text-center">
          <h1 className={`text-base sm:text-lg font-bold tracking-tight whitespace-nowrap ${titleColor}`}>
            Amount to Word
          </h1>
        </div>

        <div className="flex justify-end">
          {/* Suffix toggle button ("Only") */}
          <button
            type="button"
            onClick={() => setWithOnlySuffix((prev) => !prev)}
            title="Toggle 'Only' suffix"
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
              withOnlySuffix
                ? "bg-[#f06557]/10 border-[#f06557] text-[#f06557]"
                : isDark
                ? "bg-[#1f1e2e] border-[#2c2b3e] text-slate-400"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            {withOnlySuffix ? "+ Only" : "No 'Only'"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col space-y-4">
        {/* Amount Input Card matching the screenshot */}
        <div
          className={`rounded-2xl border px-4 py-3.5 flex items-center justify-between shadow-xs transition-colors ${cardBg} ${cardBorder}`}
        >
          <label className="text-base font-bold text-gray-900 dark:text-white shrink-0 pr-3">
            Amount
          </label>

          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              // Allow numbers and single decimal point
              const val = e.target.value.replace(/[^0-9.]/g, "");
              // prevent multiple dots
              if ((val.match(/\./g) || []).length <= 1) {
                setAmount(val);
              }
            }}
            placeholder="0"
            className="w-full bg-transparent text-left sm:text-left text-base sm:text-lg font-semibold text-gray-900 dark:text-white focus:outline-none"
          />

          {amount && (
            <button
              type="button"
              onClick={() => setAmount("")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 ml-2 cursor-pointer transition-colors"
              title="Clear input"
            >
              <IoCloseCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Amount Increment Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium shrink-0 mr-1">
            Quick add:
          </span>
          {[100, 1000, 10000, 100000, 1000000].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleAddAmount(val)}
              className={`px-2.5 py-1 rounded-full font-medium shrink-0 border transition-all text-[11px] cursor-pointer active:scale-95 ${
                isDark
                  ? "bg-[#181726] border-[#29283e] text-slate-300 hover:border-slate-500"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-400 shadow-2xs"
              }`}
            >
              +{val >= 100000 ? `${val / 100000}L` : val >= 1000 ? `${val / 1000}k` : val}
            </button>
          ))}
        </div>

        {/* Country Selector Header & Quick Chips */}
        <div className="flex flex-col space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Country & Currency
            </span>

            <button
              type="button"
              onClick={() => setIsCountryModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#f06557] hover:underline cursor-pointer"
            >
              <span>Select Country</span>
              <HiChevronUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Country Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {/* "All Countries" Chip */}
            <button
              type="button"
              onClick={() => setSelectedCountryId("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 cursor-pointer ${
                selectedCountryId === "all"
                  ? "bg-[#f06557] border-[#f06557] text-white shadow-xs"
                  : isDark
                  ? "bg-[#161522] border-[#232234] text-slate-300 hover:border-slate-600"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 shadow-2xs"
              }`}
            >
              <span>🌐</span>
              <span>All Countries</span>
            </button>

            {/* Popular country chips */}
            {COUNTRIES_REGISTRY.filter((c) => c.popular).map((country) => {
              const isSelected = selectedCountryId === country.id;
              return (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => setSelectedCountryId(country.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#f06557] border-[#f06557] text-white font-bold shadow-xs"
                      : isDark
                      ? "bg-[#161522] border-[#232234] text-slate-300 hover:border-slate-600"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 shadow-2xs"
                  }`}
                >
                  <span>{country.flag}</span>
                  <span>{country.country}</span>
                </button>
              );
            })}

            {/* More button */}
            <button
              type="button"
              onClick={() => setIsCountryModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                isDark
                  ? "bg-[#1e1d2e] border-[#2b2a3f] text-slate-300 hover:text-white"
                  : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              + More...
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: SINGLE SELECTED COUNTRY VIEW                                      */}
        {/* ========================================================================= */}
        {selectedCountryId !== "all" && currentCountryConfig && (
          <div className="flex flex-col space-y-4 animate-in fade-in duration-200">
            {/* Primary Format Card (Matching Image Style) */}
            {(() => {
              const words = convertAmountToWords(amount, currentCountryConfig, withOnlySuffix);
              const formattedFigure = formatAmountNumber(
                amount,
                currentCountryConfig.system
              );
              const copyText = words;
              const isCopied = copiedKey === `main-${currentCountryConfig.id}`;

              return (
                <div
                  className={`rounded-2xl border p-5 shadow-xs transition-colors ${cardBg} ${cardBorder}`}
                >
                  {/* Top Bar: Country Format Label + Copy & Share */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{currentCountryConfig.flag}</span>
                      <span className={`text-base font-semibold ${subtextColor}`}>
                        {currentCountryConfig.formatName}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                        {currentCountryConfig.currencyCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCopy(copyText, `main-${currentCountryConfig.id}`)}
                        className="text-gray-500 hover:text-[#f06557] dark:text-slate-400 dark:hover:text-[#f06557] transition-colors p-1 cursor-pointer"
                        title="Copy words"
                      >
                        {isCopied ? (
                          <IoCheckmark className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <IoCopyOutline className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleShare(
                            `${currentCountryConfig.formatName}: ${currentCountryConfig.symbol} ${formattedFigure}`,
                            `${currentCountryConfig.symbol} ${formattedFigure} = ${words}`
                          )
                        }
                        className="text-gray-500 hover:text-[#f06557] dark:text-slate-400 dark:hover:text-[#f06557] transition-colors p-1 cursor-pointer"
                        title="Share words"
                      >
                        <IoShareOutline className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Center: Amount & Word Text */}
                  <div className="flex flex-col items-center justify-center text-center py-2">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#f06557] tracking-tight mb-2">
                      {currentCountryConfig.symbol} {formattedFigure}
                    </div>

                    <div className="text-base sm:text-lg font-medium text-gray-900 dark:text-slate-100 px-2 max-w-sm leading-snug">
                      {words}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Word Variations Card (Cheque, Uppercase, Title Case) */}
            {(() => {
              const baseWords = convertAmountToWords(amount, currentCountryConfig, false);
              const withOnly = convertAmountToWords(amount, currentCountryConfig, true);
              const uppercaseWords = withOnly.toUpperCase();
              const lowercaseWords = withOnly.toLowerCase();

              const variations = [
                { label: "Cheque / Invoice Format (UPPERCASE)", text: uppercaseWords, key: "upper" },
                { label: "Standard with 'Only'", text: withOnly, key: "withOnly" },
                { label: "Title Case", text: baseWords, key: "title" },
                { label: "lowercase", text: lowercaseWords, key: "lower" },
              ];

              return (
                <div
                  className={`rounded-2xl border p-4 sm:p-5 shadow-xs space-y-3.5 ${cardBg} ${cardBorder}`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Ready-to-use Formats
                    </h3>
                    <span className="text-[11px] text-gray-400">Click to copy</span>
                  </div>

                  <div className="flex flex-col space-y-2.5">
                    {variations.map((item) => {
                      const isItemCopied = copiedKey === item.key;
                      return (
                        <div
                          key={item.key}
                          onClick={() => handleCopy(item.text, item.key)}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                            isDark
                              ? "bg-[#100f1a] border-[#222135] hover:border-slate-600"
                              : "bg-gray-50 border-gray-200/70 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                              {item.label}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {item.text}
                            </span>
                          </div>

                          <div className="shrink-0 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-2xs">
                            {isItemCopied ? (
                              <IoCheckmark className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <IoCopyOutline className="w-4 h-4 text-gray-500 dark:text-slate-300" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Currency Details Card */}
            <div
              className={`rounded-2xl border p-4 shadow-xs text-xs space-y-2.5 ${cardBg} ${cardBorder}`}
            >
              <h4 className="font-bold text-gray-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                <span>{currentCountryConfig.flag}</span>
                <span>Currency Information</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-slate-400">
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80">
                  <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                    Main Unit
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-slate-200 text-xs">
                    {currentCountryConfig.unitSingular} / {currentCountryConfig.unitPlural}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80">
                  <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                    Sub-unit (Decimal)
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-slate-200 text-xs">
                    {currentCountryConfig.subunitSingular} / {currentCountryConfig.subunitPlural}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80">
                  <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                    Number System
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-slate-200 text-xs capitalize">
                    {currentCountryConfig.system === "indian"
                      ? "Lakhs & Crores"
                      : "Millions & Billions"}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80">
                  <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                    Currency Symbol
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-slate-200 text-xs">
                    {currentCountryConfig.symbol} ({currentCountryConfig.currencyCode})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ALL COUNTRIES LIST (Starting with Indian & US Format like photo)  */}
        {/* ========================================================================= */}
        {selectedCountryId === "all" && (
          <div className="flex flex-col space-y-4 animate-in fade-in duration-200">
            {/* Filter bar for the All Countries list */}
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={allCountriesCardFilter}
                onChange={(e) => setAllCountriesCardFilter(e.target.value)}
                placeholder="Search formats (e.g. US, UK, Euro, Arab, Yen)..."
                className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                  isDark
                    ? "bg-[#161522] border-[#232234] text-white focus:border-slate-500"
                    : "bg-white border-gray-200 text-gray-900 focus:border-gray-400 shadow-2xs"
                }`}
              />
              {allCountriesCardFilter && (
                <button
                  type="button"
                  onClick={() => setAllCountriesCardFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <HiXMark className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* List of Format Cards matching the exact style of the user screenshot */}
            <div className="flex flex-col space-y-3.5">
              {allCountriesToDisplay.map((country) => {
                const words = convertAmountToWords(amount, country, withOnlySuffix);
                const formattedNum = formatAmountNumber(amount, country.system);
                const isCopied = copiedKey === `card-${country.id}`;

                return (
                  <div
                    key={country.id}
                    className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition-all hover:shadow-md ${cardBg} ${cardBorder}`}
                  >
                    {/* Top row: Format Name on Left, Copy & Share on Right */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{country.flag}</span>
                        <span className={`text-base font-semibold ${subtextColor}`}>
                          {country.formatName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleCopy(words, `card-${country.id}`)}
                          className="text-gray-500 hover:text-[#f06557] dark:text-slate-400 dark:hover:text-[#f06557] transition-colors p-1 cursor-pointer"
                          title={`Copy ${country.formatName} words`}
                        >
                          {isCopied ? (
                            <IoCheckmark className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <IoCopyOutline className="w-5 h-5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleShare(
                              `${country.formatName}: ${country.symbol} ${formattedNum}`,
                              `${country.symbol} ${formattedNum} = ${words}`
                            )
                          }
                          className="text-gray-500 hover:text-[#f06557] dark:text-slate-400 dark:hover:text-[#f06557] transition-colors p-1 cursor-pointer"
                          title={`Share ${country.formatName}`}
                        >
                          <IoShareOutline className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Center: Currency Symbol + Amount, followed by words */}
                    <div className="flex flex-col items-center justify-center text-center py-1">
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#f06557] tracking-tight mb-1">
                        {country.symbol} {formattedNum}
                      </div>

                      <div className="text-base sm:text-lg font-medium text-gray-900 dark:text-slate-100 max-w-sm leading-snug">
                        {words}
                      </div>
                    </div>
                  </div>
                );
              })}

              {allCountriesToDisplay.length === 0 && (
                <div
                  className={`p-8 text-center rounded-2xl border text-sm ${cardBg} ${cardBorder} text-gray-500`}
                >
                  No country formats found matching &ldquo;{allCountriesCardFilter}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* COUNTRY SELECTION MODAL                                                   */}
      {/* ========================================================================= */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className={`w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl border flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isDark ? "bg-[#13121d] border-[#29283e] text-white" : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Select Country
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Choose a country to convert amounts into words
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCountryModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={countrySearchQuery}
                  onChange={(e) => setCountrySearchQuery(e.target.value)}
                  placeholder="Search country, currency, or code (e.g. INR, Euro, UAE)..."
                  className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none transition-all ${
                    isDark
                      ? "bg-[#1b1a29] border-[#2c2b3e] text-white focus:border-slate-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400"
                  }`}
                />
                {countrySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCountrySearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    <HiXMark className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Country List */}
            <div className="overflow-y-auto p-2 flex flex-col space-y-1 divide-y divide-gray-100/60 dark:divide-slate-800/60">
              {/* Option: All Countries */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCountryId("all");
                  setIsCountryModalOpen(false);
                }}
                className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                  selectedCountryId === "all"
                    ? "bg-[#f06557]/10 text-[#f06557] font-bold"
                    : isDark
                    ? "hover:bg-[#1c1b2b] text-slate-200"
                    : "hover:bg-gray-50 text-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="text-sm font-bold">All Countries</div>
                    <div className="text-xs text-gray-400 dark:text-slate-400">
                      Show side-by-side cards for all formats
                    </div>
                  </div>
                </div>

                {selectedCountryId === "all" && (
                  <HiCheck className="w-5 h-5 text-[#f06557]" />
                )}
              </button>

              {/* Country options */}
              {filteredCountries.map((country) => {
                const isSelected = selectedCountryId === country.id;
                return (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => {
                      setSelectedCountryId(country.id);
                      setIsCountryModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#f06557]/10 text-[#f06557] font-bold"
                        : isDark
                        ? "hover:bg-[#1c1b2b] text-slate-200"
                        : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <div className="text-sm font-bold flex items-center gap-1.5">
                          <span>{country.country}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                            {country.currencyCode}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-slate-400">
                          {country.unitPlural} ({country.symbol}) •{" "}
                          {country.system === "indian"
                            ? "Lakhs & Crores"
                            : "Millions & Billions"}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <HiCheck className="w-5 h-5 text-[#f06557]" />
                    )}
                  </button>
                );
              })}

              {filteredCountries.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">
                  No countries matching &ldquo;{countrySearchQuery}&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmountToWord;
