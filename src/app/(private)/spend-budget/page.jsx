"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { DatePicker, ConfigProvider, theme as antdTheme } from "antd";
import dayjs from "dayjs";
import useSpendBudget from "@/hooks/useSpendBudget";
import { theme as defaultTheme } from "@/utils/theme";
import { getCurrencySymbol, getCurrencyConfig } from "@/utils/currencies";

// Icons
import {
  HiChevronLeft,
  HiChevronRight,
  HiPlus,
  HiTrash,
  HiXMark,
  HiMagnifyingGlass,
  HiArrowPath,
  HiExclamationTriangle,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiOutlineWallet,
} from "react-icons/hi2";

export default function SpendBudgetPage() {
  const router = useRouter();

  // Spend Budget Hook (Connected to Supabase spend_budgets table)
  const {
    budgets,
    totalCount,
    totalFund,
    totalExpense,
    balance,
    loading: budgetsLoading,
    fetchPaginatedBudgets,
    loadTotals,
    addEntry,
    deleteEntry,
  } = useSpendBudget();

  // Redux Auth state
  const authState = useSelector((state) => state?.auth || state?.authSlice);
  const user = authState?.userData?.user || authState?.userData || {};
  const userProfile = authState?.userData?.profile || user?.profile || {};
  const userName =
    authState?.userData?.name ||
    userProfile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const userCurrency =
    authState?.userData?.currency ||
    userProfile?.currency ||
    user?.user_metadata?.currency ||
    "INR";
  const currencySymbol = getCurrencySymbol(userCurrency);
  const currencyConfig = getCurrencyConfig(userCurrency);

  // Theme state - full reactive support for light/dark mode and all dynamic primary color palettes
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;
  const primaryColor =
    currentTheme?.colors?.primary ||
    themeState?.colors?.primary ||
    defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  // Filter & Search states
  const [filterType, setFilterType] = useState("all"); // 'all' | 'Fund' | 'Expense'
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states for adding Fund / Expense (without category functionality)
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("Expense"); // 'Fund' or 'Expense'
  const [amountInput, setAmountInput] = useState("");
  const [dateInput, setDateInput] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [noteInput, setNoteInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format currency helper
  const formatCurrency = useCallback(
    (val) => {
      const num = parseFloat(val) || 0;
      return `${currencySymbol}${num.toLocaleString(
        currencyConfig?.locale || "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    },
    [currencySymbol, currencyConfig]
  );

  // Format display date: e.g. "Tue, 29 Sep 2026"
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const parts = String(dateStr).split("-");
      if (parts.length === 3) {
        const d = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Dynamic Fund vs Expense Percentage and Progress calculation
  const {
    expenseRatio,
    remainingPercent,
    isOverBudget,
    overBudgetAmount,
  } = useMemo(() => {
    if (totalFund <= 0) {
      if (totalExpense > 0) {
        return {
          expenseRatio: 100,
          remainingPercent: 0,
          isOverBudget: true,
          overBudgetAmount: totalExpense,
        };
      }
      return {
        expenseRatio: 0,
        remainingPercent: 0,
        isOverBudget: false,
        overBudgetAmount: 0,
      };
    }

    const ratio = (totalExpense / totalFund) * 100;
    const isOver = totalExpense > totalFund;
    return {
      expenseRatio: ratio,
      remainingPercent: Math.max(0, 100 - ratio),
      isOverBudget: isOver,
      overBudgetAmount: isOver ? totalExpense - totalFund : 0,
    };
  }, [totalFund, totalExpense]);

  // Load paginated data from Supabase
  const loadData = useCallback(() => {
    fetchPaginatedBudgets({
      page: currentPage,
      limit: pageSize,
      type: filterType === "all" ? null : filterType,
      search: searchQuery,
    });
  }, [fetchPaginatedBudgets, currentPage, pageSize, filterType, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Open Add Modal helper (ONLY Fund or Expense)
  const handleOpenAddModal = (type) => {
    setModalType(type);
    setAmountInput("");
    setNoteInput("");
    setDateInput(new Date().toISOString().split("T")[0]);
    setShowAddModal(true);
  };

  // Submit Add Entry to Supabase
  const handleSaveEntry = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountInput);
    if (!parsedAmount || parsedAmount <= 0) return;

    setIsSubmitting(true);
    const res = await addEntry({
      amount: parsedAmount,
      type: modalType,
      note: noteInput.trim(),
      date: dateInput,
    });
    setIsSubmitting(false);

    if (res.success) {
      setShowAddModal(false);
      setAmountInput("");
      setNoteInput("");
      loadData();
    }
  };

  // Confirm delete entry from Supabase
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const res = await deleteEntry(itemToDelete.id);
    setIsDeleting(false);
    setItemToDelete(null);
    if (res.success) {
      loadData();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24 font-sans">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & ACCENT LINE (Dynamically adapts to theme)     */}
      {/* ============================================================ */}
      <div className="relative pt-2">
        {/* Progress Bar: Fund fills 100%, Expense empties it (Single Theme Color) */}
        <div className="mb-3 space-y-1">
          <div
            className="h-2 w-full rounded-full overflow-hidden relative shadow-inner transition-all duration-300"
            style={{
              backgroundColor: isDark ? "#1f1e2b" : "#e2e8f0",
            }}
          >
            {/* Remaining Fund Fill (Single theme color, empties with expenses) */}
            <div
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${remainingPercent}%`,
                background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd)`,
              }}
              title={`Fund Available: ${remainingPercent.toFixed(1)}%`}
            />
          </div>

          {/* Labels */}
          <div className="flex items-center justify-between text-[11px] font-bold px-0.5">
            <span
              className="flex items-center gap-1.5 font-bold"
              style={{ color: primaryColor }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              Fund Available: {remainingPercent.toFixed(1)}%
            </span>

            <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 font-semibold">
              {isOverBudget
                ? `Over Budget (${formatCurrency(overBudgetAmount)})`
                : `Expense Spent: ${expenseRatio.toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* Navigation & Header */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-80 cursor-pointer group"
            style={{ color: primaryColor }}
          >
            <HiChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Spend Bucket
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">
              Hi, {userName}
            </p>
          </div>

          {/* Right Tools: Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadData();
                loadTotals();
              }}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? "bg-[#161522] border-[#232234] text-slate-300 hover:text-white hover:bg-[#1f1e2f]"
                  : "bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
              title="Refresh Spend Bucket"
              aria-label="Refresh Spend Bucket"
            >
              <HiArrowPath
                className={`w-4 h-4 ${budgetsLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SPEND BUCKET SUMMARY CARD (Matching Reference Image)        */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121118] border border-gray-200/80 dark:border-[#1f1e2b]/80 shadow-sm space-y-4">
        {/* Fund Row */}
        <div className="flex items-center justify-between text-sm sm:text-base">
          <div className="flex items-center gap-2.5 font-bold text-gray-800 dark:text-slate-200">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 inline-block shadow-xs"
              style={{ backgroundColor: primaryColor }}
            />
            <span>Fund</span>
          </div>
          <span
            className="font-extrabold tracking-tight"
            style={{ color: primaryColor }}
          >
            {formatCurrency(totalFund)}
          </span>
        </div>

        {/* Expense Row */}
        <div className="flex items-center justify-between text-sm sm:text-base">
          <div className="flex items-center gap-2.5 font-bold text-gray-800 dark:text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] shrink-0 inline-block shadow-xs" />
            <span>Expense</span>
          </div>
          <span className="font-extrabold text-[#FF6B6B] tracking-tight">
            {formatCurrency(totalExpense)}
          </span>
        </div>

        {/* Dashed Separator Line */}
        <div className="border-t border-dashed border-gray-200 dark:border-[#2b2a3d] pt-3" />

        {/* Balance Row */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
            Balance
          </span>
          <span
            className={`font-black text-base sm:text-xl tracking-tight ${
              balance >= 0 ? "text-[#10B981]" : "text-[#2563EB]"
            }`}
          >
            {balance < 0 ? "-" : ""}
            {formatCurrency(Math.abs(balance))}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. QUICK ACTION BUTTONS (+Add Fund & +Expense) - ONLY THESE   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={() => handleOpenAddModal("Fund")}
          className="h-11 px-4 rounded-2xl border-2 font-bold text-sm sm:text-base transition-all cursor-pointer inline-flex items-center justify-center gap-2 leading-none shadow-xs active:scale-[0.99]"
          style={{
            borderColor: primaryColor,
            color: primaryColor,
            backgroundColor: `${primaryColor}15`,
          }}
        >
          <HiPlus className="w-4 h-4 stroke-2 shrink-0" />
          <span className="leading-none">+Add Fund</span>
        </button>

        <button
          onClick={() => handleOpenAddModal("Expense")}
          className="h-11 px-4 rounded-2xl border-2 border-[#FF6B6B] text-[#FF6B6B] bg-[#FF6B6B]/5 hover:bg-[#FF6B6B]/15 active:scale-[0.99] font-bold text-sm sm:text-base transition-all cursor-pointer inline-flex items-center justify-center gap-2 leading-none shadow-xs"
        >
          <HiPlus className="w-4 h-4 stroke-2 shrink-0" />
          <span className="leading-none">+Expense</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 4. TABLE SECTION WITH SUPABASE PAGINATION (WITHOUT CATEGORIES) */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-white dark:bg-[#121118] border border-gray-200/80 dark:border-[#1f1e2b]/80 shadow-xs overflow-hidden">
        {/* Table Filter & Search Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#1f1e2b]/80 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Bucket Transactions
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Track all your budget funds and expenses
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-52 md:w-60">
              <HiMagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-xs rounded-xl border border-gray-200 dark:border-[#232234] bg-gray-50 dark:bg-[#161522] text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-all"
                style={{ outlineColor: primaryColor }}
              />
            </div>

            {/* Type Filter: All | Funds | Expenses - Highlighted with dynamic theme color */}
            <div className="grid grid-cols-3 sm:flex items-center p-1 rounded-xl bg-gray-100 dark:bg-[#161522] border border-gray-200/80 dark:border-[#232234] w-full sm:w-auto">
              {[
                { key: "all", label: "All" },
                { key: "Fund", label: "Funds" },
                { key: "Expense", label: "Expenses" },
              ].map((tab) => {
                const isActive = filterType === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilterType(tab.key)}
                    className={`text-center px-3 py-1.5 sm:py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? "text-white shadow-xs"
                        : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    style={isActive ? { backgroundColor: primaryColor } : {}}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {budgetsLoading && (
          <div className="p-3 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 text-xs font-medium text-center flex items-center justify-center gap-2 border-b border-sky-100 dark:border-sky-900/30">
            <HiArrowPath className="w-3.5 h-3.5 animate-spin" />
            <span>Loading entries from Supabase...</span>
          </div>
        )}

        {/* Table or Empty State */}
        {budgets.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl transition-colors"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
              }}
            >
              <HiOutlineWallet className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              No bucket records found
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 max-w-sm mx-auto">
              Use <strong>+Add Fund</strong> or <strong>+Expense</strong> to log
              your first budget entry directly into Supabase.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (WITHOUT Category column) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#1f1e2b]/80 bg-gray-50/75 dark:bg-[#161522]/50 text-gray-500 dark:text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Note</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#1f1e2b]/80">
                  {budgets.map((item) => {
                    const isExpense = item.type === "Expense";
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-[#161522]/60 transition-colors group"
                      >
                        {/* Type Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={
                              isExpense
                                ? { backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }
                                : { backgroundColor: `${primaryColor}18`, color: primaryColor }
                            }
                          >
                            {isExpense ? (
                              <HiArrowTrendingDown className="w-3.5 h-3.5" />
                            ) : (
                              <HiArrowTrendingUp className="w-3.5 h-3.5" />
                            )}
                            <span>{isExpense ? "Expense" : "Fund"}</span>
                          </span>
                        </td>

                        {/* Note / Description */}
                        <td className="py-3 px-4 text-gray-800 dark:text-slate-200 font-medium">
                          {item.note || "—"}
                        </td>

                        {/* Date (e.g. Tue, 29 Sep 2026) */}
                        <td className="py-3 px-4 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDisplayDate(item.date)}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap">
                          <span
                            style={{
                              color: isExpense ? "#FF6B6B" : primaryColor,
                            }}
                          >
                            {isExpense ? "-" : "+"}
                            {formatCurrency(item.amount)}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-[#1f1e2b]/80 p-2 space-y-2">
              {budgets.map((item) => {
                const isExpense = item.type === "Expense";
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-gray-50/60 dark:bg-[#161522]/40 border border-gray-100 dark:border-[#232234] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Circular soft icon badge */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={
                          isExpense
                            ? { backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }
                            : { backgroundColor: `${primaryColor}20`, color: primaryColor }
                        }
                      >
                        {isExpense ? (
                          <HiArrowTrendingDown className="w-5 h-5" />
                        ) : (
                          <HiArrowTrendingUp className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">
                            {item.note || (isExpense ? "Expense" : "Fund")}
                          </div>
                          <div
                            className="font-extrabold text-sm whitespace-nowrap"
                            style={{
                              color: isExpense ? "#FF6B6B" : primaryColor,
                            }}
                          >
                            {isExpense ? "-" : "+"}
                            {formatCurrency(item.amount)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400 dark:text-slate-500">
                            {formatDisplayDate(item.date)}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            style={
                              isExpense
                                ? { backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }
                                : { backgroundColor: `${primaryColor}15`, color: primaryColor }
                            }
                          >
                            {isExpense ? "Expense" : "Fund"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                      title="Delete"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination Bar */}
        <div className="px-4 py-3.5 border-t border-gray-100 dark:border-[#1f1e2b]/80 bg-gray-50/50 dark:bg-[#15141e]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-500 dark:text-slate-400 text-center sm:text-left">
            Showing{" "}
            <span className="font-semibold text-gray-700 dark:text-slate-200">
              {budgets.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-700 dark:text-slate-200">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700 dark:text-slate-200">
              {totalCount}
            </span>{" "}
            entries
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#232234] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1e1d2a] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold cursor-pointer"
              >
                <HiChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "text-white shadow-xs"
                            : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1e1d2a]"
                        }`}
                        style={{
                          backgroundColor: isActive ? primaryColor : undefined,
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#232234] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1e1d2a] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>Next</span>
                <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. ADD FUND / EXPENSE MODAL (WITHOUT CATEGORY FUNCTIONALITY)   */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#161522] rounded-2xl shadow-xl border border-gray-100 dark:border-[#232234] p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modalType === "Fund" ? "+ Add Fund" : "+ Add Expense"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Form - Only Fund/Expense, Amount, Note, Date */}
            <form onSubmit={handleSaveEntry} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100 dark:bg-[#1f1e2f] border border-gray-200 dark:border-[#2b2a3d]">
                <button
                  type="button"
                  onClick={() => setModalType("Fund")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modalType === "Fund"
                      ? "text-white shadow-xs"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  style={modalType === "Fund" ? { backgroundColor: primaryColor } : {}}
                >
                  Fund
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("Expense")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modalType === "Expense"
                      ? "bg-[#FF6B6B] text-white shadow-xs"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Expense
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                  Amount ({userCurrency})
                </label>
                <div className="relative flex items-center">
                  <span
                    className="absolute left-3.5 text-2xl font-bold"
                    style={{
                      color: modalType === "Fund" ? primaryColor : "#FF6B6B",
                    }}
                  >
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-2xl font-bold border border-gray-200 dark:border-[#2b2a3d] bg-gray-50 dark:bg-[#121118] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
                    style={{ outlineColor: primaryColor }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Note / Description (e.g. Gu, Groceries, Project Fund) */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                  Note / Description
                </label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Gu, Salary, Petrol, Supplies..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-[#2b2a3d] bg-gray-50 dark:bg-[#121118] text-gray-900 dark:text-white focus:outline-none focus:ring-1"
                  style={{ outlineColor: primaryColor }}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                  Date
                </label>
                <ConfigProvider
                  theme={{
                    algorithm: isDark
                      ? antdTheme.darkAlgorithm
                      : antdTheme.defaultAlgorithm,
                    token: {
                      colorPrimary: primaryColor,
                      borderRadius: 12,
                      colorBgContainer: isDark ? "#121118" : "#f9fafb",
                      colorBorder: isDark ? "#2b2a3d" : "#e5e7eb",
                      colorText: isDark ? "#ffffff" : "#111827",
                      colorTextPlaceholder: isDark ? "#64748b" : "#9ca3af",
                    },
                  }}
                >
                  <DatePicker
                    value={dateInput ? dayjs(dateInput, "YYYY-MM-DD") : null}
                    onChange={(date, dateString) =>
                      setDateInput(dateString || "")
                    }
                    format="YYYY-MM-DD"
                    allowClear={false}
                    className="w-full h-10 rounded-xl text-sm"
                  />
                </ConfigProvider>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-[#2b2a3d] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1e1d2a] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  style={{
                    backgroundColor:
                      modalType === "Fund" ? primaryColor : "#FF6B6B",
                  }}
                >
                  {isSubmitting
                    ? "Saving..."
                    : modalType === "Fund"
                    ? "+ Save Fund"
                    : "+ Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. DELETE CONFIRMATION MODAL                                  */}
      {/* ============================================================ */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-[#161522] rounded-2xl shadow-xl border border-gray-100 dark:border-[#232234] p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/50">
                <HiExclamationTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Delete Entry?
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Are you sure you want to delete this {itemToDelete.type} entry of{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(itemToDelete.amount)}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-[#2b2a3d] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1e1d2a] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
