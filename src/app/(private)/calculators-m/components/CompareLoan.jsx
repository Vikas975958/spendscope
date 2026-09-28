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

const CompareLoan = () => {
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

  // Loan 1 State (Defaults matching screenshot: 1000, 10%, Monthly, 10)
  const [loan1Amount, setLoan1Amount] = useState("1000");
  const [loan1Rate, setLoan1Rate] = useState("10");
  const [loan1PeriodType, setLoan1PeriodType] = useState("monthly"); // "yearly" | "monthly"
  const [loan1Period, setLoan1Period] = useState("10");

  // Loan 2 State (Defaults matching screenshot: 1000, 10%, Monthly, 12)
  const [loan2Amount, setLoan2Amount] = useState("1000");
  const [loan2Rate, setLoan2Rate] = useState("10");
  const [loan2PeriodType, setLoan2PeriodType] = useState("monthly"); // "yearly" | "monthly"
  const [loan2Period, setLoan2Period] = useState("12");

  // View state
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Financial calculations helper
  const calculateLoan = (amountStr, rateStr, periodType, periodStr) => {
    const P = parseFloat(amountStr) || 0;
    const rate = parseFloat(rateStr) || 0;
    const rawPeriod = parseFloat(periodStr) || 0;

    const totalMonths = Math.max(
      1,
      Math.round(periodType === "yearly" ? rawPeriod * 12 : rawPeriod)
    );
    const r = rate / 12 / 100;
    const n = totalMonths;

    let emi = 0;
    if (P > 0 && n > 0) {
      if (r > 0) {
        emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else {
        emi = P / n;
      }
    }

    const totalPayment = emi * n;
    const totalInterest = Math.max(0, totalPayment - P);

    return {
      principal: P,
      rate,
      totalMonths: n,
      emi,
      totalInterest,
      totalPayment,
    };
  };

  const loan1 = useMemo(
    () => calculateLoan(loan1Amount, loan1Rate, loan1PeriodType, loan1Period),
    [loan1Amount, loan1Rate, loan1PeriodType, loan1Period]
  );

  const loan2 = useMemo(
    () => calculateLoan(loan2Amount, loan2Rate, loan2PeriodType, loan2Period),
    [loan2Amount, loan2Rate, loan2PeriodType, loan2Period]
  );

  const differences = useMemo(() => {
    return {
      emiDiff: Math.abs(loan1.emi - loan2.emi),
      interestDiff: Math.abs(loan1.totalInterest - loan2.totalInterest),
      paymentDiff: Math.abs(loan1.totalPayment - loan2.totalPayment),
    };
  }, [loan1, loan2]);

  const handleReset = () => {
    setLoan1Amount("");
    setLoan1Rate("");
    setLoan1PeriodType("monthly");
    setLoan1Period("");

    setLoan2Amount("");
    setLoan2Rate("");
    setLoan2PeriodType("monthly");
    setLoan2Period("");
  };

  const handleCalculate = () => {
    if (!loan1Amount || !loan1Rate || !loan1Period || !loan2Amount || !loan2Rate || !loan2Period) {
      alert("Please enter values for both Loan 1 and Loan 2.");
      return;
    }
    setShowDetails(true);
  };

  const handleShare = async () => {
    const shareText = `Loan Comparison Details:
• Loan 1:
  Amount: ₹${loan1.principal.toLocaleString("en-IN")} | Rate: ${loan1.rate}% | Months: ${loan1.totalMonths}
  EMI: ₹${loan1.emi.toFixed(2)} | Interest: ₹${loan1.totalInterest.toFixed(2)} | Total: ₹${loan1.totalPayment.toFixed(2)}

• Loan 2:
  Amount: ₹${loan2.principal.toLocaleString("en-IN")} | Rate: ${loan2.rate}% | Months: ${loan2.totalMonths}
  EMI: ₹${loan2.emi.toFixed(2)} | Interest: ₹${loan2.totalInterest.toFixed(2)} | Total: ₹${loan2.totalPayment.toFixed(2)}

• Differences:
  EMI Difference: ₹${differences.emiDiff.toFixed(2)}
  Interest Difference: ₹${differences.interestDiff.toFixed(2)}
  Total Payment Difference: ₹${differences.paymentDiff.toFixed(2)}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Loan Comparison Details",
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

  // Formatters
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

  const formatRawValue = (val) => {
    if (!val) return "";
    return Number(val).toLocaleString("en-IN");
  };

  // Styling helpers
  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200/90";
  const divideColor = isDark ? "divide-[#232234]" : "divide-gray-100";
  const labelColor = isDark ? "text-slate-200" : "text-gray-900";
  const subtleLabel = isDark ? "text-slate-400" : "text-gray-500";
  const pillBg = isDark ? "bg-[#1f1e2f]" : "bg-gray-100";

  return (
    <div className="w-full flex justify-center py-2 px-3 sm:px-4">
      <div
        className="w-full max-w-[500px] mx-auto"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        {!showDetails ? (
          /* ========================================================= */
          /* SCREEN 1: COMPARE LOAN INPUT FORM                         */
          /* ========================================================= */
          <div className="flex flex-col space-y-4">
            {/* Header: < Back on left, Compare Loan center */}
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
                  className={`text-lg sm:text-xl font-bold whitespace-nowrap ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Compare Loan
                </h1>
              </div>

              <div className="w-[80px]" />
            </div>

            {/* SECTION 1: LOAN 1 */}
            <div>
              <h2 className={`text-sm sm:text-base font-semibold mb-1.5 px-1 ${subtleLabel}`}>
                Loan 1
              </h2>

              <div
                className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
              >
                {/* Row 1: Loan Amount */}
                <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                  <label className={`text-sm sm:text-base font-semibold ${labelColor}`}>
                    Loan Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-end">
                      <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mr-0.5">
                        ₹
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formatRawValue(loan1Amount)}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          setLoan1Amount(val);
                        }}
                        placeholder="0"
                        className="w-28 sm:w-32 text-right bg-transparent outline-none font-bold text-sm sm:text-base text-gray-900 dark:text-white"
                      />
                    </div>
                    {loan1Amount ? (
                      <button
                        type="button"
                        onClick={() => setLoan1Amount("")}
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
                  <label className={`text-sm sm:text-base font-semibold ${labelColor}`}>
                    Interest %
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={loan1Rate}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        setLoan1Rate(val);
                      }}
                      placeholder="0"
                      className="w-28 sm:w-32 text-right bg-transparent outline-none font-bold text-sm sm:text-base text-gray-900 dark:text-white"
                    />
                    {loan1Rate ? (
                      <button
                        type="button"
                        onClick={() => setLoan1Rate("")}
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
                <div className="flex items-center justify-between px-4 py-2.5 sm:py-3">
                  <label className={`text-sm sm:text-base font-semibold ${labelColor}`}>
                    Period Type
                  </label>
                  <div className={`flex items-center p-1 rounded-xl ${pillBg}`}>
                    <button
                      type="button"
                      onClick={() => setLoan1PeriodType("yearly")}
                      style={{
                        backgroundColor:
                          loan1PeriodType === "yearly" ? primaryColor : "transparent",
                        color:
                          loan1PeriodType === "yearly"
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
                      onClick={() => setLoan1PeriodType("monthly")}
                      style={{
                        backgroundColor:
                          loan1PeriodType === "monthly" ? primaryColor : "transparent",
                        color:
                          loan1PeriodType === "monthly"
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
                  <label className={`text-sm sm:text-base font-semibold ${labelColor}`}>
                    Period
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={loan1Period}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setLoan1Period(val);
                      }}
                      placeholder="0"
                      className="w-28 sm:w-32 text-right bg-transparent outline-none font-bold text-sm sm:text-base text-gray-900 dark:text-white"
                    />
                    {loan1Period ? (
                      <button
                        type="button"
                        onClick={() => setLoan1Period("")}
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
            </div>

            {/* SECTION 2: LOAN 2 */}
            <div>
              <h2 className={`text-sm sm:text-base font-semibold mb-1.5 px-1 ${subtleLabel}`}>
                Loan 2
              </h2>

              <div
                className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
              >
                {/* Row 1: Loan Amount */}
                <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                  <label className={`text-sm sm:text-base font-semibold ${labelColor}`}>
                    Loan Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-end">
                      <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mr-0.5">
                        ₹
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formatRawValue(loan2Amount)}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          setLoan2Amount(val);
                        }}
                        placeholder="0"
                        className="w-28 sm:w-32 text-right bg-transparent outline-none font-bold text-sm sm:text-base text-gray-900 dark:text-white"
                      />
                    </div>
                    {loan2Amount ? (
                      <button
                        type="button"
                        onClick={() => setLoan2Amount("")}
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
                  <label className={`text-sm sm:text-base font-semibold ${labelColor}`}>
                    Interest %
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={loan2Rate}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        setLoan2Rate(val);
                      }}
                      placeholder="0"
                      className="w-28 sm:w-32 text-right bg-transparent outline-none font-bold text-sm sm:text-base text-gray-900 dark:text-white"
                    />
                    {loan2Rate ? (
                      <button
                        type="button"
                        onClick={() => setLoan2Rate("")}
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
                <div className="flex items-center justify-between px-4 py-2.5 sm:py-3">
                  <label className={`text-sm sm:text-base font-semibold ${labelColor}`}>
                    Period Type
                  </label>
                  <div className={`flex items-center p-1 rounded-xl ${pillBg}`}>
                    <button
                      type="button"
                      onClick={() => setLoan2PeriodType("yearly")}
                      style={{
                        backgroundColor:
                          loan2PeriodType === "yearly" ? primaryColor : "transparent",
                        color:
                          loan2PeriodType === "yearly"
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
                      onClick={() => setLoan2PeriodType("monthly")}
                      style={{
                        backgroundColor:
                          loan2PeriodType === "monthly" ? primaryColor : "transparent",
                        color:
                          loan2PeriodType === "monthly"
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
                  <label className={`text-sm sm:text-base font-semibold ${labelColor}`}>
                    Period
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={loan2Period}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setLoan2Period(val);
                      }}
                      placeholder="0"
                      className="w-28 sm:w-32 text-right bg-transparent outline-none font-bold text-sm sm:text-base text-gray-900 dark:text-white"
                    />
                    {loan2Period ? (
                      <button
                        type="button"
                        onClick={() => setLoan2Period("")}
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
            </div>

            {/* Action Buttons: Reset and Calculate */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <button
                type="button"
                onClick={handleReset}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base border transition-all cursor-pointer ${
                  isDark
                    ? "border-slate-600 bg-[#161522] text-slate-200 hover:bg-[#201f30]"
                    : "border-gray-900 bg-white text-gray-900 hover:bg-gray-50 shadow-xs"
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
                className="w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-[0.99]"
              >
                Calculate
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* SCREEN 2: DETAILS / COMPARISON VIEW                       */
          /* ========================================================= */
          <div className="flex flex-col space-y-4">
            {/* Modal Header: Close button left, Details center, Share right */}
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
                  className={`text-lg sm:text-xl font-bold whitespace-nowrap ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
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
                Comparison copied to clipboard!
              </div>
            )}

            {/* Loan 1 Summary Card */}
            <div>
              <h3 className={`text-sm sm:text-base font-bold mb-1.5 px-1 ${labelColor}`}>
                Loan 1
              </h3>
              <div
                className={`rounded-2xl border p-4 shadow-xs space-y-2.5 ${cardBg} ${cardBorder}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm font-medium ${subtleLabel}`}>
                    Loan Amount
                  </span>
                  <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                    {formatCurrency(loan1.principal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm font-medium ${subtleLabel}`}>
                    Interest Rate
                  </span>
                  <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                    {loan1.rate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm font-medium ${subtleLabel}`}>
                    Total Months
                  </span>
                  <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                    {loan1.totalMonths}
                  </span>
                </div>
              </div>
            </div>

            {/* Loan 2 Summary Card */}
            <div>
              <h3 className={`text-sm sm:text-base font-bold mb-1.5 px-1 ${labelColor}`}>
                Loan 2
              </h3>
              <div
                className={`rounded-2xl border p-4 shadow-xs space-y-2.5 ${cardBg} ${cardBorder}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm font-medium ${subtleLabel}`}>
                    Loan Amount
                  </span>
                  <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                    {formatCurrency(loan2.principal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm font-medium ${subtleLabel}`}>
                    Interest Rate
                  </span>
                  <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                    {loan2.rate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs sm:text-sm font-medium ${subtleLabel}`}>
                    Total Months
                  </span>
                  <span className={`text-sm sm:text-base font-bold ${labelColor}`}>
                    {loan2.totalMonths}
                  </span>
                </div>
              </div>
            </div>

            {/* Comparison Metric 1: Monthly EMI */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center ${cardBg} ${cardBorder}`}
            >
              <span className={`text-xs sm:text-sm font-bold mb-3 ${labelColor}`}>
                Monthly EMI
              </span>
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-[#232234] w-full text-center">
                <div className="px-2">
                  <span className={`text-base sm:text-lg font-bold ${labelColor}`}>
                    {formatCurrency(loan1.emi)}
                  </span>
                </div>
                <div className="px-2">
                  <span className={`text-base sm:text-lg font-bold ${labelColor}`}>
                    {formatCurrency(loan2.emi)}
                  </span>
                </div>
              </div>
              <div
                style={{ color: primaryColor }}
                className="mt-3.5 text-xs sm:text-sm font-bold"
              >
                Difference: {formatCurrency(differences.emiDiff)}
              </div>
            </div>

            {/* Comparison Metric 2: Total Interest */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center ${cardBg} ${cardBorder}`}
            >
              <span className={`text-xs sm:text-sm font-bold mb-3 ${labelColor}`}>
                Total Interest
              </span>
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-[#232234] w-full text-center">
                <div className="px-2">
                  <span className={`text-base sm:text-lg font-bold ${labelColor}`}>
                    {formatCurrency(loan1.totalInterest)}
                  </span>
                </div>
                <div className="px-2">
                  <span className={`text-base sm:text-lg font-bold ${labelColor}`}>
                    {formatCurrency(loan2.totalInterest)}
                  </span>
                </div>
              </div>
              <div
                style={{ color: primaryColor }}
                className="mt-3.5 text-xs sm:text-sm font-bold"
              >
                Difference: {formatCurrency(differences.interestDiff)}
              </div>
            </div>

            {/* Comparison Metric 3: Total Payment */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center ${cardBg} ${cardBorder}`}
            >
              <span className={`text-xs sm:text-sm font-bold mb-3 ${labelColor}`}>
                Total Payment
              </span>
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-[#232234] w-full text-center">
                <div className="px-2">
                  <span className={`text-base sm:text-lg font-bold ${labelColor}`}>
                    {formatCurrency(loan1.totalPayment)}
                  </span>
                </div>
                <div className="px-2">
                  <span className={`text-base sm:text-lg font-bold ${labelColor}`}>
                    {formatCurrency(loan2.totalPayment)}
                  </span>
                </div>
              </div>
              <div
                style={{ color: primaryColor }}
                className="mt-3.5 text-xs sm:text-sm font-bold"
              >
                Difference: {formatCurrency(differences.paymentDiff)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareLoan;
