"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import {
  IoChevronBack,
  IoClose,
  IoShareOutline,
} from "react-icons/io5";
import { HiChevronUp, HiChevronDown } from "react-icons/hi2";

const GREEN_COLOR = "#2ecc71";
const ORANGE_COLOR = "#f97316";

// Tabs available in Quick Calculator
const TABS = [
  { id: "EMI", label: "EMI" },
  { id: "Amount", label: "Amount" },
  { id: "Period", label: "Period" },
  { id: "Interest", label: "Interest" },
];

const Qcalculator = () => {
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

  // Active Tab: "EMI" | "Amount" | "Period" | "Interest"
  // Default to "Amount" to match the user's primary reference image!
  const [activeTab, setActiveTab] = useState("Amount");

  // State variables for inputs
  const [loanAmount, setLoanAmount] = useState(511087);
  const [interestRate, setInterestRate] = useState(6.5);
  const [periodYears, setPeriodYears] = useState(5);
  const [emi, setEmi] = useState(10000);
  const [processingFee, setProcessingFee] = useState(0);

  // View state
  const [showDetails, setShowDetails] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [copied, setCopied] = useState(false);

  // Numerical solver for interest rate (Bisection algorithm)
  const solveRate = (P, n, E) => {
    if (P <= 0 || n <= 0 || E <= 0) return 0;
    if (E * n <= P) return 0; // 0% or negative interest
    let low = 0.00001;
    let high = 5.0; // monthly rate up to 500% (6000% annual)
    for (let i = 0; i < 60; i++) {
      const mid = (low + high) / 2;
      const emiGuess = (P * mid * Math.pow(1 + mid, n)) / (Math.pow(1 + mid, n) - 1);
      if (emiGuess < E) {
        low = mid;
      } else {
        high = mid;
      }
    }
    const monthlyRate = (low + high) / 2;
    return monthlyRate * 12 * 100;
  };

  // Perform calculations depending on the active tab
  const calculationResult = useMemo(() => {
    let P = parseFloat(loanAmount) || 0;
    let R = parseFloat(interestRate) || 0;
    let Y = parseFloat(periodYears) || 0;
    let E = parseFloat(emi) || 0;

    let n = Math.max(1, Math.round(Y * 12));

    if (activeTab === "Amount") {
      // Calculate Loan Amount (P) given R, Y (n), and E
      const r = R / 12 / 100;
      if (r > 0 && n > 0 && E > 0) {
        P = (E * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
      } else if (n > 0 && E > 0) {
        P = E * n;
      } else {
        P = 0;
      }
    } else if (activeTab === "EMI") {
      // Calculate EMI (E) given P, R, and Y (n)
      const r = R / 12 / 100;
      if (P > 0 && n > 0) {
        if (r > 0) {
          E = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        } else {
          E = P / n;
        }
      } else {
        E = 0;
      }
    } else if (activeTab === "Period") {
      // Calculate Period (n & Y) given P, R, and E
      const r = R / 12 / 100;
      if (P > 0 && E > 0) {
        if (r > 0) {
          if (E > P * r) {
            n = Math.log(E / (E - P * r)) / Math.log(1 + r);
            Y = n / 12;
          } else {
            n = 360;
            Y = 30;
          }
        } else {
          n = P / E;
          Y = n / 12;
        }
      }
    } else if (activeTab === "Interest") {
      // Calculate Interest Rate (R) given P, Y (n), and E
      R = solveRate(P, n, E);
    }

    const totalPayment = E * n;
    const totalInterest = Math.max(0, totalPayment - P);
    const r = R / 12 / 100;

    // Build Amortization Schedule with Yearly Subtotals
    const schedule = [];
    let currentBalance = P;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let m = 1; m <= Math.round(n); m++) {
      const monthlyInterest = currentBalance * r;
      let monthlyPrincipal = E - monthlyInterest;

      if (m === Math.round(n) || currentBalance - monthlyPrincipal < 0.5) {
        monthlyPrincipal = currentBalance;
      }

      const remaining = Math.max(0, currentBalance - monthlyPrincipal);
      yearlyPrincipal += monthlyPrincipal;
      yearlyInterest += monthlyInterest;

      schedule.push({
        type: "month",
        month: m,
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        balance: remaining,
      });

      currentBalance = remaining;

      // Add Yearly Summary row every 12 months or at the end
      if (m % 12 === 0 || m === Math.round(n)) {
        schedule.push({
          type: "yearly_total",
          year: Math.ceil(m / 12),
          principal: yearlyPrincipal,
          interest: yearlyInterest,
          balance: remaining,
        });
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    }

    return {
      principal: P,
      interestRate: R,
      periodYears: Y,
      totalMonths: Math.round(n),
      emi: E,
      totalPayment,
      totalInterest,
      schedule,
    };
  }, [activeTab, loanAmount, interestRate, periodYears, emi]);

  // Share functionality
  const handleShare = async () => {
    const shareText = `Quick Loan Calculator Details:
• Loan Amount: ₹${Math.round(calculationResult.principal).toLocaleString("en-IN")}
• Interest Rate: ${calculationResult.interestRate.toFixed(2)}%
• Period: ${calculationResult.totalMonths} Months (${(calculationResult.totalMonths / 12).toFixed(1)} Yrs)
• Monthly EMI: ₹${Math.round(calculationResult.emi).toLocaleString("en-IN")}
• Total Interest: ₹${Math.round(calculationResult.totalInterest).toLocaleString("en-IN")}
• Total Payment: ₹${Math.round(calculationResult.totalPayment).toLocaleString("en-IN")}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Quick Calculator Details",
          text: shareText,
        });
        return;
      } catch {
        // user cancelled or share failed, fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Currency & formatting helpers
  const formatCurrencyWithDecimals = (val) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0.00";
    return (
      "₹" +
      Number(val).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  const formatRoundedCurrency = (val) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0";
    return "₹" + Math.round(Number(val)).toLocaleString("en-IN");
  };

  // Donut chart stroke calculations
  const totalPaymentVal = calculationResult.totalPayment > 0 ? calculationResult.totalPayment : 1;
  const principalPercent = Math.min(100, Math.max(0, (calculationResult.principal / totalPaymentVal) * 100));
  const interestPercent = Math.max(0, 100 - principalPercent);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const greenDash = (principalPercent / 100) * circumference;
  const orangeDash = (interestPercent / 100) * circumference;

  // Theming classes
  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200/80";
  const labelColor = isDark ? "text-slate-200" : "text-gray-900";
  const subtleColor = isDark ? "text-slate-400" : "text-gray-500";
  const boxBg = isDark ? "bg-[#1c1b2b] border-[#2e2d42]" : "bg-white border-gray-300";
  const trackBg = isDark ? "#28273d" : "#e5e7eb";

  // Center display values for main card
  let centerLabel = "Loan Amount";
  let centerValue = formatCurrencyWithDecimals(calculationResult.principal);

  if (activeTab === "EMI") {
    centerLabel = "Monthly EMI";
    centerValue = formatCurrencyWithDecimals(calculationResult.emi);
  } else if (activeTab === "Period") {
    centerLabel = "Period";
    centerValue = `${calculationResult.periodYears.toFixed(1)} Yr`;
  } else if (activeTab === "Interest") {
    centerLabel = "Interest Rate";
    centerValue = `${calculationResult.interestRate.toFixed(2)} %`;
  }

  return (
    <div className="w-full flex justify-center py-2 px-3 sm:px-4">
      {/* Dynamic Range Slider Custom CSS */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(0, 0, 0, 0.08);
          margin-top: -8px;
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        input[type="range"]::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 9999px;
        }
        input[type="range"]::-moz-range-track {
          height: 6px;
          border-radius: 9999px;
        }
      `}</style>

      <div className="w-full max-w-[500px] mx-auto" style={{ maxWidth: "500px", width: "100%" }}>
        {!showDetails ? (
          /* ========================================================= */
          /* SCREEN 1: QUICK CALCULATOR MAIN INTERFACE                 */
          /* ========================================================= */
          <div className="flex flex-col space-y-4">
            {/* Header: Back left, Quick Calculator center, Details right */}
            <div className="grid grid-cols-[80px_1fr_80px] items-center py-1">
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{ color: primaryColor }}
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity font-bold text-sm sm:text-base cursor-pointer"
                >
                  <IoChevronBack className="w-5 h-5" />
                  <span>Back</span>
                </button>
              </div>

              <div className="text-center">
                <h1 className={`text-lg sm:text-xl font-bold whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
                  Quick Calculator
                </h1>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  style={{ color: primaryColor }}
                  className="hover:opacity-80 transition-opacity font-bold text-sm sm:text-base cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>

            {/* Top Navigation Tabs */}
            <div
              className={`p-1 rounded-2xl flex items-center justify-between border ${
                isDark ? "bg-[#151421] border-[#232234]" : "bg-[#f1f3f6] border-gray-200/60"
              }`}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      backgroundColor: isActive ? primaryColor : "transparent",
                      color: isActive ? "#ffffff" : isDark ? "#cbd5e1" : "#1f2937",
                    }}
                    className={`flex-1 py-2 text-center text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      isActive ? "shadow-sm" : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Results Card with Donut Chart */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col relative ${cardBg} ${cardBorder}`}
            >
              {/* Total Payment in Top-Left */}
              <div className="flex flex-col items-start z-10">
                <span className={`text-xs sm:text-sm font-bold ${labelColor}`}>
                  Total Payment
                </span>
                <span className="text-sky-500 font-bold text-sm sm:text-base mt-0.5">
                  {formatCurrencyWithDecimals(calculationResult.totalPayment)}
                </span>
              </div>

              {/* Donut Chart */}
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 self-center flex items-center justify-center my-1">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 160 160"
                >
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={isDark ? "#232234" : "#f1f5f9"}
                    strokeWidth="24"
                    fill="transparent"
                  />
                  {/* Green segment (Loan Amount / Principal) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={GREEN_COLOR}
                    strokeWidth="24"
                    strokeDasharray={`${greenDash} ${circumference}`}
                    strokeDashoffset="0"
                    fill="transparent"
                    strokeLinecap="butt"
                  />
                  {/* Orange segment (Interest) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={ORANGE_COLOR}
                    strokeWidth="24"
                    strokeDasharray={`${orangeDash} ${circumference}`}
                    strokeDashoffset={-greenDash}
                    fill="transparent"
                    strokeLinecap="butt"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                  <span className={`text-xs sm:text-sm font-medium ${subtleColor}`}>
                    {centerLabel}
                  </span>
                  <span
                    style={{ color: primaryColor }}
                    className="text-base sm:text-lg font-extrabold tracking-tight mt-0.5"
                  >
                    {centerValue}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-around w-full mt-3">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span
                      style={{ backgroundColor: GREEN_COLOR }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <span>Loan Amount</span>
                  </div>
                  <span
                    style={{ color: GREEN_COLOR }}
                    className="text-sm sm:text-base font-bold mt-0.5"
                  >
                    {formatRoundedCurrency(calculationResult.principal)}
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
                    className="text-sm sm:text-base font-bold mt-0.5"
                  >
                    {formatRoundedCurrency(calculationResult.totalInterest)}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* INPUT SLIDER CARDS (The 3 variables other than activeTab) */}
            {/* ========================================================= */}

            {/* Input Card: Loan Amount (Visible if tab != "Amount") */}
            {activeTab !== "Amount" && (
              <div
                className={`rounded-2xl border p-4 shadow-xs flex flex-col space-y-3 ${cardBg} ${cardBorder}`}
              >
                <div className="flex items-center justify-between">
                  <label className={`text-sm sm:text-base font-bold ${labelColor}`}>
                    Loan Amount
                  </label>
                  <div
                    className={`border rounded-lg px-3 py-1.5 min-w-[100px] text-right font-bold text-sm sm:text-base ${boxBg}`}
                  >
                    <input
                      type="text"
                      value={formatRoundedCurrency(loanAmount)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value.replace(/[^0-9]/g, "")) || 0;
                        setLoanAmount(val);
                      }}
                      className="w-full text-right bg-transparent outline-none font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="5000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${
                      ((loanAmount - 10000) / (10000000 - 10000)) * 100
                    }%, ${trackBg} ${
                      ((loanAmount - 10000) / (10000000 - 10000)) * 100
                    }%, ${trackBg} 100%)`,
                  }}
                  className="w-full appearance-none rounded-full cursor-pointer h-1.5 outline-none"
                />
              </div>
            )}

            {/* Input Card: Interest % (Visible if tab != "Interest") */}
            {activeTab !== "Interest" && (
              <div
                className={`rounded-2xl border p-4 shadow-xs flex flex-col space-y-3 ${cardBg} ${cardBorder}`}
              >
                <div className="flex items-center justify-between">
                  <label className={`text-sm sm:text-base font-bold ${labelColor}`}>
                    Interest %
                  </label>
                  <div
                    className={`border rounded-lg px-3 py-1.5 min-w-[85px] text-right font-bold text-sm sm:text-base ${boxBg}`}
                  >
                    <input
                      type="text"
                      value={`${interestRate} %`}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0;
                        setInterestRate(val);
                      }}
                      className="w-full text-right bg-transparent outline-none font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${
                      ((interestRate - 1) / (30 - 1)) * 100
                    }%, ${trackBg} ${((interestRate - 1) / (30 - 1)) * 100}%, ${trackBg} 100%)`,
                  }}
                  className="w-full appearance-none rounded-full cursor-pointer h-1.5 outline-none"
                />
              </div>
            )}

            {/* Input Card: Period (Visible if tab != "Period") */}
            {activeTab !== "Period" && (
              <div
                className={`rounded-2xl border p-4 shadow-xs flex flex-col space-y-3 ${cardBg} ${cardBorder}`}
              >
                <div className="flex items-center justify-between">
                  <label className={`text-sm sm:text-base font-bold ${labelColor}`}>
                    Period
                  </label>
                  <div
                    className={`border rounded-lg px-3 py-1.5 min-w-[80px] text-right font-bold text-sm sm:text-base ${boxBg}`}
                  >
                    <input
                      type="text"
                      value={`${periodYears} Yr`}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0;
                        setPeriodYears(val);
                      }}
                      className="w-full text-right bg-transparent outline-none font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={periodYears}
                  onChange={(e) => setPeriodYears(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${
                      ((periodYears - 1) / (30 - 1)) * 100
                    }%, ${trackBg} ${((periodYears - 1) / (30 - 1)) * 100}%, ${trackBg} 100%)`,
                  }}
                  className="w-full appearance-none rounded-full cursor-pointer h-1.5 outline-none"
                />
              </div>
            )}

            {/* Input Card: EMI (Visible if tab != "EMI") */}
            {activeTab !== "EMI" && (
              <div
                className={`rounded-2xl border p-4 shadow-xs flex flex-col space-y-3 ${cardBg} ${cardBorder}`}
              >
                <div className="flex items-center justify-between">
                  <label className={`text-sm sm:text-base font-bold ${labelColor}`}>
                    EMI
                  </label>
                  <div
                    className={`border rounded-lg px-3 py-1.5 min-w-[110px] text-right font-bold text-sm sm:text-base ${boxBg}`}
                  >
                    <input
                      type="text"
                      value={formatRoundedCurrency(emi)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value.replace(/[^0-9]/g, "")) || 0;
                        setEmi(val);
                      }}
                      className="w-full text-right bg-transparent outline-none font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="500000"
                  step="500"
                  value={emi}
                  onChange={(e) => setEmi(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${
                      ((emi - 1000) / (500000 - 1000)) * 100
                    }%, ${trackBg} ${((emi - 1000) / (500000 - 1000)) * 100}%, ${trackBg} 100%)`,
                  }}
                  className="w-full appearance-none rounded-full cursor-pointer h-1.5 outline-none"
                />
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* SCREEN 2: DETAILS VIEW (Matching Images 2 & 3)             */
          /* ========================================================= */
          <div className="flex flex-col space-y-4">
            {/* Modal Header: Close button left, Details title center, Share right */}
            <div className="grid grid-cols-[40px_1fr_40px] items-center py-1">
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isDark
                      ? "bg-[#232234] text-gray-300 hover:text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="Close Details"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center">
                <h2 className={`text-lg sm:text-xl font-bold whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
                  Details
                </h2>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleShare}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isDark
                      ? "bg-[#232234] text-gray-300 hover:text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="Share Details"
                >
                  <IoShareOutline className="w-5 h-5" />
                </button>
              </div>
            </div>

            {copied && (
              <div className="bg-emerald-500 text-white text-xs sm:text-sm py-1.5 px-3 rounded-xl text-center font-semibold shadow-xs">
                Details copied to clipboard!
              </div>
            )}

            {/* Top Summary Table */}
            <div
              className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${
                isDark ? "divide-[#232234]" : "divide-gray-100"
              }`}
            >
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className={`text-xs sm:text-sm font-medium ${subtleColor}`}>Amount</span>
                <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                  {formatRoundedCurrency(calculationResult.principal)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className={`text-xs sm:text-sm font-medium ${subtleColor}`}>Interest %</span>
                <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                  {calculationResult.interestRate.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className={`text-xs sm:text-sm font-medium ${subtleColor}`}>Period (Months)</span>
                <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                  {calculationResult.totalMonths}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className={`text-xs sm:text-sm font-medium ${subtleColor}`}>Monthly EMI</span>
                <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                  {formatRoundedCurrency(calculationResult.emi)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className={`text-xs sm:text-sm font-medium ${subtleColor}`}>Total Interest</span>
                <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                  {formatRoundedCurrency(calculationResult.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className={`text-xs sm:text-sm font-medium ${subtleColor}`}>Processing Fees</span>
                <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                  {processingFee}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className={`text-xs sm:text-sm font-medium ${subtleColor}`}>Total Payment</span>
                <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                  {formatRoundedCurrency(calculationResult.totalPayment)}
                </span>
              </div>
            </div>

            {/* Donut Chart Card (In Details Screen) */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center ${cardBg} ${cardBorder}`}
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
                    strokeWidth="24"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={GREEN_COLOR}
                    strokeWidth="24"
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
                    strokeWidth="24"
                    strokeDasharray={`${orangeDash} ${circumference}`}
                    strokeDashoffset={-greenDash}
                    fill="transparent"
                    strokeLinecap="butt"
                  />
                </svg>

                {/* Center Content for Details: Total Payment */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-xs sm:text-sm font-medium ${subtleColor}`}>
                    Total Payment
                  </span>
                  <span
                    style={{ color: primaryColor }}
                    className="text-base sm:text-lg font-extrabold tracking-tight mt-0.5"
                  >
                    {formatRoundedCurrency(calculationResult.totalPayment)}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-around w-full mt-3 pt-3 border-t border-gray-100 dark:border-[#232234]">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span
                      style={{ backgroundColor: GREEN_COLOR }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <span>Loan Amount</span>
                  </div>
                  <span
                    style={{ color: GREEN_COLOR }}
                    className="text-sm sm:text-base font-bold mt-0.5"
                  >
                    {formatRoundedCurrency(calculationResult.principal)}
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
                    className="text-sm sm:text-base font-bold mt-0.5"
                  >
                    {formatRoundedCurrency(calculationResult.totalInterest)}
                  </span>
                </div>
              </div>
            </div>

            {/* Collapsible Amortization Breakdown Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                style={{ color: primaryColor }}
                className="flex items-center justify-between w-full text-left font-semibold text-sm sm:text-base hover:opacity-80 transition-opacity cursor-pointer py-1"
              >
                <span>{showBreakdown ? "Hide Details" : "Show Details"}</span>
                {showBreakdown ? (
                  <HiChevronUp className="w-5 h-5" />
                ) : (
                  <HiChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Amortization Table with Yearly Subtotals (Matching Image 3) */}
            {showBreakdown && (
              <div className={`rounded-2xl overflow-hidden shadow-xs border ${cardBorder}`}>
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: primaryColor, color: "#ffffff" }}>
                      <th className="py-2.5 px-3 font-semibold text-left">Month</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Principal</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Interest</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDark
                        ? "bg-[#161522] divide-[#232234] text-slate-200"
                        : "bg-white divide-gray-100 text-gray-800"
                    }`}
                  >
                    {calculationResult.schedule.map((item, idx) => {
                      if (item.type === "yearly_total") {
                        // Highlighted Yearly Total Row (Matching Image 3)
                        return (
                          <tr
                            key={`total-yr-${item.year}-${idx}`}
                            style={{ backgroundColor: primaryColor, color: "#ffffff" }}
                            className="font-bold"
                          >
                            <td className="py-2.5 px-3 text-left">Total</td>
                            <td className="py-2.5 px-3 text-center">
                              {formatRoundedCurrency(item.principal)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {formatRoundedCurrency(item.interest)}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {formatRoundedCurrency(item.balance)}
                            </td>
                          </tr>
                        );
                      }

                      // Regular Monthly Row
                      return (
                        <tr
                          key={`month-${item.month}`}
                          className={
                            item.month % 2 === 0
                              ? isDark
                                ? "bg-[#1c1b2b]/50"
                                : "bg-rose-50/20"
                              : ""
                          }
                        >
                          <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                            {item.month}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {formatRoundedCurrency(item.principal)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {formatRoundedCurrency(item.interest)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium">
                            {formatRoundedCurrency(item.balance)}
                          </td>
                        </tr>
                      );
                    })}
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

export default Qcalculator;
