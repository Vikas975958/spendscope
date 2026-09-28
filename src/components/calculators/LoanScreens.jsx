"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency } from "./EmiScreens";

export const LoanProfileScreen = ({ isDark }) => {
  const [loanName, setLoanName] = useState("Home Loan");
  const [principal, setPrincipal] = useState(2500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(15);
  const [processingFee, setProcessingFee] = useState(10000);

  const stats = useMemo(() => {
    const P = Number(principal) || 0;
    const r = (Number(interestRate) || 0) / 12 / 100;
    const n = (Number(tenureYears) || 1) * 12;
    const fee = Number(processingFee) || 0;

    if (P <= 0 || r <= 0 || n <= 0) return { emi: 0, totalInterest: 0, totalCost: 0 };

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - P;
    const totalCost = totalPayable + fee;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
      totalCost: Math.round(totalCost),
      months: n,
    };
  }, [principal, interestRate, tenureYears, processingFee]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Loan Label
          </label>
          <input
            type="text"
            value={loanName}
            onChange={(e) => setLoanName(e.target.value)}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Principal Amount (₹)
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
            Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
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
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
          <span className="text-xs font-bold text-red-500">Monthly EMI</span>
          <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
            ₹ {formatCurrency(stats.emi)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-bold text-gray-400">Total Interest</span>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            ₹ {formatCurrency(stats.totalInterest)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-bold text-gray-400">Total Repayment</span>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            ₹ {formatCurrency(stats.totalPayable)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-bold text-gray-400">Total Loan Cost (+Fees)</span>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            ₹ {formatCurrency(stats.totalCost)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrePaymentRoiChangeScreen = ({ isDark }) => {
  const [principal, setPrincipal] = useState(2000000);
  const [interestRate, setInterestRate] = useState(9.0);
  const [tenureYears, setTenureYears] = useState(15);
  const [extraPrepayment, setExtraPrepayment] = useState(200000); // lump sum prepayment

  const comparison = useMemo(() => {
    const P = Number(principal) || 0;
    const r = (Number(interestRate) || 0) / 12 / 100;
    const n = (Number(tenureYears) || 1) * 12;
    const prepay = Number(extraPrepayment) || 0;

    if (P <= 0 || r <= 0 || n <= 0) return { originalInterest: 0, newInterest: 0, savings: 0, monthsSaved: 0 };

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const origTotalInterest = emi * n - P;

    // After prepayment
    const newPrincipal = Math.max(0, P - prepay);
    // Calculate new tenure with same EMI: n_new = -ln(1 - r*P_new/EMI) / ln(1+r)
    let newMonths = n;
    let newInterest = origTotalInterest;

    if (newPrincipal > 0 && 1 - (r * newPrincipal) / emi > 0) {
      newMonths = Math.ceil(-Math.log(1 - (r * newPrincipal) / emi) / Math.log(1 + r));
      newInterest = emi * newMonths - newPrincipal;
    } else {
      newMonths = 0;
      newInterest = 0;
    }

    const savings = Math.max(0, origTotalInterest - newInterest);
    const monthsSaved = Math.max(0, n - newMonths);

    return {
      emi: Math.round(emi),
      originalInterest: Math.round(origTotalInterest),
      newInterest: Math.round(newInterest),
      savings: Math.round(savings),
      monthsSaved,
      yearsSaved: (monthsSaved / 12).toFixed(1),
    };
  }, [principal, interestRate, tenureYears, extraPrepayment]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Outstanding Loan (₹)
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
            Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Remaining Tenure (Yrs)
          </label>
          <input
            type="number"
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Lump-Sum Prepayment (₹)
          </label>
          <input
            type="number"
            value={extraPrepayment}
            onChange={(e) => setExtraPrepayment(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            Total Interest Saved
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-300 mt-1">
            ₹ {formatCurrency(comparison.savings)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
            Tenure Reduced By
          </span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-300 mt-1">
            {comparison.monthsSaved} Months ({comparison.yearsSaved} Years)
          </div>
        </div>
      </div>
    </div>
  );
};

export const MoratoriumCalculatorScreen = ({ isDark }) => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(9.0);
  const [tenureYears, setTenureYears] = useState(5);
  const [moratoriumMonths, setMoratoriumMonths] = useState(6);

  const results = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const r = (Number(interestRate) || 0) / 12 / 100;
    const n = (Number(tenureYears) || 1) * 12;
    const m = Number(moratoriumMonths) || 0;

    // Normal loan
    const normalEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const normalTotal = normalEmi * n;

    // Moratorium: Interest accumulated during holiday
    const newPrincipal = P * Math.pow(1 + r, m);
    const addedInterest = newPrincipal - P;
    const newEmi = (newPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const newTotal = newEmi * n;
    const extraCost = newTotal - normalTotal;

    return {
      normalEmi: Math.round(normalEmi),
      newEmi: Math.round(newEmi),
      addedInterest: Math.round(addedInterest),
      extraCost: Math.round(extraCost),
    };
  }, [loanAmount, interestRate, tenureYears, moratoriumMonths]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Loan Amount (₹)
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
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
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Moratorium (Months)
          </label>
          <input
            type="number"
            value={moratoriumMonths}
            onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-gray-400">Regular EMI (No Holiday)</span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
            ₹ {formatCurrency(results.normalEmi)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
          <span className="text-xs font-semibold text-red-500">New EMI After Moratorium</span>
          <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">
            ₹ {formatCurrency(results.newEmi)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            Extra Total Cost
          </span>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            ₹ {formatCurrency(results.extraCost)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const LoanEligibleCalculatorScreen = ({ isDark }) => {
  const [monthlyIncome, setMonthlyIncome] = useState(80000);
  const [existingEmi, setExistingEmi] = useState(15000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [foir, setFoir] = useState(50); // Fixed Obligation to Income Ratio %

  const results = useMemo(() => {
    const income = Number(monthlyIncome) || 0;
    const existing = Number(existingEmi) || 0;
    const r = (Number(interestRate) || 0) / 12 / 100;
    const n = (Number(tenureYears) || 1) * 12;
    const foirRatio = (Number(foir) || 50) / 100;

    const maxEmiCapacity = Math.max(0, income * foirRatio - existing);

    if (maxEmiCapacity <= 0 || r <= 0 || n <= 0) {
      return { maxEmi: 0, maxLoan: 0 };
    }

    const maxLoan = (maxEmiCapacity * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));

    return {
      maxEmi: Math.round(maxEmiCapacity),
      maxLoan: Math.round(maxLoan),
    };
  }, [monthlyIncome, existingEmi, interestRate, tenureYears, foir]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Net Monthly Income (₹)
          </label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Existing EMIs (₹)
          </label>
          <input
            type="number"
            value={existingEmi}
            onChange={(e) => setExistingEmi(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
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
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className={`w-full mt-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
            Maximum Loan Eligibility
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-300 mt-1">
            ₹ {formatCurrency(results.maxLoan)}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-center">
          <span className="text-xs font-bold text-red-600 dark:text-red-400">
            Maximum Eligible Monthly EMI
          </span>
          <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
            ₹ {formatCurrency(results.maxEmi)} / mo
          </div>
        </div>
      </div>
    </div>
  );
};
