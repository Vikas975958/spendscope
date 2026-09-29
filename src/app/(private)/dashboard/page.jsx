"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { Select, DatePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
import useTransactions from "@/hooks/useTransactions";
import useCategories from "@/hooks/useCategories";
import ThemeChange from "@/components/ThemeChange";
import CategoryModal from "@/components/CategoryModal";
import { theme as defaultTheme } from "@/utils/theme";
import { getCurrencySymbol, getCurrencyConfig } from "@/utils/currencies";

// Icons
import {
  HiPlus,
  HiTrash,
  HiPencilSquare,
  HiExclamationTriangle,
  HiChevronLeft,
  HiChevronRight,
  HiArrowPath,
  HiArrowRight,
  HiXMark,
  HiOutlineCreditCard,
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { BiCategory } from "react-icons/bi";
import { IoColorPaletteOutline } from "react-icons/io5";

export default function DashboardPage() {
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    addTransaction,
    deleteTransaction,
    fetchPaginatedTransactions,
  } = useTransactions();

  const {
    categories,
    loading: categoriesLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  // Auth & Profile state
  const authState = useSelector((state) => state?.auth || state?.authSlice);
  const user = authState?.userData?.user || authState?.userData || {};
  const userProfile = authState?.userData?.profile || user?.profile || {};
  const userCurrency =
    authState?.userData?.currency ||
    userProfile?.currency ||
    user?.user_metadata?.currency ||
    "INR";
  const currencySymbol = getCurrencySymbol(userCurrency);
  const currencyConfig = getCurrencyConfig(userCurrency);

  // Theme state
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;

  const emeraldGreen = "#10B981";

  const primaryColor =
    currentTheme?.colors?.primary ||
    themeState?.colors?.primary ||
    defaultTheme.colors.primary;

  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  // Filter types: 'today', 'weekly', 'monthly', 'custom'
  const [filterType, setFilterType] = useState("weekly");

  // Date format & display helpers
  const formatDateToISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (
    dateStr,
    options = { month: "short", day: "numeric", year: "numeric" },
  ) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("en-US", options);
    }
    return dateStr;
  };

  // 1. TODAY FILTER STATE
  const [selectedDay, setSelectedDay] = useState(() =>
    formatDateToISO(new Date()),
  );

  const handlePrevDay = () => {
    const [y, m, d] = selectedDay.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    setSelectedDay(formatDateToISO(date));
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDay.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    setSelectedDay(formatDateToISO(date));
  };

  // 2. WEEKLY FILTER STATE (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);

  const weeklyInfo = useMemo(() => {
    const now = new Date();
    const current = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + weekOffset * 7,
    );
    const day = current.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMon = (day === 0 ? -6 : 1) - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + diffToMon);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startStr = formatDateToISO(monday);
    const endStr = formatDateToISO(sunday);
    const label = `${monday.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${sunday.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;

    return {
      startStr,
      endStr,
      label,
    };
  }, [weekOffset]);

  const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);

  // 3. MONTHLY FILTER STATE (Dynamic Month Options)
  const monthOptions = useMemo(() => {
    const now = new Date();
    const list = [];
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      list.push({ value, label });
    }
    return list;
  }, []);

  const defaultMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const handlePrevMonth = () => {
    const idx = monthOptions.findIndex((m) => m.value === selectedMonth);
    if (idx < monthOptions.length - 1) {
      setSelectedMonth(monthOptions[idx + 1].value);
    }
  };

  const handleNextMonth = () => {
    const idx = monthOptions.findIndex((m) => m.value === selectedMonth);
    if (idx > 0) {
      setSelectedMonth(monthOptions[idx - 1].value);
    }
  };

  const activeMonthLabel = useMemo(() => {
    const found = monthOptions.find((m) => m.value === selectedMonth);
    return found ? found.label : selectedMonth;
  }, [monthOptions, selectedMonth]);

  // 4. CUSTOM DATE RANGE STATE
  const [customStartDate, setCustomStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [customEndDate, setCustomEndDate] = useState(() =>
    formatDateToISO(new Date()),
  );

  // Dynamic active period label for display across dashboard overview & headers
  const activePeriodLabel = useMemo(() => {
    if (filterType === "today") {
      const todayISO = formatDateToISO(new Date());
      if (selectedDay === todayISO) {
        return `Today (${formatDisplayDate(selectedDay)})`;
      }
      return formatDisplayDate(selectedDay);
    }
    if (filterType === "weekly") {
      return weeklyInfo.label;
    }
    if (filterType === "monthly") {
      return activeMonthLabel;
    }
    if (filterType === "custom") {
      if (customStartDate && customEndDate) {
        return `${formatDisplayDate(customStartDate)} – ${formatDisplayDate(customEndDate)}`;
      }
      if (customStartDate) return `From ${formatDisplayDate(customStartDate)}`;
      if (customEndDate) return `Until ${formatDisplayDate(customEndDate)}`;
      return "Custom Range";
    }
    return "All Records";
  }, [
    filterType,
    selectedDay,
    weeklyInfo.label,
    activeMonthLabel,
    customStartDate,
    customEndDate,
  ]);

  // Filtered transactions based on active filter
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    return transactions.filter((t) => {
      const rawDate = (t.date || "").substring(0, 10);
      if (!rawDate) return false;

      if (filterType === "today") {
        return rawDate === selectedDay;
      }
      if (filterType === "weekly") {
        return rawDate >= weeklyInfo.startStr && rawDate <= weeklyInfo.endStr;
      }
      if (filterType === "monthly") {
        return rawDate.startsWith(selectedMonth);
      }
      if (filterType === "custom") {
        if (customStartDate && customEndDate) {
          return rawDate >= customStartDate && rawDate <= customEndDate;
        }
        if (customStartDate) return rawDate >= customStartDate;
        if (customEndDate) return rawDate <= customEndDate;
        return true;
      }
      return true;
    });
  }, [
    transactions,
    filterType,
    selectedDay,
    weeklyInfo.startStr,
    weeklyInfo.endStr,
    selectedMonth,
    customStartDate,
    customEndDate,
  ]);

  // -------------------------------------------------------------
  // SERVER-SIDE PAGINATION FOR RECENT ACTIVITY (Limit: 30 items per page)
  // -------------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  const [paginatedData, setPaginatedData] = useState([]);
  const [serverTotalCount, setServerTotalCount] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Active date range for database querying
  const activeDateRange = useMemo(() => {
    if (filterType === "today") {
      return { startDate: selectedDay, endDate: selectedDay };
    }
    if (filterType === "weekly") {
      return { startDate: weeklyInfo.startStr, endDate: weeklyInfo.endStr };
    }
    if (filterType === "monthly") {
      const parts = (selectedMonth || "").split("-").map(Number);
      const year = parts[0] || new Date().getFullYear();
      const month = parts[1] || new Date().getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();
      const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
      const endStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      return { startDate: startStr, endDate: endStr };
    }
    if (filterType === "custom") {
      return {
        startDate: customStartDate || null,
        endDate: customEndDate || null,
      };
    }
    return { startDate: null, endDate: null };
  }, [
    filterType,
    selectedDay,
    weeklyInfo.startStr,
    weeklyInfo.endStr,
    selectedMonth,
    customStartDate,
    customEndDate,
  ]);

  // Reset pagination to first page when filtering changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterType,
    selectedDay,
    weeklyInfo.startStr,
    weeklyInfo.endStr,
    selectedMonth,
    customStartDate,
    customEndDate,
  ]);

  // Server-side API query for transactions with limit & page
  const loadPaginatedTransactions = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const res = await fetchPaginatedTransactions({
        page: currentPage,
        limit: pageSize,
        startDate: activeDateRange.startDate,
        endDate: activeDateRange.endDate,
      });
      setPaginatedData(res.data || []);
      setServerTotalCount(res.totalCount ?? null);
    } catch (err) {
      console.error("Failed to load paginated page from API:", err);
    } finally {
      setIsPageLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    activeDateRange.startDate,
    activeDateRange.endDate,
    fetchPaginatedTransactions,
  ]);

  // Trigger API request whenever currentPage, pageSize, or date filters change
  useEffect(() => {
    loadPaginatedTransactions();
  }, [loadPaginatedTransactions]);

  const totalEntries =
    serverTotalCount !== null ? serverTotalCount : filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));

  // Auto-clamp currentPage if items decrease (e.g. deletion)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Displayed transactions: prefer freshly fetched server page, fallback to filtered client slice during initial load
  const displayedTransactions = useMemo(() => {
    if (paginatedData.length > 0 || isPageLoading) {
      return paginatedData;
    }
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [paginatedData, isPageLoading, currentPage, pageSize, filteredTransactions]);

  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries);

  // Financial totals for the active month
  const { totalIncome, totalExpense, balance, incomeCount, expenseCount } =
    useMemo(() => {
      let inc = 0;
      let exp = 0;
      let incCount = 0;
      let expCount = 0;

      filteredTransactions.forEach((t) => {
        const val = parseFloat(t.amount) || 0;
        if (t.type === "Income") {
          inc += val;
          incCount++;
        } else {
          exp += val;
          expCount++;
        }
      });

      return {
        totalIncome: inc,
        totalExpense: exp,
        balance: inc - exp,
        incomeCount: incCount,
        expenseCount: expCount,
      };
    }, [filteredTransactions]);

  // Categories counts
  const expenseCatCount = useMemo(() => {
    return categories.filter((c) => (c.type || "Expense") === "Expense").length;
  }, [categories]);

  const incomeCatCount = useMemo(() => {
    return categories.filter((c) => c.type === "Income").length;
  }, [categories]);

  // Category breakdown computation based on actual monthly transactions and Total Income
  const categoryBreakdown = useMemo(() => {
    const expenses = filteredTransactions.filter((t) => t.type === "Expense");
    const map = {};
    let totalExpenseSum = 0;

    expenses.forEach((t) => {
      const amt = parseFloat(t.amount) || 0;
      const catName = t.category || "Uncategorized";
      if (!map[catName]) {
        map[catName] = {
          amount: 0,
          icon: "🏷️",
          color: t.color_code || "#FF6B6B",
        };
      }
      map[catName].amount += amt;
      totalExpenseSum += amt;
    });

    return Object.entries(map).map(([name, item]) => {
      // When totalIncome > 0, calculate percentage against total income; else against total expense
      const hasIncome = totalIncome > 0;
      const baseAmount = hasIncome ? totalIncome : totalExpenseSum;
      const percentVal = baseAmount > 0 ? (item.amount / baseAmount) * 100 : 0;
      const remainingIncomeAfterCategory = hasIncome
        ? totalIncome - item.amount
        : 0;

      return {
        name,
        amount: item.amount,
        percentage: percentVal.toFixed(1),
        hasIncome,
        remainingIncome: remainingIncomeAfterCategory,
        icon: item.icon,
        color: item.color,
      };
    });
  }, [filteredTransactions, totalIncome]);

  // Modal & Form States
  const [showFormModal, setShowFormModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalInitialEdit, setCategoryModalInitialEdit] =
    useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState("Expense");
  const [amountInput, setAmountInput] = useState("");
  const [dateInput, setDateInput] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [noteInput, setNoteInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available categories filtered by current type
  const availableCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const filtered = categories.filter(
      (c) => !c.type || c.type === transactionType,
    );
    return filtered.length > 0 ? filtered : categories;
  }, [categories, transactionType]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (availableCategories.length > 0) {
      if (
        !selectedCategory ||
        !availableCategories.some((c) => c.id === selectedCategory.id)
      ) {
        setSelectedCategory(availableCategories[0]);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [availableCategories]);

  // Formatting currency helper
  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return `${currencySymbol}${num.toLocaleString(currencyConfig.locale || "en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Form submit handler
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountInput);

    if (!parsedAmount || parsedAmount <= 0) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      amount: parsedAmount,
      type: transactionType,
      category_id: selectedCategory?.id || null,
      date: dateInput,
      note: noteInput.trim(),
    };

    const res = await addTransaction(payload);
    setIsSubmitting(false);

    if (res.success) {
      setAmountInput("");
      setNoteInput("");
      setShowFormModal(false);
      setCurrentPage(1);
      loadPaginatedTransactions();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 font-sans">
      {/* ============================================================ */}
      {/* 1. HEADER SECTION                                             */}
      {/* ============================================================ */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121118] border border-gray-200/80 dark:border-[#1f1e2b]/80 shadow-xs space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5 leading-normal">
              Real-time financial summary, category breakdowns, and activity
              tracking.
            </p>
          </div>

          <button
            onClick={() => setShowFormModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs transition-opacity hover:opacity-90 active:opacity-100 cursor-pointer shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <HiPlus className="w-4 h-4 stroke-2" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-[#1f1e2b]/80">
          {/* Segmented Filter Type Selector: Today | Weekly | Month | Custom */}
          <div className="grid grid-cols-4 sm:flex sm:items-center p-1 rounded-xl bg-gray-100 dark:bg-[#161522] border border-gray-200/80 dark:border-[#232234] w-full sm:w-auto">
            {[
              { key: "today", label: "Today" },
              { key: "weekly", label: "Weekly" },
              { key: "monthly", label: "Month" },
              { key: "custom", label: "Custom" },
            ].map((opt) => {
              const isActive = filterType === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFilterType(opt.key)}
                  className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                    isActive
                      ? "text-white shadow-xs"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  style={isActive ? { backgroundColor: primaryColor } : {}}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Sub-controls specific to active filter type */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {/* 1. TODAY CONTROLS */}
            {filterType === "today" && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="h-[34px] flex-1 sm:flex-initial inline-flex items-center justify-between sm:justify-start gap-1 bg-white dark:bg-[#161522] px-2 rounded-lg border border-gray-200/90 dark:border-[#232234] shadow-xs box-border">
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    className="h-6 w-6 inline-flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1f1e2f] rounded transition-all cursor-pointer"
                    title="Previous Day"
                    aria-label="Previous Day"
                  >
                    <HiChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="px-2 text-xs font-bold text-gray-800 dark:text-slate-100 select-none whitespace-nowrap truncate text-center">
                    {selectedDay === formatDateToISO(new Date())
                      ? "Today, "
                      : ""}
                    {formatDisplayDate(selectedDay, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextDay}
                    className="h-6 w-6 inline-flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1f1e2f] rounded transition-all cursor-pointer"
                    title="Next Day"
                    aria-label="Next Day"
                  >
                    <HiChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
                {selectedDay !== formatDateToISO(new Date()) && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(formatDateToISO(new Date()))}
                    className="h-[34px] px-3 inline-flex items-center text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-950/70 transition-all cursor-pointer bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200/60 dark:border-blue-900/50 shadow-xs box-border shrink-0"
                  >
                    Reset Today
                  </button>
                )}
              </div>
            )}

            {/* 2. WEEKLY CONTROLS */}
            {filterType === "weekly" && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="h-[34px] flex-1 sm:flex-initial inline-flex items-center justify-between sm:justify-start gap-1 bg-white dark:bg-[#161522] px-2 rounded-lg border border-gray-200/90 dark:border-[#232234] shadow-xs box-border">
                  <button
                    type="button"
                    onClick={handlePrevWeek}
                    className="h-6 w-6 inline-flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1f1e2f] rounded transition-all cursor-pointer"
                    title="Previous Week"
                    aria-label="Previous Week"
                  >
                    <HiChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="px-2 text-xs font-bold text-gray-800 dark:text-slate-100 select-none whitespace-nowrap truncate text-center">
                    {weeklyInfo.label}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    className="h-6 w-6 inline-flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1f1e2f] rounded transition-all cursor-pointer"
                    title="Next Week"
                    aria-label="Next Week"
                  >
                    <HiChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
                {weekOffset !== 0 && (
                  <button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    className="h-[34px] px-3 inline-flex items-center text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-950/70 transition-all cursor-pointer bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200/60 dark:border-blue-900/50 shadow-xs box-border shrink-0"
                  >
                    This Week
                  </button>
                )}
              </div>
            )}

            {/* 3. MONTHLY CONTROLS */}
            {filterType === "monthly" && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:w-44 min-w-0">
                  <Select
                    value={selectedMonth}
                    onChange={(value) => setSelectedMonth(value)}
                    className="ant-select-custom w-full text-xs"
                    options={monthOptions}
                  />
                </div>
                <div className="h-[34px] inline-flex items-center gap-1 bg-white dark:bg-[#161522] px-2 rounded-lg border border-gray-200/90 dark:border-[#232234] shadow-xs box-border shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={
                      monthOptions.findIndex(
                        (m) => m.value === selectedMonth,
                      ) >=
                      monthOptions.length - 1
                    }
                    className="h-6 w-6 inline-flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1f1e2f] rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title="Previous Month"
                    aria-label="Previous Month"
                  >
                    <HiChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <div className="w-[1px] h-3.5 bg-gray-200 dark:bg-[#232234]" />
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    disabled={
                      monthOptions.findIndex(
                        (m) => m.value === selectedMonth,
                      ) <= 0
                    }
                    className="h-6 w-6 inline-flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1f1e2f] rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title="Next Month"
                    aria-label="Next Month"
                  >
                    <HiChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}

            {/* 4. CUSTOM DATE RANGE CONTROLS */}
            {filterType === "custom" && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <RangePicker
                  value={[
                    customStartDate
                      ? dayjs(customStartDate, "YYYY-MM-DD")
                      : null,
                    customEndDate ? dayjs(customEndDate, "YYYY-MM-DD") : null,
                  ]}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setCustomStartDate(dates[0].format("YYYY-MM-DD"));
                      setCustomEndDate(dates[1].format("YYYY-MM-DD"));
                    } else {
                      setCustomStartDate("");
                      setCustomEndDate("");
                    }
                  }}
                  format="DD-MM-YYYY"
                  className="ant-rangepicker-custom text-xs w-full sm:w-auto"
                  allowClear={false}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. OVERVIEW SECTION                                          */}
      {/* ============================================================ */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            FINANCIAL OVERVIEW ({activePeriodLabel.toUpperCase()})
          </h2>
          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">
            {filteredTransactions.length} Total Records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
          {/* Card 1: Total Income */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#121118] border border-gray-200/80 dark:border-[#1f1e2b]/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                Total Income
              </p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate leading-tight">
                {formatCurrency(totalIncome)}
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-slate-500">
                {incomeCount} credit {incomeCount === 1 ? "entry" : "entries"}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <HiOutlineArrowTrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Total Expenses */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#121118] border border-gray-200/80 dark:border-[#1f1e2b]/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                Total Expenses
              </p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#FF6B6B] truncate leading-tight">
                {formatCurrency(totalExpense)}
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-slate-500">
                {expenseCount} debit {expenseCount === 1 ? "entry" : "entries"}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[#FF6B6B] flex items-center justify-center shrink-0">
              <HiOutlineCreditCard className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Net Balance */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#121118] border border-gray-200/80 dark:border-[#1f1e2b]/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                Net Balance
              </p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 truncate leading-tight">
                {formatCurrency(balance)}
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-slate-500">
                {totalIncome > 0
                  ? `${((balance / totalIncome) * 100).toFixed(0)}% retained`
                  : "Active period"}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <HiOutlineBanknotes className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CATEGORIES SUMMARY SECTION                                */}
      {/* ============================================================ */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121118] border border-gray-200/80 dark:border-[#1f1e2b]/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-[#1f1e2b]/80 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Categories Overview
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Summary of your {categories.length} configured spending and income
              categories.
            </p>
          </div>

          {/* Prominent Manage Categories Button */}
          <button
            type="button"
            onClick={() => {
              setCategoryModalInitialEdit(null);
              setShowCategoryModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 active:opacity-100 cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            <BiCategory className="w-4 h-4" />
            <span>Manage Categories</span>
          </button>
        </div>

        {/* Category Breakdown & Spending Distribution (Analyzed against Total Income) */}
        {categoriesLoading ? (
          <div className="py-6 text-center text-xs text-gray-400 animate-pulse">
            Loading categories...
          </div>
        ) : categoryBreakdown.length > 0 ? (
          <div className="space-y-3">
            {/* Income vs Spending Balance Summary (when totalIncome > 0) */}
            {totalIncome > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-gray-50/80 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 dark:text-slate-400">
                    Total Income:
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 dark:text-slate-400">
                    Categories Spend:
                  </span>
                  <span className="font-extrabold text-rose-500">
                    - {formatCurrency(totalExpense)}
                  </span>
                  <span className="text-[11px] text-gray-400 font-semibold">
                    ({((totalExpense / totalIncome) * 100).toFixed(1)}% of
                    Income)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 dark:text-slate-400">
                    Net Remaining:
                  </span>
                  <span
                    className={`font-extrabold ${
                      balance >= 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-rose-600"
                    }`}
                  >
                    {formatCurrency(balance)}
                  </span>
                  <span className="text-[11px] text-gray-400 font-semibold">
                    ({((balance / totalIncome) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs px-1">
                <p className="font-bold text-gray-700 dark:text-slate-300">
                  Spending Distribution in {activePeriodLabel}
                </p>
                <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500">
                  Total Spent: {formatCurrency(totalExpense)}
                </span>
              </div>
            )}

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {categoryBreakdown.map((cat, idx) => {
                const percentVal = parseFloat(cat.percentage);
                const percentFormatted = Number.isInteger(percentVal)
                  ? `${percentVal}%`
                  : `${cat.percentage}%`;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                        <span className="text-sm">🏷️</span>
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm">
                          {formatCurrency(cat.amount)}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-2xs"
                          style={{ backgroundColor: cat.color || primaryColor }}
                        >
                          {percentFormatted} {cat.hasIncome ? "of Income" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar against Total Income or Expenses */}
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(percentVal, 100)}%`,
                          backgroundColor: cat.color || primaryColor,
                        }}
                      />
                    </div>

                    {/* Subtraction breakdown details */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500 pt-0.5">
                      {cat.hasIncome ? (
                        <>
                          <span>
                            {percentFormatted} of {formatCurrency(totalIncome)}
                          </span>
                          <span className="font-medium text-gray-600 dark:text-slate-300">
                            Left: {formatCurrency(cat.remainingIncome)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>{percentFormatted} of total spend</span>
                          <span>
                            {formatCurrency(cat.amount)} /{" "}
                            {formatCurrency(totalExpense)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-5 text-center space-y-1.5">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              No category spending recorded for {activePeriodLabel} yet.
            </p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500">
              Add transactions for this period to see automated category
              breakdowns here.
            </p>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 4. RECENT / ACTIVITY SECTION                                 */}
      {/* ============================================================ */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            RECENT ACTIVITY ({activePeriodLabel.toUpperCase()})
          </h2>
          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">
            {totalEntries} Logged Entries
            {totalPages > 1 ? ` • Page ${currentPage} of ${totalPages}` : ""}
          </span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#121118] border border-gray-200/80 dark:border-[#1f1e2b]/80 shadow-xs overflow-hidden relative">
          {transactionsLoading ? (
            <div className="p-6 text-center text-xs text-gray-400 animate-pulse">
              Loading recent transactions...
            </div>
          ) : totalEntries === 0 ? (
            <div className="p-6 sm:p-8 text-center space-y-2.5">
              <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-[#161522] text-gray-400 flex items-center justify-center mx-auto">
                <HiOutlineDocumentText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-gray-700 dark:text-slate-300">
                  No records logged for {activePeriodLabel}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  Transactions added for this period will appear here in
                  chronological order.
                </p>
              </div>
              <button
                onClick={() => setShowFormModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <HiPlus className="w-4 h-4" />
                <span>Add First Transaction</span>
              </button>
            </div>
          ) : (
            <>
              {isPageLoading && (
                <div className="absolute inset-0 bg-white/40 dark:bg-[#121118]/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="text-xs font-bold text-gray-500 dark:text-slate-300 bg-white dark:bg-[#1c1b28] px-3 py-1.5 rounded-full shadow-md border border-gray-200 dark:border-[#2b2a3d]">
                    Loading Page {currentPage}...
                  </div>
                </div>
              )}
              <div className="divide-y divide-gray-100 dark:divide-[#1f1e2b]/80">
                {displayedTransactions.map((item) => {
                  const isExpense = item.type === "Expense";
                  const formattedAmt = `${isExpense ? "-" : "+"}${formatCurrency(item.amount)}`;

                  return (
                    <div
                      key={item.id}
                      className="p-3 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50/60 dark:hover:bg-[#161522]/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#161522] flex items-center justify-center text-lg shrink-0">
                          🏷️
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                            {item.category}
                          </h4>
                          <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate mt-0.5">
                            {item.note ||
                              (isExpense ? "Expense Entry" : "Income Credit")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <span
                            className={`block text-xs sm:text-sm font-extrabold ${
                              isExpense ? "text-[#FF6B6B]" : "text-[#10B981]"
                            }`}
                          >
                            {formattedAmt}
                          </span>
                          <span className="text-[11px] text-gray-400 dark:text-slate-500 block mt-0.5">
                            {item.date}
                          </span>
                        </div>

                        <button
                          onClick={() => setTransactionToDelete(item)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="Delete transaction"
                          aria-label="Delete transaction"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Bar */}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-[#1f1e2b]/80 bg-gray-50/50 dark:bg-[#15141e]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-gray-500 dark:text-slate-400 text-center sm:text-left">
                  Showing <span className="font-semibold text-gray-700 dark:text-slate-200">{startEntry}</span> to{" "}
                  <span className="font-semibold text-gray-700 dark:text-slate-200">{endEntry}</span> of{" "}
                  <span className="font-semibold text-gray-700 dark:text-slate-200">{totalEntries}</span> logged entries
                  <span className="text-gray-400 dark:text-slate-500 ml-1.5">(Limit: {pageSize} per page)</span>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#232234] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1e1d2a] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold cursor-pointer"
                      aria-label="Previous Page"
                    >
                      <HiChevronLeft className="w-4 h-4" />
                      <span className="hidden xs:inline">Prev</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        if (
                          totalPages > 7 &&
                          pageNum !== 1 &&
                          pageNum !== totalPages &&
                          Math.abs(pageNum - currentPage) > 1
                        ) {
                          if (pageNum === 2 || pageNum === totalPages - 1) {
                            return (
                              <span key={pageNum} className="px-1 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                              isActive
                                ? "text-white shadow-xs"
                                : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#1e1d2a]"
                            }`}
                            style={isActive ? { backgroundColor: primaryColor } : {}}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#232234] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1e1d2a] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold cursor-pointer"
                      aria-label="Next Page"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <HiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* ADD TRANSACTION MODAL                                        */}
      {/* ============================================================ */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-5">
          <div
            className={`border rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4.5 animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? "bg-[#121118] border-[#1f1e2b]"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`text-lg sm:text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Add Transaction
                </h3>
                <p
                  className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"} mt-0.5`}
                >
                  Log an expense or income entry to Supabase
                </p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className={`p-1.5 rounded-lg ${
                  isDark
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
                aria-label="Close modal"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTransaction} className="space-y-4">
              {/* Type Toggle Switch */}
              <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setTransactionType("Expense")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    transactionType === "Expense"
                      ? "bg-[#FF6B6B] text-white shadow-xs"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType("Income")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    transactionType === "Income"
                      ? "bg-[#10B981] text-white shadow-xs"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900"
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                  Amount ({userCurrency})
                </label>
                <div className="relative flex items-center">
                  <span
                    className="absolute left-3.5 text-2xl font-bold"
                    style={{
                      color:
                        transactionType === "Expense"
                          ? primaryColor
                          : emeraldGreen,
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-2xl font-bold border border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/60 text-gray-900 dark:text-white focus:outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryModalInitialEdit(null);
                      setShowCategoryModal(true);
                    }}
                    className="text-[11px] font-bold text-blue-500 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    + Manage Categories
                  </button>
                </div>

                {categoriesLoading ? (
                  <div className="py-2.5 text-xs text-gray-400">
                    Loading categories...
                  </div>
                ) : availableCategories.length === 0 ? (
                  <div className="p-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-between">
                    <span>No categories found for {transactionType}.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryModalInitialEdit(null);
                        setShowCategoryModal(true);
                      }}
                      className="font-bold underline ml-2 cursor-pointer"
                    >
                      + Add One
                    </button>
                  </div>
                ) : (
                  <Select
                    showSearch
                    placeholder="Search or select a category"
                    optionFilterProp="searchLabel"
                    filterOption={(input, option) =>
                      (option?.searchLabel || "")
                        .toLowerCase()
                        .includes(input.toLowerCase().trim())
                    }
                    value={selectedCategory?.id}
                    onChange={(val) => {
                      const found = availableCategories.find(
                        (c) => c.id === val,
                      );
                      if (found) setSelectedCategory(found);
                    }}
                    className="w-full text-xs font-semibold"
                    popupRender={(menu) => (
                      <div>
                        {menu}
                        <div className="p-2 border-t border-gray-100 dark:border-slate-800">
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCategoryModalInitialEdit(null);
                              setShowCategoryModal(true);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <HiPlus className="w-3.5 h-3.5 stroke-2" />
                            <span>Add New Category</span>
                          </button>
                        </div>
                      </div>
                    )}
                    options={availableCategories.map((cat) => ({
                      value: cat.id,
                      searchLabel: cat.name,
                      label: (
                        <div className="flex items-center justify-between w-full py-0.5 group">
                          {/* Left: Icon + Name */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm leading-none shrink-0">
                              🏷️
                            </span>
                            <span className="font-bold text-xs truncate text-gray-800 dark:text-slate-200">
                              {cat.name}
                            </span>
                          </div>

                          {/* Right: Edit & Delete buttons for user-created custom categories */}
                          {!cat.is_default && (
                            <div
                              className="flex items-center gap-1 shrink-0 ml-2"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCategoryModalInitialEdit(cat);
                                  setShowCategoryModal(true);
                                }}
                                className="p-1 rounded text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                                title="Edit Category"
                              >
                                <HiPencilSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCategoryToDelete(cat);
                                }}
                                className="p-1 rounded text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                                title="Delete Category"
                              >
                                <HiTrash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ),
                    }))}
                  />
                )}
              </div>

              {/* Date & Note Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/60 text-gray-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-slate-300">
                    Note
                  </label>
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Optional note..."
                    className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/60 text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  disabled={isSubmitting}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? "text-slate-300 bg-slate-800 hover:bg-slate-700"
                      : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedCategory}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor:
                      transactionType === "Expense"
                        ? primaryColor
                        : emeraldGreen,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <HiArrowPath className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save {transactionType}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Add & Management Modal */}
      {showCategoryModal && (
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setCategoryModalInitialEdit(null);
          }}
          categories={categories}
          createCategory={createCategory}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
          initialEditCategory={categoryModalInitialEdit}
          initialType={transactionType}
        />
      )}

      {/* Delete Category Confirmation Dialog */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`border rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? "bg-[#121118] border-[#1f1e2b] text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/40">
              <HiExclamationTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold">Delete Category?</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Are you sure you want to delete category{" "}
                <strong className="text-gray-900 dark:text-white">
                  "{categoryToDelete.name}"
                </strong>
                ?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeletingCategory}
                className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isDark
                    ? "text-slate-300 bg-slate-800 hover:bg-slate-700"
                    : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsDeletingCategory(true);
                  const res = await deleteCategory(categoryToDelete.id);
                  setIsDeletingCategory(false);
                  if (res.success) {
                    setCategoryToDelete(null);
                  } else {
                    setCategoryToDelete(null);
                  }
                }}
                disabled={isDeletingCategory}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingCategory ? (
                  <>
                    <HiArrowPath className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation Dialog */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`border rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? "bg-[#121118] border-[#1f1e2b] text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/40">
              <HiTrash className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold">Delete Transaction?</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Are you sure you want to delete this {transactionToDelete.type?.toLowerCase() || "transaction"}? This action cannot be undone.
              </p>
            </div>

            {/* Transaction summary card */}
            <div
              className={`p-3 rounded-xl border text-left flex items-center justify-between gap-3 ${
                isDark
                  ? "bg-[#161522] border-[#232234]"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {transactionToDelete.category}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate mt-0.5">
                  {transactionToDelete.note ||
                    (transactionToDelete.type === "Expense"
                      ? "Expense Entry"
                      : "Income Credit")}
                  {transactionToDelete.date ? ` • ${transactionToDelete.date}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`text-xs sm:text-sm font-extrabold ${
                    transactionToDelete.type === "Expense"
                      ? "text-[#FF6B6B]"
                      : "text-[#10B981]"
                  }`}
                >
                  {transactionToDelete.type === "Expense" ? "-" : "+"}
                  {formatCurrency(transactionToDelete.amount)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setTransactionToDelete(null)}
                disabled={isDeletingTransaction}
                className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isDark
                    ? "text-slate-300 bg-slate-800 hover:bg-slate-700"
                    : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!transactionToDelete) return;
                  setIsDeletingTransaction(true);
                  try {
                    await deleteTransaction(transactionToDelete.id);
                    await loadPaginatedTransactions();
                  } catch (err) {
                    console.error("Failed to delete transaction:", err);
                  } finally {
                    setIsDeletingTransaction(false);
                    setTransactionToDelete(null);
                  }
                }}
                disabled={isDeletingTransaction}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingTransaction ? (
                  <>
                    <HiArrowPath className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Settings Modal */}
      {showThemeModal && (
        <ThemeChange handleClose={() => setShowThemeModal(false)} />
      )}
    </div>
  );
}
