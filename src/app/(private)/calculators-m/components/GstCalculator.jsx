"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import {
  IoChevronBack,
  IoClose,
  IoCloseCircle,
  IoShareOutline,
} from "react-icons/io5";

const CORAL_COLOR = "#f06557";
const GREEN_COLOR = "#22c55e";
const ORANGE_COLOR = "#f97316";

const GstCalculator = () => {
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

  // Mode: "add" | "remove"
  const [mode, setMode] = useState("add"); // "add" = Add GST (+), "remove" = Remove GST (-)

  // Form input states
  const [initialAmount, setInitialAmount] = useState("10");
  const [gstRate, setGstRate] = useState("18");

  // View state
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Financial calculations
  const calculatedData = useMemo(() => {
    const P = parseFloat(initialAmount) || 0;
    const R = parseFloat(gstRate) || 0;

    let baseAmount = P;
    let gstAmount = 0;
    let totalAmount = 0;

    if (mode === "add") {
      // Add GST:
      // GST Amount = Initial Amount * (R / 100)
      // Total Amount = Initial Amount + GST Amount
      baseAmount = P;
      gstAmount = (P * R) / 100;
      totalAmount = baseAmount + gstAmount;
    } else {
      // Remove GST:
      // Initial Amount is Gross (including GST)
      // Base Amount = Gross / (1 + R / 100)
      // GST Amount = Gross - Base Amount
      if (1 + R / 100 > 0) {
        baseAmount = P / (1 + R / 100);
        gstAmount = P - baseAmount;
        totalAmount = P;
      } else {
        baseAmount = P;
        gstAmount = 0;
        totalAmount = P;
      }
    }

    const halfRate = R / 2;
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;

    const baseRatio = totalAmount > 0 ? baseAmount / totalAmount : 1;
    const gstRatio = totalAmount > 0 ? gstAmount / totalAmount : 0;

    return {
      initialAmount: P,
      rate: R,
      baseAmount,
      gstAmount,
      totalAmount,
      halfRate: halfRate.toFixed(1),
      cgstAmount: cgstAmount.toFixed(2),
      sgstAmount: sgstAmount.toFixed(2),
      baseRatio: Math.min(1, Math.max(0, baseRatio)),
      gstRatio: Math.min(1, Math.max(0, gstRatio)),
    };
  }, [initialAmount, gstRate, mode]);

  // Handle Calculate button
  const handleCalculate = () => {
    if (!initialAmount && !gstRate) {
      setInitialAmount("10");
      setGstRate("18");
    }
    setShowDetails(true);
  };

  // Handle Reset button
  const handleReset = () => {
    setInitialAmount("");
    setGstRate("");
    setShowDetails(false);
  };

  // Format currency helpers
  const formatCurrency = (val, decimals = 2) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0.00";
    return (
      "₹" +
      Number(val).toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    );
  };

  // Share calculation details
  const handleShare = async () => {
    const text = `GST Calculation Details:
• Mode: ${mode === "add" ? "Add GST (+)" : "Remove GST (-)"}
• Initial Amount: ${formatCurrency(calculatedData.initialAmount, 2)}
• Rate of GST: ${calculatedData.rate}%
• GST Amount: ${formatCurrency(calculatedData.gstAmount, 2)}
• Total Amount: ${formatCurrency(calculatedData.totalAmount, 2)}
• CGST (${calculatedData.halfRate}%): ₹${calculatedData.cgstAmount}
• SGST (${calculatedData.halfRate}%): ₹${calculatedData.sgstAmount}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "GST Calculator Details",
          text,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Theme styling helpers
  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200/80";
  const divideColor = isDark ? "divide-[#232234]" : "divide-gray-100";
  const labelColor = isDark ? "text-slate-300" : "text-gray-800";
  const valueColor = isDark ? "text-slate-100" : "text-gray-900";
  const titleColor = isDark ? "text-white" : "text-gray-900";

  // Donut chart math
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const greenDash = calculatedData.baseRatio * circumference;
  const orangeDash = Math.max(0, circumference - greenDash);

  return (
    <div className="w-full max-w-[480px] mx-auto pb-12 transition-colors duration-200">
      {!showDetails ? (
        /* ========================================================= */
        /* SCREEN 1: INPUT VIEW (GST Calculator)                     */
        /* ========================================================= */
        <div className="flex flex-col space-y-4">
          {/* Header Bar */}
          <div className="grid grid-cols-[80px_1fr_80px] items-center py-1.5 px-0.5">
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-0.5 text-blue-500 hover:opacity-80 transition-opacity font-medium text-sm sm:text-base cursor-pointer"
              >
                <IoChevronBack className="w-5 h-5 text-blue-500" />
                <span>Back</span>
              </button>
            </div>

            <div className="text-center">
              <h1 className={`text-base sm:text-lg font-bold tracking-tight whitespace-nowrap ${titleColor}`}>
                GST Calculator
              </h1>
            </div>

            <div className="w-max" />
          </div>

          {/* Mode Switcher Tabs */}
          <div
            className={`grid grid-cols-2 p-1 rounded-xl border ${
              isDark ? "bg-[#161522] border-[#232234]" : "bg-gray-100 border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={() => setMode("add")}
              style={{
                backgroundColor: mode === "add" ? primaryColor : "transparent",
                color: mode === "add" ? "#ffffff" : isDark ? "#cbd5e1" : "#475569",
              }}
              className="py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
            >
              Add GST (+)
            </button>
            <button
              type="button"
              onClick={() => setMode("remove")}
              style={{
                backgroundColor: mode === "remove" ? primaryColor : "transparent",
                color: mode === "remove" ? "#ffffff" : isDark ? "#cbd5e1" : "#475569",
              }}
              className="py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
            >
              Remove GST (-)
            </button>
          </div>

          {/* Form Inputs Card */}
          <div className={`rounded-2xl border shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}>
            {/* Row 1: Initial Amount */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
                Initial Amount
              </label>
              <div className="flex items-center justify-end flex-1 pl-4">
                <span className={`text-sm sm:text-base font-normal ${valueColor} mr-0.5`}>
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={initialAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setInitialAmount(val);
                  }}
                  placeholder="0"
                  className={`w-full max-w-[150px] text-right bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                />
                {initialAmount && (
                  <button
                    type="button"
                    onClick={() => setInitialAmount("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1.5 cursor-pointer"
                  >
                    <IoCloseCircle className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Rate Of GST (%) */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
                Rate Of GST (%)
              </label>
              <div className="flex items-center justify-end flex-1 pl-4">
                <input
                  type="text"
                  inputMode="decimal"
                  value={gstRate}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setGstRate(val);
                  }}
                  placeholder="18"
                  className={`w-full max-w-[150px] text-right bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                />
                {gstRate && (
                  <button
                    type="button"
                    onClick={() => setGstRate("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1.5 cursor-pointer"
                  >
                    <IoCloseCircle className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Reset and Calculate */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm sm:text-base border transition-all cursor-pointer ${
                isDark
                  ? "border-slate-700 bg-[#161522] text-slate-100 hover:bg-[#201f30]"
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
        /* SCREEN 2: DETAILS MODAL VIEW (Matching Image 2)           */
        /* ========================================================= */
        <div className="flex flex-col space-y-4">
          {/* Header Bar */}
          <div className="grid grid-cols-[40px_1fr_40px] items-center py-1.5 px-0.5">
            {/* Gray Circular Close Button */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-200 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer shadow-xs"
                title="Close"
              >
                <IoClose className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" />
              </button>
            </div>

            <div className="text-center">
              <h2 className={`text-base sm:text-lg font-bold tracking-tight whitespace-nowrap ${titleColor}`}>
                Details
              </h2>
            </div>

            {/* Share Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleShare}
                className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white p-1 cursor-pointer transition-colors"
                title="Share Details"
              >
                <IoShareOutline className="w-6 h-6" />
              </button>
            </div>
          </div>

          {copied && (
            <div className="bg-emerald-500 text-white text-xs sm:text-sm py-2 px-3 rounded-xl text-center font-semibold shadow-xs">
              Details copied to clipboard!
            </div>
          )}

          {/* Top Summary Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}>
            {/* Initial Amount */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Initial Amount
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {formatCurrency(calculatedData.initialAmount, 2)}
              </span>
            </div>

            {/* GST Amount */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                GST Amount
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {formatCurrency(calculatedData.gstAmount, 2)}
              </span>
            </div>

            {/* Rate of GST (%) */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Rate of GST (%)
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {calculatedData.rate}
              </span>
            </div>

            {/* Total Amount */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Total Amount
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {formatCurrency(calculatedData.totalAmount, 2)}
              </span>
            </div>
          </div>

          {/* Donut Chart Card */}
          <div className={`rounded-2xl border p-5 sm:p-6 shadow-xs flex flex-col items-center justify-center ${cardBg} ${cardBorder}`}>
            {/* Donut SVG */}
            <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={isDark ? "#232234" : "#f1f5f9"}
                  strokeWidth="24"
                  fill="transparent"
                />

                {/* Green segment: Initial Amount */}
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

                {/* Orange segment: GST Amount */}
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

              {/* Center Text in Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <span className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Total Amount
                </span>
                <span
                  style={{ color: primaryColor }}
                  className="text-sm sm:text-base font-bold line-clamp-1 mt-0.5"
                >
                  ₹{Math.round(calculatedData.totalAmount)}
                </span>
              </div>
            </div>

            {/* Legend Below Chart */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-[280px] mt-6 pt-1">
              {/* Initial Amount */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: GREEN_COLOR }}
                  />
                  <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                    Initial Amount
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{Math.round(calculatedData.baseAmount)}
                </span>
              </div>

              {/* GST Amount */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: ORANGE_COLOR }}
                  />
                  <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                    GST Amount
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-orange-500">
                  ₹{Math.round(calculatedData.gstAmount)}
                </span>
              </div>
            </div>

            {/* CGST / SGST Breakdown Text */}
            <div className="mt-5 text-[11px] sm:text-xs font-medium text-gray-700 dark:text-slate-300 text-center tracking-tight">
              (CGST : {calculatedData.halfRate}% = ₹{calculatedData.cgstAmount}) (SGST : {calculatedData.halfRate}% = ₹{calculatedData.sgstAmount})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GstCalculator;
