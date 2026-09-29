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

const SwpCalculator = () => {
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
  const [totalInvestment, setTotalInvestment] = useState("");
  const [withdrawalPerMonth, setWithdrawalPerMonth] = useState("");
  const [returnRate, setReturnRate] = useState("");
  const [periodYears, setPeriodYears] = useState("");

  // View state
  const [showDetails, setShowDetails] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Financial calculations
  const calculatedData = useMemo(() => {
    // Default to sample values if empty to show realistic preview
    const P = totalInvestment !== "" ? parseFloat(totalInvestment) || 0 : 1000000;
    const W = withdrawalPerMonth !== "" ? parseFloat(withdrawalPerMonth) || 0 : 10000;
    const r = returnRate !== "" ? parseFloat(returnRate) || 0 : 6.5;
    const y = periodYears !== "" ? parseFloat(periodYears) || 0 : 5;

    const totalMonths = Math.max(1, Math.round(y * 12));
    const monthlyRate = r / 12 / 100;

    let balance = P;
    let totalWithdrawn = 0;
    const yearlySchedule = [];

    let currentYearOpening = P;
    let currentYearWithdrawn = 0;
    let currentYearReturns = 0;

    for (let m = 1; m <= totalMonths; m++) {
      const monthStart = balance;
      // Monthly interest earned on balance
      const interestEarned = balance * monthlyRate;
      balance += interestEarned;

      // Deduct monthly withdrawal
      const actualWithdraw = Math.min(balance, W);
      balance = Math.max(0, balance - actualWithdraw);
      totalWithdrawn += actualWithdraw;

      currentYearWithdrawn += actualWithdraw;
      currentYearReturns += interestEarned;

      // End of a year or end of tenure
      if (m % 12 === 0 || m === totalMonths) {
        const yrNumber = Math.ceil(m / 12);
        yearlySchedule.push({
          year: yrNumber,
          opening: Math.round(currentYearOpening),
          withdrawn: Math.round(currentYearWithdrawn),
          returns: Math.round(currentYearReturns),
          closing: Math.round(balance),
        });

        currentYearOpening = balance;
        currentYearWithdrawn = 0;
        currentYearReturns = 0;
      }

      if (balance <= 0) {
        break;
      }
    }

    const finalValue = Math.round(balance);
    const roundedWithdrawn = Math.round(totalWithdrawn);
    const totalValue = roundedWithdrawn + finalValue;
    const totalReturns = Math.max(0, totalValue - Math.round(P));

    return {
      principal: Math.round(P),
      withdrawalPerMonth: Math.round(W),
      returnRate: r,
      periodYears: y,
      totalWithdrawn: roundedWithdrawn,
      finalValue,
      totalValue,
      totalReturns,
      schedule: yearlySchedule,
    };
  }, [totalInvestment, withdrawalPerMonth, returnRate, periodYears]);

  // Handle Calculate button click
  const handleCalculate = () => {
    setShowDetails(true);
  };

  // Reset form inputs
  const handleReset = () => {
    setTotalInvestment("");
    setWithdrawalPerMonth("");
    setReturnRate("");
    setPeriodYears("");
    setShowDetails(false);
  };

  // Share calculation
  const handleShare = async () => {
    const shareText = `SWP Calculator Details:
• Total Investment: ₹${calculatedData.principal.toLocaleString("en-US")}
• Monthly Withdrawal: ₹${calculatedData.withdrawalPerMonth.toLocaleString("en-US")}
• Expected Return Rate: ${calculatedData.returnRate}%
• Period: ${calculatedData.periodYears} Years
• Total Withdrawn: ₹${calculatedData.totalWithdrawn.toLocaleString("en-US")}
• Final Value: ₹${calculatedData.finalValue.toLocaleString("en-US")}
• Total Returns: ₹${calculatedData.totalReturns.toLocaleString("en-US")}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "SWP Calculator Details",
          text: shareText,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper formatters
  const formatCurrency = (val) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0";
    return "₹" + Number(val).toLocaleString("en-US");
  };

  // Donut chart calculations
  const totalVal = (calculatedData.principal + calculatedData.totalReturns) || 1;
  const principalPercent = (calculatedData.principal / totalVal) * 100;
  const returnPercent = (calculatedData.totalReturns / totalVal) * 100;

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const greenDash = (principalPercent / 100) * circumference;
  const orangeDash = (returnPercent / 100) * circumference;

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
          /* SCREEN 1: INPUT FORM (SWP Calculator - Matches Screenshot) */
          /* ========================================================= */
          <div className="flex flex-col space-y-4">
            {/* Header: Back Button Left, Title Center */}
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
                  SWP Calculator
                </h1>
              </div>

              <div className="w-max" />
            </div>

            {/* Form Inputs Card */}
            <div
              className={`rounded-2xl border shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
            >
              {/* Row 1: Total Investment */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium ${labelColor}`}
                >
                  Total Investment
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={totalInvestment}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setTotalInvestment(val);
                    }}
                    placeholder="Enter Investment"
                    className={`w-full max-w-[180px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-300 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {totalInvestment && (
                    <button
                      type="button"
                      onClick={() => setTotalInvestment("")}
                      className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      <IoCloseCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Withdrawal Per Month */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium leading-tight ${labelColor}`}
                >
                  <span className="block">Withdrawal</span>
                  <span className="block">Per Month</span>
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={withdrawalPerMonth}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setWithdrawalPerMonth(val);
                    }}
                    placeholder="Enter withdrawal"
                    className={`w-full max-w-[180px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-300 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {withdrawalPerMonth && (
                    <button
                      type="button"
                      onClick={() => setWithdrawalPerMonth("")}
                      className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      <IoCloseCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 3: Exp. Return Rate (%) */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium leading-tight ${labelColor}`}
                >
                  <span className="block">Exp. Return</span>
                  <span className="block">Rate (%)</span>
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={returnRate}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setReturnRate(val);
                    }}
                    placeholder="Ex: 6.5%"
                    className={`w-full max-w-[180px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-300 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {returnRate && (
                    <button
                      type="button"
                      onClick={() => setReturnRate("")}
                      className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      <IoCloseCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 4: Period (Years) */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium ${labelColor}`}
                >
                  Period (Years)
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={periodYears}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setPeriodYears(val);
                    }}
                    placeholder="Enter Period"
                    className={`w-full max-w-[180px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-300 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {periodYears && (
                    <button
                      type="button"
                      onClick={() => setPeriodYears("")}
                      className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
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
          </div>
        ) : (
          /* ========================================================= */
          /* SCREEN 2: DETAILS VIEW                                    */
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

            {/* Top Summary Table (2 columns with vertical dividing line) */}
            <div
              className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
            >
              {/* Row 1: Total Investment */}
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Total Investment
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {formatCurrency(calculatedData.principal)}
                </span>
              </div>

              {/* Row 2: Total Withdrawn */}
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Total Withdrawn
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {formatCurrency(calculatedData.totalWithdrawn)}
                </span>
              </div>

              {/* Row 3: Final Value */}
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Final Value
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {formatCurrency(calculatedData.finalValue)}
                </span>
              </div>

              {/* Row 4: Total Returns */}
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Total Returns
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {formatCurrency(calculatedData.totalReturns)}
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
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={isDark ? "#232234" : "#f1f5f9"}
                    strokeWidth="22"
                    fill="transparent"
                  />
                  {/* Green segment (Total Investment) */}
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
                  {/* Orange segment (Total Returns) */}
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

                {/* Center Text inside Donut Chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium">
                    Final Value
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mt-0.5">
                    {formatCurrency(calculatedData.finalValue)}
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
                    Total Investment
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ORANGE_COLOR }}
                  />
                  <span className="text-gray-600 dark:text-slate-400 font-medium">
                    Total Returns
                  </span>
                </div>
              </div>
            </div>

            {/* Yearly Breakdown Collapsible Accordion */}
            <div
              className={`rounded-2xl border shadow-xs overflow-hidden ${cardBg} ${cardBorder}`}
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
                        <th className="py-2.5 px-3 text-right">Withdrawn</th>
                        <th className="py-2.5 px-3 text-right">Returns</th>
                        <th className="py-2.5 px-3 text-right">Closing</th>
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
                            {formatCurrency(item.withdrawn)}
                          </td>
                          <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatCurrency(item.returns)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(item.closing)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recalculate Button */}
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
                Edit Inputs / Recalculate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwpCalculator;
