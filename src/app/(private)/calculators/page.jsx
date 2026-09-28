"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import {
  HiMagnifyingGlass,
  HiXMark,
  HiBuildingLibrary,
  HiArrowTrendingUp,
  HiReceiptPercent,
  HiCurrencyDollar,
  HiSquares2X2,
  HiCalculator,
  HiChevronRight,
  HiSparkles,
} from "react-icons/hi2";

// Import Calculator Screen Components
import {
  EmiCalculatorScreen,
  QuickCalculatorScreen,
  EmiInAdvanceScreen,
  CompareLoansScreen,
} from "@/components/calculators/EmiScreens";

import {
  FdCalculatorScreen,
  RdCalculatorScreen,
  PpfCalculatorScreen,
  InterestCalculatorScreen,
  InflationImpactScreen,
} from "@/components/calculators/BankingScreens";

import {
  SipCalculatorScreen,
  SwpCalculatorScreen,
  StpCalculatorScreen,
  StepUpSipScreen,
  SipWithInflationScreen,
} from "@/components/calculators/SipScreens";

import {
  GstCalculatorScreen,
  VatCalculatorScreen,
} from "@/components/calculators/GstVatScreens";

import {
  LoanProfileScreen,
  PrePaymentRoiChangeScreen,
  MoratoriumCalculatorScreen,
  LoanEligibleCalculatorScreen,
} from "@/components/calculators/LoanScreens";

import {
  CashNoteCounterScreen,
  AmountToWordScreen,
  DiscountCalculatorScreen,
  CurrencyConverterScreen,
} from "@/components/calculators/OtherScreens";

// Structured calculators data grouped by category
export const CALCULATOR_CATEGORIES = [
  {
    id: "emi",
    category: "EMI",
    icon: HiCalculator,
    description: "Loan installment & payment schedule calculators",
    items: [
      {
        id: "emi-calculator",
        title: "EMI Calculator",
        description: "Calculate Equated Monthly Installment for home, car or personal loans",
      },
      {
        id: "quick-calculator",
        title: "Quick Calculator",
        description: "Instant monthly installment calculation with loan presets",
      },
      {
        id: "emi-in-advance",
        title: "EMI in Advance",
        description: "Calculate EMI with upfront initial down payments (Annuity Due)",
      },
      {
        id: "compare-loans",
        title: "Compare Loans",
        description: "Side-by-side comparison between two loan options",
      },
    ],
  },
  {
    id: "banking",
    category: "Banking",
    icon: HiBuildingLibrary,
    description: "Deposit, savings and interest calculation tools",
    items: [
      {
        id: "fd-calculator",
        title: "FD Calculator",
        description: "Fixed Deposit maturity value and quarterly compounding interest",
      },
      {
        id: "rd-calculator",
        title: "RD Calculator",
        description: "Recurring Deposit returns and interest earned over time",
      },
      {
        id: "ppf-calculator",
        title: "PPF Calculator",
        description: "Public Provident Fund growth and tax-free wealth benefits",
      },
      {
        id: "interest-calculator",
        title: "Interest Calculator",
        description: "Simple and compound interest comparison calculations",
      },
      {
        id: "inflation-impact",
        title: "Inflation Impact",
        description: "Future value of money adjusted for purchasing power inflation",
      },
    ],
  },
  {
    id: "sip",
    category: "SIP",
    icon: HiArrowTrendingUp,
    description: "Mutual fund, systematic investment & wealth planners",
    items: [
      {
        id: "sip-calculator",
        title: "SIP Calculator",
        description: "Systematic Investment Plan compound wealth growth calculator",
      },
      {
        id: "swp-calculator",
        title: "SWP Calculator",
        description: "Systematic Withdrawal Plan monthly cash flow & balance tracker",
      },
      {
        id: "stp-calculator",
        title: "STP Calculator",
        description: "Systematic Transfer Plan balance growth between funds",
      },
      {
        id: "step-up-sip",
        title: "Step-Up SIP",
        description: "SIP with yearly increment in investment for higher wealth",
      },
      {
        id: "sip-with-inflation",
        title: "SIP With Inflation",
        description: "SIP returns adjusted for cost-of-living real purchasing power",
      },
    ],
  },
  {
    id: "gst-vat",
    category: "GST & VAT",
    icon: HiReceiptPercent,
    description: "Goods and services tax & value added tax tools",
    items: [
      {
        id: "gst-calculator",
        title: "GST Calculator",
        description: "Calculate inclusive and exclusive GST rates with CGST/SGST split",
      },
      {
        id: "vat-calculator",
        title: "VAT Calculator",
        description: "Value Added Tax calculation for goods and commercial invoices",
      },
    ],
  },
  {
    id: "loan",
    category: "Loan",
    icon: HiCurrencyDollar,
    description: "Advanced loan profile, pre-payment & eligibility planners",
    items: [
      {
        id: "loan-profile",
        title: "Loan Profile",
        description: "Detailed overview, fee schedule and breakdown of your loan",
      },
      {
        id: "pre-payment-roi-change",
        title: "Pre Payment/ ROI Change",
        description: "Calculate tenure reduction and interest saved through prepayments",
      },
      {
        id: "moratorium-calculator",
        title: "Moratorium Calculator",
        description: "Impact of repayment holiday on loan tenure and capitalized interest",
      },
      {
        id: "loan-eligible-calculator",
        title: "Loan Eligible Calculator",
        description: "Check maximum borrowing capacity based on income and FOIR",
      },
    ],
  },
  {
    id: "other",
    category: "Other",
    icon: HiSquares2X2,
    description: "Cash denomination counter, currency & utility tools",
    items: [
      {
        id: "cash-note-counter",
        title: "Cash Note Counter",
        description: "Count denomination currency notes and calculate cash total in words",
      },
      {
        id: "amount-to-word",
        title: "Amount To Word",
        description: "Convert numbers into Indian & International words for cheques",
      },
      {
        id: "discount-calculator",
        title: "Discount Calculator",
        description: "Calculate final discounted price, savings and effective tax",
      },
      {
        id: "currency-converter",
        title: "Currency Converter",
        description: "Convert exchange rates between global currencies",
      },
    ],
  },
];

// Flattened list for search
export const ALL_CALCULATORS = CALCULATOR_CATEGORIES.flatMap((cat) =>
  cat.items.map((item) => ({
    ...item,
    categoryId: cat.id,
    categoryName: cat.category,
  }))
);

function CalculatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeCategoryId, setActiveCategoryId] = useState("emi");
  const [activeCalculatorId, setActiveCalculatorId] = useState("emi-calculator");
  const [searchQuery, setSearchQuery] = useState("");

  // Theme support
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;
  const primaryColor = currentTheme?.colors?.primary || themeState?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  // URL query sync
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const categoryParam = searchParams.get("category");

    if (typeParam) {
      const found = ALL_CALCULATORS.find((c) => c.id === typeParam);
      if (found) {
        setActiveCategoryId(found.categoryId);
        setActiveCalculatorId(found.id);
        return;
      }
    }

    if (categoryParam) {
      const cat = CALCULATOR_CATEGORIES.find((c) => c.id === categoryParam);
      if (cat) {
        setActiveCategoryId(cat.id);
        setActiveCalculatorId(cat.items[0]?.id || "");
      }
    }
  }, [searchParams]);

  const activeCategory = useMemo(() => {
    return (
      CALCULATOR_CATEGORIES.find((c) => c.id === activeCategoryId) ||
      CALCULATOR_CATEGORIES[0]
    );
  }, [activeCategoryId]);

  const activeCalculator = useMemo(() => {
    return (
      activeCategory.items.find((item) => item.id === activeCalculatorId) ||
      activeCategory.items[0]
    );
  }, [activeCategory, activeCalculatorId]);

  // Handle Category click
  const handleCategorySelect = (categoryId) => {
    setActiveCategoryId(categoryId);
    const cat = CALCULATOR_CATEGORIES.find((c) => c.id === categoryId);
    if (cat && cat.items.length > 0) {
      setActiveCalculatorId(cat.items[0].id);
    }
    setSearchQuery("");
  };

  // Filtered search results when user searches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALL_CALCULATORS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.categoryName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSearchResultClick = (calc) => {
    setActiveCategoryId(calc.categoryId);
    setActiveCalculatorId(calc.id);
    setSearchQuery("");
  };

  // Render the respective calculator screen
  const renderCalculatorScreen = () => {
    switch (activeCalculatorId) {
      // EMI Category
      case "emi-calculator":
        return <EmiCalculatorScreen isDark={isDark} primaryColor={primaryColor} />;
      case "quick-calculator":
        return <QuickCalculatorScreen isDark={isDark} />;
      case "emi-in-advance":
        return <EmiInAdvanceScreen isDark={isDark} />;
      case "compare-loans":
        return <CompareLoansScreen isDark={isDark} />;

      // Banking Category
      case "fd-calculator":
        return <FdCalculatorScreen isDark={isDark} />;
      case "rd-calculator":
        return <RdCalculatorScreen isDark={isDark} />;
      case "ppf-calculator":
        return <PpfCalculatorScreen isDark={isDark} />;
      case "interest-calculator":
        return <InterestCalculatorScreen isDark={isDark} />;
      case "inflation-impact":
        return <InflationImpactScreen isDark={isDark} />;

      // SIP Category
      case "sip-calculator":
        return <SipCalculatorScreen isDark={isDark} />;
      case "swp-calculator":
        return <SwpCalculatorScreen isDark={isDark} />;
      case "stp-calculator":
        return <StpCalculatorScreen isDark={isDark} />;
      case "step-up-sip":
        return <StepUpSipScreen isDark={isDark} />;
      case "sip-with-inflation":
        return <SipWithInflationScreen isDark={isDark} />;

      // GST & VAT Category
      case "gst-calculator":
        return <GstCalculatorScreen isDark={isDark} />;
      case "vat-calculator":
        return <VatCalculatorScreen isDark={isDark} />;

      // Loan Category
      case "loan-profile":
        return <LoanProfileScreen isDark={isDark} />;
      case "pre-payment-roi-change":
        return <PrePaymentRoiChangeScreen isDark={isDark} />;
      case "moratorium-calculator":
        return <MoratoriumCalculatorScreen isDark={isDark} />;
      case "loan-eligible-calculator":
        return <LoanEligibleCalculatorScreen isDark={isDark} />;

      // Other Category
      case "cash-note-counter":
        return <CashNoteCounterScreen isDark={isDark} />;
      case "amount-to-word":
        return <AmountToWordScreen isDark={isDark} />;
      case "discount-calculator":
        return <DiscountCalculatorScreen isDark={isDark} />;
      case "currency-converter":
        return <CurrencyConverterScreen isDark={isDark} />;

      default:
        return <EmiCalculatorScreen isDark={isDark} primaryColor={primaryColor} />;
    }
  };

  const CategoryIcon = activeCategory.icon;

  return (
    <div className="w-full space-y-4">
      {/* Top Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <span>Financial Calculators</span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {ALL_CALCULATORS.length} Tools
            </span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Select a category on the left, switch sub-category tabs, and calculate instantly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
            <HiMagnifyingGlass className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any calculator..."
            className={`w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none transition-all ${
              isDark
                ? "bg-slate-800/90 border-slate-700/80 text-white placeholder-slate-400 focus:border-red-400"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-400"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          )}

          {/* Quick Search Dropdown Results */}
          {searchQuery && (
            <div
              className={`absolute left-0 right-0 top-full mt-1.5 p-2 rounded-2xl border shadow-xl z-40 max-h-72 overflow-y-auto ${
                isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
              }`}
            >
              {searchResults.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400">
                  No calculators found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearchResultClick(item)}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                        isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-gray-400 line-clamp-1">
                          {item.description}
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white shrink-0 ml-2"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {item.categoryName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout: Left Menu Bar + Right Sub-Tabs & Screen Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Side Menu Bar */}
        <aside className="md:col-span-3 lg:col-span-3">
          <div
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
              isDark ? "bg-slate-900/90 border-slate-800/80" : "bg-white border-gray-200/80 shadow-xs"
            }`}
          >
            <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Categories
            </div>

            {/* Category Navigation Items */}
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 scrollbar-none">
              {CALCULATOR_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left shrink-0 cursor-pointer ${
                      isActive
                        ? "text-white shadow-xs"
                        : isDark
                        ? "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100/90 hover:text-gray-900"
                    }`}
                    style={isActive ? { backgroundColor: primaryColor } : {}}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? "bg-white/20 text-white"
                            : isDark
                            ? "bg-slate-800 text-slate-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{cat.category}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? "bg-white/25 text-white"
                            : isDark
                            ? "bg-slate-800 text-slate-400"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {cat.items.length}
                      </span>
                      <HiChevronRight
                        className={`w-3 h-3 hidden md:block transition-transform ${
                          isActive ? "text-white translate-x-0.5" : "text-gray-400 opacity-50"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Side: Sub-Category Tabs & Calculator Screen */}
        <main className="md:col-span-9 lg:col-span-9 space-y-4">
          {/* Sub-Category Tabs Navigation Bar */}
          <div
            className={`p-1.5 rounded-2xl border ${
              isDark ? "bg-slate-900/90 border-slate-800/80" : "bg-white border-gray-200/80 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {activeCategory.items.map((item) => {
                const isSelected = activeCalculatorId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveCalculatorId(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? "text-white shadow-2xs"
                        : isDark
                        ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    style={isSelected ? { backgroundColor: primaryColor } : {}}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Calculator Title & Description Badge */}
          <div
            className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-red-50/40 border-red-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl text-white shadow-xs shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <CategoryIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                    {activeCalculator.title}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                    {activeCategory.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {activeCalculator.description}
                </p>
              </div>
            </div>
          </div>

          {/* The Calculator Screen View */}
          <div className="transition-all duration-200">
            {renderCalculatorScreen()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500 dark:text-slate-400">
          Loading calculators...
        </div>
      }
    >
      <CalculatorContent />
    </Suspense>
  );
}
