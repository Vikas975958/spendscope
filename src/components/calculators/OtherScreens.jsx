"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency } from "./EmiScreens";
import { HiClipboard, HiCheck, HiArrowsRightLeft } from "react-icons/hi2";

// Helper function to convert number to Indian words
export const numberToIndianWords = (num) => {
  if (isNaN(num) || num === null || num === undefined || num === "") return "";
  const n = Math.floor(Math.abs(Number(num)));
  if (n === 0) return "Zero Rupees Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (val) => {
    let str = "";
    if (val > 19) {
      str += b[Math.floor(val / 10)] + (val % 10 !== 0 ? " " + a[val % 10] : "");
    } else {
      str += a[val];
    }
    return str;
  };

  let crore = Math.floor(n / 10000000);
  let lakh = Math.floor((n % 10000000) / 100000);
  let thousand = Math.floor((n % 100000) / 1000);
  let hundred = Math.floor((n % 1000) / 100);
  let rest = n % 100;

  let res = "";
  if (crore > 0) res += inWords(crore) + " Crore ";
  if (lakh > 0) res += inWords(lakh) + " Lakh ";
  if (thousand > 0) res += inWords(thousand) + " Thousand ";
  if (hundred > 0) res += inWords(hundred) + " Hundred ";
  if (rest > 0) {
    if (res !== "") res += "and ";
    res += inWords(rest) + " ";
  }

  return res.trim() + " Rupees Only";
};

export const CashNoteCounterScreen = ({ isDark }) => {
  const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
  const [counts, setCounts] = useState({
    2000: 0,
    500: 10,
    200: 5,
    100: 20,
    50: 10,
    20: 0,
    10: 0,
    5: 0,
    2: 0,
    1: 0,
  });

  const handleChange = (denom, val) => {
    setCounts((prev) => ({
      ...prev,
      [denom]: Math.max(0, Number(val) || 0),
    }));
  };

  const handleReset = () => {
    const zero = {};
    denominations.forEach((d) => (zero[d] = 0));
    setCounts(zero);
  };

  const totalNotes = denominations.reduce((acc, d) => acc + (counts[d] || 0), 0);
  const totalAmount = denominations.reduce((acc, d) => acc + d * (counts[d] || 0), 0);
  const words = numberToIndianWords(totalAmount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      {/* Denominations table */}
      <div
        className={`lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-3 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <div className="flex justify-between items-center border-b pb-2 border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Denominations</h3>
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {denominations.map((denom) => {
            const subtotal = denom * (counts[denom] || 0);
            return (
              <div
                key={denom}
                className="flex items-center justify-between gap-3 p-2 rounded-xl bg-gray-50 dark:bg-slate-900/60"
              >
                <div className="w-20 font-bold text-xs sm:text-sm text-gray-800 dark:text-slate-200">
                  ₹ {denom}
                </div>
                <div className="text-xs text-gray-400">×</div>
                <input
                  type="number"
                  min="0"
                  value={counts[denom] || ""}
                  placeholder="0"
                  onChange={(e) => handleChange(denom, e.target.value)}
                  className={`w-24 px-2.5 py-1 text-center text-xs sm:text-sm font-bold rounded-lg border ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-900"
                  }`}
                />
                <div className="w-24 text-right font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  = ₹ {formatCurrency(subtotal)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary side */}
      <div
        className={`lg:col-span-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border flex flex-col justify-between space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <div>
          <div className="text-center pb-3 border-b border-gray-100 dark:border-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Cash Amount
            </span>
            <div className="text-3xl font-extrabold text-red-500 mt-1">
              ₹ {formatCurrency(totalAmount)}
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              Total Notes: {totalNotes}
            </span>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Amount in Words</span>
            <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 italic">
              &ldquo;{words}&rdquo;
            </p>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center">
          * Useful for banking cash slips, safe cash audits & counting
        </div>
      </div>
    </div>
  );
};

export const AmountToWordScreen = ({ isDark }) => {
  const [num, setNum] = useState(1250000);
  const [copied, setCopied] = useState(false);

  const words = numberToIndianWords(num);

  const handleCopy = () => {
    navigator.clipboard.writeText(words);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="max-w-md mx-auto space-y-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
          Enter Numeric Amount (₹)
        </label>
        <input
          type="number"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          placeholder="e.g. 500000"
          className={`w-full px-4 py-3 rounded-xl text-base font-bold border focus:outline-none ${
            isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
          }`}
        />
      </div>

      <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-center space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
          Converted Word Text
        </span>
        <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white px-4">
          &ldquo;{words}&rdquo;
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all shadow-2xs cursor-pointer"
        >
          {copied ? <HiCheck className="w-4 h-4" /> : <HiClipboard className="w-4 h-4" />}
          <span>{copied ? "Copied to Clipboard!" : "Copy Words"}</span>
        </button>
      </div>
    </div>
  );
};

export const DiscountCalculatorScreen = ({ isDark }) => {
  const [originalPrice, setOriginalPrice] = useState(2499);
  const [discountPercent, setDiscountPercent] = useState(25);
  const [taxPercent, setTaxPercent] = useState(5);

  const results = useMemo(() => {
    const P = Number(originalPrice) || 0;
    const d = (Number(discountPercent) || 0) / 100;
    const t = (Number(taxPercent) || 0) / 100;

    const discountAmount = P * d;
    const discountedPrice = P - discountAmount;
    const taxAmount = discountedPrice * t;
    const finalPrice = discountedPrice + taxAmount;
    const totalSavings = discountAmount;

    return {
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
    };
  }, [originalPrice, discountPercent, taxPercent]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Original Price (₹)
          </label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Discount (%)
          </label>
          <input
            type="number"
            step="0.5"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Additional Tax / VAT (%)
          </label>
          <input
            type="number"
            step="0.5"
            value={taxPercent}
            onChange={(e) => setTaxPercent(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-center">
          <span className="text-xs font-bold text-red-500">Final Discounted Price</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
            ₹ {formatCurrency(results.finalPrice)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Total Money Saved
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹ {formatCurrency(results.totalSavings)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CurrencyConverterScreen = ({ isDark }) => {
  const [amount, setAmount] = useState(100);
  const [fromCurr, setFromCurr] = useState("USD");
  const [toCurr, setToCurr] = useState("INR");

  const rates = {
    USD: 1,
    INR: 86.5,
    EUR: 0.92,
    GBP: 0.79,
    AED: 3.67,
    CAD: 1.39,
    AUD: 1.54,
    JPY: 153.2,
    SGD: 1.34,
  };

  const handleSwap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const converted = useMemo(() => {
    const val = Number(amount) || 0;
    const rateFrom = rates[fromCurr] || 1;
    const rateTo = rates[toCurr] || 1;
    // Base USD
    const inUsd = val / rateFrom;
    return Math.round(inUsd * rateTo * 100) / 100;
  }, [amount, fromCurr, toCurr]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-center">
        <div className="sm:col-span-3 space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            From Currency
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            />
            <select
              value={fromCurr}
              onChange={(e) => setFromCurr(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            >
              {Object.keys(rates).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-1 flex justify-center pt-4">
          <button
            onClick={handleSwap}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-600 hover:text-red-500 border border-gray-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Swap Currencies"
          >
            <HiArrowsRightLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="sm:col-span-3 space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            To Currency
          </label>
          <div className="flex gap-2">
            <div
              className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border flex items-center ${
                isDark ? "bg-slate-900/60 border-slate-700 text-white" : "bg-gray-100/60 border-gray-200 text-gray-900"
              }`}
            >
              {converted}
            </div>
            <select
              value={toCurr}
              onChange={(e) => setToCurr(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            >
              {Object.keys(rates).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
        <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
          Exchange Result:
        </span>
        <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-300 mt-0.5">
          {amount} {fromCurr} = {converted} {toCurr}
        </div>
      </div>
    </div>
  );
};
