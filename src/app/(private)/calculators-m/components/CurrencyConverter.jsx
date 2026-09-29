"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import {
  IoChevronBack,
  IoChevronDown,
  IoSwapVertical,
  IoSearchOutline,
  IoClose,
  IoCheckmark,
} from "react-icons/io5";

const CORAL_COLOR = "#f06557";
const ORANGE_COLOR = "#f97316";

// Comprehensive currency list with flags and names
const CURRENCY_LIST = [
  { code: "USD", name: "United States Dollar", symbol: "$", flag: "🇺🇸", rate: 1.0 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", rate: 86.5 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rate: 0.92 },
  { code: "GBP", name: "British Pound Sterling", symbol: "£", flag: "🇬🇧", rate: 0.79 },
  { code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ", flag: "🇦🇪", rate: 3.67 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", rate: 1.39 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", rate: 1.54 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", rate: 153.2 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", rate: 1.34 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", rate: 0.89 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", rate: 7.24 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", rate: 1.68 },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦", rate: 3.75 },
  { code: "QAR", name: "Qatari Riyal", symbol: "QR", flag: "🇶🇦", rate: 3.64 },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD", flag: "🇰🇼", rate: 0.31 },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BD", flag: "🇧🇭", rate: 0.38 },
  { code: "OMR", name: "Omani Rial", symbol: "OMR", flag: "🇴🇲", rate: 0.385 },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", rate: 18.25 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", rate: 5.75 },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺", rate: 96.5 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷", rate: 1395.0 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", rate: 34.4 },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", rate: 34.8 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", rate: 4.46 },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", rate: 15850.0 },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", rate: 58.7 },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳", rate: 25300.0 },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩", rate: 119.5 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰", rate: 278.2 },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰", rate: 292.0 },
  { code: "NPR", name: "Nepalese Rupee", symbol: "Rs", flag: "🇳🇵", rate: 138.4 },
];

const CurrencyConverter = () => {
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

  // State
  const [amount, setAmount] = useState("");
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("INR");
  const [exchangeRates, setExchangeRates] = useState(() => {
    const map = {};
    CURRENCY_LIST.forEach((c) => {
      map[c.code] = c.rate;
    });
    return map;
  });

  // Modal selector state: null | "from" | "to"
  const [pickerTarget, setPickerTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Last update timestamp
  const [lastUpdated, setLastUpdated] = useState(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString("default", { month: "short" });
    const year = now.getFullYear();
    return `${day}, ${month} ${year}`;
  });

  // Fetch live exchange rates (fallback smoothly to offline rates)
  useEffect(() => {
    let isMounted = true;
    const fetchRates = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && isMounted) {
            setExchangeRates((prev) => ({
              ...prev,
              ...data.rates,
            }));
            const d = new Date(data.time_last_update_utc || Date.now());
            const day = d.getDate();
            const month = d.toLocaleString("default", { month: "short" });
            const year = d.getFullYear();
            setLastUpdated(`${day}, ${month} ${year}`);
          }
        }
      } catch (err) {
        // Fallback silently to pre-defined exchange rates
        console.warn("Using offline rates:", err);
      }
    };

    fetchRates();
    return () => {
      isMounted = false;
    };
  }, []);

  const fromCurrency = useMemo(
    () =>
      CURRENCY_LIST.find((c) => c.code === fromCode) || {
        code: fromCode,
        flag: "🌐",
        name: fromCode,
        symbol: "$",
      },
    [fromCode]
  );

  const toCurrency = useMemo(
    () =>
      CURRENCY_LIST.find((c) => c.code === toCode) || {
        code: toCode,
        flag: "🌐",
        name: toCode,
        symbol: "₹",
      },
    [toCode]
  );

  // Conversion calculation
  const convertedValue = useMemo(() => {
    if (!amount || isNaN(amount)) return "";
    const num = parseFloat(amount);
    const rateFrom = exchangeRates[fromCode] || 1;
    const rateTo = exchangeRates[toCode] || 1;

    // Convert to base USD, then to target currency
    const inUsd = num / rateFrom;
    const result = inUsd * rateTo;

    return result.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [amount, fromCode, toCode, exchangeRates]);

  // Current rate 1 Unit From -> To
  const unitRate = useMemo(() => {
    const rateFrom = exchangeRates[fromCode] || 1;
    const rateTo = exchangeRates[toCode] || 1;
    const rate = rateTo / rateFrom;
    return rate.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }, [fromCode, toCode, exchangeRates]);

  // Swap currencies
  const handleSwap = () => {
    const prevFrom = fromCode;
    const prevTo = toCode;
    setFromCode(prevTo);
    setToCode(prevFrom);
  };

  // Filtered currencies for picker
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return CURRENCY_LIST;
    const q = searchQuery.toLowerCase();
    return CURRENCY_LIST.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectCurrency = (code) => {
    if (pickerTarget === "from") {
      if (code === toCode) {
        // Swap if same
        setToCode(fromCode);
      }
      setFromCode(code);
    } else if (pickerTarget === "to") {
      if (code === fromCode) {
        setFromCode(toCode);
      }
      setToCode(code);
    }
    setPickerTarget(null);
    setSearchQuery("");
  };

  // Theme styles
  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200/80";
  const inputBorder = isDark ? "border-slate-700" : "border-gray-300";
  const valueBg = isDark ? "bg-[#212032]" : "bg-[#f4f5f8]";
  const textColor = isDark ? "text-slate-100" : "text-gray-900";

  return (
    <div className="w-full max-w-[480px] mx-auto pb-12 transition-colors duration-200">
      <div className="flex flex-col space-y-6">
        {/* Header Bar */}
        <div className="grid grid-cols-[80px_1fr_80px] items-center py-2 px-1">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => router.back()}
              style={{ color: primaryColor }}
              className="flex items-center gap-0.5 hover:opacity-80 transition-opacity font-medium text-sm sm:text-base cursor-pointer"
            >
              <IoChevronBack className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
              Currency Converter
            </h1>
          </div>

          <div className="w-max" />
        </div>

        {/* Main Converter Card (Matches Screenshot 4) */}
        <div
          className={`rounded-3xl border shadow-xs p-5 sm:p-6 relative transition-colors ${cardBg} ${cardBorder}`}
        >
          {/* Top Section: Amount / From Currency */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-400">
              Amount
            </label>

            <div className="flex items-center justify-between gap-3">
              {/* Currency Selector Pill */}
              <button
                type="button"
                onClick={() => setPickerTarget("from")}
                className="flex items-center gap-2 p-1 hover:opacity-80 transition-opacity cursor-pointer select-none"
              >
                <span className="text-2xl leading-none">{fromCurrency.flag}</span>
                <span className={`text-lg sm:text-xl font-bold tracking-tight ${textColor}`}>
                  {fromCurrency.code}
                </span>
                <IoChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-400 ml-0.5" />
              </button>

              {/* Amount Input */}
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setAmount(val);
                }}
                placeholder="Amount"
                className={`w-36 sm:w-44 px-3.5 py-2.5 rounded-xl border text-right font-medium text-sm sm:text-base bg-transparent outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#f97316] ${inputBorder} ${textColor}`}
              />
            </div>
          </div>

          {/* Divider with Floating Orange Swap Button */}
          <div className="relative my-7 flex items-center justify-center">
            <div className="w-full h-px bg-gray-200 dark:bg-[#232234]" />
            <button
              type="button"
              onClick={handleSwap}
              style={{ backgroundColor: ORANGE_COLOR }}
              className="absolute w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer z-10"
              title="Swap Currencies"
            >
              <IoSwapVertical className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Bottom Section: Converted Amount / To Currency */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-400">
              Converted Amount
            </label>

            <div className="flex items-center justify-between gap-3">
              {/* Currency Selector Pill */}
              <button
                type="button"
                onClick={() => setPickerTarget("to")}
                className="flex items-center gap-2 p-1 hover:opacity-80 transition-opacity cursor-pointer select-none"
              >
                <span className="text-2xl leading-none">{toCurrency.flag}</span>
                <span className={`text-lg sm:text-xl font-bold tracking-tight ${textColor}`}>
                  {toCurrency.code}
                </span>
                <IoChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-400 ml-0.5" />
              </button>

              {/* Converted Display Box */}
              <div
                className={`w-36 sm:w-44 px-3.5 py-2.5 rounded-xl text-right font-medium text-sm sm:text-base select-all overflow-x-auto whitespace-nowrap ${valueBg} ${
                  convertedValue
                    ? textColor + " font-semibold"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {convertedValue || "Value"}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Details Section (Matches Screenshot 4) */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 pt-3">
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 font-normal">
            Last Time Update {lastUpdated}
          </p>

          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 font-normal">
            {amount && !isNaN(amount) && Number(amount) > 0
              ? `${amount} ${fromCurrency.code} Equals`
              : `${fromCurrency.code} Equals`}
          </p>

          <div
            style={{ color: ORANGE_COLOR }}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          >
            {amount && !isNaN(amount) && Number(amount) > 0
              ? `${convertedValue} ${toCurrency.code}`
              : toCurrency.code}
          </div>

          {/* Quick Rate Information Pill */}
          <div className="pt-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                isDark
                  ? "bg-[#161522] border-[#232234] text-slate-300"
                  : "bg-white border-gray-200 text-gray-600 shadow-xs"
              }`}
            >
              1 {fromCurrency.code} = {unitRate} {toCurrency.code}
            </span>
          </div>
        </div>
      </div>

      {/* Currency Selector Modal */}
      {pickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-[420px] rounded-3xl border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${cardBg} ${cardBorder}`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-[#232234]">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Select {pickerTarget === "from" ? "Source" : "Target"} Currency
              </h2>
              <button
                type="button"
                onClick={() => {
                  setPickerTarget(null);
                  setSearchQuery("");
                }}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-100 dark:border-[#232234]">
              <div className="relative">
                <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search currency or country..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    isDark
                      ? "bg-[#212032] border-[#2e2d44] text-white focus:border-slate-400"
                      : "bg-[#f8f9fc] border-gray-200 text-gray-900 focus:border-gray-400"
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* Currency List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#232234] p-1">
              {filteredCurrencies.map((c) => {
                const isSelected =
                  pickerTarget === "from" ? c.code === fromCode : c.code === toCode;

                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => selectCurrency(c.code)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-pointer text-left ${
                      isSelected
                        ? isDark
                          ? "bg-orange-950/20 text-orange-400"
                          : "bg-orange-50 text-orange-600"
                        : isDark
                        ? "hover:bg-[#201f30] text-slate-200"
                        : "hover:bg-gray-50 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none shrink-0">{c.flag}</span>
                      <div>
                        <div className="font-semibold text-sm sm:text-base flex items-center gap-1.5">
                          <span>{c.code}</span>
                          <span className="text-xs text-gray-400 font-normal">
                            ({c.symbol})
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-400 line-clamp-1">
                          {c.name}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <IoCheckmark className="w-5 h-5 text-orange-500 shrink-0" />
                    )}
                  </button>
                );
              })}

              {filteredCurrencies.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">
                  No currency found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;
