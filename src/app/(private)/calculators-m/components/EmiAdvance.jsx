"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import { IoChevronBack, IoClose, IoShareOutline } from "react-icons/io5";
import { HiChevronUp, HiChevronDown } from "react-icons/hi2";

const GREEN_COLOR = "#2ecc71";
const ORANGE_COLOR = "#f97316";

const EmiAdvance = () => {
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

  // Form State
  const [paymentTiming, setPaymentTiming] = useState("arrears"); // "arrears" | "advance"
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [periodType, setPeriodType] = useState("yearly"); // "yearly" | "monthly"
  const [period, setPeriod] = useState("");
  const [feeType, setFeeType] = useState("percent"); // "percent" | "amount"
  const [processingFee, setProcessingFee] = useState("");
  const [gstRate, setGstRate] = useState("");

  // Views
  const [showDetails, setShowDetails] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [copied, setCopied] = useState(false);

  // Calculations
  const calculatedData = useMemo(() => {
    const P = parseFloat(loanAmount) || 0;
    const R = parseFloat(interestRate) || 0;
    const rawPeriod = parseFloat(period) || 0;
    const rawFee = parseFloat(processingFee) || 0;
    const gstPercent = parseFloat(gstRate) || 0;

    const totalMonths = Math.max(
      1,
      Math.round(periodType === "yearly" ? rawPeriod * 12 : rawPeriod),
    );
    const r = R / 12 / 100;
    const n = totalMonths;

    let emiArrears = 0;
    let emi = 0;

    if (P > 0 && n > 0) {
      if (r > 0) {
        emiArrears = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        if (paymentTiming === "advance") {
          // Annuity Due: EMI is paid in advance
          emi = emiArrears / (1 + r);
        } else {
          emi = emiArrears;
        }
      } else {
        emiArrears = P / n;
        emi = P / n;
      }
    }

    // Processing Fee Amount
    let feeAmount = 0;
    if (feeType === "percent") {
      feeAmount = P * (rawFee / 100);
    } else {
      feeAmount = rawFee;
    }

    // Amortization Schedule
    const schedule = [];
    let currentBalance = P;
    let totalInterest = 0;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    let yearlyGst = 0;

    if (P > 0 && n > 0 && emi > 0) {
      if (paymentTiming === "advance") {
        // Month 1 is paid upfront (at inception): No interest accrued yet
        const firstPrincipal = Math.min(currentBalance, emi);
        const firstInterest = 0;
        const firstGst = 0;
        const firstBalance = Math.max(0, currentBalance - firstPrincipal);

        yearlyPrincipal += firstPrincipal;
        yearlyInterest += firstInterest;
        yearlyGst += firstGst;

        schedule.push({
          type: "month",
          month: 1,
          isAdvance: true,
          principal: firstPrincipal,
          interest: firstInterest,
          gst: firstGst,
          balance: firstBalance,
        });

        currentBalance = firstBalance;

        // Remaining months: 2 to n
        for (let m = 2; m <= n; m++) {
          const monthlyInterest = currentBalance * r;
          let monthlyPrincipal = emi - monthlyInterest;

          if (m === n || currentBalance - monthlyPrincipal < 0.5) {
            monthlyPrincipal = currentBalance;
          }

          const monthlyGst = monthlyInterest * (gstPercent / 100);
          const remaining = Math.max(0, currentBalance - monthlyPrincipal);

          totalInterest += monthlyInterest;
          yearlyPrincipal += monthlyPrincipal;
          yearlyInterest += monthlyInterest;
          yearlyGst += monthlyGst;

          schedule.push({
            type: "month",
            month: m,
            isAdvance: false,
            principal: monthlyPrincipal,
            interest: monthlyInterest,
            gst: monthlyGst,
            balance: remaining,
          });

          currentBalance = remaining;

          if (m % 12 === 0 || m === n) {
            schedule.push({
              type: "yearly_total",
              year: Math.ceil(m / 12),
              principal: yearlyPrincipal,
              interest: yearlyInterest,
              gst: yearlyGst,
              balance: remaining,
            });
            yearlyPrincipal = 0;
            yearlyInterest = 0;
            yearlyGst = 0;
          }
        }
      } else {
        // Standard EMI in Arrears
        for (let m = 1; m <= n; m++) {
          const monthlyInterest = currentBalance * r;
          let monthlyPrincipal = emi - monthlyInterest;

          if (m === n || currentBalance - monthlyPrincipal < 0.5) {
            monthlyPrincipal = currentBalance;
          }

          const monthlyGst = monthlyInterest * (gstPercent / 100);
          const remaining = Math.max(0, currentBalance - monthlyPrincipal);

          totalInterest += monthlyInterest;
          yearlyPrincipal += monthlyPrincipal;
          yearlyInterest += monthlyInterest;
          yearlyGst += monthlyGst;

          schedule.push({
            type: "month",
            month: m,
            isAdvance: false,
            principal: monthlyPrincipal,
            interest: monthlyInterest,
            gst: monthlyGst,
            balance: remaining,
          });

          currentBalance = remaining;

          if (m % 12 === 0 || m === n) {
            schedule.push({
              type: "yearly_total",
              year: Math.ceil(m / 12),
              principal: yearlyPrincipal,
              interest: yearlyInterest,
              gst: yearlyGst,
              balance: remaining,
            });
            yearlyPrincipal = 0;
            yearlyInterest = 0;
            yearlyGst = 0;
          }
        }
      }
    }

    const totalGst = totalInterest * (gstPercent / 100);
    const totalPayment = P + totalInterest + totalGst + feeAmount;

    return {
      principal: P,
      interestRate: R,
      periodType,
      period: rawPeriod,
      totalMonths: n,
      paymentTiming,
      emi,
      totalInterest,
      totalGst,
      processingFeeAmount: feeAmount,
      totalPayment,
      schedule,
    };
  }, [
    loanAmount,
    interestRate,
    periodType,
    period,
    feeType,
    processingFee,
    gstRate,
    paymentTiming,
  ]);

  const handleReset = () => {
    setPaymentTiming("arrears");
    setLoanAmount("");
    setInterestRate("");
    setPeriodType("yearly");
    setPeriod("");
    setFeeType("percent");
    setProcessingFee("");
    setGstRate("");
  };

  const handleCalculate = () => {
    if (!loanAmount || !interestRate || !period) {
      alert("Please fill in Loan Amount, Interest %, and Period to calculate.");
      return;
    }
    setShowDetails(true);
  };

  const handleShare = async () => {
    const shareText = `EMI in ${paymentTiming === "advance" ? "Advance" : "Arrears"} Details:
• Loan Amount: ₹${Number(loanAmount || 0).toLocaleString("en-IN")}
• Timing: EMI In ${paymentTiming === "advance" ? "Advance" : "Arrears"}
• Interest Rate: ${interestRate}%
• Period: ${period} ${periodType === "yearly" ? "Years" : "Months"}
• Monthly EMI: ₹${Math.round(calculatedData.emi).toLocaleString("en-IN")}
• Total Interest: ₹${Math.round(calculatedData.totalInterest).toLocaleString("en-IN")}
• Total GST on Interest: ₹${Math.round(calculatedData.totalGst).toLocaleString("en-IN")}
• Processing Fee: ₹${Math.round(calculatedData.processingFeeAmount).toLocaleString("en-IN")}
• Total Payment: ₹${Math.round(calculatedData.totalPayment).toLocaleString("en-IN")}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "EMI Details",
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
  const formatRoundedCurrency = (val) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0";
    return "₹" + Math.round(Number(val)).toLocaleString("en-IN");
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
  const totalVal =
    calculatedData.totalPayment > 0 ? calculatedData.totalPayment : 1;
  const principalPercent = (calculatedData.principal / totalVal) * 100;
  const interestPercent =
    ((calculatedData.totalInterest + calculatedData.totalGst) / totalVal) * 100;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const greenDash = (principalPercent / 100) * circumference;
  const orangeDash = (interestPercent / 100) * circumference;

  // Theming classes
  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200/90";
  const divideColor = isDark ? "divide-[#232234]" : "divide-gray-100";
  const labelColor = isDark ? "text-slate-200" : "text-gray-900";
  const subtleColor = isDark ? "text-slate-400" : "text-gray-500";
  const pillBg = isDark ? "bg-[#1f1e2f]" : "bg-gray-100";

  return (
    <div className="w-full flex justify-center py-2 px-3 sm:px-4">
      <div
        className="w-full max-w-[500px] mx-auto"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        {!showDetails ? (
          /* ========================================================= */
          /* SCREEN 1: INPUT FORM (Matching Uploaded Screenshot)       */
          /* ========================================================= */
          <div className="flex flex-col space-y-4">
            {/* Header: < Back on left, EMI in Advance center */}
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
                  EMI in Advance
                </h1>
              </div>

              <div className="w-[80px]" />
            </div>

            {/* Radio Selection: EMI In Arrears vs EMI In Advance */}
            <div className="flex items-center gap-6 px-1 pt-1">
              {/* Option 1: EMI In Arrears */}
              <label
                onClick={() => setPaymentTiming("arrears")}
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <div
                  style={{
                    borderColor:
                      paymentTiming === "arrears"
                        ? primaryColor
                        : isDark
                          ? "#475569"
                          : "#cbd5e1",
                  }}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                >
                  {paymentTiming === "arrears" && (
                    <div
                      style={{ backgroundColor: primaryColor }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                  )}
                </div>
                <span
                  className={`text-sm sm:text-base font-semibold ${
                    paymentTiming === "arrears"
                      ? isDark
                        ? "text-white"
                        : "text-gray-900"
                      : subtleColor
                  }`}
                >
                  EMI In Arrears
                </span>
              </label>

              {/* Option 2: EMI In Advance */}
              <label
                onClick={() => setPaymentTiming("advance")}
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <div
                  style={{
                    borderColor:
                      paymentTiming === "advance"
                        ? primaryColor
                        : isDark
                          ? "#475569"
                          : "#cbd5e1",
                  }}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                >
                  {paymentTiming === "advance" && (
                    <div
                      style={{ backgroundColor: primaryColor }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                  )}
                </div>
                <span
                  className={`text-sm sm:text-base font-semibold ${
                    paymentTiming === "advance"
                      ? isDark
                        ? "text-white"
                        : "text-gray-900"
                      : subtleColor
                  }`}
                >
                  EMI In Advance
                </span>
              </label>
            </div>

            {/* Grouped Input Card */}
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
                <input
                  type="text"
                  inputMode="decimal"
                  value={loanAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setLoanAmount(val);
                  }}
                  placeholder="Enter loan amount"
                  className="w-44 sm:w-52 text-right bg-transparent outline-none font-semibold text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600"
                />
              </div>

              {/* Row 2: Interest % */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-semibold ${labelColor}`}
                >
                  Interest %
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={interestRate}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setInterestRate(val);
                  }}
                  placeholder="Max 30% per annum"
                  className="w-44 sm:w-52 text-right bg-transparent outline-none font-semibold text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600"
                />
              </div>

              {/* Row 3: Period Type */}
              <div className="flex items-center justify-between px-4 py-2.5 sm:py-3">
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
                <input
                  type="text"
                  inputMode="numeric"
                  value={period}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setPeriod(val);
                  }}
                  placeholder={
                    periodType === "yearly" ? "Max 30 years" : "Max 360 months"
                  }
                  className="w-44 sm:w-52 text-right bg-transparent outline-none font-semibold text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600"
                />
              </div>

              {/* Row 5: Fee Type */}
              <div className="flex items-center justify-between px-4 py-2.5 sm:py-3">
                <label
                  className={`text-sm sm:text-base font-semibold ${labelColor}`}
                >
                  Fee Type
                </label>
                <div className={`flex items-center p-1 rounded-xl ${pillBg}`}>
                  <button
                    type="button"
                    onClick={() => setFeeType("percent")}
                    style={{
                      backgroundColor:
                        feeType === "percent" ? primaryColor : "transparent",
                      color:
                        feeType === "percent"
                          ? "#ffffff"
                          : isDark
                            ? "#cbd5e1"
                            : "#4b5563",
                    }}
                    className="px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeeType("amount")}
                    style={{
                      backgroundColor:
                        feeType === "amount" ? primaryColor : "transparent",
                      color:
                        feeType === "amount"
                          ? "#ffffff"
                          : isDark
                            ? "#cbd5e1"
                            : "#4b5563",
                    }}
                    className="px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    ₹
                  </button>
                </div>
              </div>

              {/* Row 6: Processing Fee */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-semibold ${labelColor}`}
                >
                  Processing Fee
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={processingFee}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setProcessingFee(val);
                  }}
                  placeholder="Enter processing..."
                  className="w-44 sm:w-52 text-right bg-transparent outline-none font-semibold text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600"
                />
              </div>

              {/* Row 7: GST On Interest(%) */}
              <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
                <label
                  className={`text-sm sm:text-base font-semibold ${labelColor}`}
                >
                  GST On Interest(%)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={gstRate}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setGstRate(val);
                  }}
                  placeholder="Enter GST %"
                  className="w-44 sm:w-52 text-right bg-transparent outline-none font-semibold text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600"
                />
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
          /* SCREEN 2: DETAILS VIEW                                    */
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
                Details copied to clipboard!
              </div>
            )}

            {/* Summary Table Card */}
            <div
              className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${
                isDark ? "divide-[#232234]" : "divide-gray-100"
              }`}
            >
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${subtleColor}`}
                >
                  Timing Mode
                </span>
                <span
                  style={{ color: primaryColor }}
                  className="text-xs sm:text-sm font-bold"
                >
                  EMI In{" "}
                  {calculatedData.paymentTiming === "advance"
                    ? "Advance"
                    : "Arrears"}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${subtleColor}`}
                >
                  Loan Amount
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${labelColor}`}
                >
                  {formatRoundedCurrency(calculatedData.principal)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${subtleColor}`}
                >
                  Interest %
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${labelColor}`}
                >
                  {calculatedData.interestRate}%
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${subtleColor}`}
                >
                  Period (Months)
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${labelColor}`}
                >
                  {calculatedData.totalMonths}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${subtleColor}`}
                >
                  Monthly EMI
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${labelColor}`}
                >
                  {formatCurrency(calculatedData.emi)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${subtleColor}`}
                >
                  Total Interest
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${labelColor}`}
                >
                  {formatCurrency(calculatedData.totalInterest)}
                </span>
              </div>
              {calculatedData.totalGst > 0 && (
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span
                    className={`text-xs sm:text-sm font-medium ${subtleColor}`}
                  >
                    GST On Interest ({gstRate}%)
                  </span>
                  <span
                    className={`text-sm sm:text-base font-bold ${labelColor}`}
                  >
                    {formatCurrency(calculatedData.totalGst)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${subtleColor}`}
                >
                  Processing Fee
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${labelColor}`}
                >
                  {formatCurrency(calculatedData.processingFeeAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span
                  className={`text-xs sm:text-sm font-medium ${subtleColor}`}
                >
                  Total Payment
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${labelColor}`}
                >
                  {formatCurrency(calculatedData.totalPayment)}
                </span>
              </div>
            </div>

            {/* Donut Chart Card */}
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

                {/* Center Content: Total Payment */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span
                    className={`text-xs sm:text-sm font-medium ${subtleColor}`}
                  >
                    Total Payment
                  </span>
                  <span
                    style={{ color: primaryColor }}
                    className="text-base sm:text-lg font-extrabold tracking-tight mt-0.5"
                  >
                    {formatRoundedCurrency(calculatedData.totalPayment)}
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
                    {formatRoundedCurrency(calculatedData.principal)}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span
                      style={{ backgroundColor: ORANGE_COLOR }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <span>Interest & Charges</span>
                  </div>
                  <span
                    style={{ color: ORANGE_COLOR }}
                    className="text-sm sm:text-base font-bold mt-0.5"
                  >
                    {formatRoundedCurrency(
                      calculatedData.totalInterest +
                        calculatedData.totalGst +
                        calculatedData.processingFeeAmount,
                    )}
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
                    {calculatedData.schedule.map((item, idx) => {
                      if (item.type === "yearly_total") {
                        return (
                          <tr
                            key={`total-yr-${item.year}-${idx}`}
                            style={{
                              backgroundColor: primaryColor,
                              color: "#ffffff",
                            }}
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
                            {item.isAdvance && (
                              <span className="ml-1 text-[10px] text-amber-500 font-normal">
                                (Upfront)
                              </span>
                            )}
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

export default EmiAdvance;
