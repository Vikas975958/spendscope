"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import {
  IoChevronBack,
  IoRefreshOutline,
  IoShareOutline,
  IoCopyOutline,
  IoCheckmark,
} from "react-icons/io5";

const CORAL_COLOR = "#f06557";
const GREEN_BTN_COLOR = "#48bb78";
const BLUE_BTN_COLOR = "#2563eb";

const DEFAULT_DENOMINATIONS = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

const CashNoteCounter = () => {
  const router = useRouter();

  // Dynamic Theme Integration
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;

  const primaryColor =
    currentTheme?.colors?.primary ||
    themeState?.colors?.primary ||
    defaultTheme?.colors?.primary ||
    CORAL_COLOR;

  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  // State for standard note counts (object mapping denom -> count string)
  const [counts, setCounts] = useState(() => {
    const initial = {};
    DEFAULT_DENOMINATIONS.forEach((d) => {
      initial[d] = "";
    });
    return initial;
  });

  // State for custom denomination row
  const [customDenom, setCustomDenom] = useState("");
  const [customCount, setCustomCount] = useState("");

  // Feedback states
  const [toastMessage, setToastMessage] = useState("");

  // Update count for a denomination
  const handleCountChange = (denom, value) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setCounts((prev) => ({
      ...prev,
      [denom]: cleaned,
    }));
  };

  // Reset all counts
  const handleReset = () => {
    const reset = {};
    DEFAULT_DENOMINATIONS.forEach((d) => {
      reset[d] = "";
    });
    setCounts(reset);
    setCustomDenom("");
    setCustomCount("");
    showToast("Cleared all notes!");
  };

  // Calculations for totals
  const { totalNotes, totalAmount, rowCalculations } = useMemo(() => {
    let noteSum = 0;
    let amountSum = 0;

    const rows = DEFAULT_DENOMINATIONS.map((denom) => {
      const count = parseInt(counts[denom], 10) || 0;
      const subtotal = denom * count;
      noteSum += count;
      amountSum += subtotal;
      return {
        denom,
        count,
        subtotal,
      };
    });

    // Custom row calculation
    const cDenom = parseInt(customDenom, 10) || 0;
    const cCount = parseInt(customCount, 10) || 0;
    const cSubtotal = cDenom * cCount;
    noteSum += cCount;
    amountSum += cSubtotal;

    return {
      totalNotes: noteSum,
      totalAmount: amountSum,
      rowCalculations: rows,
      customRow: {
        denom: cDenom,
        count: cCount,
        subtotal: cSubtotal,
      },
    };
  }, [counts, customDenom, customCount]);

  // Format currency
  const formatCurrency = (val) => {
    return "₹" + Number(val || 0).toLocaleString("en-IN");
  };

  // Toast feedback helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  // Generate shareable / copyable text
  const generateSummaryText = () => {
    const lines = ["Cash Note Counter Summary:", "-------------------------"];
    rowCalculations.forEach((item) => {
      if (item.count > 0) {
        lines.push(`${item.denom} x ${item.count} = ${formatCurrency(item.subtotal)}`);
      }
    });

    const cDenom = parseInt(customDenom, 10) || 0;
    const cCount = parseInt(customCount, 10) || 0;
    if (cDenom > 0 && cCount > 0) {
      lines.push(`${cDenom} x ${cCount} = ${formatCurrency(cDenom * cCount)}`);
    }

    lines.push("-------------------------");
    lines.push(`Total Notes: ${totalNotes}`);
    lines.push(`Total Amount: ${formatCurrency(totalAmount)}`);
    return lines.join("\n");
  };

  // Handle Copy to clipboard
  const handleCopy = async () => {
    const text = generateSummaryText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showToast("Summary copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Handle Share
  const handleShare = async () => {
    const text = generateSummaryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Cash Note Counter Summary",
          text,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    }

    // Fallback to copy
    handleCopy();
  };

  // Theme styling classes
  const cardBg = isDark ? "bg-[#161522]" : "bg-white";
  const cardBorder = isDark ? "border-[#232234]" : "border-gray-200/80";
  const inputBg = isDark ? "bg-[#212032] border-[#2e2d44]" : "bg-[#f4f5f8] border-gray-200";
  const textColor = isDark ? "text-slate-100" : "text-gray-900";
  const titleColor = isDark ? "text-white" : "text-gray-900";

  return (
    <div className="w-full max-w-[480px] mx-auto pb-16 transition-colors duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between py-2 px-1 mb-2">
        <button
          type="button"
          onClick={() => router.back()}
          style={{ color: primaryColor }}
          className="flex items-center gap-0.5 hover:opacity-80 transition-opacity font-medium text-sm sm:text-base cursor-pointer"
        >
          <IoChevronBack className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h1 className={`text-base sm:text-lg font-bold tracking-tight ${titleColor}`}>
          Note Counter
        </h1>

        {/* Reset Action in top right */}
        <button
          type="button"
          onClick={handleReset}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer flex items-center gap-1 text-xs sm:text-sm font-semibold"
          title="Reset All"
        >
          <IoRefreshOutline className="w-5 h-5" />
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="mb-3 bg-emerald-500 text-white text-xs sm:text-sm py-2 px-4 rounded-xl text-center font-semibold shadow-md animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Top Display Card (Shows Grand Total Amount) */}
      <div
        className={`rounded-2xl border p-6 sm:p-7 shadow-xs flex items-center justify-center mb-4 transition-all ${cardBg} ${cardBorder}`}
      >
        <span
          style={{ color: primaryColor }}
          className="text-3xl sm:text-4xl font-bold tracking-tight text-center select-all"
        >
          {totalAmount === 0 ? "0" : formatCurrency(totalAmount)}
        </span>
      </div>

      {/* Denominations List Card */}
      <div
        className={`rounded-2xl border shadow-xs px-4 py-3 sm:py-4 space-y-3.5 mb-4 ${cardBg} ${cardBorder}`}
      >
        {DEFAULT_DENOMINATIONS.map((denom) => {
          const count = counts[denom];
          const subtotal = (parseInt(count, 10) || 0) * denom;

          return (
            <div
              key={denom}
              className="grid grid-cols-[68px_20px_1fr_20px_84px] items-center text-center gap-1 sm:gap-2"
            >
              {/* Denomination Label */}
              <div className={`text-right font-medium text-sm sm:text-base pr-1 ${textColor}`}>
                {denom}
              </div>

              {/* Multiplier 'X' in coral */}
              <div
                style={{ color: primaryColor }}
                className="font-bold text-xs sm:text-sm text-center select-none"
              >
                X
              </div>

              {/* Note Count Input Box */}
              <div className="flex justify-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={count}
                  onChange={(e) => handleCountChange(denom, e.target.value)}
                  placeholder="0"
                  className={`w-16 sm:w-20 h-9 sm:h-10 text-center rounded-lg border text-sm sm:text-base font-medium outline-none transition-all focus:border-red-400 dark:focus:border-red-500 placeholder-gray-400 dark:placeholder-gray-500 ${inputBg} ${textColor}`}
                />
              </div>

              {/* Equal '=' in coral */}
              <div
                style={{ color: primaryColor }}
                className="font-bold text-xs sm:text-sm text-center select-none"
              >
                =
              </div>

              {/* Row Subtotal */}
              <div className={`text-right font-semibold text-xs sm:text-sm pl-1 ${textColor}`}>
                {formatCurrency(subtotal)}
              </div>
            </div>
          );
        })}

        {/* Custom Editable Denomination Row */}
        <div className="grid grid-cols-[68px_20px_1fr_20px_84px] items-center text-center gap-1 sm:gap-2 pt-1 border-t border-gray-100 dark:border-[#232234]">
          {/* Custom Denomination Input */}
          <div className="flex justify-end pr-1">
            <input
              type="text"
              inputMode="numeric"
              value={customDenom}
              onChange={(e) => setCustomDenom(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              className={`w-14 sm:w-16 h-9 sm:h-10 text-center rounded-lg border text-sm sm:text-base font-medium outline-none transition-all focus:border-red-400 dark:focus:border-red-500 placeholder-gray-400 dark:placeholder-gray-500 ${inputBg} ${textColor}`}
            />
          </div>

          {/* Multiplier 'X' */}
          <div
            style={{ color: primaryColor }}
            className="font-bold text-xs sm:text-sm text-center select-none"
          >
            X
          </div>

          {/* Custom Count Input */}
          <div className="flex justify-center">
            <input
              type="text"
              inputMode="numeric"
              value={customCount}
              onChange={(e) => setCustomCount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              className={`w-16 sm:w-20 h-9 sm:h-10 text-center rounded-lg border text-sm sm:text-base font-medium outline-none transition-all focus:border-red-400 dark:focus:border-red-500 placeholder-gray-400 dark:placeholder-gray-500 ${inputBg} ${textColor}`}
            />
          </div>

          {/* Equal '=' */}
          <div
            style={{ color: primaryColor }}
            className="font-bold text-xs sm:text-sm text-center select-none"
          >
            =
          </div>

          {/* Custom Subtotal */}
          <div className={`text-right font-semibold text-xs sm:text-sm pl-1 ${textColor}`}>
            {formatCurrency(
              (parseInt(customDenom, 10) || 0) * (parseInt(customCount, 10) || 0)
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Total Notes & Action Buttons */}
      <div className="flex flex-col space-y-3">
        {/* Total Note Banner */}
        <div
          style={{ backgroundColor: primaryColor }}
          className="flex items-center justify-between px-5 py-3.5 rounded-xl text-white shadow-md font-semibold text-sm sm:text-base"
        >
          <span>Total Note:</span>
          <span className="text-base sm:text-lg font-bold">{totalNotes}</span>
        </div>

        {/* Copy & Share Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Green Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            style={{ backgroundColor: GREEN_BTN_COLOR }}
            className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm sm:text-base shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-1.5"
          >
            <IoCopyOutline className="w-5 h-5" />
            <span>Copy</span>
          </button>

          {/* Blue Share Button */}
          <button
            type="button"
            onClick={handleShare}
            style={{ backgroundColor: BLUE_BTN_COLOR }}
            className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm sm:text-base shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-1.5"
          >
            <IoShareOutline className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashNoteCounter;
