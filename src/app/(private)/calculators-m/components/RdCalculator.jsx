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
  IoCloseCircle,
} from "react-icons/io5";
import {
  HiChevronUp,
  HiChevronDown,
} from "react-icons/hi2";

const GREEN_COLOR = "#22c55e";
const ORANGE_COLOR = "#f97316";

const RdCalculator = () => {
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

  // Form input states matching Screenshot 1
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [periodType, setPeriodType] = useState("Monthly"); // "Yearly" | "Monthly"
  const [period, setPeriod] = useState("");

  // View states
  const [showDetails, setShowDetails] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Financial calculations
  const calculatedData = useMemo(() => {
    const P = monthlyAmount !== "" ? parseFloat(monthlyAmount) || 0 : 5000;
    const r = interestRate !== "" ? parseFloat(interestRate) || 0 : 6.5;
    const rawPeriod = parseFloat(period) || 0;

    // Total tenure in months
    let totalMonths =
      periodType === "Yearly" ? rawPeriod * 12 : rawPeriod;

    // Default to 12 months (1 year) if empty
    if (totalMonths <= 0) {
      totalMonths = periodType === "Yearly" ? 12 : 12;
    }

    const totalInvested = P * totalMonths;
    let maturityAmount = 0;

    if (P > 0 && r >= 0 && totalMonths > 0) {
      // Standard quarterly compounding formula for Recurring Deposit (IBA guideline)
      const quarterlyRate = (r / 100) / 4;
      let total = 0;
      for (let i = 1; i <= totalMonths; i++) {
        const remainingQuarters = (totalMonths - i + 1) / 3;
        total += P * Math.pow(1 + quarterlyRate, remainingQuarters);
      }
      maturityAmount = total;
    }

    const totalInterest = Math.max(0, maturityAmount - totalInvested);

    // Maturity Date Calculation
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + Math.round(totalMonths));

    const maturityDateStr = targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Yearly Breakdown Schedule
    const schedule = [];
    const scheduleYears = Math.max(1, Math.ceil(totalMonths / 12));
    let cummInvested = 0;

    for (let yr = 1; yr <= scheduleYears; yr++) {
      const monthsUpToYr = Math.min(totalMonths, yr * 12);
      const monthsInYr = monthsUpToYr - (yr - 1) * 12;
      const yrInvestment = P * monthsInYr;
      cummInvested += yrInvestment;

      let yrMaturity = 0;
      const quarterlyRate = (r / 100) / 4;
      for (let i = 1; i <= monthsUpToYr; i++) {
        const remQuarters = (monthsUpToYr - i + 1) / 3;
        yrMaturity += P * Math.pow(1 + quarterlyRate, remQuarters);
      }
      const yrInterest = Math.max(0, yrMaturity - cummInvested);

      schedule.push({
        year: yr,
        opening: cummInvested - yrInvestment,
        invested: yrInvestment,
        interest: yrInterest,
        closing: yrMaturity,
      });
    }

    return {
      principal: totalInvested,
      monthlyDeposit: P,
      interestRate: r,
      totalMonths,
      totalInterest,
      maturityAmount,
      maturityDate: maturityDateStr,
      schedule,
    };
  }, [monthlyAmount, interestRate, periodType, period]);

  const handleReset = () => {
    setMonthlyAmount("");
    setInterestRate("");
    setPeriodType("Monthly");
    setPeriod("");
  };

  const handleCalculate = () => {
    setShowDetails(true);
  };

  const handleShare = async () => {
    const shareText = `Recurring Deposit (RD) Details:
• Monthly Amount: ₹${calculatedData.monthlyDeposit.toFixed(2)}
• Period: ${period || (periodType === "Yearly" ? "1" : "12")} ${periodType}
• Total Investment: ₹${calculatedData.principal.toFixed(2)}
• Interest Rate: ${calculatedData.interestRate}%
• Maturity Amount: ₹${calculatedData.maturityAmount.toFixed(2)}
• Total Interest: ₹${calculatedData.totalInterest.toFixed(2)}
• Maturity Date: ${calculatedData.maturityDate}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "RD Calculator Details",
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

  // Helper formatters
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
  const totalVal = calculatedData.maturityAmount || 1;
  const principalPercent = (calculatedData.principal / totalVal) * 100;
  const interestPercent = (calculatedData.totalInterest / totalVal) * 100;

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const greenDash = (principalPercent / 100) * circumference;
  const orangeDash = (interestPercent / 100) * circumference;

  // Theme styling helpers
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
          /* SCREEN 1: INPUT FORM (RD Calculator - matches Image 1)    */
          /* ========================================================= */
          <div className="flex flex-col space-y-4">
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
                  RD Calculator
                </h1>
              </div>

              <div className="w-max" />
            </div>

            {/* Form Inputs Card */}
            <div
              className={`rounded-2xl border shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
            >
              {/* Row 1: Monthly Amount */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium ${labelColor}`}
                >
                  Monthly Amount
                </label>
                <div className="flex items-center justify-end flex-1 pl-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={monthlyAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setMonthlyAmount(val);
                    }}
                    placeholder="Enter amount"
                    className={`w-full max-w-[180px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {monthlyAmount && (
                    <button
                      type="button"
                      onClick={() => setMonthlyAmount("")}
                      className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <IoCloseCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Interest % */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-medium ${labelColor}`}
                >
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

              {/* Row 3: Period Type (Segmented Pill Toggle: Yearly | Monthly) */}
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
                        ? { backgroundColor: primaryColor, color: "#ffffff" }
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
                        ? { backgroundColor: primaryColor, color: "#ffffff" }
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

              {/* Row 4: Period */}
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
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setPeriod(val);
                    }}
                    placeholder="Enter Period"
                    className={`w-full max-w-[180px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                  />
                  {period && (
                    <button
                      type="button"
                      onClick={() => setPeriod("")}
                      className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
          /* SCREEN 2 & 3: DETAILS VIEW                                */
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

              {/* Row 2: Maturity Amount */}
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Maturity Amount
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {formatCurrency(calculatedData.maturityAmount)}
                </span>
              </div>

              {/* Row 3: Total Interest */}
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Total Interest
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {formatCurrency(calculatedData.totalInterest)}
                </span>
              </div>

              {/* Row 4: Maturity Date */}
              <div
                className={`grid grid-cols-2 divide-x ${
                  isDark ? "divide-[#232234]" : "divide-gray-200"
                }`}
              >
                <span
                  className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}
                >
                  Maturity Date
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}
                >
                  {calculatedData.maturityDate}
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
                  {/* Orange segment (Total Interest) */}
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
                    Maturity Amount
                  </span>
                  <span
                    style={{ color: primaryColor }}
                    className="text-base sm:text-lg font-bold tracking-tight mt-0.5"
                  >
                    {formatCurrency(calculatedData.maturityAmount)}
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
                    <span>Investment Amount</span>
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
                    <tr
                      style={{
                        backgroundColor: primaryColor,
                        color: "#ffffff",
                      }}
                    >
                      <th className="py-2.5 px-3 font-semibold text-left">
                        Year
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-center">
                        Invested
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-center">
                        Interest
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-right">
                        Balance
                      </th>
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
                        <td className="py-2.5 px-3 text-center">
                          {formatCurrency(item.invested)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatCurrency(item.interest)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {formatCurrency(item.closing)}
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

export default RdCalculator;
