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

const GREEN_COLOR = "#2ecc71";
const ORANGE_COLOR = "#f97316";

const EmiC = () => {
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

  // Form input states
  const [loanAmount, setLoanAmount] = useState("2000");
  const [interestRate, setInterestRate] = useState("10");
  const [periodType, setPeriodType] = useState("monthly"); // "yearly" | "monthly"
  const [period, setPeriod] = useState("6");
  const [processingFee, setProcessingFee] = useState("100");

  // View toggles
  const [showDetails, setShowDetails] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [copied, setCopied] = useState(false);

  // Financial calculations
  const calculatedData = useMemo(() => {
    const P = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const rawPeriod = parseFloat(period) || 0;
    const feeRate = parseFloat(processingFee) || 0;

    const totalMonths = periodType === "yearly" ? rawPeriod * 12 : rawPeriod;
    const r = rate / 12 / 100;
    const n = Math.max(1, Math.round(totalMonths));

    let emi = 0;
    if (P > 0 && n > 0) {
      if (r > 0) {
        emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else {
        emi = P / n;
      }
    }

    const processingFeeAmount = P * (feeRate / 100);

    // Amortization Schedule
    const schedule = [];
    let currentBalance = P;
    let totalInterest = 0;

    if (P > 0 && n > 0) {
      for (let m = 1; m <= n; m++) {
        const monthlyInterest = currentBalance * r;
        let monthlyPrincipal = emi - monthlyInterest;

        if (m === n || currentBalance - monthlyPrincipal < 0.01) {
          monthlyPrincipal = currentBalance;
        }

        const remaining = Math.max(0, currentBalance - monthlyPrincipal);
        totalInterest += monthlyInterest;

        schedule.push({
          month: m,
          principal: monthlyPrincipal,
          interest: monthlyInterest,
          balance: remaining,
        });

        currentBalance = remaining;
      }
    }

    const totalPayment = P + totalInterest;

    return {
      principal: P,
      interestRate: rate,
      totalMonths: n,
      emi,
      totalInterest,
      processingFeeAmount,
      totalPayment,
      schedule,
    };
  }, [loanAmount, interestRate, periodType, period, processingFee]);

  const handleReset = () => {
    setLoanAmount("2000");
    setInterestRate("10");
    setPeriodType("monthly");
    setPeriod("6");
    setProcessingFee("100");
  };

  const handleShare = async () => {
    const shareText = `EMI Calculation Details:
• Loan Amount: ₹${Number(loanAmount).toLocaleString("en-IN")}
• Interest Rate: ${interestRate}%
• Period: ${period} ${periodType === "yearly" ? "Years" : "Months"}
• Monthly EMI: ₹${calculatedData.emi.toFixed(2)}
• Total Interest: ₹${calculatedData.totalInterest.toFixed(2)}
• Total Payment: ₹${calculatedData.totalPayment.toFixed(2)}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "EMI Calculator Details",
          text: shareText,
        });
        return;
      } catch {
        // fallback
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper formatters
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

  const formatRoundedCurrency = (val) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0";
    return "₹" + Math.round(Number(val)).toLocaleString("en-IN");
  };

  // Donut chart calculations
  const totalVal = calculatedData.totalPayment || 1;
  const principalPercent = (calculatedData.principal / totalVal) * 100;
  const interestPercent = (calculatedData.totalInterest / totalVal) * 100;

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const greenDash = (principalPercent / 100) * circumference;
  const orangeDash = (interestPercent / 100) * circumference;

  // Theme styling helpers matching project standards
  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200";
  const divideColor = isDark ? "divide-[#232234]" : "divide-gray-100";
  const titleColor = isDark ? "text-white" : "text-gray-900";
  const labelColor = isDark ? "text-slate-300" : "text-gray-700";
  const valueColor = isDark ? "text-white" : "text-gray-900";
  const pillBg = isDark ? "bg-[#0d0c14]" : "bg-gray-100";

  return (
    <div className="w-full flex justify-center py-2 px-3 sm:px-4">
      <div
        className="w-full max-w-[500px] mx-auto"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        {!showDetails ? (
          /* ========================================================= */
          /* SCREEN 1: INPUT FORM (EMI Calculator)                     */
          /* ========================================================= */
          <div className="flex flex-col space-y-3.5">
            {/* Header: Symmetrical 3-column layout */}
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
                <h1
                  className={`text-lg sm:text-xl font-bold whitespace-nowrap ${titleColor}`}
                >
                  EMI Calculator
                </h1>
              </div>

              {/* Symmetrical spacer */}
              <div className="w-max" />
            </div>

            {/* Input Grouped Card */}
            <div
              className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
            >
              {/* Row 1: Loan Amount */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-semibold ${labelColor}`}
                >
                  Loan Amount
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-end">
                    <span
                      className={`text-base sm:text-lg font-bold mr-1 ${valueColor}`}
                    >
                      ₹
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={loanAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        setLoanAmount(val);
                      }}
                      placeholder="0"
                      className={`w-28 sm:w-32 text-right bg-transparent outline-none font-bold text-base sm:text-lg ${valueColor}`}
                    />
                  </div>
                  {loanAmount ? (
                    <button
                      type="button"
                      onClick={() => setLoanAmount("")}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5"
                    >
                      <IoCloseCircle className="w-5 h-5 text-gray-400" />
                    </button>
                  ) : (
                    <div className="w-5" />
                  )}
                </div>
              </div>

              {/* Row 2: Interest % */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-semibold ${labelColor}`}
                >
                  Interest %
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={interestRate}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setInterestRate(val);
                    }}
                    placeholder="0"
                    className={`w-28 sm:w-32 text-right bg-transparent outline-none font-bold text-base sm:text-lg ${valueColor}`}
                  />
                  {interestRate ? (
                    <button
                      type="button"
                      onClick={() => setInterestRate("")}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5"
                    >
                      <IoCloseCircle className="w-5 h-5 text-gray-400" />
                    </button>
                  ) : (
                    <div className="w-5" />
                  )}
                </div>
              </div>

              {/* Row 3: Period Type */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-semibold ${labelColor}`}
                >
                  Period Type
                </label>
                <div className={`flex items-center p-1 rounded-xl ${pillBg}`}>
                  <button
                    type="button"
                    onClick={() => setPeriodType("yearly")}
                    style={{
                      backgroundColor:
                        periodType === "yearly" ? primaryColor : "transparent",
                      color:
                        periodType === "yearly"
                          ? "#ffffff"
                          : isDark
                            ? "#cbd5e1"
                            : "#4b5563",
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    Yearly
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodType("monthly")}
                    style={{
                      backgroundColor:
                        periodType === "monthly" ? primaryColor : "transparent",
                      color:
                        periodType === "monthly"
                          ? "#ffffff"
                          : isDark
                            ? "#cbd5e1"
                            : "#4b5563",
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Row 4: Period */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-semibold ${labelColor}`}
                >
                  Period
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={period}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setPeriod(val);
                    }}
                    placeholder="0"
                    className={`w-28 sm:w-32 text-right bg-transparent outline-none font-bold text-base sm:text-lg ${valueColor}`}
                  />
                  {period ? (
                    <button
                      type="button"
                      onClick={() => setPeriod("")}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5"
                    >
                      <IoCloseCircle className="w-5 h-5 text-gray-400" />
                    </button>
                  ) : (
                    <div className="w-5" />
                  )}
                </div>
              </div>

              {/* Row 5: Processing Fee % */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-semibold ${labelColor}`}
                >
                  Processing Fee %
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={processingFee}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setProcessingFee(val);
                    }}
                    placeholder="0"
                    className={`w-28 sm:w-32 text-right bg-transparent outline-none font-bold text-base sm:text-lg ${valueColor}`}
                  />
                  {processingFee ? (
                    <button
                      type="button"
                      onClick={() => setProcessingFee("")}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5"
                    >
                      <IoCloseCircle className="w-5 h-5 text-gray-400" />
                    </button>
                  ) : (
                    <div className="w-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Reset and Calculate */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleReset}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base border transition-all cursor-pointer ${
                  isDark
                    ? "border-[#2e2d42] bg-[#161522] text-slate-200 hover:bg-[#201f30]"
                    : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50 shadow-xs"
                }`}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                style={{
                  backgroundColor: primaryColor,
                  color: "#ffffff",
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-[0.99]"
              >
                Calculate
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* SCREEN 2 & 3: DETAILS VIEW                                */
          /* ========================================================= */
          <div className="flex flex-col space-y-3.5">
            {/* Modal Header: Close button left, Details title center, Share button right */}
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
              className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
            >
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${labelColor}`}
                >
                  Loan Amount
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${valueColor}`}
                >
                  {formatRoundedCurrency(calculatedData.principal)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${labelColor}`}
                >
                  Interest %
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${valueColor}`}
                >
                  {calculatedData.interestRate}%
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${labelColor}`}
                >
                  Period (Months)
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${valueColor}`}
                >
                  {calculatedData.totalMonths}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${labelColor}`}
                >
                  Monthly EMI
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${valueColor}`}
                >
                  {formatCurrency(calculatedData.emi)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${labelColor}`}
                >
                  Total Interest
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${valueColor}`}
                >
                  {formatCurrency(calculatedData.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${labelColor}`}
                >
                  Processing Fee
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${valueColor}`}
                >
                  {formatCurrency(calculatedData.processingFeeAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${labelColor}`}
                >
                  Total Payment
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${valueColor}`}
                >
                  {formatCurrency(calculatedData.totalPayment)}
                </span>
              </div>
            </div>

            {/* Donut Chart Card */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center ${cardBg} ${cardBorder}`}
            >
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 150 150"
                >
                  {/* Background Track */}
                  <circle
                    cx="75"
                    cy="75"
                    r={radius}
                    stroke={isDark ? "#232234" : "#f1f5f9"}
                    strokeWidth="20"
                    fill="transparent"
                  />
                  {/* Green segment (Loan Amount / Principal) */}
                  <circle
                    cx="75"
                    cy="75"
                    r={radius}
                    stroke={GREEN_COLOR}
                    strokeWidth="20"
                    strokeDasharray={`${greenDash} ${circumference}`}
                    strokeDashoffset="0"
                    fill="transparent"
                    strokeLinecap="butt"
                  />
                  {/* Orange segment (Interest) */}
                  <circle
                    cx="75"
                    cy="75"
                    r={radius}
                    stroke={ORANGE_COLOR}
                    strokeWidth="20"
                    strokeDasharray={`${orangeDash} ${circumference}`}
                    strokeDashoffset={-greenDash}
                    fill="transparent"
                    strokeLinecap="butt"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Payment
                  </span>
                  <span
                    style={{ color: primaryColor }}
                    className="text-lg sm:text-xl font-extrabold tracking-tight mt-0.5"
                  >
                    {formatRoundedCurrency(calculatedData.totalPayment)}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-around w-full mt-3.5 pt-3 border-t border-gray-100 dark:border-[#232234]">
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
                    {formatRoundedCurrency(calculatedData.principal)}
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
                    {formatRoundedCurrency(calculatedData.totalInterest)}
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
                  <HiChevronUp className="w-4 h-4" />
                ) : (
                  <HiChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Amortization Table */}
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
                        Month
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-center">
                        Principal
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
                        key={item.month}
                        className={
                          idx % 2 === 1
                            ? isDark
                              ? "bg-[#1d1c2b]/70"
                              : "bg-gray-50/70"
                            : ""
                        }
                      >
                        <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                          {item.month}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {formatCurrency(item.principal)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {formatCurrency(item.interest)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {formatRoundedCurrency(item.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr
                      style={{
                        backgroundColor: primaryColor,
                        color: "#ffffff",
                      }}
                      className="font-bold"
                    >
                      <td className="py-2.5 px-3">Total</td>
                      <td className="py-2.5 px-3 text-center">
                        {formatRoundedCurrency(calculatedData.principal)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {formatCurrency(calculatedData.totalInterest)}
                      </td>
                      <td className="py-2.5 px-3 text-right">₹0.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmiC;
