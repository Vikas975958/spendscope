"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import {
  IoChevronBack,
  IoClose,
  IoShareOutline,
  IoCloseCircle,
} from "react-icons/io5";
import {
  HiChevronUpDown,
  HiCheck,
  HiChevronUp,
  HiChevronDown,
} from "react-icons/hi2";

const GREEN_COLOR = "#22c55e";
const ORANGE_COLOR = "#f97316";

const COMPOUND_INTERVALS = [
  { id: "none", label: "None" },
  { id: "annually", label: "Annually" },
  { id: "semi-annually", label: "Semi-Annually" },
  { id: "quarterly", label: "Quarterly" },
  { id: "monthly", label: "Monthly" },
  { id: "daily", label: "Daily" },
];

const InterestCalculator = () => {
  const router = useRouter();

  // Dynamic Theme Integration
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;

  const primaryColor =
    currentTheme?.colors?.primary ||
    themeState?.colors?.primary ||
    defaultTheme?.colors?.primary ||
    "#EB5757";

  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  // Top Tab Mode: "Period" | "Date"
  const [activeTab, setActiveTab] = useState("Period");

  // Form input states matching Image 1
  const [amount, setAmount] = useState("");
  const [interestType, setInterestType] = useState("Yearly"); // "Yearly" | "Monthly"
  const [interestRate, setInterestRate] = useState("");
  const [compoundInterval, setCompoundInterval] = useState("None");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [days, setDays] = useState("");

  // Date Mode states
  const todayStr = new Date().toISOString().split("T")[0];
  const nextYearDate = new Date();
  nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
  const nextYearStr = nextYearDate.toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(nextYearStr);

  // Dropdown & View states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Calculations
  const calculatedData = useMemo(() => {
    const P = amount !== "" ? parseFloat(amount) || 0 : 100;
    const rawRate = interestRate !== "" ? parseFloat(interestRate) || 0 : 6.0;

    // Convert rate to annual equivalent if user selected "Monthly"
    const annualRate = interestType === "Monthly" ? rawRate * 12 : rawRate;

    let totalYears = 0;
    let totalDays = 0;

    if (activeTab === "Period") {
      const y = parseFloat(years) || 0;
      const m = parseFloat(months) || 0;
      const d = parseFloat(days) || 0;

      if (y === 0 && m === 0 && d === 0) {
        totalYears = 1; // Default 1 year
        totalDays = 365;
      } else {
        totalYears = y + m / 12 + d / 365;
        totalDays = y * 365 + m * 30.4167 + d;
      }
    } else {
      // Date Mode
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const diffTime = Math.max(0, end - start);
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalYears = totalDays / 365;
    }

    let totalInterest = 0;
    const r = annualRate / 100;

    if (P > 0 && r >= 0 && totalYears > 0) {
      if (compoundInterval === "None") {
        // Simple Interest: SI = P * r * t
        totalInterest = P * r * totalYears;
      } else {
        // Compound Interest
        let n = 1;
        if (compoundInterval === "Annually") n = 1;
        else if (compoundInterval === "Semi-Annually") n = 2;
        else if (compoundInterval === "Quarterly") n = 4;
        else if (compoundInterval === "Monthly") n = 12;
        else if (compoundInterval === "Daily") n = 365;

        const maturity = P * Math.pow(1 + r / n, n * totalYears);
        totalInterest = Math.max(0, maturity - P);
      }
    }

    const totalAmount = P + totalInterest;

    // Schedule breakdown
    const schedule = [];
    const scheduleYears = Math.max(1, Math.min(20, Math.ceil(totalYears)));
    for (let yr = 1; yr <= scheduleYears; yr++) {
      let yrInt = 0;
      if (compoundInterval === "None") {
        yrInt = P * r * yr;
      } else {
        let n = 1;
        if (compoundInterval === "Annually") n = 1;
        else if (compoundInterval === "Semi-Annually") n = 2;
        else if (compoundInterval === "Quarterly") n = 4;
        else if (compoundInterval === "Monthly") n = 12;
        else if (compoundInterval === "Daily") n = 365;
        yrInt = P * Math.pow(1 + r / n, n * yr) - P;
      }
      schedule.push({
        year: yr,
        interest: yrInt,
        balance: P + yrInt,
      });
    }

    return {
      principal: P,
      rate: rawRate,
      interestType,
      compoundInterval,
      totalYears,
      totalInterest,
      totalAmount,
      schedule,
    };
  }, [
    amount,
    interestType,
    interestRate,
    compoundInterval,
    years,
    months,
    days,
    activeTab,
    fromDate,
    toDate,
  ]);

  const handleReset = () => {
    setAmount("");
    setInterestType("Yearly");
    setInterestRate("");
    setCompoundInterval("None");
    setYears("");
    setMonths("");
    setDays("");
    setFromDate(todayStr);
    setToDate(nextYearStr);
    setIsDropdownOpen(false);
  };

  const handleCalculate = () => {
    setShowDetails(true);
  };

  const handleShare = async () => {
    const shareText = `Interest Calculation Details:
• Principle Amount: ₹${calculatedData.principal.toFixed(2)}
• Interest Rate: ${calculatedData.rate}% (${calculatedData.interestType})
• Compound Interval: ${compoundInterval}
• Total Interest: ₹${calculatedData.totalInterest.toFixed(2)}
• Total Amount: ₹${calculatedData.totalAmount.toFixed(2)}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Interest Calculator Details",
          text: shareText,
        });
        return;
      } catch {
        // Fallback
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (val) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0.00";
    return (
      "₹" +
      Number(val).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  // Donut chart calculations
  const totalVal = calculatedData.totalAmount || 1;
  const principalPercent = (calculatedData.principal / totalVal) * 100;
  const interestPercent = (calculatedData.totalInterest / totalVal) * 100;

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const greenDash = (principalPercent / 100) * circumference;
  const orangeDash = (interestPercent / 100) * circumference;

  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200/80";
  const divideColor = isDark ? "divide-[#232234]" : "divide-gray-100";
  const titleColor = isDark ? "text-white" : "text-gray-900";
  const labelColor = isDark ? "text-slate-300" : "text-gray-800";
  const valueColor = isDark ? "text-white" : "text-gray-900";

  return (
    <div className="w-full flex justify-center py-2 px-3 sm:px-4">
      <div
        className="w-full max-w-[500px] mx-auto"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        {!showDetails ? (
          /* ========================================================= */
          /* SCREEN 1: INPUT FORM (Interest Calculator - matches Img 1)*/
          /* ========================================================= */
          <div className="flex flex-col space-y-3.5">
            {/* Header: Back Button Left, Title Center */}
            <div className="grid grid-cols-[80px_1fr_80px] items-center py-1">
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{ color: primaryColor }}
                  className="flex items-center gap-0.5 hover:opacity-80 transition-opacity font-semibold text-sm sm:text-base cursor-pointer"
                >
                  <IoChevronBack className="w-5 h-5" />
                  <span>Back</span>
                </button>
              </div>

              <div className="text-center">
                <h1
                  className={`text-lg sm:text-xl font-bold whitespace-nowrap ${titleColor}`}
                >
                  Interest Calculator
                </h1>
              </div>

              <div className="w-max" />
            </div>

            {/* Top Period / Date Tab Switcher (Image 1) */}
            <div
              className={`p-1 rounded-2xl flex items-center gap-1 border ${
                isDark
                  ? "bg-[#181726] border-[#252438]"
                  : "bg-gray-100/90 border-gray-200/60"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab("Period")}
                style={
                  activeTab === "Period"
                    ? { backgroundColor: primaryColor, color: "#ffffff" }
                    : {}
                }
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "Period"
                    ? "shadow-sm"
                    : isDark
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Period
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("Date")}
                style={
                  activeTab === "Date"
                    ? { backgroundColor: primaryColor, color: "#ffffff" }
                    : {}
                }
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "Date"
                    ? "shadow-sm"
                    : isDark
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Date
              </button>
            </div>

            {/* Form Inputs Card */}
            <div
              className={`rounded-2xl border shadow-xs divide-y relative ${cardBg} ${cardBorder} ${divideColor}`}
            >
              {/* Row 1: Amount */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label className={`text-sm sm:text-base font-medium ${labelColor}`}>
                  Amount
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setAmount(val);
                    }}
                    placeholder="Enter amount"
                    className={`w-full max-w-[180px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount("")}
                      className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <IoCloseCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Interest Type (Pill: Yearly | Monthly) */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label className={`text-sm sm:text-base font-medium ${labelColor}`}>
                  Interest Type
                </label>
                <div
                  className={`p-1 rounded-xl flex items-center gap-1 ${
                    isDark ? "bg-[#212032]" : "bg-[#f4f5f8]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setInterestType("Yearly")}
                    style={
                      interestType === "Yearly"
                        ? { backgroundColor: primaryColor, color: "#ffffff" }
                        : {}
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      interestType === "Yearly"
                        ? "shadow-xs"
                        : isDark
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestType("Monthly")}
                    style={
                      interestType === "Monthly"
                        ? { backgroundColor: primaryColor, color: "#ffffff" }
                        : {}
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      interestType === "Monthly"
                        ? "shadow-xs"
                        : isDark
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Row 3: Interest % */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label className={`text-sm sm:text-base font-medium ${labelColor}`}>
                  Interest %
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={interestRate}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setInterestRate(val);
                    }}
                    placeholder="Ex: 6.5%"
                    className={`w-full max-w-[180px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {interestRate && (
                    <button
                      type="button"
                      onClick={() => setInterestRate("")}
                      className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <IoCloseCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 4: Compound Interval (Dropdown) */}
              <div
                ref={dropdownRef}
                className="relative flex items-center justify-between px-4 py-3 sm:py-3.5"
              >
                <div className="flex flex-col">
                  <span className={`text-sm sm:text-base font-medium leading-tight ${labelColor}`}>
                    Compound
                  </span>
                  <span className={`text-sm sm:text-base font-medium leading-tight ${labelColor}`}>
                    Interval
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  style={{ color: primaryColor }}
                  className="flex items-center gap-1.5 text-sm sm:text-base font-medium hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <span>{compoundInterval}</span>
                  <HiChevronUpDown className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                  <div
                    className={`absolute right-3 top-14 z-50 w-56 rounded-2xl border shadow-xl overflow-hidden divide-y ${
                      isDark
                        ? "bg-[#1d1c2d] border-[#2e2d44] divide-[#2e2d44] text-slate-100"
                        : "bg-white border-gray-100 divide-gray-100 text-gray-900 shadow-gray-200/50"
                    }`}
                  >
                    {COMPOUND_INTERVALS.map((item) => {
                      const isSelected = compoundInterval === item.label;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setCompoundInterval(item.label);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-3 text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                            isDark ? "hover:bg-[#26253b]" : "hover:bg-gray-50"
                          } ${isSelected ? "font-semibold" : "font-normal"}`}
                        >
                          <div className="w-4 flex items-center justify-center shrink-0">
                            {isSelected && (
                              <HiCheck className="w-4 h-4 text-gray-900 dark:text-white stroke-2" />
                            )}
                          </div>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Row 5: Period Mode or Date Mode */}
              {activeTab === "Period" ? (
                <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                  <label className={`text-sm sm:text-base font-medium ${labelColor}`}>
                    Period
                  </label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className={`w-[68px] sm:w-[76px] py-1.5 px-2 rounded-lg text-center transition-colors ${
                        isDark ? "bg-[#212032]" : "bg-[#f4f5f8]"
                      }`}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        value={years}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setYears(val);
                        }}
                        placeholder="Years"
                        className={`w-full text-center bg-transparent outline-none text-xs sm:text-sm font-medium placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                      />
                    </div>

                    <div
                      className={`w-[68px] sm:w-[76px] py-1.5 px-2 rounded-lg text-center transition-colors ${
                        isDark ? "bg-[#212032]" : "bg-[#f4f5f8]"
                      }`}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        value={months}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setMonths(val);
                        }}
                        placeholder="Months"
                        className={`w-full text-center bg-transparent outline-none text-xs sm:text-sm font-medium placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                      />
                    </div>

                    <div
                      className={`w-[68px] sm:w-[76px] py-1.5 px-2 rounded-lg text-center transition-colors ${
                        isDark ? "bg-[#212032]" : "bg-[#f4f5f8]"
                      }`}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        value={days}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setDays(val);
                        }}
                        placeholder="Days"
                        className={`w-full text-center bg-transparent outline-none text-xs sm:text-sm font-medium placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-inherit">
                  <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                    <label className={`text-sm sm:text-base font-medium ${labelColor}`}>
                      From Date
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className={`bg-transparent outline-none font-normal text-xs sm:text-sm ${valueColor}`}
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                    <label className={`text-sm sm:text-base font-medium ${labelColor}`}>
                      To Date
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className={`bg-transparent outline-none font-normal text-xs sm:text-sm ${valueColor}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: Reset and Calculate */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleReset}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm sm:text-base border transition-all cursor-pointer ${
                  isDark
                    ? "border-slate-600 bg-[#161522] text-slate-100 hover:bg-[#201f30]"
                    : "border-slate-800 bg-white text-gray-900 hover:bg-gray-50 shadow-xs"
                }`}
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleCalculate}
                style={{
                  backgroundColor: primaryColor,
                  color: "#ffffff",
                }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-[0.99]"
              >
                Calculate
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* SCREEN 2 & 3: DETAILS VIEW (Matches Image 2)               */
          /* ========================================================= */
          <div className="flex flex-col space-y-4">
            {/* Modal Header */}
            <div className="grid grid-cols-[40px_1fr_40px] items-center py-1">
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isDark
                      ? "bg-[#232234] text-gray-300 hover:text-white"
                      : "bg-[#e2e5eb] text-gray-700 hover:bg-[#d5d9e2]"
                  }`}
                  title="Close Details"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center">
                <h2
                  className={`text-lg sm:text-xl font-bold whitespace-nowrap ${titleColor}`}
                >
                  Details
                </h2>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleShare}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isDark
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  title="Share Details"
                >
                  <IoShareOutline className="w-6 h-6" />
                </button>
              </div>
            </div>

            {copied && (
              <div className="bg-emerald-500 text-white text-xs sm:text-sm py-1.5 px-3 rounded-xl text-center font-semibold shadow-xs">
                Details copied to clipboard!
              </div>
            )}

            {/* Top Summary Table (Matches Image 2 exactly) */}
            <div
              className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
            >
              {/* Row 1: Principle Amount */}
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                  Principle Amount
                </span>
                <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                  {formatCurrency(calculatedData.principal)}
                </span>
              </div>

              {/* Row 2: Total Interest */}
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                  Total Interest
                </span>
                <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                  {formatCurrency(calculatedData.totalInterest)}
                </span>
              </div>

              {/* Row 3: Total Amount */}
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                  Total Amount
                </span>
                <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                  {formatCurrency(calculatedData.totalAmount)}
                </span>
              </div>
            </div>

            {/* Donut Chart Card (Matches Image 2) */}
            <div
              className={`rounded-2xl border p-5 sm:p-6 shadow-xs flex flex-col items-center justify-center ${cardBg} ${cardBorder}`}
            >
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 160 160"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={isDark ? "#232234" : "#f1f5f9"}
                    strokeWidth="22"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={GREEN_COLOR}
                    strokeWidth="22"
                    strokeDasharray={`${greenDash} ${circumference}`}
                    strokeDashoffset="0"
                    fill="transparent"
                    strokeLinecap="butt"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={ORANGE_COLOR}
                    strokeWidth="22"
                    strokeDasharray={`${orangeDash} ${circumference}`}
                    strokeDashoffset={-greenDash}
                    fill="transparent"
                    strokeLinecap="butt"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Amount
                  </span>
                  <span
                    style={{ color: primaryColor }}
                    className="text-base sm:text-lg font-bold tracking-tight mt-0.5"
                  >
                    {formatCurrency(calculatedData.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Legend below donut chart */}
              <div className="flex items-center justify-around w-full mt-4 pt-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span
                      style={{ backgroundColor: GREEN_COLOR }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <span>Principal Amount</span>
                  </div>
                  <span
                    style={{ color: GREEN_COLOR }}
                    className="text-sm sm:text-base font-bold mt-1"
                  >
                    {formatCurrency(calculatedData.principal)}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span
                      style={{ backgroundColor: ORANGE_COLOR }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <span>Interest</span>
                  </div>
                  <span
                    style={{ color: ORANGE_COLOR }}
                    className="text-sm sm:text-base font-bold mt-1"
                  >
                    {formatCurrency(calculatedData.totalInterest)}
                  </span>
                </div>
              </div>
            </div>

            {/* Collapsible Yearly Breakdown Header */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowBreakdown((prev) => !prev)}
                style={{ color: primaryColor }}
                className="flex items-center justify-between w-full text-left font-semibold text-sm sm:text-base hover:opacity-80 transition-opacity cursor-pointer py-1"
              >
                <span>{showBreakdown ? "Hide Details" : "Show Details"}</span>
                {showBreakdown ? (
                  <HiChevronUp className="w-4 h-4" />
                ) : (
                  <HiChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Breakdown Schedule Table */}
            {showBreakdown && (
              <div
                className={`rounded-2xl overflow-hidden shadow-xs border ${cardBorder}`}
              >
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                      <th className="py-2.5 px-3 font-semibold text-left">Year</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Interest</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Total Balance</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDark
                        ? "bg-[#161522] divide-[#232234] text-slate-200"
                        : "bg-white divide-gray-100 text-gray-800"
                    }`}
                  >
                    {calculatedData.schedule.map((item, idx) => (
                      <tr
                        key={item.year}
                        className={
                          idx % 2 === 1
                            ? isDark
                              ? "bg-[#1d1c2b]/70"
                              : "bg-gray-50/70"
                            : ""
                        }
                      >
                        <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                          Year {item.year}
                        </td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatCurrency(item.interest)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {formatCurrency(item.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestCalculator;
