"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import {
  HiOutlineSparkles,
  HiOutlineCreditCard,
  HiOutlineArrowTrendingUp,
  HiOutlineInformationCircle,
  HiOutlineArrowUpRight,
  HiXMark,
  HiOutlineShieldCheck,
  HiOutlineBolt,
  HiOutlineBanknotes,
} from "react-icons/hi2";
import { theme as defaultTheme } from "@/utils/theme";

export function SideAdvertisement({ side = "left" }) {
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;
  const primaryColor =
    currentTheme?.colors?.primary ||
    themeState?.colors?.primary ||
    defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  const [dismissedAds, setDismissedAds] = useState({});

  const handleDismiss = (id) => {
    setDismissedAds((prev) => ({ ...prev, [id]: true }));
  };

  if (side === "left") {
    return (
      <aside className="w-full flex flex-col gap-4 py-2 select-none">
        {/* SPONSORED HEADER BADGE */}
        <div className="flex items-center justify-between px-1 text-[11px] font-semibold tracking-wider uppercase text-gray-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sponsored
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#181724] border border-gray-200/60 dark:border-[#232234]">
            Ad
          </span>
        </div>

        {/* AD 1: HIGH-YIELD SAVINGS / WEALTH */}
        {!dismissedAds["ad-left-1"] && (
          <div
            className={`relative rounded-2xl p-3.5 border transition-all duration-300 group hover:shadow-md ${
              isDark
                ? "bg-gradient-to-b from-[#14131f] to-[#0f0e18] border-[#222033] hover:border-[#35334e]"
                : "bg-gradient-to-b from-white to-gray-50/80 border-gray-200/90 hover:border-gray-300"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => handleDismiss("ad-left-1")}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1f1e2f] transition-colors cursor-pointer"
              title="Hide ad"
            >
              <HiXMark className="w-3.5 h-3.5" />
            </button>

            {/* Badge */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
              <HiOutlineArrowTrendingUp className="w-3 h-3" />
              <span>5.45% APY</span>
            </div>

            <h4
              className={`text-xs font-bold leading-snug ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Apex High-Yield Cash Account
            </h4>
            <p
              className={`text-[11px] leading-relaxed mt-1 mb-3 ${
                isDark ? "text-slate-400" : "text-gray-500"
              }`}
            >
              Maximize idle funds with FDIC insurance up to $2M. No fees or
              minimums.
            </p>

            <a
              href="#sponsored"
              onClick={(e) => e.preventDefault()}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Open Account</span>
              <HiOutlineArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-1.5 mt-2.5 text-[9.5px] text-gray-400 dark:text-slate-500">
              <HiOutlineShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>FDIC-Insured Partner Banks</span>
            </div>
          </div>
        )}

        {/* AD 2: TAX & AI ANALYTICS TOOL */}
        {!dismissedAds["ad-left-2"] && (
          <div
            className={`relative rounded-2xl p-3.5 border transition-all duration-300 group hover:shadow-md ${
              isDark
                ? "bg-[#12111b] border-[#1f1e2c] hover:border-[#2d2a40]"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <button
              onClick={() => handleDismiss("ad-left-2")}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1f1e2f] transition-colors cursor-pointer"
              title="Hide ad"
            >
              <HiXMark className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <HiOutlineSparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block leading-none">
                  AI Tax Engine
                </span>
                <span
                  className={`text-xs font-bold leading-tight ${isDark ? "text-slate-200" : "text-gray-800"}`}
                >
                  TaxHarvester Pro
                </span>
              </div>
            </div>

            <p
              className={`text-[11px] leading-relaxed mb-3 ${
                isDark ? "text-slate-400" : "text-gray-500"
              }`}
            >
              Automatically identify write-offs & save an average of $3,200
              yearly.
            </p>

            <button
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isDark
                  ? "border-[#2b293d] bg-[#171624] text-slate-200 hover:bg-[#201f31]"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Explore Free Trial
            </button>
          </div>
        )}

        {/* SKYSCRAPER BANNER SLOT */}
        <div
          className={`rounded-2xl p-4 border border-dashed text-center flex flex-col items-center justify-center min-h-[140px] ${
            isDark
              ? "border-[#232233] bg-[#0d0c14]/60 text-slate-500"
              : "border-gray-300 bg-gray-50/50 text-gray-400"
          }`}
        >
          <span className="text-[10px] uppercase tracking-widest font-semibold">
            Advertisement
          </span>
          <span className="text-[11px] mt-1 font-medium max-w-[140px]">
            Display Space (160x600 Skyscraper)
          </span>
        </div>
      </aside>
    );
  }

  // RIGHT SIDE ADVERTISEMENT
  return (
    <aside className="w-full flex flex-col gap-4 py-2 select-none">
      {/* SPONSORED HEADER BADGE */}
      <div className="flex items-center justify-between px-1 text-[11px] font-semibold tracking-wider uppercase text-gray-400 dark:text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Featured Partner
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#181724] border border-gray-200/60 dark:border-[#232234]">
          Ad
        </span>
      </div>

      {/* AD 1: BLACK CORPORATE CREDIT CARD */}
      {!dismissedAds["ad-right-1"] && (
        <div
          className={`relative rounded-2xl p-3.5 border transition-all duration-300 group hover:shadow-md ${
            isDark
              ? "bg-gradient-to-b from-[#14131f] to-[#0f0e18] border-[#222033] hover:border-[#35334e]"
              : "bg-gradient-to-b from-white to-gray-50/80 border-gray-200/90 hover:border-gray-300"
          }`}
        >
          <button
            onClick={() => handleDismiss("ad-right-1")}
            className="absolute top-2.5 right-2.5 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1f1e2f] transition-colors cursor-pointer"
            title="Hide ad"
          >
            <HiXMark className="w-3.5 h-3.5" />
          </button>

          {/* Mini Card Graphic */}
          <div
            className="w-full h-24 rounded-xl p-3 text-white flex flex-col justify-between mb-3 shadow-md relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
            }}
          >
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[9px] font-bold tracking-widest uppercase opacity-80">
                Titanium Card
              </span>
              <HiOutlineBolt className="w-4 h-4 text-amber-300" />
            </div>
            <div className="relative z-10">
              <span className="text-xs font-mono tracking-wider font-semibold">
                •••• 8824
              </span>
              <div className="flex items-center justify-between mt-1 text-[9px] opacity-90 font-medium">
                <span>0% INTRO APR</span>
                <span className="text-emerald-300 font-bold">3.5% CASHBACK</span>
              </div>
            </div>
          </div>

          <h4
            className={`text-xs font-bold leading-snug ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Titanium Business Card
          </h4>
          <p
            className={`text-[11px] leading-relaxed mt-1 mb-3 ${
              isDark ? "text-slate-400" : "text-gray-500"
            }`}
          >
            $300 welcome bonus after $1,500 spend in the first 90 days.
          </p>

          <a
            href="#sponsored"
            onClick={(e) => e.preventDefault()}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <span>Apply in 2 Mins</span>
            <HiOutlineArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* AD 2: GLOBAL INSTANT TRANSFERS */}
      {!dismissedAds["ad-right-2"] && (
        <div
          className={`relative rounded-2xl p-3.5 border transition-all duration-300 group hover:shadow-md ${
            isDark
              ? "bg-[#12111b] border-[#1f1e2c] hover:border-[#2d2a40]"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <button
            onClick={() => handleDismiss("ad-right-2")}
            className="absolute top-2.5 right-2.5 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#1f1e2f] transition-colors cursor-pointer"
            title="Hide ad"
          >
            <HiXMark className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <HiOutlineBanknotes className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block leading-none">
                Global Payments
              </span>
              <span
                className={`text-xs font-bold leading-tight ${isDark ? "text-slate-200" : "text-gray-800"}`}
              >
                Zero-Fee Wire
              </span>
            </div>
          </div>

          <p
            className={`text-[11px] leading-relaxed mb-3 ${
              isDark ? "text-slate-400" : "text-gray-500"
            }`}
          >
            Send over 40+ currencies at true mid-market exchange rates.
          </p>

          <button
            className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              isDark
                ? "border-[#2b293d] bg-[#171624] text-slate-200 hover:bg-[#201f31]"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Compare Rates
          </button>
        </div>
      )}

      {/* SKYSCRAPER BANNER SLOT */}
      <div
        className={`rounded-2xl p-4 border border-dashed text-center flex flex-col items-center justify-center min-h-[140px] ${
          isDark
            ? "border-[#232233] bg-[#0d0c14]/60 text-slate-500"
            : "border-gray-300 bg-gray-50/50 text-gray-400"
        }`}
      >
        <span className="text-[10px] uppercase tracking-widest font-semibold">
          Sponsor Unit
        </span>
        <span className="text-[11px] mt-1 font-medium max-w-[140px]">
          Targeted Placement (160x600)
        </span>
      </div>
    </aside>
  );
}
