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
const GREEN_COLOR = "#22c55e";
const ORANGE_COLOR = "#f97316";

const StepUpSipCalculator = () => {
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
  const [annualStepUp, setAnnualStepUp] = useState("");
  const [period, setPeriod] = useState("");

  // Result and view states
  const [hasCalculated, setHasCalculated] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Accurate Step-Up SIP Financial Calculation
  const calculatedData = useMemo(() => {
    // Default to sample values (matching screenshots) if not filled or calculating
    const P = monthlyAmount !== "" ? parseFloat(monthlyAmount) || 0 : 5180;
    const rAnnual = expectedReturns !== "" ? parseFloat(expectedReturns) || 0 : 6;
    const sRate = annualStepUp !== "" ? parseFloat(annualStepUp) || 0 : 9;
    const yYears = period !== "" ? Math.min(50, Math.max(1, parseInt(period) || 1)) : 1;

    const monthlyRate = rAnnual > 0 ? rAnnual / 12 / 100 : 0;
    const stepUpFraction = sRate / 100;

    let currentMonthlyDeposit = P;
    let totalInvested = 0;
    let balance = 0;
    const schedule = [];

    for (let y = 1; y <= yYears; y++) {
      for (let m = 1; m <= 12; m++) {
        totalInvested += currentMonthlyDeposit;
        // SIP investment at beginning of each month compounded monthly
        balance = (balance + currentMonthlyDeposit) * (1 + monthlyRate);
      }

      const yearInvested = totalInvested;
      const yearBalance = balance;
      const yearReturns = Math.max(0, yearBalance - yearInvested);

      schedule.push({
        year: y,
        invested: Math.round(yearInvested),
        returns: Math.round(yearReturns),
        finalBalance: Math.round(yearBalance),
      });

      // Annual step-up applied at the start of each new year
      currentMonthlyDeposit = currentMonthlyDeposit * (1 + stepUpFraction);
    }

    const totalInvestment = totalInvested;
    const futureValue = balance;
    const totalReturns = Math.max(0, futureValue - totalInvestment);

    const invPercent = futureValue > 0 ? (totalInvestment / futureValue) * 100 : 0;
    const retPercent = futureValue > 0 ? (totalReturns / futureValue) * 100 : 0;

    return {
      monthlyAmount: P,
      expectedReturns: rAnnual,
      annualStepUp: sRate,
      period: yYears,
      totalInvestment,
      totalReturns,
      futureValue,
      invPercent: Number(invPercent.toFixed(1)),
      retPercent: Number(retPercent.toFixed(1)),
      schedule,
    };
  }, [monthlyAmount, expectedReturns, annualStepUp, period]);

  // Handle Calculate button
  const handleCalculate = () => {
    // If empty, populate with standard defaults from screenshots
    if (!monthlyAmount && !expectedReturns && !annualStepUp && !period) {
      setMonthlyAmount("5180");
      setExpectedReturns("6");
      setAnnualStepUp("9");
      setPeriod("1");
    }
    setHasCalculated(true);
  };

  // Handle Reset button
  const handleReset = () => {
    setMonthlyAmount("");
    setExpectedReturns("");
    setAnnualStepUp("");
    setPeriod("");
    setHasCalculated(false);
    setShowDetails(false);
  };

  // Currency Formatter
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

  // Share Calculation Details
  const handleShare = async () => {
    const text = `Step-Up SIP Calculation Details:
• Monthly Investment: ${formatCurrency(calculatedData.monthlyAmount, 2)}
• Exp. Return Rate: ${calculatedData.expectedReturns}%
• Annual Step-Up: ${calculatedData.annualStepUp}%
• Period: ${calculatedData.period} years
• Invested Amount: ${formatCurrency(calculatedData.totalInvestment, 2)}
• Estimated Returns: ${formatCurrency(calculatedData.totalReturns, 2)}
• Total Future Value: ${formatCurrency(calculatedData.futureValue, 2)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Step-Up SIP Calculator Details",
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

  // Donut chart stroke math
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const invRatio = Math.min(1, Math.max(0, calculatedData.invPercent / 100));
  const orangeDash = invRatio * circumference;
  const greenDash = Math.max(0, circumference - orangeDash);

  return (
    <div className="w-full max-w-[480px] mx-auto pb-12 transition-colors duration-200">
      {!showDetails ? (
        /* ========================================================= */
        /* SCREEN 1 & SCREEN 3: CALCULATOR INPUT & OUTPUT VIEW       */
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
              Step-Up SIP
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
                  placeholder="Enter amount"
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

            {/* Row 2: Exp. Annual Returns(%) */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
                Exp. Annual Returns(%)
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
                  placeholder="Ex: 6.5%"
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

            {/* Row 3: Annual step up(%) */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
                Annual step up(%)
              </label>
              <div className="flex items-center justify-end flex-1 pl-4">
                <input
                  type="text"
                  inputMode="decimal"
                  value={annualStepUp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setAnnualStepUp(val);
                  }}
                  placeholder="Ex: 6.5%"
                  className={`w-full max-w-[170px] text-right bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                />
                {annualStepUp && (
                  <button
                    type="button"
                    onClick={() => setAnnualStepUp("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1.5 cursor-pointer"
                  >
                    <IoCloseCircle className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 4: Period */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
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
                  placeholder="(max. 50 Years)"
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
          {/* RESULTS CARD & DONUT CHART (Shown after Calculate)        */}
          {/* ========================================================= */}
          {hasCalculated && (
            <div className="flex flex-col space-y-4 pt-1">
              {/* Summary Table Card */}
              <div className={`rounded-2xl border overflow-hidden shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}>
                {/* Total Investment */}
                <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
                  <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                    Total Investment
                  </span>
                  <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                    {formatCurrency(calculatedData.totalInvestment, 2)}
                  </span>
                </div>

                {/* Expected Returns */}
                <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
                  <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                    Expected Returns
                  </span>
                  <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                    {formatCurrency(calculatedData.totalReturns, 2)}
                  </span>
                </div>

                {/* Future Value */}
                <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
                  <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                    Future Value
                  </span>
                  <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                    {formatCurrency(calculatedData.futureValue, 2)}
                  </span>
                </div>
              </div>

              {/* Portfolio Allocation Card */}
              <div className={`rounded-2xl border p-5 sm:p-6 shadow-xs flex flex-col items-center justify-center ${cardBg} ${cardBorder}`}>
                <h2 className={`text-sm sm:text-base font-bold mb-4 tracking-tight ${titleColor}`}>
                  Portfolio Allocation
                </h2>

                {/* Donut Chart SVG */}
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

                    {/* Orange segment: Total Investment */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={ORANGE_COLOR}
                      strokeWidth="24"
                      strokeDasharray={`${orangeDash} ${circumference}`}
                      strokeDashoffset="0"
                      fill="transparent"
                      strokeLinecap="butt"
                    />

                    {/* Green segment: Returns */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={GREEN_COLOR}
                      strokeWidth="24"
                      strokeDasharray={`${greenDash} ${circumference}`}
                      strokeDashoffset={-orangeDash}
                      fill="transparent"
                      strokeLinecap="butt"
                    />
                  </svg>

                  {/* Center Text in Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                    <span className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium">
                      Total Value
                    </span>
                    <span
                      style={{ color: primaryColor }}
                      className="text-xs sm:text-sm font-bold line-clamp-1 mt-0.5"
                    >
                      {formatCurrency(calculatedData.futureValue, 2)}
                    </span>
                  </div>
                </div>

                {/* Legend Below Chart */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-[320px] mt-6 pt-2">
                  {/* Total Investment Legend */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ORANGE_COLOR }}
                      />
                      <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                        Total investment
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-orange-500">
                      {formatCurrency(calculatedData.totalInvestment, 2)}
                    </span>
                    <span className="text-[11px] font-medium text-orange-400/90">
                      ({calculatedData.invPercent}%)
                    </span>
                  </div>

                  {/* Returns Legend */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: GREEN_COLOR }}
                      />
                      <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                        Returns
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(calculatedData.totalReturns, 2)}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-500/90">
                      ({calculatedData.retPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* SCREEN 2: DETAILS VIEW (Exact Match with Image 2)          */
        /* ========================================================= */
        <div className="flex flex-col space-y-4">
          {/* Header: Back button left, Details title center, Share button right */}
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
                {formatCurrency(calculatedData.monthlyAmount, 2)}
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

            {/* Annual Step-Up (%) */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Annual Step-Up (%)
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {calculatedData.annualStepUp}%
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

            {/* Invested Amount */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Invested Amount
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {formatCurrency(calculatedData.totalInvestment, 2)}
              </span>
            </div>

            {/* Estimated Returns */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Estimated Returns
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {formatCurrency(calculatedData.totalReturns, 2)}
              </span>
            </div>

            {/* Total Value */}
            <div className={`grid grid-cols-2 divide-x ${isDark ? "divide-[#232234]" : "divide-gray-200"}`}>
              <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                Total Value
              </span>
              <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                {formatCurrency(calculatedData.futureValue, 2)}
              </span>
            </div>
          </div>

          {/* Yearly Breakdown Table matching Screenshot 2 */}
          <div className={`rounded-2xl border shadow-xs overflow-hidden ${cardBorder}`}>
            {/* Table Header: Coral background */}
            <div
              style={{ backgroundColor: primaryColor }}
              className="grid grid-cols-4 py-3 px-3 text-white text-xs sm:text-sm font-semibold text-center"
            >
              <div>Years</div>
              <div>Invested</div>
              <div>Returns</div>
              <div>Final Balance</div>
            </div>

            {/* Table Body */}
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
                  <div>{formatCurrency(item.invested, 0)}</div>
                  <div>{formatCurrency(item.returns, 0)}</div>
                  <div className="font-semibold">{formatCurrency(item.finalBalance, 0)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepUpSipCalculator;
