"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "styled-components";
import { useSelector } from "react-redux";
import { theme as defaultTheme } from "@/utils/theme";
import {
  HiCalculator,
  HiArrowTrendingUp,
  HiBuildingLibrary,
  HiReceiptPercent,
  HiSquares2X2,
  HiArrowRight,
  HiSparkles,
  HiShieldCheck,
  HiBolt,
  HiChartBar,
} from "react-icons/hi2";
import {
  BsCalculatorFill,
  BsPiggyBankFill,
  BsFileCheckFill,
  BsCashStack,
  BsReceipt,
  BsArrowRepeat,
  BsBarChartLineFill,
  BsCurrencyExchange,
  BsSafe2Fill,
  BsGraphUpArrow,
  BsTranslate,
  BsCheckCircleFill,
} from "react-icons/bs";

export default function CalculatorsSection() {
  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : reduxTheme;
  const primary = currentTheme?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark";

  // Active Category Filter for Showcase Grid
  const [activeFilter, setActiveFilter] = useState("all");

  // Showcase Cards List
  const allCalculators = [
    {
      id: "sip-calculator",
      title: "SIP Calculator",
      category: "sip",
      categoryName: "Investments",
      badge: "High Growth",
      icon: <BsBarChartLineFill className="w-5 h-5" />,
      lightBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      darkBg: "dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
      desc: "Simulate systematic investments with monthly compounding & long-term wealth returns.",
      link: "/calculators-m/calculating?type=sip-calculator&category=sip",
      popular: true,
    },
    {
      id: "step-up-sip",
      title: "Step-Up SIP",
      category: "sip",
      categoryName: "Investments",
      badge: "Wealth Booster",
      icon: <BsGraphUpArrow className="w-5 h-5" />,
      lightBg: "bg-amber-50 text-amber-600 border-amber-200",
      darkBg: "dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
      desc: "Boost your SIP annually with salary increments to build exponential retirement corpus.",
      link: "/calculators-m/calculating?type=step-up-sip&category=sip",
      popular: true,
    },
    {
      id: "emi-calculator",
      title: "EMI Calculator",
      category: "emi",
      categoryName: "Loans",
      badge: "Essential",
      icon: <BsCalculatorFill className="w-5 h-5" />,
      lightBg: "bg-rose-50 text-rose-600 border-rose-200",
      darkBg: "dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50",
      desc: "Plan home, car & personal loan monthly EMIs with principal-interest amortization.",
      link: "/calculators-m/calculating?type=emi-calculator&category=emi",
      popular: true,
    },
    {
      id: "compare-loans",
      title: "Compare Loans",
      category: "emi",
      categoryName: "Loans",
      badge: "Smart Compare",
      icon: <BsFileCheckFill className="w-5 h-5" />,
      lightBg: "bg-red-50 text-red-600 border-red-200",
      darkBg: "dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50",
      desc: "Put two loan offers side-by-side to find the lowest interest outflow & optimal tenure.",
      link: "/calculators-m/calculating?type=compare-loans&category=emi",
      popular: false,
    },
    {
      id: "fd-calculator",
      title: "FD Calculator",
      category: "banking",
      categoryName: "Banking",
      badge: "Guaranteed",
      icon: <BsPiggyBankFill className="w-5 h-5" />,
      lightBg: "bg-pink-50 text-pink-600 border-pink-200",
      darkBg: "dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800/50",
      desc: "Compute quarterly compound interest & final maturity on Fixed Bank Deposits.",
      link: "/calculators-m/calculating?type=fd-calculator&category=banking",
      popular: true,
    },
    {
      id: "ppf-calculator",
      title: "PPF Calculator",
      category: "banking",
      categoryName: "Banking",
      badge: "Tax-Free EEE",
      icon: <BsSafe2Fill className="w-5 h-5" />,
      lightBg: "bg-blue-50 text-blue-600 border-blue-200",
      darkBg: "dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50",
      desc: "Calculate 15-year Public Provident Fund interest, extensions & guaranteed maturity.",
      link: "/calculators-m/calculating?type=ppf-calculator&category=banking",
      popular: false,
    },
    {
      id: "gst-calculator",
      title: "GST Calculator",
      category: "tax",
      categoryName: "Tax & Tools",
      badge: "Quick Math",
      icon: <BsReceipt className="w-5 h-5" />,
      lightBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
      darkBg: "dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50",
      desc: "Calculate inclusive and exclusive Goods & Services Tax (GST) for any tax slab instantly.",
      link: "/calculators-m/calculating?type=gst-calculator&category=gst-vat",
      popular: true,
    },
    {
      id: "currency-converter",
      title: "Currency Converter",
      category: "tax",
      categoryName: "Tax & Tools",
      badge: "Global FX",
      icon: <BsCurrencyExchange className="w-5 h-5" />,
      lightBg: "bg-amber-50 text-amber-600 border-amber-200",
      darkBg: "dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
      desc: "Real-time foreign exchange conversions between USD, INR, EUR, GBP and 30+ currencies.",
      link: "/calculators-m/calculating?type=currency-converter&category=other",
      popular: false,
    },
    {
      id: "amount-to-word",
      title: "Amount to Words",
      category: "tax",
      categoryName: "Tax & Tools",
      badge: "Cheque Ready",
      icon: <BsTranslate className="w-5 h-5" />,
      lightBg: "bg-sky-50 text-sky-600 border-sky-200",
      darkBg: "dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/50",
      desc: "Convert numbers into clean English or Hindi words for cheques, invoices, and vouchers.",
      link: "/calculators-m/calculating?type=amount-to-word&category=other",
      popular: false,
    },
    {
      id: "cash-note-counter",
      title: "Cash Note Counter",
      category: "tax",
      categoryName: "Tax & Tools",
      badge: "Daily Cash",
      icon: <BsCashStack className="w-5 h-5" />,
      lightBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      darkBg: "dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
      desc: "Tally daily currency denominations (₹500, ₹200, ₹100, etc.) with automatic total balance.",
      link: "/calculators-m/calculating?type=cash-note-counter&category=other",
      popular: false,
    },
    {
      id: "rd-calculator",
      title: "RD Calculator",
      category: "banking",
      categoryName: "Banking",
      badge: "Savings",
      icon: <BsArrowRepeat className="w-5 h-5" />,
      lightBg: "bg-purple-50 text-purple-600 border-purple-200",
      darkBg: "dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50",
      desc: "Calculate cumulative returns on recurring monthly deposits at fixed interest rates.",
      link: "/calculators-m/calculating?type=rd-calculator&category=banking",
      popular: false,
    },
    {
      id: "swp-calculator",
      title: "SWP Calculator",
      category: "sip",
      categoryName: "Investments",
      badge: "Pension Plan",
      icon: <BsCashStack className="w-5 h-5" />,
      lightBg: "bg-teal-50 text-teal-600 border-teal-200",
      darkBg: "dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/50",
      desc: "Plan regular monthly cash withdrawals from mutual fund investments post-retirement.",
      link: "/calculators-m/calculating?type=swp-calculator&category=sip",
      popular: false,
    },
  ];

  const filteredCalculators = useMemo(() => {
    if (activeFilter === "all") return allCalculators;
    if (activeFilter === "popular") return allCalculators.filter((c) => c.popular);
    return allCalculators.filter((c) => c.category === activeFilter);
  }, [activeFilter]);

  return (
    <section
      id="calculators"
      className={`relative py-12 md:py-16 transition-colors duration-200 overflow-hidden ${
        isDark ? "bg-[#0b0f19]" : "bg-gradient-to-b from-[#f8fafc] via-white to-[#fdf8f6]"
      }`}
    >
      {/* Decorative background glows */}
      <div
        className="absolute -top-24 right-[10%] w-[450px] h-[450px] rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{ background: `${primary}35` }}
      />
      <div
        className="absolute bottom-10 left-[5%] w-[350px] h-[350px] rounded-full opacity-15 pointer-events-none blur-3xl"
        style={{ background: `${primary}25` }}
      />

      <div className="w-full px-4 sm:px-8 md:px-[60px] lg:px-[80px] max-w-[1400px] mx-auto relative z-10">
        {/* ===== SECTION HEADER ===== */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
            style={{
              backgroundColor: isDark ? `${primary}18` : `${primary}10`,
              borderColor: `${primary}30`,
              color: primary,
            }}
          >
            <HiSparkles className="w-4 h-4 animate-pulse" />
            <span>Financial Planning Suite</span>
          </div>

          <h2
            className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4 ${
              isDark ? "text-white" : "text-[#1a1a2e]"
            }`}
          >
            Calculate, Project & Grow With{" "}
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(135deg, ${primary}, #ff7b54)`,
              }}
            >
              20+ Precision Calculators
            </span>
          </h2>

          <p
            className={`text-sm sm:text-base md:text-lg leading-relaxed ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Discover compounding power, estimate loan burdens, project savings growth, and optimize taxes with our free precision calculators.
          </p>

          {/* Quick Value Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <HiBolt className="w-4 h-4" />
              <span>Real-Time Math</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <HiChartBar className="w-4 h-4" />
              <span>Accurate Projections</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <HiShieldCheck className="w-4 h-4" />
              <span>100% Free & Private</span>
            </div>
          </div>
        </div>

        {/* ===== CALCULATORS SHOWCASE GRID & CATEGORY TABS ===== */}
        <div className="space-y-8">
          {/* Header & Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span
                className="text-xs font-bold uppercase tracking-wider block mb-1"
                style={{ color: primary }}
              >
                Explore The Complete Arsenal
              </span>
              <h3 className={`text-xl sm:text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
                Featured Financial Tools
              </h3>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Tools (20+)", icon: HiSquares2X2 },
                { id: "popular", label: "🔥 Top Picks", icon: HiSparkles },
                { id: "sip", label: "Investments", icon: HiArrowTrendingUp },
                { id: "emi", label: "Loans & EMI", icon: HiCalculator },
                { id: "banking", label: "Banking", icon: HiBuildingLibrary },
                { id: "tax", label: "Tax & Utilities", icon: HiReceiptPercent },
              ].map((filter) => {
                const isSelected = activeFilter === filter.id;
                const IconComponent = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                      isSelected
                        ? "shadow-sm"
                        : isDark
                        ? "border-slate-800 text-gray-400 hover:text-white hover:border-slate-700 bg-[#161a27]"
                        : "border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 bg-white"
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${primary}18`,
                            borderColor: primary,
                            color: primary,
                          }
                        : {}
                    }
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredCalculators.map((calc) => (
              <Link
                key={calc.id}
                href={calc.link}
                className={`group relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
                  isDark
                    ? "bg-[#131724] border-slate-800/90 hover:border-slate-700 shadow-black/30"
                    : "bg-white border-gray-100 hover:border-rose-200 shadow-sm"
                }`}
              >
                <div>
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-300 group-hover:scale-110 ${calc.lightBg} ${calc.darkBg}`}
                    >
                      {calc.icon}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        calc.badge === "High Growth" || calc.badge === "Wealth Booster"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : calc.badge === "Essential"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          : isDark
                          ? "bg-slate-800 text-gray-300 border-slate-700"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {calc.badge}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div className="mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider block mb-0.5"
                      style={{ color: primary }}
                    >
                      {calc.categoryName}
                    </span>
                    <h4
                      className={`text-base font-bold transition-colors group-hover:text-rose-500 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {calc.title}
                    </h4>
                  </div>

                  {/* Description */}
                  <p
                    className={`text-xs leading-relaxed line-clamp-2 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {calc.desc}
                  </p>
                </div>

                {/* Bottom Card Action */}
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400 dark:text-gray-500 text-[11px]">Free Calculator</span>
                  <span
                    className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    style={{ color: primary }}
                  >
                    <span>Launch</span>
                    <HiArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Highlight / Hub Invitation Banner */}
          <div
            className={`rounded-2xl p-6 sm:p-8 border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all ${
              isDark
                ? "bg-gradient-to-r from-[#171b29] to-[#1e1728] border-slate-800"
                : "bg-gradient-to-r from-rose-50/70 via-white to-orange-50/70 border-rose-100"
            }`}
          >
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: primary }}>
                <BsCheckCircleFill className="w-3.5 h-3.5" />
                <span>All 20+ Financial Calculators Available</span>
              </div>
              <h4 className={`text-lg sm:text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                Need SIP with Inflation, SWP, STP, VAT or Loan Profiling?
              </h4>
              <p className={`text-xs sm:text-sm max-w-xl ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                We have built comprehensive financial modeling tools for every phase of your personal and business wealth journey.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/calculators-m"
                className="px-6 py-3 rounded-full text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: primary }}
              >
                <span>Browse All Calculators</span>
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
