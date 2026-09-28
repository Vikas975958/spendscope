"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency } from "./EmiScreens";

export const SipCalculatorScreen = ({ isDark }) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12.0);
  const [tenureYears, setTenureYears] = useState(10);

  const results = useMemo(() => {
    const P = Number(monthlyInvestment) || 0;
    const r = (Number(expectedReturn) || 0) / 12 / 100;
    const n = (Number(tenureYears) || 1) * 12;

    if (P <= 0 || r <= 0 || n <= 0) return { invested: 0, returns: 0, total: 0 };

    // Standard Mutual Fund SIP formula
    const total = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = P * n;
    const returns = total - invested;

    return {
      invested: Math.round(invested),
      returns: Math.round(returns),
      total: Math.round(total),
      investedRatio: Math.round((invested / total) * 100) || 50,
    };
  }, [monthlyInvestment, expectedReturn, tenureYears]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      <div
        className={`lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b pb-2.5 border-gray-100 dark:border-slate-700">
          SIP Investment Plan
        </h3>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
              Monthly Investment
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
              <input
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className={`w-36 pl-6 pr-3 py-1.5 text-right text-xs sm:text-sm font-bold rounded-xl border ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
          </div>
          <input
            type="range"
            min="500"
            max="100000"
            step="500"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
              Expected Return Rate (p.a. %)
            </label>
            <input
              type="number"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className={`w-24 px-3 py-1.5 text-right text-xs sm:text-sm font-bold rounded-xl border ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            />
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.5"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
              Time Period (Years)
            </label>
            <input
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className={`w-24 px-3 py-1.5 text-right text-xs sm:text-sm font-bold rounded-xl border ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            />
          </div>
          <input
            type="range"
            min="1"
            max="35"
            step="1"
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
          />
        </div>
      </div>

      <div
        className={`lg:col-span-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border flex flex-col justify-between space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <div className="text-center pb-3 border-b border-gray-100 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Expected Wealth
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500 mt-1">
            ₹ {formatCurrency(results.total)}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60">
            <span className="text-gray-500">Invested Amount</span>
            <span className="font-bold text-gray-900 dark:text-white">
              ₹ {formatCurrency(results.invested)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60">
            <span className="text-gray-500">Est. Returns (Profit)</span>
            <span className="font-bold text-emerald-500">
              ₹ {formatCurrency(results.returns)}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-gray-200 dark:bg-slate-700">
            <div
              style={{ width: `${results.investedRatio}%` }}
              className="bg-slate-500 transition-all duration-300"
            />
            <div
              style={{ width: `${100 - results.investedRatio}%` }}
              className="bg-emerald-500 transition-all duration-300"
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Invested: {results.investedRatio}%</span>
            <span>Returns: {100 - results.investedRatio}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SwpCalculatorScreen = ({ isDark }) => {
  const [totalInvestment, setTotalInvestment] = useState(2500000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(20000);
  const [expectedReturn, setExpectedReturn] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(10);

  const results = useMemo(() => {
    let balance = Number(totalInvestment) || 0;
    const withdraw = Number(monthlyWithdrawal) || 0;
    const r = (Number(expectedReturn) || 0) / 12 / 100;
    const totalMonths = (Number(tenureYears) || 1) * 12;

    let totalWithdrawn = 0;

    for (let m = 0; m < totalMonths; m++) {
      balance = balance * (1 + r) - withdraw;
      totalWithdrawn += withdraw;
      if (balance <= 0) {
        balance = 0;
        break;
      }
    }

    return {
      totalWithdrawn: Math.round(totalWithdrawn),
      finalBalance: Math.round(balance),
    };
  }, [totalInvestment, monthlyWithdrawal, expectedReturn, tenureYears]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      <div
        className={`lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b pb-2.5 border-gray-100 dark:border-slate-700">
          Systematic Withdrawal Plan (SWP)
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Initial Corpus (₹)
          </label>
          <input
            type="number"
            value={totalInvestment}
            onChange={(e) => setTotalInvestment(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Monthly Withdrawal (₹)
          </label>
          <input
            type="number"
            value={monthlyWithdrawal}
            onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Expected Return Rate (% p.a.)
          </label>
          <input
            type="number"
            step="0.5"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Time Period (Years)
          </label>
          <input
            type="number"
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div
        className={`lg:col-span-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border flex flex-col justify-between space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <div className="text-center pb-3 border-b border-gray-100 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Final Balance Remaining
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-500 mt-1">
            ₹ {formatCurrency(results.finalBalance)}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60">
            <span className="text-gray-500">Total Withdrawn Cash</span>
            <span className="font-bold text-emerald-500">
              ₹ {formatCurrency(results.totalWithdrawn)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60">
            <span className="text-gray-500">Initial Invested Corpus</span>
            <span className="font-bold text-gray-900 dark:text-white">
              ₹ {formatCurrency(totalInvestment)}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center">
          * Calculated with monthly compounding growth & payout
        </div>
      </div>
    </div>
  );
};

export const StpCalculatorScreen = ({ isDark }) => {
  const [sourceAmount, setSourceAmount] = useState(1000000);
  const [transferAmount, setTransferAmount] = useState(25000);
  const [sourceReturn, setSourceReturn] = useState(6.0);
  const [targetReturn, setTargetReturn] = useState(12.0);
  const [years, setYears] = useState(3);

  const finalValue = useMemo(() => {
    let src = Number(sourceAmount) || 0;
    let dst = 0;
    const t = Number(transferAmount) || 0;
    const rSrc = (Number(sourceReturn) || 0) / 12 / 100;
    const rDst = (Number(targetReturn) || 0) / 12 / 100;
    const totalMonths = (Number(years) || 1) * 12;

    for (let m = 0; m < totalMonths; m++) {
      const transfer = Math.min(src, t);
      src = (src - transfer) * (1 + rSrc);
      dst = (dst + transfer) * (1 + rDst);
    }

    return {
      sourceBalance: Math.round(src),
      targetBalance: Math.round(dst),
      totalValue: Math.round(src + dst),
    };
  }, [sourceAmount, transferAmount, sourceReturn, targetReturn, years]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Source Initial Amount (₹)
          </label>
          <input
            type="number"
            value={sourceAmount}
            onChange={(e) => setSourceAmount(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Monthly Transfer (₹)
          </label>
          <input
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Tenure (Years)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-gray-400">Source Fund Left</span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
            ₹ {formatCurrency(finalValue.sourceBalance)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Target Fund Value
          </span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            ₹ {formatCurrency(finalValue.targetBalance)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
          <span className="text-xs font-semibold text-red-500">Total Portfolio Value</span>
          <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">
            ₹ {formatCurrency(finalValue.totalValue)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const StepUpSipScreen = ({ isDark }) => {
  const [initialSip, setInitialSip] = useState(5000);
  const [stepUpPercent, setStepUpPercent] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);

  const results = useMemo(() => {
    let monthly = Number(initialSip) || 0;
    const step = (Number(stepUpPercent) || 0) / 100;
    const r = (Number(expectedReturn) || 0) / 12 / 100;
    const totalYears = Number(years) || 1;

    let total = 0;
    let totalInvested = 0;

    for (let y = 0; y < totalYears; y++) {
      for (let m = 0; m < 12; m++) {
        total = (total + monthly) * (1 + r);
        totalInvested += monthly;
      }
      monthly = monthly * (1 + step);
    }

    return {
      invested: Math.round(totalInvested),
      totalValue: Math.round(total),
      gains: Math.round(total - totalInvested),
    };
  }, [initialSip, stepUpPercent, expectedReturn, years]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Initial Monthly SIP (₹)
          </label>
          <input
            type="number"
            value={initialSip}
            onChange={(e) => setInitialSip(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Annual Step-Up (%/yr)
          </label>
          <input
            type="number"
            value={stepUpPercent}
            onChange={(e) => setStepUpPercent(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Expected Return (% p.a.)
          </label>
          <input
            type="number"
            step="0.5"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Duration (Years)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-gray-400">Total Invested</span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
            ₹ {formatCurrency(results.invested)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Estimated Returns
          </span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            ₹ {formatCurrency(results.gains)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
          <span className="text-xs font-semibold text-red-500">Step-Up Maturity Value</span>
          <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">
            ₹ {formatCurrency(results.totalValue)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SipWithInflationScreen = ({ isDark }) => {
  const [monthlySip, setMonthlySip] = useState(10000);
  const [returns, setReturns] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [years, setYears] = useState(15);

  const results = useMemo(() => {
    const P = Number(monthlySip) || 0;
    const r = (Number(returns) || 0) / 12 / 100;
    const inf = (Number(inflation) || 0) / 100;
    const n = (Number(years) || 1) * 12;

    const nominalFuture = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    // Inflation discount factor
    const realFuture = nominalFuture / Math.pow(1 + inf, years);

    return {
      nominal: Math.round(nominalFuture),
      real: Math.round(realFuture),
      invested: P * n,
    };
  }, [monthlySip, returns, inflation, years]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Monthly SIP (₹)
          </label>
          <input
            type="number"
            value={monthlySip}
            onChange={(e) => setMonthlySip(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Expected Returns (%)
          </label>
          <input
            type="number"
            step="0.5"
            value={returns}
            onChange={(e) => setReturns(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Expected Inflation (%)
          </label>
          <input
            type="number"
            step="0.5"
            value={inflation}
            onChange={(e) => setInflation(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Time (Years)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-gray-400">Nominal Future Wealth</span>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            ₹ {formatCurrency(results.nominal)}
          </div>
          <span className="text-[11px] text-gray-400">Face value in {years} years</span>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Real Purchasing Power (Inflation-Adjusted)
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹ {formatCurrency(results.real)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Real wealth in terms of today&apos;s purchasing power
          </span>
        </div>
      </div>
    </div>
  );
};
