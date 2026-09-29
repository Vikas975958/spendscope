"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import {
  IoChevronBack,
  IoShareOutline,
  IoRefreshOutline,
  IoCheckmark,
} from "react-icons/io5";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";

const CORAL_COLOR = "#f06456";
const GREEN_COLOR = "#22c55e";
const ORANGE_COLOR = "#f97316";

// Fixed Slider and Input Limits
const SIP_MIN = 500;
const SIP_MAX = 200000; // Max ₹2,00,000 for monthly SIP
const LUMPSUM_MIN = 1000;
const LUMPSUM_MAX = 1000000; // Max ₹10,00,000 for Lumpsum

const RATE_MIN = 1;
const RATE_MAX = 30; // Max 30%

const PERIOD_MIN = 1;
const PERIOD_MAX = 40; // Max 40 Years

const SipCalculator = () => {
  const router = useRouter();

  // Dynamic Theme Integration
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;
  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  // Tab mode: "sip" | "lumpsum"
  const [activeTab, setActiveTab] = useState("sip");

  // Form input states
  const [sipAmount, setSipAmount] = useState(25000);
  const [lumpsumAmount, setLumpsumAmount] = useState(25000);
  const [expectedReturn, setExpectedReturn] = useState(12.0);
  const [timePeriod, setTimePeriod] = useState(10);

  // Focus states for input fields to allow comfortable typing
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [amountInputText, setAmountInputText] = useState("");
  const [isReturnFocused, setIsReturnFocused] = useState(false);
  const [returnInputText, setReturnInputText] = useState("");
  const [isPeriodFocused, setIsPeriodFocused] = useState(false);
  const [periodInputText, setPeriodInputText] = useState("");

  // Breakdown & Share states
  const [showSchedule, setShowSchedule] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fixed limits for current active tab
  const amountMin = activeTab === "sip" ? SIP_MIN : LUMPSUM_MIN;
  const amountMax = activeTab === "sip" ? SIP_MAX : LUMPSUM_MAX;

  // Current active amount based on tab
  const currentAmount = activeTab === "sip" ? sipAmount : lumpsumAmount;

  // Clamp amount strictly within [0, amountMax]
  const handleAmountChange = (newVal) => {
    const clamped = Math.min(amountMax, Math.max(0, newVal));
    if (activeTab === "sip") {
      setSipAmount(clamped);
    } else {
      setLumpsumAmount(clamped);
    }
  };

  // Tab switcher with range enforcement
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setIsAmountFocused(false);
    if (tab === "sip") {
      setSipAmount((prev) => Math.min(SIP_MAX, Math.max(SIP_MIN, prev)));
    } else {
      setLumpsumAmount((prev) => Math.min(LUMPSUM_MAX, Math.max(LUMPSUM_MIN, prev)));
    }
  };

  // Financial calculations matching image formulas
  const calculatedData = useMemo(() => {
    const P = Number(currentAmount) || 0;
    const r = Number(expectedReturn) || 0;
    const y = Number(timePeriod) || 0;

    let investedAmount = 0;
    let totalValue = 0;
    let estReturns = 0;

    if (activeTab === "sip") {
      // Monthly SIP formula:
      // M = P * [ ((1 + i)^n - 1) / i ] * (1 + i)
      const totalMonths = y * 12;
      investedAmount = P * totalMonths;

      if (r > 0 && totalMonths > 0) {
        const monthlyRate = r / 12 / 100;
        totalValue =
          P *
          ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
          (1 + monthlyRate);
      } else {
        totalValue = investedAmount;
      }
    } else {
      // Lumpsum formula:
      // M = P * (1 + r/100)^y
      investedAmount = P;
      if (r >= 0 && y >= 0) {
        totalValue = P * Math.pow(1 + r / 100, y);
      } else {
        totalValue = investedAmount;
      }
    }

    // Rounding to exact integers as shown in screenshots
    const roundedInvested = Math.round(investedAmount);
    const roundedTotal = Math.round(totalValue);
    estReturns = Math.max(0, roundedTotal - roundedInvested);

    // Generate yearly schedule
    const schedule = [];
    if (y > 0) {
      for (let yr = 1; yr <= y; yr++) {
        let yrInvested = 0;
        let yrTotal = 0;

        if (activeTab === "sip") {
          const months = yr * 12;
          yrInvested = P * months;
          if (r > 0) {
            const monthlyRate = r / 12 / 100;
            yrTotal =
              P *
              ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
              (1 + monthlyRate);
          } else {
            yrTotal = yrInvested;
          }
        } else {
          yrInvested = P;
          yrTotal = P * Math.pow(1 + r / 100, yr);
        }

        const yrRoundInvested = Math.round(yrInvested);
        const yrRoundTotal = Math.round(yrTotal);
        const yrReturns = Math.max(0, yrRoundTotal - yrRoundInvested);

        schedule.push({
          year: yr,
          invested: yrRoundInvested,
          returns: yrReturns,
          total: yrRoundTotal,
        });
      }
    }

    return {
      investedAmount: roundedInvested,
      estReturns,
      totalValue: roundedTotal,
      schedule,
    };
  }, [activeTab, currentAmount, expectedReturn, timePeriod]);

  // Donut chart calculations
  const totalVal = calculatedData.totalValue || 1;
  const investedRatio = Math.min(
    1,
    Math.max(0, calculatedData.investedAmount / totalVal)
  );

  const radius = 75;
  const strokeWidth = 34;
  const circumference = 2 * Math.PI * radius;
  const gap = totalVal > 0 && calculatedData.investedAmount > 0 && calculatedData.estReturns > 0 ? 8 : 0;

  // Green segment (Invested amount)
  const greenLength = Math.max(0, investedRatio * circumference - gap);
  // Orange segment (Est. returns)
  const orangeLength = Math.max(0, (1 - investedRatio) * circumference - gap);

  // Reset to default values shown in screenshot
  const handleReset = () => {
    if (activeTab === "sip") {
      setSipAmount(25000);
    } else {
      setLumpsumAmount(25000);
    }
    setExpectedReturn(12.0);
    setTimePeriod(10);
  };

  // Share calculation
  const handleShare = async () => {
    const text = `${activeTab === "sip" ? "SIP" : "Lumpsum"} Calculation:
• Investment: ₹${Number(currentAmount).toLocaleString("en-US")}
• Expected Return: ${Number(expectedReturn).toFixed(2)}%
• Time Period: ${timePeriod} Years
• Invested Amount: ₹${Number(calculatedData.investedAmount).toLocaleString("en-US")}
• Est. Returns: ₹${Number(calculatedData.estReturns).toLocaleString("en-US")}
• Total Value: ₹${Number(calculatedData.totalValue).toLocaleString("en-US")}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "SIP Calculator Result",
          text,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Slider progress percentages for custom track gradients (always strictly within 0 - 100%)
  const amountPercent = Math.min(
    100,
    Math.max(0, ((currentAmount - amountMin) / (amountMax - amountMin)) * 100)
  );

  const ratePercent = Math.min(
    100,
    Math.max(0, ((expectedReturn - RATE_MIN) / (RATE_MAX - RATE_MIN)) * 100)
  );

  const periodPercent = Math.min(
    100,
    Math.max(0, ((timePeriod - PERIOD_MIN) / (PERIOD_MAX - PERIOD_MIN)) * 100)
  );

  // Common Theme styles
  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200/80";
  const labelColor = isDark ? "text-slate-200" : "text-gray-900";
  const trackInactiveColor = isDark ? "#334155" : "#e5e7eb";

  return (
    <div className="w-full flex justify-center py-2 px-3 sm:px-4">
      <div
        className="w-full max-w-[500px] mx-auto"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        {/* ========================================================= */}
        {/* TOP BAR: Back Button & Title                               */}
        {/* ========================================================= */}
        <div className="grid grid-cols-[80px_1fr_80px] items-center py-1 mb-3">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-0.5 text-[#3b82f6] hover:text-[#2563eb] transition-colors font-medium text-sm sm:text-base cursor-pointer"
            >
              <IoChevronBack className="w-5 h-5 text-[#3b82f6]" />
              <span>Back</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold whitespace-nowrap text-gray-900 dark:text-white">
              SIP Calculator
            </h1>
          </div>

          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={handleReset}
              title="Reset to default"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              <IoRefreshOutline className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              title="Share or Copy"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors cursor-pointer relative"
            >
              {copied ? (
                <IoCheckmark className="w-5 h-5 text-emerald-500" />
              ) : (
                <IoShareOutline className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB TOGGLE: SIP | Lumpsum                                  */}
        {/* ========================================================= */}
        <div className="w-full bg-[#e5e7eb] dark:bg-[#1e1c2b] p-1 rounded-xl sm:rounded-2xl flex items-center mb-4 transition-colors">
          <button
            type="button"
            onClick={() => handleTabSwitch("sip")}
            className={`flex-1 py-2 sm:py-2.5 text-center text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all cursor-pointer ${
              activeTab === "sip"
                ? "bg-[#ee6055] text-white shadow-xs"
                : "bg-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            SIP
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("lumpsum")}
            className={`flex-1 py-2 sm:py-2.5 text-center text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all cursor-pointer ${
              activeTab === "lumpsum"
                ? "bg-[#ee6055] text-white shadow-xs"
                : "bg-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Lumpsum
          </button>
        </div>

        {/* ========================================================= */}
        {/* CARD 1: Monthly / Total Investment                        */}
        {/* ========================================================= */}
        <div
          className={`rounded-2xl border shadow-xs p-4 sm:p-5 mb-3 sm:mb-4 ${cardBg} ${cardBorder}`}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <label
              className={`text-sm sm:text-base font-semibold leading-tight ${labelColor}`}
            >
              {activeTab === "sip" ? "Monthly\ninvestment" : "Total\ninvestment"}
            </label>
            <div className="border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800/80 flex items-center justify-end shadow-2xs focus-within:border-[#ee6055] transition-colors">
              <span className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base mr-0.5">
                ₹
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={
                  isAmountFocused
                    ? amountInputText
                    : Number(currentAmount).toLocaleString("en-US")
                }
                onFocus={() => {
                  setIsAmountFocused(true);
                  setAmountInputText(String(currentAmount));
                }}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  if (!cleaned) {
                    setAmountInputText("");
                    handleAmountChange(0);
                    return;
                  }
                  const num = Number(cleaned);
                  if (num > amountMax) {
                    // Strictly cap to slider maximum
                    setAmountInputText(String(amountMax));
                    handleAmountChange(amountMax);
                  } else {
                    setAmountInputText(cleaned);
                    handleAmountChange(num);
                  }
                }}
                onBlur={() => {
                  setIsAmountFocused(false);
                  const num = Number(amountInputText);
                  if (!amountInputText || num < amountMin) {
                    handleAmountChange(amountMin);
                    setAmountInputText(String(amountMin));
                  } else if (num > amountMax) {
                    handleAmountChange(amountMax);
                    setAmountInputText(String(amountMax));
                  } else {
                    handleAmountChange(num);
                  }
                }}
                className="w-24 sm:w-28 text-right bg-transparent outline-none font-semibold text-sm sm:text-base text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Slider */}
          <div className="pt-1">
            <input
              type="range"
              min={amountMin}
              max={amountMax}
              step={activeTab === "sip" ? 500 : 1000}
              value={currentAmount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, ${CORAL_COLOR} 0%, ${CORAL_COLOR} ${amountPercent}%, ${trackInactiveColor} ${amountPercent}%, ${trackInactiveColor} 100%)`,
              }}
              className="w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.22)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-200/40 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.22)] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: Expected return rate (p.a)                         */}
        {/* ========================================================= */}
        <div
          className={`rounded-2xl border shadow-xs p-4 sm:p-5 mb-3 sm:mb-4 ${cardBg} ${cardBorder}`}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <label
              className={`text-sm sm:text-base font-semibold leading-tight ${labelColor}`}
            >
              Expected return rate (p.a)
            </label>
            <div className="border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800/80 flex items-center justify-end shadow-2xs focus-within:border-[#ee6055] transition-colors">
              <input
                type="text"
                inputMode="decimal"
                value={
                  isReturnFocused
                    ? returnInputText
                    : `${Number(expectedReturn).toFixed(2)} %`
                }
                onFocus={() => {
                  setIsReturnFocused(true);
                  setReturnInputText(String(expectedReturn));
                }}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                  if (!cleaned) {
                    setReturnInputText("");
                    setExpectedReturn(RATE_MIN);
                    return;
                  }
                  const parts = cleaned.split(".");
                  const sanitized =
                    parts[0] + (parts.length > 1 ? "." + parts.slice(1).join("") : "");
                  const parsed = parseFloat(sanitized);
                  if (!isNaN(parsed)) {
                    if (parsed > RATE_MAX) {
                      // Strictly cap to slider maximum
                      setReturnInputText(String(RATE_MAX));
                      setExpectedReturn(RATE_MAX);
                    } else {
                      setReturnInputText(sanitized);
                      setExpectedReturn(parsed);
                    }
                  } else {
                    setReturnInputText(sanitized);
                  }
                }}
                onBlur={() => {
                  setIsReturnFocused(false);
                  const parsed = parseFloat(returnInputText);
                  if (isNaN(parsed) || parsed < RATE_MIN) {
                    setExpectedReturn(RATE_MIN);
                    setReturnInputText(String(RATE_MIN));
                  } else if (parsed > RATE_MAX) {
                    setExpectedReturn(RATE_MAX);
                    setReturnInputText(String(RATE_MAX));
                  } else {
                    setExpectedReturn(parsed);
                    setReturnInputText(String(parsed));
                  }
                }}
                className="w-20 sm:w-24 text-right bg-transparent outline-none font-semibold text-sm sm:text-base text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Slider */}
          <div className="pt-1">
            <input
              type="range"
              min={RATE_MIN}
              max={RATE_MAX}
              step={0.1}
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(parseFloat(e.target.value))}
              style={{
                background: `linear-gradient(to right, ${CORAL_COLOR} 0%, ${CORAL_COLOR} ${ratePercent}%, ${trackInactiveColor} ${ratePercent}%, ${trackInactiveColor} 100%)`,
              }}
              className="w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.22)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-200/40 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.22)] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 3: Time period                                       */}
        {/* ========================================================= */}
        <div
          className={`rounded-2xl border shadow-xs p-4 sm:p-5 mb-3 sm:mb-4 ${cardBg} ${cardBorder}`}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <label
              className={`text-sm sm:text-base font-semibold leading-tight ${labelColor}`}
            >
              Time period
            </label>
            <div className="border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800/80 flex items-center justify-end shadow-2xs focus-within:border-[#ee6055] transition-colors">
              <input
                type="text"
                inputMode="numeric"
                value={
                  isPeriodFocused
                    ? periodInputText
                    : `${Number(timePeriod)} Yr`
                }
                onFocus={() => {
                  setIsPeriodFocused(true);
                  setPeriodInputText(String(timePeriod));
                }}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  if (!cleaned) {
                    setPeriodInputText("");
                    setTimePeriod(PERIOD_MIN);
                    return;
                  }
                  const parsed = parseInt(cleaned, 10);
                  if (!isNaN(parsed)) {
                    if (parsed > PERIOD_MAX) {
                      // Strictly cap to slider maximum
                      setPeriodInputText(String(PERIOD_MAX));
                      setTimePeriod(PERIOD_MAX);
                    } else {
                      setPeriodInputText(cleaned);
                      setTimePeriod(parsed);
                    }
                  }
                }}
                onBlur={() => {
                  setIsPeriodFocused(false);
                  const parsed = parseInt(periodInputText, 10);
                  if (isNaN(parsed) || parsed < PERIOD_MIN) {
                    setTimePeriod(PERIOD_MIN);
                    setPeriodInputText(String(PERIOD_MIN));
                  } else if (parsed > PERIOD_MAX) {
                    setTimePeriod(PERIOD_MAX);
                    setPeriodInputText(String(PERIOD_MAX));
                  } else {
                    setTimePeriod(parsed);
                    setPeriodInputText(String(parsed));
                  }
                }}
                className="w-16 sm:w-20 text-right bg-transparent outline-none font-semibold text-sm sm:text-base text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Slider */}
          <div className="pt-1">
            <input
              type="range"
              min={PERIOD_MIN}
              max={PERIOD_MAX}
              step={1}
              value={timePeriod}
              onChange={(e) => setTimePeriod(parseInt(e.target.value, 10))}
              style={{
                background: `linear-gradient(to right, ${CORAL_COLOR} 0%, ${CORAL_COLOR} ${periodPercent}%, ${trackInactiveColor} ${periodPercent}%, ${trackInactiveColor} 100%)`,
              }}
              className="w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.22)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-200/40 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.22)] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUMMARY TABLE CARD                                        */}
        {/* ========================================================= */}
        <div
          className={`rounded-2xl border shadow-xs overflow-hidden mb-3 sm:mb-4 ${cardBg} ${cardBorder}`}
        >
          {/* Row 1: Invested Amount */}
          <div className="grid grid-cols-2 divide-x divide-gray-200/90 dark:divide-[#232234] border-b border-gray-200/90 dark:border-[#232234]">
            <div className="px-4 py-3 sm:py-3.5 text-sm sm:text-base font-medium text-gray-800 dark:text-slate-200">
              Invested Amount
            </div>
            <div className="px-4 py-3 sm:py-3.5 text-right text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              ₹{Number(calculatedData.investedAmount).toLocaleString("en-US")}
            </div>
          </div>

          {/* Row 2: Est Returns */}
          <div className="grid grid-cols-2 divide-x divide-gray-200/90 dark:divide-[#232234] border-b border-gray-200/90 dark:border-[#232234]">
            <div className="px-4 py-3 sm:py-3.5 text-sm sm:text-base font-medium text-gray-800 dark:text-slate-200">
              Est Returns
            </div>
            <div className="px-4 py-3 sm:py-3.5 text-right text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              ₹{Number(calculatedData.estReturns).toLocaleString("en-US")}
            </div>
          </div>

          {/* Row 3: Total Value */}
          <div className="grid grid-cols-2 divide-x divide-gray-200/90 dark:divide-[#232234]">
            <div className="px-4 py-3 sm:py-3.5 text-sm sm:text-base font-medium text-gray-800 dark:text-slate-200">
              Total Value
            </div>
            <div className="px-4 py-3 sm:py-3.5 text-right text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              ₹{Number(calculatedData.totalValue).toLocaleString("en-US")}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DONUT CHART CARD                                          */}
        {/* ========================================================= */}
        <div
          className={`rounded-2xl border shadow-xs p-6 mb-4 flex flex-col items-center justify-center ${cardBg} ${cardBorder}`}
        >
          {/* Donut Chart with Center Text */}
          <div className="relative flex items-center justify-center">
            <svg
              width="230"
              height="230"
              viewBox="0 0 230 230"
              className="transform"
            >
              <g transform="rotate(-90 115 115)">
                {/* Background track circle */}
                <circle
                  cx="115"
                  cy="115"
                  r={radius}
                  fill="transparent"
                  stroke={isDark ? "#232234" : "#f1f3f7"}
                  strokeWidth={strokeWidth}
                />

                {/* Orange segment: Est. returns */}
                {calculatedData.estReturns > 0 && (
                  <circle
                    cx="115"
                    cy="115"
                    r={radius}
                    fill="transparent"
                    stroke={ORANGE_COLOR}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${orangeLength} ${circumference - orangeLength}`}
                    strokeDashoffset={`-${investedRatio * circumference + gap / 2}`}
                    strokeLinecap="butt"
                    className="transition-all duration-300"
                  />
                )}

                {/* Green segment: Invested amount */}
                {calculatedData.investedAmount > 0 && (
                  <circle
                    cx="115"
                    cy="115"
                    r={radius}
                    fill="transparent"
                    stroke={GREEN_COLOR}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${greenLength} ${circumference - greenLength}`}
                    strokeDashoffset={`-${gap / 2}`}
                    strokeLinecap="butt"
                    className="transition-all duration-300"
                  />
                )}
              </g>
            </svg>

            {/* Center Value Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-slate-400">
                Total Value
              </span>
              <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-0.5">
                ₹{Number(calculatedData.totalValue).toLocaleString("en-US")}
              </span>
            </div>
          </div>

          {/* Donut Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: GREEN_COLOR }}
              />
              <span className="text-gray-600 dark:text-slate-400 font-medium">
                Invested amount
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: ORANGE_COLOR }}
              />
              <span className="text-gray-600 dark:text-slate-400 font-medium">
                Est. returns
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* YEARLY BREAKDOWN (COLLAPSIBLE SCHEDULE)                   */}
        {/* ========================================================= */}
        <div
          className={`rounded-2xl border shadow-xs overflow-hidden mb-6 ${cardBg} ${cardBorder}`}
        >
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Yearly Investment Breakdown
            </span>
            <span className="text-gray-500">
              {showSchedule ? (
                <HiChevronUp className="w-5 h-5" />
              ) : (
                <HiChevronDown className="w-5 h-5" />
              )}
            </span>
          </button>

          {showSchedule && (
            <div className="border-t border-gray-200/90 dark:border-[#232234] overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-600 dark:text-slate-300 font-semibold border-b border-gray-200/90 dark:border-[#232234]">
                  <tr>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3 text-right">Invested</th>
                    <th className="py-2.5 px-3 text-right">Est. Returns</th>
                    <th className="py-2.5 px-3 text-right">Total Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#232234]">
                  {calculatedData.schedule.map((row) => (
                    <tr
                      key={row.year}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">
                        Yr {row.year}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700 dark:text-slate-300">
                        ₹{Number(row.invested).toLocaleString("en-US")}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                        ₹{Number(row.returns).toLocaleString("en-US")}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-white">
                        ₹{Number(row.total).toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SipCalculator;
