"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import {
  IoChevronBack,
  IoCloseCircle,
} from "react-icons/io5";

const InflationImpact = () => {
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

  // Form input states matching Image 3 & 4
  const [initialAmount, setInitialAmount] = useState("");
  const [inflationRate, setInflationRate] = useState("");
  const [period, setPeriod] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Calculations
  const results = useMemo(() => {
    const P = initialAmount !== "" ? parseFloat(initialAmount) || 0 : 10;
    const rawRate = inflationRate !== "" ? parseFloat(inflationRate) || 0 : 3;
    const r = Math.min(30, rawRate) / 100;
    const t = Math.min(50, Math.max(1, parseFloat(period) || 10));

    // 1. Future Cost Estimation (Price Increase)
    // Future Cost = P * (1 + r)^t
    const futureCost = P * Math.pow(1 + r, t);
    const priceIncrease = Math.max(0, futureCost - P);

    // 2. Purchasing Power Erosion (Decrease in value of money)
    // Future Value = P / (1 + r)^t
    const futureValue = P / Math.pow(1 + r, t);
    const valueReduction = Math.max(0, P - futureValue);

    const formatNum = (val) => {
      if (val === undefined || val === null || isNaN(val)) return "0";
      return Number(val.toFixed(2)).toString();
    };

    return {
      currentCost: formatNum(P),
      futureCost: formatNum(futureCost),
      priceIncrease: formatNum(priceIncrease),
      todaysValue: formatNum(P),
      futureValue: formatNum(futureValue),
      valueReduction: formatNum(valueReduction),
    };
  }, [initialAmount, inflationRate, period]);

  const handleReset = () => {
    setInitialAmount("");
    setInflationRate("");
    setPeriod("");
    setShowResults(false);
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

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
                Inflation Impact
              </h1>
            </div>

            <div className="w-max" />
          </div>

          {/* Form Inputs Card (Images 3 & 4) */}
          <div
            className={`rounded-2xl border shadow-xs divide-y relative ${cardBg} ${cardBorder} ${divideColor}`}
          >
            {/* Row 1: Initial Amount */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-medium ${labelColor}`}>
                Intial Amount
              </label>
              <div className="flex items-center justify-end flex-1 pl-4 gap-1">
                {initialAmount && (
                  <span className={`text-sm sm:text-base font-medium ${valueColor}`}>
                    ₹
                  </span>
                )}
                <input
                  type="text"
                  inputMode="decimal"
                  value={initialAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setInitialAmount(val);
                  }}
                  placeholder="Enter amount"
                  className={`w-full max-w-[160px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                />
                {initialAmount ? (
                  <button
                    type="button"
                    onClick={() => setInitialAmount("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5"
                  >
                    <IoCloseCircle className="w-5 h-5 text-gray-400" />
                  </button>
                ) : (
                  <div className="w-5" />
                )}
              </div>
            </div>

            {/* Row 2: Inflation Rate */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-medium ${labelColor}`}>
                Inflation Rate
              </label>
              <div className="flex items-center justify-end flex-1 pl-4 gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={inflationRate}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    if (Number(val) <= 30 || val === "") {
                      setInflationRate(val);
                    }
                  }}
                  placeholder="Max 30% per annum"
                  className={`w-full max-w-[180px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
                />
                {inflationRate ? (
                  <button
                    type="button"
                    onClick={() => setInflationRate("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5"
                  >
                    <IoCloseCircle className="w-5 h-5 text-gray-400" />
                  </button>
                ) : (
                  <div className="w-5" />
                )}
              </div>
            </div>

            {/* Row 3: Period */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-3.5">
              <label className={`text-sm sm:text-base font-medium ${labelColor}`}>
                Period
              </label>
              <div className="flex items-center justify-end flex-1 pl-4 gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={period}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (Number(val) <= 50 || val === "") {
                      setPeriod(val);
                    }
                  }}
                  placeholder="Max 50 years"
                  className={`w-full max-w-[180px] text-right bg-transparent outline-none font-normal text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 ${valueColor}`}
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

          {/* Result Cards displayed below buttons (Matches Image 3) */}
          {showResults && (
            <div className="flex flex-col space-y-4 pt-1 animate-in fade-in duration-200">
              {/* Card 1: Future Cost Estimation */}
              <div
                className={`rounded-2xl border shadow-xs overflow-hidden ${cardBg} ${cardBorder}`}
              >
                <div className="px-4 pt-4 pb-2">
                  <h3 className={`text-sm sm:text-base font-bold ${titleColor}`}>
                    Future Cost Estimation:
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    (Price Increase due to inflation)
                  </p>
                </div>

                <div
                  className={`border-t divide-y ${
                    isDark ? "border-[#232234] divide-[#232234]" : "border-gray-100 divide-gray-100"
                  }`}
                >
                  <div
                    className={`grid grid-cols-2 divide-x ${
                      isDark ? "divide-[#232234]" : "divide-gray-100"
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                      Current Cost
                    </span>
                    <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                      {results.currentCost}
                    </span>
                  </div>

                  <div
                    className={`grid grid-cols-2 divide-x ${
                      isDark ? "divide-[#232234]" : "divide-gray-100"
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                      Future Cost
                    </span>
                    <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                      {results.futureCost}
                    </span>
                  </div>

                  <div
                    className={`grid grid-cols-2 divide-x ${
                      isDark ? "divide-[#232234]" : "divide-gray-100"
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                      Price Increase
                    </span>
                    <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                      {results.priceIncrease}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Purchasing Power Erosion */}
              <div
                className={`rounded-2xl border shadow-xs overflow-hidden ${cardBg} ${cardBorder}`}
              >
                <div className="px-4 pt-4 pb-2">
                  <h3 className={`text-sm sm:text-base font-bold ${titleColor}`}>
                    Purchasing Power Erosion:
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    (Decrease in value of money)
                  </p>
                </div>

                <div
                  className={`border-t divide-y ${
                    isDark ? "border-[#232234] divide-[#232234]" : "border-gray-100 divide-gray-100"
                  }`}
                >
                  <div
                    className={`grid grid-cols-2 divide-x ${
                      isDark ? "divide-[#232234]" : "divide-gray-100"
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                      Today&apos;s Value
                    </span>
                    <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                      {results.todaysValue}
                    </span>
                  </div>

                  <div
                    className={`grid grid-cols-2 divide-x ${
                      isDark ? "divide-[#232234]" : "divide-gray-100"
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                      Future Value
                    </span>
                    <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                      {results.futureValue}
                    </span>
                  </div>

                  <div
                    className={`grid grid-cols-2 divide-x ${
                      isDark ? "divide-[#232234]" : "divide-gray-100"
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-normal py-3 px-4 ${labelColor}`}>
                      Value Reduction
                    </span>
                    <span className={`text-xs sm:text-sm font-medium py-3 px-4 text-right ${valueColor}`}>
                      {results.valueReduction}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InflationImpact;
