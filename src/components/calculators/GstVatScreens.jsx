"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency } from "./EmiScreens";

export const GstCalculatorScreen = ({ isDark }) => {
  const [amount, setAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(18);
  const [calculationType, setCalculationType] = useState("exclusive"); // exclusive (Add GST) | inclusive (Remove GST)

  const slabs = [3, 5, 12, 18, 28];

  const results = useMemo(() => {
    const A = Number(amount) || 0;
    const r = (Number(gstRate) || 0) / 100;

    if (calculationType === "exclusive") {
      // Add GST
      const gstAmount = A * r;
      const total = A + gstAmount;
      return {
        netAmount: A,
        gstAmount: Math.round(gstAmount * 100) / 100,
        cgst: Math.round((gstAmount / 2) * 100) / 100,
        sgst: Math.round((gstAmount / 2) * 100) / 100,
        grossAmount: Math.round(total * 100) / 100,
      };
    } else {
      // Remove GST (Inclusive)
      const net = A / (1 + r);
      const gstAmount = A - net;
      return {
        netAmount: Math.round(net * 100) / 100,
        gstAmount: Math.round(gstAmount * 100) / 100,
        cgst: Math.round((gstAmount / 2) * 100) / 100,
        sgst: Math.round((gstAmount / 2) * 100) / 100,
        grossAmount: A,
      };
    }
  }, [amount, gstRate, calculationType]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      <div
        className={`lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b pb-2.5 border-gray-100 dark:border-slate-700">
          GST Calculation Method
        </h3>

        {/* Exclusive vs Inclusive Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setCalculationType("exclusive")}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              calculationType === "exclusive"
                ? "bg-red-500 text-white shadow-2xs"
                : "text-gray-600 dark:text-slate-400"
            }`}
          >
            Add GST (Exclusive)
          </button>
          <button
            type="button"
            onClick={() => setCalculationType("inclusive")}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              calculationType === "inclusive"
                ? "bg-red-500 text-white shadow-2xs"
                : "text-gray-600 dark:text-slate-400"
            }`}
          >
            Remove GST (Inclusive)
          </button>
        </div>

        {/* Initial Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            {calculationType === "exclusive" ? "Initial Net Amount (₹)" : "Total Gross Amount (₹)"}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>

        {/* Slabs */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            GST Rate Slab (%)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {slabs.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setGstRate(rate)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  gstRate === rate
                    ? "bg-red-500 text-white border-red-500 shadow-2xs"
                    : isDark
                    ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`lg:col-span-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border flex flex-col justify-between space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <div className="text-center pb-3 border-b border-gray-100 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Final Total Price
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-500 mt-1">
            ₹ {formatCurrency(results.grossAmount)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-gray-50 dark:bg-slate-900/60">
            <span className="text-gray-500">Actual Net Price</span>
            <span className="font-bold text-gray-900 dark:text-white">
              ₹ {formatCurrency(results.netAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-gray-50 dark:bg-slate-900/60">
            <span className="text-gray-500">Total GST ({gstRate}%)</span>
            <span className="font-bold text-red-500">
              ₹ {formatCurrency(results.gstAmount)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-900/60 flex justify-between">
              <span className="text-gray-400">CGST ({gstRate / 2}%):</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹ {formatCurrency(results.cgst)}</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-900/60 flex justify-between">
              <span className="text-gray-400">SGST ({gstRate / 2}%):</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹ {formatCurrency(results.sgst)}</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center">
          * Intra-state split: 50% CGST + 50% SGST / Inter-state: 100% IGST
        </div>
      </div>
    </div>
  );
};

export const VatCalculatorScreen = ({ isDark }) => {
  const [netAmount, setNetAmount] = useState(10000);
  const [vatRate, setVatRate] = useState(5.0);

  const results = useMemo(() => {
    const net = Number(netAmount) || 0;
    const rate = (Number(vatRate) || 0) / 100;
    const vat = net * rate;
    return {
      net,
      vat: Math.round(vat * 100) / 100,
      gross: Math.round((net + vat) * 100) / 100,
    };
  }, [netAmount, vatRate]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Net Price (Excl. VAT)
          </label>
          <input
            type="number"
            value={netAmount}
            onChange={(e) => setNetAmount(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            VAT Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={vatRate}
            onChange={(e) => setVatRate(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-gray-400">Net Amount</span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
            ₹ {formatCurrency(results.net)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
          <span className="text-xs font-semibold text-red-500">VAT Amount ({vatRate}%)</span>
          <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">
            ₹ {formatCurrency(results.vat)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Gross Price (Incl. VAT)
          </span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            ₹ {formatCurrency(results.gross)}
          </div>
        </div>
      </div>
    </div>
  );
};
