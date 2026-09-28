"use client";

import React, { useState, useMemo } from "react";
import { HiArrowPath, HiMiniArrowTrendingUp, HiDocumentText } from "react-icons/hi2";

// Helper currency formatter (INR / Standard)
export const formatCurrency = (val) => {
  if (isNaN(val) || val === null || val === undefined) return "0";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(val));
};

export const EmiCalculatorScreen = ({ isDark, primaryColor }) => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(5);
  const [tenureType, setTenureType] = useState("years"); // "years" | "months"

  const months = tenureType === "years" ? tenureYears * 12 : tenureYears;

  const results = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const r = (Number(interestRate) || 0) / 12 / 100;
    const n = Number(months) || 1;

    if (P <= 0 || r <= 0 || n <= 0) {
      return { emi: 0, totalInterest: 0, totalAmount: 0, interestRatio: 0, principalRatio: 100 };
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - P;
    const principalRatio = Math.round((P / totalAmount) * 100);
    const interestRatio = 100 - principalRatio;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount),
      principalRatio,
      interestRatio,
    };
  }, [loanAmount, interestRate, months]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      {/* Input Controls */}
      <div
        className={`lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-5 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-slate-700/60">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
            Loan Parameters
          </h3>
          <button
            onClick={() => {
              setLoanAmount(1000000);
              setInterestRate(8.5);
              setTenureYears(5);
              setTenureType("years");
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            <HiArrowPath className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Loan Amount */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
              Loan Amount
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className={`w-36 sm:w-44 pl-6 pr-3 py-1.5 text-right text-xs sm:text-sm font-bold rounded-xl border focus:outline-none ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
          </div>
          <input
            type="range"
            min="10000"
            max="10000000"
            step="10000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>₹10 K</span>
            <span>₹50 L</span>
            <span>₹1 Cr</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
              Interest Rate (p.a.)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className={`w-24 sm:w-28 pr-6 pl-3 py-1.5 text-right text-xs sm:text-sm font-bold rounded-xl border focus:outline-none ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                %
              </span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>1%</span>
            <span>15%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Loan Tenure */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
              Loan Tenure
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className={`w-20 sm:w-24 px-3 py-1.5 text-right text-xs sm:text-sm font-bold rounded-xl border focus:outline-none ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
              <div className="flex rounded-xl p-0.5 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    if (tenureType === "months") {
                      setTenureYears(Math.max(1, Math.round(tenureYears / 12)));
                    }
                    setTenureType("years");
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    tenureType === "years"
                      ? "bg-red-500 text-white shadow-2xs"
                      : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  Yr
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tenureType === "years") {
                      setTenureYears(tenureYears * 12);
                    }
                    setTenureType("months");
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    tenureType === "months"
                      ? "bg-red-500 text-white shadow-2xs"
                      : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  Mo
                </button>
              </div>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max={tenureType === "years" ? 30 : 360}
            step="1"
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{tenureType === "years" ? "1 Yr" : "1 Mo"}</span>
            <span>{tenureType === "years" ? "15 Yrs" : "180 Mos"}</span>
            <span>{tenureType === "years" ? "30 Yrs" : "360 Mos"}</span>
          </div>
        </div>
      </div>

      {/* Results Breakdown */}
      <div
        className={`lg:col-span-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border flex flex-col justify-between space-y-4 ${
          isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
        }`}
      >
        <div>
          <div className="text-center pb-4 border-b border-gray-100 dark:border-slate-700/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Monthly Loan EMI
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-red-500 mt-1">
              ₹ {formatCurrency(results.emi)}
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="mt-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60">
              <span className="text-gray-500 dark:text-slate-400 font-medium">
                Principal Amount
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                ₹ {formatCurrency(loanAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60">
              <span className="text-gray-500 dark:text-slate-400 font-medium">
                Total Interest Payable
              </span>
              <span className="font-bold text-red-500">
                ₹ {formatCurrency(results.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
              <span className="text-gray-700 dark:text-slate-300 font-semibold">
                Total Payment (Principal + Interest)
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                ₹ {formatCurrency(results.totalAmount)}
              </span>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-gray-500">
              <span>Principal: {results.principalRatio}%</span>
              <span>Interest: {results.interestRatio}%</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-200 dark:bg-slate-700">
              <div
                style={{ width: `${results.principalRatio}%` }}
                className="bg-slate-700 dark:bg-slate-300 transition-all duration-300"
              />
              <div
                style={{ width: `${results.interestRatio}%` }}
                className="bg-red-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 text-center">
          * Calculated with monthly reducing balance method
        </div>
      </div>
    </div>
  );
};

export const QuickCalculatorScreen = ({ isDark }) => {
  const [loanType, setLoanType] = useState("home");
  const [amount, setAmount] = useState(2500000);
  const [rate, setRate] = useState(8.75);
  const [years, setYears] = useState(20);

  const presets = [
    { id: "home", label: "Home Loan", rate: 8.5, tenure: 20, defAmount: 3500000 },
    { id: "car", label: "Car Loan", rate: 9.2, tenure: 5, defAmount: 800000 },
    { id: "personal", label: "Personal", rate: 12.5, tenure: 3, defAmount: 300000 },
    { id: "education", label: "Education", rate: 10.0, tenure: 7, defAmount: 1200000 },
  ];

  const handleSelectPreset = (p) => {
    setLoanType(p.id);
    setRate(p.rate);
    setYears(p.tenure);
    setAmount(p.defAmount);
  };

  const emi = useMemo(() => {
    const P = Number(amount) || 0;
    const r = (Number(rate) || 0) / 12 / 100;
    const n = (Number(years) || 1) * 12;
    if (P <= 0 || r <= 0 || n <= 0) return 0;
    return Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }, [amount, rate, years]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-6 ${
        isDark ? "bg-slate-800/80 border-slate-700/70" : "bg-white border-gray-200/80 shadow-xs"
      }`}
    >
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPreset(p)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              loanType === p.id
                ? "bg-red-500 text-white shadow-2xs"
                : isDark
                ? "bg-slate-900 text-slate-300 hover:bg-slate-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
            Amount (₹)
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
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
            Interest Rate (%)
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
          <label className="text-xs font-semibold text-gray-600 dark:text-slate-300">
            Tenure (Years)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-center">
        <span className="text-xs font-bold text-red-600 dark:text-red-400">
          Estimated Quick Monthly EMI
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
          ₹ {formatCurrency(emi)} / month
        </div>
      </div>
    </div>
  );
};

export const EmiInAdvanceScreen = ({ isDark }) => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenureYears, setTenureYears] = useState(3);
  const [advanceEmis, setAdvanceEmis] = useState(1);

  const months = tenureYears * 12;

  const result = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const r = (Number(interestRate) || 0) / 12 / 100;
    const n = Number(months) || 1;
    const adv = Number(advanceEmis) || 0;

    if (P <= 0 || r <= 0 || n <= 0) return { regularEmi: 0, advanceEmi: 0, upfrontPayment: 0 };

    const regularEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    // EMI in advance (Annuity Due formula)
    const advanceEmi = regularEmi / (1 + r);
    const upfrontPayment = advanceEmi * adv;

    return {
      regularEmi: Math.round(regularEmi),
      advanceEmi: Math.round(advanceEmi),
      upfrontPayment: Math.round(upfrontPayment),
      savings: Math.round((regularEmi - advanceEmi) * n),
    };
  }, [loanAmount, interestRate, months, advanceEmis]);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-5 ${
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
            className={`w-full mt-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
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
            className={`w-full mt-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
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
            className={`w-full mt-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            Advance EMIs Paid
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={advanceEmis}
            onChange={(e) => setAdvanceEmis(Number(e.target.value))}
            className={`w-full mt-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-gray-400">Regular Arrears EMI</span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
            ₹ {formatCurrency(result.regularEmi)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
          <span className="text-[11px] font-semibold text-red-500">Advance (Annuity Due) EMI</span>
          <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">
            ₹ {formatCurrency(result.advanceEmi)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Upfront Payment ({advanceEmis} EMI)
          </span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            ₹ {formatCurrency(result.upfrontPayment)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CompareLoansScreen = ({ isDark }) => {
  const [loanA, setLoanA] = useState({ amount: 1000000, rate: 8.5, years: 10 });
  const [loanB, setLoanB] = useState({ amount: 1000000, rate: 9.2, years: 10 });

  const calcEmi = (P, rPercent, y) => {
    const r = (rPercent || 0) / 12 / 100;
    const n = (y || 1) * 12;
    if (P <= 0 || r <= 0 || n <= 0) return { emi: 0, totalInterest: 0, total: 0 };
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    return {
      emi: Math.round(emi),
      totalInterest: Math.round(total - P),
      total: Math.round(total),
    };
  };

  const resA = calcEmi(loanA.amount, loanA.rate, loanA.years);
  const resB = calcEmi(loanB.amount, loanB.rate, loanB.years);

  const emiDiff = Math.abs(resA.emi - resB.emi);
  const interestDiff = Math.abs(resA.totalInterest - resB.totalInterest);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Loan A */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
            isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-200 shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-700">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Option A</h4>
            <span className="text-xs font-bold text-red-500">Loan 1</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                Amount (₹)
              </label>
              <input
                type="number"
                value={loanA.amount}
                onChange={(e) => setLoanA({ ...loanA, amount: Number(e.target.value) })}
                className={`w-full mt-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={loanA.rate}
                onChange={(e) => setLoanA({ ...loanA, rate: Number(e.target.value) })}
                className={`w-full mt-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                Tenure (Years)
              </label>
              <input
                type="number"
                value={loanA.years}
                onChange={(e) => setLoanA({ ...loanA, years: Number(e.target.value) })}
                className={`w-full mt-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-slate-700 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Monthly EMI:</span>
              <span className="font-bold text-gray-900 dark:text-white">₹ {formatCurrency(resA.emi)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total Interest:</span>
              <span className="font-bold text-red-500">₹ {formatCurrency(resA.totalInterest)}</span>
            </div>
          </div>
        </div>

        {/* Loan B */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
            isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-200 shadow-xs"
          }`}
        >
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-700">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Option B</h4>
            <span className="text-xs font-bold text-blue-500">Loan 2</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                Amount (₹)
              </label>
              <input
                type="number"
                value={loanB.amount}
                onChange={(e) => setLoanB({ ...loanB, amount: Number(e.target.value) })}
                className={`w-full mt-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={loanB.rate}
                onChange={(e) => setLoanB({ ...loanB, rate: Number(e.target.value) })}
                className={`w-full mt-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                Tenure (Years)
              </label>
              <input
                type="number"
                value={loanB.years}
                onChange={(e) => setLoanB({ ...loanB, years: Number(e.target.value) })}
                className={`w-full mt-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-slate-700 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Monthly EMI:</span>
              <span className="font-bold text-gray-900 dark:text-white">₹ {formatCurrency(resB.emi)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total Interest:</span>
              <span className="font-bold text-blue-500">₹ {formatCurrency(resB.totalInterest)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Difference Highlights */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Comparison Summary
          </span>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
            {resA.totalInterest < resB.totalInterest
              ? "Option A saves you interest over the loan life"
              : "Option B saves you interest over the loan life"}
          </p>
        </div>
        <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-4 text-xs font-bold w-full sm:w-auto justify-center">
          <div className="w-full sm:w-auto bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-2xs">
            EMI Diff: ₹ {formatCurrency(emiDiff)}/mo
          </div>
          <div className="w-full sm:w-auto bg-emerald-600 text-white px-3 py-1.5 rounded-xl shadow-2xs">
            Total Savings: ₹ {formatCurrency(interestDiff)}
          </div>
        </div>
      </div>
    </div>
  );
};
