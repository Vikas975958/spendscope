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
import { HiChevronUp, HiChevronDown } from "react-icons/hi2";

const CORAL_COLOR = "#ee6055";
const GREEN_COLOR = "#22c55e";
const ORANGE_COLOR = "#f97316";

const StpCalculator = () => {
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
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [stpAmount, setStpAmount] = useState("");
  const [transferorRate, setTransferorRate] = useState("");
  const [transfereeRate, setTransfereeRate] = useState("");
  const [periodType, setPeriodType] = useState("Yearly"); // "Yearly" | "Monthly"
  const [period, setPeriod] = useState("");

  // Result and view states
  const [hasCalculated, setHasCalculated] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Exact STP Financial Calculation matching Try 2 verified math
  const calculatedData = useMemo(() => {
    const P = parseFloat(investmentAmount) || 0;
    const S = parseFloat(stpAmount) || 0;
    const r1 = (parseFloat(transferorRate) || 0) / 100 / 12;
    const r2 = (parseFloat(transfereeRate) || 0) / 100 / 12;
    const numPeriod = parseFloat(period) || 0;

    const totalMonths =
      periodType === "Yearly" ? Math.round(numPeriod * 12) : Math.round(numPeriod);

    let b1 = P;
    let b2 = 0;
    let totalTransferred = 0;
    const yearlySchedule = [];

    let currentYearTransferred = 0;

    for (let m = 1; m <= totalMonths; m++) {
      // 1. Transfer STP amount from source to destination
      const actualTransfer = Math.min(b1, S);
      b1 = Math.max(0, b1 - actualTransfer);
      b2 = b2 + actualTransfer;
      totalTransferred += actualTransfer;
      currentYearTransferred += actualTransfer;

      // 2. Both balances grow with respective monthly interest
      b1 = b1 * (1 + r1);
      b2 = b2 * (1 + r2);

      // Record annual milestones
      if (m % 12 === 0 || m === totalMonths) {
        const yr = Math.ceil(m / 12);
        const yrRoundTransferred = Math.round(currentYearTransferred);
        const yrRoundB1 = Math.round(b1);
        const yrRoundB2 = Math.round(b2);
        const yrProfit = Math.max(0, Math.round(b1 + b2 - P));

        yearlySchedule.push({
          year: yr,
          transferred: yrRoundTransferred,
          transferorBalance: yrRoundB1,
          transfereeBalance: yrRoundB2,
          totalProfit: yrProfit,
        });

        currentYearTransferred = 0;
      }

      if (b1 <= 0 && b2 <= 0) break;
    }

    const roundB1 = Math.round(b1);
    const roundB2 = Math.round(b2);
    const roundTransferred = Math.round(totalTransferred);
    const totalProfit = Math.max(0, Math.round(b1 + b2 - P));

    return {
      principal: P,
      stpAmount: S,
      transferorRate: parseFloat(transferorRate) || 0,
      transfereeRate: parseFloat(transfereeRate) || 0,
      totalMonths,
      totalTransferred: roundTransferred,
      totalProfit,
      balanceTransferor: roundB1,
      balanceTransferee: roundB2,
      totalValue: roundB1 + roundB2,
      schedule: yearlySchedule,
    };
  }, [
    investmentAmount,
    stpAmount,
    transferorRate,
    transfereeRate,
    periodType,
    period,
  ]);

  // Handle Calculate button click
  const handleCalculate = () => {
    // If empty, supply sample data as in Screenshot 2
    if (!investmentAmount && !stpAmount && !transferorRate && !transfereeRate && !period) {
      setInvestmentAmount("1000");
      setStpAmount("5");
      setTransferorRate("6");
      setTransfereeRate("6");
      setPeriodType("Yearly");
      setPeriod("2");
    }
    setHasCalculated(true);
  };

  // Handle Reset button click
  const handleReset = () => {
    setInvestmentAmount("");
    setStpAmount("");
    setTransferorRate("");
    setTransfereeRate("");
    setPeriodType("Yearly");
    setPeriod("");
    setHasCalculated(false);
    setShowDetails(false);
  };

  // Helper formatters
  const formatCurrency = (val) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0";
    return "₹" + Number(val).toLocaleString("en-US");
  };

  // Share calculation
  const handleShare = async () => {
    const text = `STP Calculation Details:
• Investment Amount: ₹${Number(calculatedData.principal).toLocaleString("en-US")}
• STP Amount: ₹${Number(calculatedData.stpAmount).toLocaleString("en-US")}
• Transferor (%): ${calculatedData.transferorRate}%
• Transferee (%): ${calculatedData.transfereeRate}%
• Period: ${period} ${periodType}
• Total Amount Transferred: ₹${calculatedData.totalTransferred.toLocaleString("en-US")}
• Total Profit: ₹${calculatedData.totalProfit.toLocaleString("en-US")}
• Balance in Transferor: ₹${calculatedData.balanceTransferor.toLocaleString("en-US")}
• Balance in Transferee: ₹${calculatedData.balanceTransferee.toLocaleString("en-US")}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "STP Calculator Details",
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

  // Donut chart calculations
  const totalVal =
    calculatedData.balanceTransferor + calculatedData.balanceTransferee || 1;
  const transferorRatio = Math.min(
    1,
    Math.max(0, calculatedData.balanceTransferor / totalVal)
  );

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const greenDash = transferorRatio * circumference;
  const orangeDash = (1 - transferorRatio) * circumference;

  // Theme styling helpers matching project standards
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
          /* SCREEN 1: INPUT FORM (Matches Screenshots 1 & 2)          */
          /* ========================================================= */
          <div className="flex flex-col space-y-4">
            {/* Header: Back Button Left, Title Center, Details Link Right */}
            <div className="grid grid-cols-[80px_1fr_80px] items-center py-1">
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
                <h1
                  className={`text-lg sm:text-xl font-bold whitespace-nowrap ${titleColor}`}
                >
                  STP Calculator
                </h1>
              </div>

              <div className="flex justify-end">
                {hasCalculated && (
                  <button
                    type="button"
                    onClick={() => setShowDetails(true)}
                    className="text-[#ee6055] hover:opacity-80 transition-opacity font-medium text-sm sm:text-base cursor-pointer"
                  >
                    Details
                  </button>
                )}
              </div>
            </div>

            {/* Form Inputs Card */}
            <div
              className={`rounded-2xl border shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
            >
              {/* Row 1: Investment Amount */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium leading-tight ${labelColor}`}
                >
                  <span className="block">Investment</span>
                  <span className="block">Amount</span>
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  {investmentAmount ? (
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mr-1">
                      ₹
                    </span>
                  ) : null}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      investmentAmount
                        ? Number(investmentAmount).toLocaleString("en-US")
                        : ""
                    }
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, "");
                      const num = Number(cleaned);
                      if (num > 100000000) {
                        setInvestmentAmount("100000000");
                      } else {
                        setInvestmentAmount(cleaned);
                      }
                    }}
                    placeholder="Enter amount"
                    className={`w-full max-w-[150px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-300 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {investmentAmount && (
                    <button
                      type="button"
                      onClick={() => setInvestmentAmount("")}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      <IoCloseCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: STP Amount */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium ${labelColor}`}
                >
                  STP Amount
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  {stpAmount ? (
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mr-1">
                      ₹
                    </span>
                  ) : null}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      stpAmount ? Number(stpAmount).toLocaleString("en-US") : ""
                    }
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, "");
                      const num = Number(cleaned);
                      if (num > 10000000) {
                        setStpAmount("10000000");
                      } else {
                        setStpAmount(cleaned);
                      }
                    }}
                    placeholder="Enter amount"
                    className={`w-full max-w-[150px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-300 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {stpAmount && (
                    <button
                      type="button"
                      onClick={() => setStpAmount("")}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      <IoCloseCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 3: Transferor (%) */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium ${labelColor}`}
                >
                  Transferor (%)
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={transferorRate}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                      const num = parseFloat(cleaned);
                      if (!isNaN(num) && num > 30) {
                        setTransferorRate("30");
                      } else {
                        setTransferorRate(cleaned);
                      }
                    }}
                    placeholder="Ex: 6.5%"
                    className={`w-full max-w-[150px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-300 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {transferorRate && (
                    <button
                      type="button"
                      onClick={() => setTransferorRate("")}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      <IoCloseCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 4: Transferee (%) */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium ${labelColor}`}
                >
                  Transferee (%)
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={transfereeRate}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                      const num = parseFloat(cleaned);
                      if (!isNaN(num) && num > 30) {
                        setTransfereeRate("30");
                      } else {
                        setTransfereeRate(cleaned);
                      }
                    }}
                    placeholder="Ex: 6.5%"
                    className={`w-full max-w-[150px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-300 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {transfereeRate && (
                    <button
                      type="button"
                      onClick={() => setTransfereeRate("")}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      <IoCloseCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 5: Period Type (Segmented Pill Toggle: Yearly | Monthly) */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium ${labelColor}`}
                >
                  Period Type
                </label>
                <div
                  className={`p-1 rounded-xl flex items-center gap-1 ${
                    isDark ? "bg-[#212032]" : "bg-[#f4f5f8]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setPeriodType("Yearly")}
                    style={
                      periodType === "Yearly"
                        ? { backgroundColor: CORAL_COLOR, color: "#ffffff" }
                        : {}
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      periodType === "Yearly"
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
                    onClick={() => setPeriodType("Monthly")}
                    style={
                      periodType === "Monthly"
                        ? { backgroundColor: CORAL_COLOR, color: "#ffffff" }
                        : {}
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      periodType === "Monthly"
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

              {/* Row 6: Period */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium ${labelColor}`}
                >
                  Period
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={period}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, "");
                      const num = parseInt(cleaned, 10);
                      const maxLimit = periodType === "Yearly" ? 50 : 600;
                      if (!isNaN(num) && num > maxLimit) {
                        setPeriod(String(maxLimit));
                      } else {
                        setPeriod(cleaned);
                      }
                    }}
                    placeholder={
                      periodType === "Yearly" ? "Max 50 years" : "Max 600 months"
                    }
                    className={`w-full max-w-[150px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-300 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {period && (
                    <button
                      type="button"
                      onClick={() => setPeriod("")}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      <IoCloseCircle className="w-4 h-4" />
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
                    ? "border-slate-600 bg-[#161522] text-slate-100 hover:bg-[#201f30]"
                    : "border-slate-900 bg-white text-gray-900 hover:bg-gray-50 shadow-xs"
                }`}
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleCalculate}
                style={{
                  backgroundColor: CORAL_COLOR,
                  color: "#ffffff",
                }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-[0.99]"
              >
                Calculate
              </button>
            </div>

            {/* RESULTS SUMMARY CARD (Rendered when calculated, matching Screenshot 2) */}
            {hasCalculated && (
              <div
                className={`rounded-2xl border shadow-xs overflow-hidden ${cardBg} ${cardBorder}`}
              >
                {/* Row 1: Total Amount Transferred */}
                <div className="grid grid-cols-2 divide-x divide-gray-200/90 dark:divide-[#232234] border-b border-gray-200/90 dark:border-[#232234]">
                  <div className="px-4 py-3 sm:py-3.5 text-sm sm:text-base font-normal sm:font-medium text-gray-800 dark:text-slate-200">
                    Total Amount Transferred
                  </div>
                  <div className="px-4 py-3 sm:py-3.5 text-right text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(calculatedData.totalTransferred)}
                  </div>
                </div>

                {/* Row 2: Total Profit */}
                <div className="grid grid-cols-2 divide-x divide-gray-200/90 dark:divide-[#232234] border-b border-gray-200/90 dark:border-[#232234]">
                  <div className="px-4 py-3 sm:py-3.5 text-sm sm:text-base font-normal sm:font-medium text-gray-800 dark:text-slate-200">
                    Total Profit
                  </div>
                  <div className="px-4 py-3 sm:py-3.5 text-right text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(calculatedData.totalProfit)}
                  </div>
                </div>

                {/* Row 3: Balance in Transferor */}
                <div className="grid grid-cols-2 divide-x divide-gray-200/90 dark:divide-[#232234] border-b border-gray-200/90 dark:border-[#232234]">
                  <div className="px-4 py-3 sm:py-3.5 text-sm sm:text-base font-normal sm:font-medium text-gray-800 dark:text-slate-200">
                    Balance in Transferor
                  </div>
                  <div className="px-4 py-3 sm:py-3.5 text-right text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(calculatedData.balanceTransferor)}
                  </div>
                </div>

                {/* Row 4: Balance in Transferee */}
                <div className="grid grid-cols-2 divide-x divide-gray-200/90 dark:divide-[#232234]">
                  <div className="px-4 py-3 sm:py-3.5 text-sm sm:text-base font-normal sm:font-medium text-gray-800 dark:text-slate-200">
                    Balance in Transferee
                  </div>
                  <div className="px-4 py-3 sm:py-3.5 text-right text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(calculatedData.balanceTransferee)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* SCREEN 2: DETAILS MODAL VIEW                              */
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

            {/* Top Summary Table */}
            <div
              className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
            >
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Total Amount Transferred
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {formatCurrency(calculatedData.totalTransferred)}
                </span>
              </div>

              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Total Profit
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {formatCurrency(calculatedData.totalProfit)}
                </span>
              </div>

              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Balance in Transferor
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {formatCurrency(calculatedData.balanceTransferor)}
                </span>
              </div>

              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Balance in Transferee
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {formatCurrency(calculatedData.balanceTransferee)}
                </span>
              </div>
            </div>

            {/* Donut Chart Card */}
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
                  {/* Green segment: Transferor */}
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
                  {/* Orange segment: Transferee */}
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

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium">
                    Total Value
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mt-0.5">
                    {formatCurrency(calculatedData.totalValue)}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: GREEN_COLOR }}
                  />
                  <span className="text-gray-600 dark:text-slate-400 font-medium">
                    Transferor
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ORANGE_COLOR }}
                  />
                  <span className="text-gray-600 dark:text-slate-400 font-medium">
                    Transferee
                  </span>
                </div>
              </div>
            </div>

            {/* Yearly Breakdown Collapsible Accordion */}
            <div
              className={`rounded-2xl border shadow-xs overflow-hidden mb-6 ${cardBg} ${cardBorder}`}
            >
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <span className={`text-sm font-medium ${titleColor}`}>
                  Yearly Breakdown
                </span>
                <span className="text-gray-500">
                  {showBreakdown ? (
                    <HiChevronUp className="w-5 h-5" />
                  ) : (
                    <HiChevronDown className="w-5 h-5" />
                  )}
                </span>
              </button>

              {showBreakdown && (
                <div className="border-t border-gray-100 dark:border-[#232234] overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead
                      className={`text-gray-600 dark:text-slate-300 font-semibold border-b ${
                        isDark
                          ? "bg-[#1c1b2c] border-[#232234]"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <tr>
                        <th className="py-2.5 px-3">Year</th>
                        <th className="py-2.5 px-3 text-right">Transferred</th>
                        <th className="py-2.5 px-3 text-right">Transferor</th>
                        <th className="py-2.5 px-3 text-right">Transferee</th>
                        <th className="py-2.5 px-3 text-right">Total Profit</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${divideColor}`}>
                      {calculatedData.schedule.map((item) => (
                        <tr
                          key={item.year}
                          className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">
                            Yr {item.year}
                          </td>
                          <td className="py-2 px-3 text-right text-orange-500 font-medium">
                            {formatCurrency(item.transferred)}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-700 dark:text-slate-300">
                            {formatCurrency(item.transferorBalance)}
                          </td>
                          <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatCurrency(item.transfereeBalance)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(item.totalProfit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Back to Form Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm sm:text-base border transition-all cursor-pointer ${
                  isDark
                    ? "border-slate-600 bg-[#161522] text-slate-100 hover:bg-[#201f30]"
                    : "border-slate-800 bg-white text-gray-900 hover:bg-gray-50 shadow-xs"
                }`}
              >
                Edit Inputs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StpCalculator;
