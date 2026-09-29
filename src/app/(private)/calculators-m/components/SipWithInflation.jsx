"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import {
  IoChevronBack,
  IoCloseCircle,
  IoShareOutline,
} from "react-icons/io5";

const CORAL_COLOR = "#f06557";

const SipWithInflation = () => {
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
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [expectedReturns, setExpectedReturns] = useState("");
  const [inflationRate, setInflationRate] = useState("");
  const [period, setPeriod] = useState("");

  // Result and view states
  const [hasCalculated, setHasCalculated] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Financial calculations
  const calculatedData = useMemo(() => {
    const P = monthlyAmount !== "" ? parseFloat(monthlyAmount) || 0 : 1000;
    const rAnnual = expectedReturns !== "" ? parseFloat(expectedReturns) || 0 : 15;
    const infRate = inflationRate !== "" ? parseFloat(inflationRate) || 0 : 6;
    const yYears = period !== "" ? Math.min(50, Math.max(1, parseInt(period) || 1)) : 1;

    const monthlyRate = rAnnual > 0 ? rAnnual / 12 / 100 : 0;
    const schedule = [];

    // Calculate year-by-year inflation-adjusted SIP
    for (let y = 1; y <= yYears; y++) {
      const totalMonths = y * 12;
      const totalInvestedYear = P * totalMonths;

      let nominalFv = totalInvestedYear;
      if (monthlyRate > 0) {
        nominalFv =
          P *
          ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
          (1 + monthlyRate);
      }

      // Deflate nominal FV by annual inflation over y years
      const inflationFactor = Math.pow(1 + infRate / 100, y);
      const adjustedFv = inflationFactor > 0 ? nominalFv / inflationFactor : nominalFv;
      const adjustedReturns = Math.max(0, adjustedFv - totalInvestedYear);

      schedule.push({
        year: y,
        invested: Math.round(totalInvestedYear),
        returns: Math.round(adjustedReturns),
        finalBalance: Math.round(adjustedFv),
      });
    }

    const totalMonths = yYears * 12;
    const totalInvestment = P * totalMonths;

    let nominalFutureValue = totalInvestment;
    if (monthlyRate > 0) {
      nominalFutureValue =
        P *
        ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
        (1 + monthlyRate);
    }

    const totalInflationFactor = Math.pow(1 + infRate / 100, yYears);
    const futureValueAdjusted =
      totalInflationFactor > 0 ? nominalFutureValue / totalInflationFactor : nominalFutureValue;
    const expectedReturnsAdjusted = Math.max(0, futureValueAdjusted - totalInvestment);

    return {
      monthlyAmount: P,
      expectedReturns: rAnnual,
      inflationRate: infRate,
      period: yYears,
      totalInvestment: Math.round(totalInvestment),
      expectedReturns: Math.round(expectedReturnsAdjusted),
      futureValue: Math.round(futureValueAdjusted),
      schedule,
    };
  }, [monthlyAmount, expectedReturns, inflationRate, period]);

  // Handle Calculate button
  const handleCalculate = () => {
    if (!monthlyAmount && !expectedReturns && !inflationRate && !period) {
      setMonthlyAmount("1000");
      setExpectedReturns("15");
      setInflationRate("6");
      setPeriod("1");
    }
    setHasCalculated(true);
  };

  // Handle Reset button
  const handleReset = () => {
    setMonthlyAmount("");
    setExpectedReturns("");
    setInflationRate("");
    setPeriod("");
    setHasCalculated(false);
    setShowDetails(false);
  };

  // Currency Formatter
  const formatCurrency = (val) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0";
    return "₹" + Number(val).toLocaleString("en-IN");
  };

  // Share calculation details
  const handleShare = async () => {
    const text = `Inflation Adjusted SIP Details:
• Monthly Amount: ${formatCurrency(calculatedData.monthlyAmount)}
• Exp. Annual Returns: ${calculatedData.expectedReturns}%
• Inflation Rate: ${calculatedData.inflationRate}%
• Period: ${calculatedData.period} years
• Total Investment: ${formatCurrency(calculatedData.totalInvestment)}
• Expected Returns: ${formatCurrency(calculatedData.expectedReturns)}
• Future Value (Inflation Adjusted): ${formatCurrency(calculatedData.futureValue)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Inflation Adjusted SIP Details",
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

  return (
    <div className="w-full max-w-[480px] mx-auto pb-12 transition-colors duration-200">
      {!showDetails ? (
        /* ========================================================= */
        /* SCREEN 1 & 2: INPUT & OUTPUT FORM VIEW                    */
        /* ========================================================= */
        <div className="flex flex-col space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between py-1.5 px-0.5">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-0.5 text-blue-500 hover:opacity-80 transition-opacity font-medium text-sm sm:text-base cursor-pointer"
            >
              <IoChevronBack className="w-5 h-5 text-blue-500" />
              <span>Back</span>
            </button>

            <h1 className={`text-base sm:text-lg font-bold tracking-tight ${titleColor}`}>
              Inflation Adjusted SIP
            </h1>

            {hasCalculated ? (
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                style={{ color: primaryColor }}
                className="font-medium text-sm sm:text-base hover:opacity-80 transition-opacity cursor-pointer"
              >
                Details
              </button>
            ) : (
              <div className="w-12" />
            )}
          </div>

          {/* Form Inputs Card */}
          <div className={`rounded-2xl border shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}>
            {/* Row 1: Monthly Amount */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
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
                  placeholder="Enter Amount"
                  className={`w-full max-w-[170px] text-right bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                />
                {monthlyAmount && (
                  <button
                    type="button"
                    onClick={() => setMonthlyAmount("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1.5 cursor-pointer"
                  >
                    <IoCloseCircle className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Exp. Annual Returns (%) */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
                Exp. Annual Returns (%)
              </label>
              <div className="flex items-center justify-end flex-1 pl-4">
                <input
                  type="text"
                  inputMode="decimal"
                  value={expectedReturns}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setExpectedReturns(val);
                  }}
                  placeholder="Ex: 15%"
                  className={`w-full max-w-[170px] text-right bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                />
                {expectedReturns && (
                  <button
                    type="button"
                    onClick={() => setExpectedReturns("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1.5 cursor-pointer"
                  >
                    <IoCloseCircle className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 3: Inflation Rate (%) */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
                Inflation Rate (%)
              </label>
              <div className="flex items-center justify-end flex-1 pl-4">
                <input
                  type="text"
                  inputMode="decimal"
                  value={inflationRate}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setInflationRate(val);
                  }}
                  placeholder="Ex: 6.5%"
                  className={`w-full max-w-[170px] text-right bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                />
                {inflationRate && (
                  <button
                    type="button"
                    onClick={() => setInflationRate("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1.5 cursor-pointer"
                  >
                    <IoCloseCircle className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 4: Period (Years) */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
                Period (Years)
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
                  className={`w-full max-w-[170px] text-right bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                />
                {period && (
                  <button
                    type="button"
                    onClick={() => setPeriod("")}
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

          {/* ========================================================= */}
          {/* RESULTS CARD (Shown after Calculate)                      */}
          {/* ========================================================= */}
          {hasCalculated && (
            <div className="pt-1">
              <div className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}>
                {/* Total Investment */}
                <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
                  <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                    Total Investment
                  </span>
                  <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                    {formatCurrency(calculatedData.totalInvestment)}
                  </span>
                </div>

                {/* Expected Returns */}
                <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
                  <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                    Expected Returns
                  </span>
                  <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                    {formatCurrency(calculatedData.expectedReturns)}
                  </span>
                </div>

                {/* Future Value (Inflation Adjusted) */}
                <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
                  <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                    Future Value<br />(Inflation Adjusted)
                  </span>
                  <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right self-center ${valueColor}`}>
                    {formatCurrency(calculatedData.futureValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* DETAILS SCREEN VIEW                                       */
        /* ========================================================= */
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between py-1.5 px-0.5">
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="flex items-center gap-0.5 text-blue-500 hover:opacity-80 transition-opacity font-medium text-sm sm:text-base cursor-pointer"
            >
              <IoChevronBack className="w-5 h-5 text-blue-500" />
              <span>Back</span>
            </button>

            <h2 className={`text-base sm:text-lg font-bold tracking-tight ${titleColor}`}>
              Details
            </h2>

            <button
              type="button"
              onClick={handleShare}
              className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white p-1 cursor-pointer transition-colors"
              title="Share Details"
            >
              <IoShareOutline className="w-6 h-6" />
            </button>
          </div>

          {copied && (
            <div className="bg-emerald-500 text-white text-xs sm:text-sm py-2 px-3 rounded-xl text-center font-semibold shadow-xs">
              Details copied to clipboard!
            </div>
          )}

          {/* Top Summary Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}>
            {/* Monthly Investment */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Monthly Investment
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {formatCurrency(calculatedData.monthlyAmount)}
              </span>
            </div>

            {/* Exp. Return Rate (%) */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Exp. Return Rate (%)
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {calculatedData.expectedReturns}%
              </span>
            </div>

            {/* Inflation Rate (%) */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Inflation Rate (%)
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {calculatedData.inflationRate}%
              </span>
            </div>

            {/* Periods (Years) */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Periods (Years)
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {calculatedData.period} years
              </span>
            </div>

            {/* Total Investment */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Total Investment
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {formatCurrency(calculatedData.totalInvestment)}
              </span>
            </div>

            {/* Expected Returns */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Expected Returns
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {formatCurrency(calculatedData.expectedReturns)}
              </span>
            </div>

            {/* Future Value (Inflation Adjusted) */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Future Value (Inflation Adjusted)
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {formatCurrency(calculatedData.futureValue)}
              </span>
            </div>
          </div>

          {/* Yearly Breakdown Table */}
          <div className={`rounded-2xl border shadow-xs overflow-hidden ${cardBorder}`}>
            {/* Header: Coral Background */}
            <div
              style={{ backgroundColor: primaryColor }}
              className="grid grid-cols-4 py-3 px-3 text-white text-xs sm:text-sm font-semibold text-center"
            >
              <div>Years</div>
              <div>Invested</div>
              <div>Returns</div>
              <div>Final Balance</div>
            </div>

            {/* Table Rows */}
            <div className={`divide-y ${divideColor}`}>
              {calculatedData.schedule.map((item, idx) => (
                <div
                  key={item.year}
                  className={`grid grid-cols-4 py-3 px-3 text-xs sm:text-sm text-center font-medium transition-colors ${
                    idx === 0
                      ? "bg-[#9fe29d] dark:bg-emerald-950/50 text-gray-900 dark:text-emerald-200"
                      : idx % 2 === 1
                      ? isDark
                        ? "bg-[#161522] text-slate-100"
                        : "bg-white text-gray-900"
                      : "bg-[#9fe29d]/60 dark:bg-emerald-950/30 text-gray-900 dark:text-emerald-200"
                  }`}
                >
                  <div className="font-semibold">{item.year}</div>
                  <div>{formatCurrency(item.invested)}</div>
                  <div>{formatCurrency(item.returns)}</div>
                  <div className="font-semibold">{formatCurrency(item.finalBalance)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SipWithInflation;
