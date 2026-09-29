"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { theme as defaultTheme } from "@/utils/theme";
import {
  HiMagnifyingGlass,
  HiXMark,
  HiCalculator,
  HiBuildingLibrary,
  HiArrowTrendingUp,
  HiReceiptPercent,
  HiCurrencyDollar,
  HiSquares2X2,
} from "react-icons/hi2";
import {
  BsCalculatorFill,
  BsCreditCard2FrontFill,
  BsBank,
  BsPiggyBankFill,
  BsCashStack,
  BsReceipt,
  BsTagsFill,
  BsArrowRepeat,
  BsFileEarmarkTextFill,
  BsBarChartLineFill,
  BsFileCheckFill,
  BsCurrencyExchange,
  BsSafe2Fill,
  BsPercent,
  BsGraphUpArrow,
  BsTranslate,
  BsCheckCircleFill,
  BsHourglassSplit,
} from "react-icons/bs";

// Visual illustration badges for each calculator type
const CalculatorIllustration = ({ type, id }) => {
  switch (id) {
    // === EMI ===
    case "emi-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 dark:from-red-950/40 dark:to-rose-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-8 h-10 rounded-lg bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex flex-col items-center p-1 justify-between">
            <div className="w-6 h-2 rounded bg-rose-500/20 dark:bg-rose-500/40" />
            <div className="grid grid-cols-2 gap-0.5 w-full">
              <span className="w-2.5 h-1.5 rounded-xs bg-rose-400 dark:bg-rose-500" />
              <span className="w-2.5 h-1.5 rounded-xs bg-rose-300 dark:bg-rose-600" />
              <span className="w-2.5 h-1.5 rounded-xs bg-slate-300 dark:bg-slate-600" />
              <span className="w-2.5 h-1.5 rounded-xs bg-rose-500 text-[6px] text-white font-bold flex items-center justify-center">
                =
              </span>
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs text-[10px]">
            <BsCalculatorFill className="w-3 h-3" />
          </span>
        </div>
      );

    case "quick-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-rose-100 dark:from-orange-950/40 dark:to-rose-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-orange-200 dark:border-orange-900/50 flex items-center justify-center">
            <BsHourglassSplit className="w-5 h-5 text-orange-500" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold">
            ⚡
          </span>
        </div>
      );

    case "emi-in-advance":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/40 dark:to-pink-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-10 h-6 rounded-md bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-xs p-1 flex flex-col justify-between">
            <div className="w-2 h-1.5 rounded-xs bg-yellow-300" />
            <span className="text-[6px] tracking-tighter font-mono">•••• 4892</span>
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <BsCashStack className="w-3 h-3" />
          </span>
        </div>
      );

    case "compare-loans":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/40 dark:to-rose-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="relative flex items-center justify-center">
            <div className="w-7 h-9 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs -mr-2 z-0 opacity-75 flex flex-col p-1 gap-1">
              <div className="w-full h-1 bg-slate-300 rounded" />
              <div className="w-3/4 h-1 bg-slate-200 rounded" />
            </div>
            <div className="w-8 h-10 rounded-md bg-rose-500 text-white shadow-xs z-10 flex flex-col p-1 gap-1">
              <div className="w-full h-1 bg-white/70 rounded" />
              <div className="w-2/3 h-1 bg-white/50 rounded" />
              <div className="mt-auto self-center text-[7px] font-bold">VS</div>
            </div>
          </div>
        </div>
      );

    // === BANKING ===
    case "fd-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/40 dark:to-pink-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500">
            <BsPiggyBankFill className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[8px] font-black">
            ₹
          </span>
        </div>
      );

    case "rd-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950/40 dark:to-rose-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-pink-200 dark:border-pink-900/50 flex items-center justify-center text-pink-500">
            <BsArrowRepeat className="w-5 h-5" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px] font-bold">
            M
          </span>
        </div>
      );

    case "ppf-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950/40 dark:to-orange-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-500">
            <BsSafe2Fill className="w-5 h-5" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px]">
            <BsCheckCircleFill className="w-3 h-3" />
          </span>
        </div>
      );

    case "interest-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950/40 dark:to-red-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500">
            <BsPercent className="w-6 h-6 stroke-1" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold">
            %
          </span>
        </div>
      );

    case "inflation-impact":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-100 dark:from-amber-950/40 dark:to-rose-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-rose-500">
            <BsGraphUpArrow className="w-5 h-5 text-rose-600" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] font-bold">
            📈
          </span>
        </div>
      );

    // === SIP ===
    case "sip-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-emerald-50 dark:from-rose-950/40 dark:to-emerald-950/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500">
            <BsBarChartLineFill className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">
            +
          </span>
        </div>
      );

    case "swp-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-sky-100 dark:from-rose-950/40 dark:to-sky-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500">
            <BsCashStack className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold">
            ↓
          </span>
        </div>
      );

    case "stp-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-indigo-100 dark:from-rose-950/40 dark:to-indigo-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-indigo-500">
            <BsArrowRepeat className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px] font-bold">
            ⇄
          </span>
        </div>
      );

    case "step-up-sip":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-100 dark:from-rose-950/40 dark:to-amber-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <BsGraphUpArrow className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold">
            ▲
          </span>
        </div>
      );

    case "sip-with-inflation":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/40 dark:to-rose-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500">
            <BsPiggyBankFill className="w-5 h-5 text-rose-500" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[7px] font-bold">
            %
          </span>
        </div>
      );

    // === GST & VAT ===
    case "gst-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950/40 dark:to-red-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500">
            <BsReceipt className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px] font-bold">
            GST
          </span>
        </div>
      );

    case "vat-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-100 dark:from-rose-950/40 dark:to-orange-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-orange-200 dark:border-orange-900/50 flex items-center justify-center text-orange-500">
            <BsFileEarmarkTextFill className="w-5 h-5" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[7px] font-bold">
            VAT
          </span>
        </div>
      );

    // === LOAN ===
    case "loan-profile":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950/40 dark:to-red-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500">
            <BsFileCheckFill className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px]">
            📋
          </span>
        </div>
      );

    case "pre-payment-roi-change":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/40 dark:to-pink-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500">
            <BsCreditCard2FrontFill className="w-5 h-5" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px] font-bold">
            ROI
          </span>
        </div>
      );

    case "moratorium-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-100 dark:from-rose-950/40 dark:to-amber-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <BsHourglassSplit className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px]">
            ⏸
          </span>
        </div>
      );

    case "loan-eligible-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-emerald-100 dark:from-rose-950/40 dark:to-emerald-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BsBank className="w-5 h-5" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px]">
            <BsCheckCircleFill className="w-3 h-3" />
          </span>
        </div>
      );

    // === OTHER ===
    case "cash-note-counter":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-emerald-100 dark:from-rose-950/40 dark:to-emerald-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BsCashStack className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px] font-bold">
            123
          </span>
        </div>
      );

    case "amount-to-word":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-sky-100 dark:from-rose-950/40 dark:to-sky-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-sky-200 dark:border-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <BsTranslate className="w-5 h-5" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px] font-bold">
            Abc
          </span>
        </div>
      );

    case "discount-calculator":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950/40 dark:to-red-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500">
            <BsTagsFill className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px] font-bold">
            %
          </span>
        </div>
      );

    case "currency-converter":
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-indigo-100 dark:from-rose-950/40 dark:to-indigo-900/30 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center text-indigo-500">
            <BsCurrencyExchange className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[8px] font-black">
            $
          </span>
        </div>
      );

    default:
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
          <BsCalculatorFill className="w-5 h-5" />
        </div>
      );
  }
};

const CalculatorsMPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Theme support
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;
  const primaryColor =
    currentTheme?.colors?.primary ||
    themeState?.colors?.primary ||
    defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  // Structured calculations array with categories matching the images
  const calculations = [
    {
      category: "EMI",
      type: "emi",
      icon: HiCalculator,
      items: [
        {
          id: "emi-calculator",
          title: "EMI Calculator",
          icon: <BsCalculatorFill />,
          type: "emi",
        },
        {
          id: "quick-calculator",
          title: "Quick Calculator",
          icon: <BsHourglassSplit />,
          type: "emi",
        },
        {
          id: "emi-in-advance",
          title: "EMI in Advance",
          icon: <BsCreditCard2FrontFill />,
          type: "emi",
        },
        {
          id: "compare-loans",
          title: "Compare Loans",
          icon: <BsFileCheckFill />,
          type: "emi",
        },
      ],
    },
    {
      category: "Banking",
      type: "banking",
      icon: HiBuildingLibrary,
      items: [
        {
          id: "fd-calculator",
          title: "FD Calculator",
          icon: <BsPiggyBankFill />,
          type: "banking",
        },
        {
          id: "rd-calculator",
          title: "RD Calculator",
          icon: <BsArrowRepeat />,
          type: "banking",
        },
        {
          id: "ppf-calculator",
          title: "PPF Calculator",
          icon: <BsSafe2Fill />,
          type: "banking",
        },
        {
          id: "interest-calculator",
          title: "Interest Calculator",
          icon: <BsPercent />,
          type: "banking",
        },
        {
          id: "inflation-impact",
          title: "Inflation Impact",
          icon: <BsGraphUpArrow />,
          type: "banking",
        },
      ],
    },
    {
      category: "SIP",
      type: "sip",
      icon: HiArrowTrendingUp,
      items: [
        {
          id: "sip-calculator",
          title: "SIP Calculator",
          icon: <BsBarChartLineFill />,
          type: "sip",
        },
        {
          id: "swp-calculator",
          title: "SWP Calculator",
          icon: <BsCashStack />,
          type: "sip",
        },
        {
          id: "stp-calculator",
          title: "STP Calculator",
          icon: <BsArrowRepeat />,
          type: "sip",
        },
        {
          id: "step-up-sip",
          title: "Step-Up SIP",
          icon: <BsGraphUpArrow />,
          type: "sip",
        },
        {
          id: "sip-with-inflation",
          title: "SIP With Inflation",
          icon: <BsPiggyBankFill />,
          type: "sip",
        },
      ],
    },
    {
      category: "GST & VAT",
      type: "gst-vat",
      icon: HiReceiptPercent,
      items: [
        {
          id: "gst-calculator",
          title: "GST Calculator",
          icon: <BsReceipt />,
          type: "gst-vat",
        },
        {
          id: "vat-calculator",
          title: "VAT Calculator",
          icon: <BsFileEarmarkTextFill />,
          type: "gst-vat",
        },
      ],
    },
    // {
    //   category: "Loan",
    //   type: "loan",
    //   icon: HiCurrencyDollar,
    //   items: [
    //     {
    //       id: "loan-profile",
    //       title: "Loan Profile",
    //       icon: <BsFileCheckFill />,
    //       type: "loan",
    //     },
    //     {
    //       id: "pre-payment-roi-change",
    //       title: "Pre Payment/ ROI Change",
    //       icon: <BsCreditCard2FrontFill />,
    //       type: "loan",
    //     },
    //     {
    //       id: "moratorium-calculator",
    //       title: "Moratorium Calculator",
    //       icon: <BsHourglassSplit />,
    //       type: "loan",
    //     },
    //     {
    //       id: "loan-eligible-calculator",
    //       title: "Loan Eligible Calculator",
    //       icon: <BsBank />,
    //       type: "loan",
    //     },
    //   ],
    // },
    {
      category: "Other",
      type: "other",
      icon: HiSquares2X2,
      items: [
        {
          id: "cash-note-counter",
          title: "Cash Note Counter",
          icon: <BsCashStack />,
          type: "other",
        },
        {
          id: "amount-to-word",
          title: "Amount To Word",
          icon: <BsTranslate />,
          type: "other",
        },
        {
          id: "discount-calculator",
          title: "Discount Calculator",
          icon: <BsTagsFill />,
          type: "other",
        },
        {
          id: "currency-converter",
          title: "Currency Converter",
          icon: <BsCurrencyExchange />,
          type: "other",
        },
      ],
    },
  ];

  // Search filter
  const filteredCalculations = calculations
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-200 ${
        isDark ? "bg-[#0b0a10] text-slate-100" : "bg-[#f4f5f9] text-gray-900"
      }`}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Calculators
          </h1>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search calculators..."
              className={`w-full pl-10 pr-9 py-2 rounded-2xl text-xs sm:text-sm border transition-all focus:outline-none ${
                isDark
                  ? "bg-[#161522] border-[#232234] text-white focus:border-slate-400"
                  : "bg-white border-gray-200 text-gray-900 focus:border-gray-400 shadow-xs"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories & Calculators Flex */}
        <div className="flex flex-col space-y-6">
          {filteredCalculations.map((cat) => (
            <div key={cat.category} className="flex flex-col space-y-3">
              {/* Category Title */}
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white px-0.5">
                {cat.category}
              </h2>

              {/* Flex Layout for Cards */}
              <div className="flex flex-wrap gap-2.5 sm:gap-4 items-stretch">
                {cat.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/calculators-m/calculating?type=${item.id}&category=${item.type}`}
                    className={`group relative rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center transition-all duration-200 border cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] w-[calc(33.333%-7px)] sm:w-[130px] md:w-[140px] aspect-square sm:aspect-auto sm:min-h-[145px] ${
                      isDark
                        ? "bg-[#161522] border-[#232234] hover:border-slate-700 shadow-black/20"
                        : "bg-white border-gray-100 hover:border-gray-200 shadow-xs"
                    }`}
                  >
                    {/* Illustration Icon */}
                    <div className="mb-2.5 flex items-center justify-center shrink-0">
                      <CalculatorIllustration type={item.type} id={item.id} />
                    </div>

                    {/* Calculator Title */}
                    <span className="text-[11px] sm:text-xs font-semibold leading-tight text-gray-800 dark:text-slate-100 line-clamp-2 px-0.5">
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {filteredCalculations.length === 0 && (
            <div
              className={`p-8 text-center rounded-2xl border ${
                isDark
                  ? "bg-[#161522] border-[#232234] text-slate-400"
                  : "bg-white border-gray-100 text-gray-500 shadow-xs"
              }`}
            >
              <p className="text-sm font-medium">
                No calculators found for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorsMPage;
