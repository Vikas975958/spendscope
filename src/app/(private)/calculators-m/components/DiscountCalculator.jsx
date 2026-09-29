"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import { IoChevronBack, IoCloseCircle } from "react-icons/io5";

const CORAL_COLOR = "#f06557";

const DiscountCalculator = () => {
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

  // Mode: "after-tax" | "before-tax"
  const [mode, setMode] = useState("after-tax");

  // Inputs: empty by default (matches Screenshot 3)
  const [amount, setAmount] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [salesTaxPercent, setSalesTaxPercent] = useState("");

  // Results visibility
  const [hasCalculated, setHasCalculated] = useState(false);

  // Financial calculations
  const results = useMemo(() => {
    const P = parseFloat(amount) || 0;
    const D = parseFloat(discountPercent) || 0;
    const T = parseFloat(salesTaxPercent) || 0;

    let savings = 0;
    let salesTax = 0;
    let payableAmount = 0;

    if (mode === "after-tax") {
      // In After Tax:
      // Tax is applied on the initial amount:
      // Sales Tax = Amount * (T / 100)
      // Amount with Tax = Amount + Sales Tax
      // Discount is applied on amount after tax:
      // Savings = Amount with Tax * (D / 100)
      // Payable = Amount with Tax - Savings
      salesTax = P * (T / 100);
      const amountWithTax = P + salesTax;
      savings = amountWithTax * (D / 100);
      payableAmount = amountWithTax - savings;
    } else {
      // In Before Tax:
      // Discount is applied on initial amount first:
      // Savings = Amount * (D / 100)
      // Discounted Amount = Amount - Savings
      // Sales Tax is applied on discounted amount:
      // Sales Tax = Discounted Amount * (T / 100)
      // Payable = Discounted Amount + Sales Tax
      savings = P * (D / 100);
      const discountedAmount = Math.max(0, P - savings);
      salesTax = discountedAmount * (T / 100);
      payableAmount = discountedAmount + salesTax;
    }

    return {
      initialAmount: P,
      savings,
      salesTax,
      payableAmount: Math.max(0, payableAmount),
    };
  }, [amount, discountPercent, salesTaxPercent, mode]);

  const handleCalculate = () => {
    // If fields are empty, fill default 100, 6, 6 matching screenshot 1 & 2
    if (!amount && !discountPercent && !salesTaxPercent) {
      setAmount("100");
      setDiscountPercent("6");
      setSalesTaxPercent("6");
    }
    setHasCalculated(true);
  };

  const handleReset = () => {
    setAmount("");
    setDiscountPercent("");
    setSalesTaxPercent("");
    setHasCalculated(false);
  };

  // Helper formatting to match ₹100, ₹6.36, ₹6.00, ₹99.64
  const formatAmountDisplay = (val) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0";
    // Check if integer
    if (Number.isInteger(Number(val))) {
      return "₹" + Number(val).toLocaleString("en-IN");
    }
    return (
      "₹" +
      Number(val).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  const formatCurrencyFixed = (val) => {
    if (isNaN(val) || val === null || val === undefined) return "₹0.00";
    return (
      "₹" +
      Number(val).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  // Color tokens
  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200/80";
  const divideColor = isDark ? "divide-[#232234]" : "divide-gray-100";
  const labelColor = isDark ? "text-slate-100" : "text-gray-900";
  const valueColor = isDark ? "text-slate-100" : "text-gray-900";
  const tabBg = isDark ? "bg-[#1a1928]" : "bg-[#e5e7eb]/80";

  return (
    <div className="w-full max-w-[480px] mx-auto pb-12 transition-colors duration-200">
      <div className="flex flex-col space-y-4">
        {/* Header Bar */}
        <div className="grid grid-cols-[80px_1fr_80px] items-center py-2 px-1">
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
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
              Discount Calculator
            </h1>
          </div>

          <div className="w-max" />
        </div>

        {/* Toggle Switch: After Tax | Before Tax */}
        <div className={`grid grid-cols-2 p-1 rounded-xl ${tabBg}`}>
          <button
            type="button"
            onClick={() => setMode("after-tax")}
            style={{
              backgroundColor: mode === "after-tax" ? primaryColor : "transparent",
              color: mode === "after-tax" ? "#ffffff" : isDark ? "#cbd5e1" : "#1f2937",
            }}
            className="py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
          >
            After Tax
          </button>
          <button
            type="button"
            onClick={() => setMode("before-tax")}
            style={{
              backgroundColor: mode === "before-tax" ? primaryColor : "transparent",
              color: mode === "before-tax" ? "#ffffff" : isDark ? "#cbd5e1" : "#1f2937",
            }}
            className="py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
          >
            Before Tax
          </button>
        </div>

        {/* Form Inputs Card */}
        <div
          className={`rounded-2xl border shadow-xs divide-y ${cardBg} ${cardBorder} ${divideColor}`}
        >
          {/* Row 1: Amount */}
          <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
            <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
              Amount
            </label>
            <div className="flex items-center justify-end flex-1 pl-4">
              {amount && (
                <span className={`text-sm sm:text-base font-normal ${valueColor} mr-0.5`}>
                  ₹
                </span>
              )}
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setAmount(val);
                }}
                placeholder="Enter amount"
                className={`w-full max-w-[150px] text-right bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
              />
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount("")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1.5 cursor-pointer"
                >
                  <IoCloseCircle className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Discount % */}
          <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
            <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
              Discount %
            </label>
            <div className="flex items-center justify-end flex-1 pl-4">
              <input
                type="text"
                inputMode="decimal"
                value={discountPercent}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setDiscountPercent(val);
                }}
                placeholder="Ex: 6.5%"
                className={`w-full max-w-[150px] text-right bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
              />
              {discountPercent && (
                <button
                  type="button"
                  onClick={() => setDiscountPercent("")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1.5 cursor-pointer"
                >
                  <IoCloseCircle className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Row 3: Sales Tax % */}
          <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
            <label className={`text-sm sm:text-base font-normal ${labelColor}`}>
              Sales Tax %
            </label>
            <div className="flex items-center justify-end flex-1 pl-4">
              <input
                type="text"
                inputMode="decimal"
                value={salesTaxPercent}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setSalesTaxPercent(val);
                }}
                placeholder="Ex: 6.5%"
                className={`w-full max-w-[150px] text-right bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
              />
              {salesTaxPercent && (
                <button
                  type="button"
                  onClick={() => setSalesTaxPercent("")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1.5 cursor-pointer"
                >
                  <IoCloseCircle className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Reset & Calculate */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleReset}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm sm:text-base border border-gray-900 dark:border-slate-400 bg-white dark:bg-[#161522] text-gray-900 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-[#201f30] transition-all cursor-pointer shadow-xs`}
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

        {/* Results Card (Displayed when calculated) */}
        {hasCalculated && (
          <div
            className={`rounded-2xl border shadow-xs overflow-hidden ${cardBg} ${cardBorder} mt-2`}
          >
            {/* 4 Rows, 2 Columns with Vertical divider down the middle */}
            <div className={`divide-y ${divideColor}`}>
              {/* Row 1: Initial Amount */}
              <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-[#232234]">
                <div className="py-3.5 px-4 text-left text-sm sm:text-base font-normal text-gray-900 dark:text-slate-100">
                  Initial Amount
                </div>
                <div className="py-3.5 px-4 text-right text-sm sm:text-base font-normal text-gray-900 dark:text-slate-100">
                  {formatAmountDisplay(results.initialAmount)}
                </div>
              </div>

              {/* Row 2: Savings */}
              <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-[#232234]">
                <div className="py-3.5 px-4 text-left text-sm sm:text-base font-normal text-gray-900 dark:text-slate-100">
                  Savings
                </div>
                <div className="py-3.5 px-4 text-right text-sm sm:text-base font-normal text-gray-900 dark:text-slate-100">
                  {formatCurrencyFixed(results.savings)}
                </div>
              </div>

              {/* Row 3: Sales Tax */}
              <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-[#232234]">
                <div className="py-3.5 px-4 text-left text-sm sm:text-base font-normal text-gray-900 dark:text-slate-100">
                  Sales Tax
                </div>
                <div className="py-3.5 px-4 text-right text-sm sm:text-base font-normal text-gray-900 dark:text-slate-100">
                  {formatCurrencyFixed(results.salesTax)}
                </div>
              </div>

              {/* Row 4: Payable Amount */}
              <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-[#232234]">
                <div className="py-3.5 px-4 text-left text-sm sm:text-base font-normal text-gray-900 dark:text-slate-100">
                  Payable Amount
                </div>
                <div className="py-3.5 px-4 text-right text-sm sm:text-base font-normal text-gray-900 dark:text-slate-100">
                  {formatCurrencyFixed(results.payableAmount)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountCalculator;
