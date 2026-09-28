"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency } from "./EmiScreens";
import { HiArrowPath } from "react-icons/hi2";

export const FdCalculatorScreen = ({ isDark }) => {
  const [deposit, setDeposit] = useState(100000);
  const [interestRate, setInterestRate] = useState(7.0);
  const [tenureYears, setTenureYears] = useState(5);
  const [compounding, setCompounding] = useState(4); // 4 = quarterly

  const results = useMemo(() => {
    const P = Number(deposit) || 0;
    const r = (Number(interestRate) || 0) / 100;
    const t = Number(tenureYears) || 1;
    const n = Number(compounding) || 4;

    const maturity = P * Math.pow(1 + r / n, n * t);
    const totalInterest = maturity - P;

    return {
      maturity: Math.round(maturity),
      totalInterest: Math.round(totalInterest),
      invested: P,
    };
  }, [deposit, interestRate, tenureYears, compounding]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      <div
        className={`lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b pb-2.5 border-gray-100 dark:border-slate-700">
          Fixed Deposit Parameters
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Total Investment (₹)
          </label>
          <input
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Rate of Interest (p.a. %)
          </label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
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
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Compounding Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 12, label: "Monthly" },
              { id: 4, label: "Quarterly" },
              { id: 1, label: "Yearly" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCompounding(c.id)}
                className={`py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  compounding === c.id
                    ? "bg-red-500 text-white border-red-500 shadow-2xs"
                    : isDark
                    ? "bg-slate-900 border-slate-700 text-slate-300"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                {c.label}
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
            Total Maturity Value
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500 mt-1">
            ₹ {formatCurrency(results.maturity)}
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
            <span className="text-gray-500">Estimated Interest</span>
            <span className="font-bold text-red-500">
              ₹ {formatCurrency(results.totalInterest)}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center">
          * Compound interest applied {compounding === 4 ? "Quarterly" : compounding === 12 ? "Monthly" : "Annually"}
        </div>
      </div>
    </div>
  );
};

export const RdCalculatorScreen = ({ isDark }) => {
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
  const [interestRate, setInterestRate] = useState(6.8);
  const [tenureYears, setTenureYears] = useState(3);

  const results = useMemo(() => {
    const P = Number(monthlyDeposit) || 0;
    const r = (Number(interestRate) || 0) / 100;
    const months = (Number(tenureYears) || 1) * 12;

    // Standard Indian bank quarterly compounding formula for RD
    const quarterlyRate = r / 4;
    let maturity = 0;
    for (let i = 1; i <= months; i++) {
      const remainingQuarters = (months - i + 1) / 3;
      maturity += P * Math.pow(1 + quarterlyRate, remainingQuarters);
    }

    const totalInvested = P * months;
    const interest = maturity - totalInvested;

    return {
      invested: totalInvested,
      maturity: Math.round(maturity),
      interest: Math.round(interest),
    };
  }, [monthlyDeposit, interestRate, tenureYears]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      <div
        className={`lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b pb-2.5 border-gray-100 dark:border-slate-700">
          Recurring Deposit Parameters
        </h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Monthly Deposit (₹)
          </label>
          <input
            type="number"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Interest Rate (p.a. %)
          </label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Tenure (Years)
          </label>
          <input
            type="number"
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
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
            Total RD Maturity Amount
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500 mt-1">
            ₹ {formatCurrency(results.maturity)}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60">
            <span className="text-gray-500">Total Invested</span>
            <span className="font-bold text-gray-900 dark:text-white">
              ₹ {formatCurrency(results.invested)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60">
            <span className="text-gray-500">Total Interest Earned</span>
            <span className="font-bold text-red-500">
              ₹ {formatCurrency(results.interest)}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-gray-400 text-center">
          * Compounded quarterly as per banking guidelines
        </div>
      </div>
    </div>
  );
};

export const PpfCalculatorScreen = ({ isDark }) => {
  const [yearlyDeposit, setYearlyDeposit] = useState(150000);
  const [rate, setRate] = useState(7.1);
  const [years, setYears] = useState(15);

  const results = useMemo(() => {
    const P = Math.min(150000, Number(yearlyDeposit) || 0);
    const r = (Number(rate) || 7.1) / 100;
    const n = Math.max(15, Number(years) || 15);

    let total = 0;
    for (let i = 0; i < n; i++) {
      total = (total + P) * (1 + r);
    }
    const invested = P * n;
    return {
      invested,
      maturity: Math.round(total),
      interest: Math.round(total - invested),
    };
  }, [yearlyDeposit, rate, years]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      <div
        className={`lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <div className="flex justify-between items-center border-b pb-2.5 border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            PPF Parameters (Max ₹1.5L/yr)
          </h3>
          <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
            Tax Free EEE
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Yearly Investment (₹)
          </label>
          <input
            type="number"
            max="150000"
            value={yearlyDeposit}
            onChange={(e) => setYearlyDeposit(Math.min(150000, Number(e.target.value)))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Interest Rate (%) [Current Govt Rate: 7.1%]
          </label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Tenure (Min 15 Years)
          </label>
          <input
            type="number"
            min="15"
            max="30"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
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
            Maturity Value ({years} Yrs)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500 mt-1">
            ₹ {formatCurrency(results.maturity)}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60">
            <span className="text-gray-500">Total Invested</span>
            <span className="font-bold text-gray-900 dark:text-white">
              ₹ {formatCurrency(results.invested)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60">
            <span className="text-gray-500">Tax-Free Interest</span>
            <span className="font-bold text-red-500">
              ₹ {formatCurrency(results.interest)}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center">
          * Returns are 100% exempt from income tax under Sec 80C
        </div>
      </div>
    </div>
  );
};

export const InterestCalculatorScreen = ({ isDark }) => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8.5);
  const [time, setTime] = useState(5);

  const si = (principal * rate * time) / 100;
  const ci = principal * Math.pow(1 + rate / 100, time) - principal;

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Principal (₹)
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Rate (% p.a.)
          </label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
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
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold text-gray-500">Simple Interest (SI)</span>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            ₹ {formatCurrency(si)}
          </div>
          <div className="text-xs text-gray-400">
            Total Amount: ₹ {formatCurrency(principal + si)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 space-y-2">
          <span className="text-xs font-bold text-red-500">Compound Interest (CI - Annual)</span>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">
            ₹ {formatCurrency(ci)}
          </div>
          <div className="text-xs text-red-400">
            Total Amount: ₹ {formatCurrency(principal + ci)} (Extra ₹ {formatCurrency(ci - si)})
          </div>
        </div>
      </div>
    </div>
  );
};

export const InflationImpactScreen = ({ isDark }) => {
  const [currentExpense, setCurrentExpense] = useState(50000);
  const [inflationRate, setInflationRate] = useState(6.0);
  const [years, setYears] = useState(15);

  const futureValue = useMemo(() => {
    const P = Number(currentExpense) || 0;
    const r = (Number(inflationRate) || 0) / 100;
    const t = Number(years) || 1;
    return Math.round(P * Math.pow(1 + r, t));
  }, [currentExpense, inflationRate, years]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Current Expense / Amount (₹)
          </label>
          <input
            type="number"
            value={currentExpense}
            onChange={(e) => setCurrentExpense(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Inflation Rate (% p.a.)
          </label>
          <input
            type="number"
            step="0.1"
            value={inflationRate}
            onChange={(e) => setInflationRate(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Time Horizon (Years)
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

      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-center space-y-1">
        <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
          Required Purchasing Power in {years} Years
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-300">
          ₹ {formatCurrency(futureValue)}
        </div>
        <p className="text-xs text-amber-700 dark:text-amber-400 pt-1">
          What costs ₹{formatCurrency(currentExpense)} today will require ₹{formatCurrency(futureValue)} after {years} years at {inflationRate}% inflation.
        </p>
      </div>
    </div>
  );
};
