"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "styled-components";
import { useSelector } from "react-redux";
import { HiChevronDown } from "react-icons/hi2";
import { IoCheckmarkCircle, IoWifi, IoChevronForward } from "react-icons/io5";
import { FaBatteryThreeQuarters } from "react-icons/fa6";
import { SpendScopeLogo } from "@/components/Header";
import { theme as defaultTheme } from "@/utils/theme";

export default function HeroSection() {
  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : reduxTheme;
  const primary = currentTheme?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark";

  return (
    <section
      id="home"
      className="relative pt-6 pb-10 md:pt-8 md:pb-12 lg:pt-10 lg:pb-14 overflow-hidden"
      style={{
        background: isDark
          ? "#0b0f19"
          : `linear-gradient(180deg, ${primary}12 0%, ${primary}05 35%, #FFFFFF 100%)`,
      }}
    >
      {/* Decorative background blobs */}
      <div
        className="absolute top-0 right-[8%] w-[350px] h-[350px] rounded-full opacity-25 pointer-events-none blur-3xl"
        style={{ background: `${primary}30` }}
      />
      <div
        className="absolute bottom-10 left-[3%] w-[250px] h-[250px] rounded-full opacity-15 pointer-events-none blur-2xl"
        style={{ background: `${primary}25` }}
      />
      <div
        className="absolute top-[40%] left-[15%] w-[120px] h-[120px] rounded-full opacity-20 pointer-events-none blur-xl"
        style={{ background: `${primary}20` }}
      />

      <div className="w-full px-4 sm:px-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-center">
          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-4 sm:space-y-5 z-10">
            {/* Breadcrumb pill */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium"
              style={{
                backgroundColor: `${primary}12`,
                color: primary,
              }}
            >
              <span>Your Money</span>
              <span
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: primary }}
              />
              <span>Your Goals</span>
              <span
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: primary }}
              />
              <span>Our Focus</span>
            </div>

            {/* Main Headline */}
            <h1
              className={`text-3xl xs:text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.1] ${
                isDark ? "text-white" : "text-[#1a1a2e]"
              }`}
            >
              Take Control of Your
              <br />
              <span style={{ color: primary }}>Finances, One Expense</span>
              <br />
              at a Time
            </h1>

            {/* Description */}
            <p
              className={`text-sm sm:text-base md:text-lg max-w-lg leading-relaxed ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              SpendScope helps you track your income, manage your expenses and
              balance your budget — all in one simple, beautiful and easy-to-use
              app.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Link
                href="/?modal=signup"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    url.searchParams.set("modal", "signup");
                    window.history.pushState(
                      {},
                      "",
                      url.pathname + url.search
                    );
                    window.dispatchEvent(new Event("popstate"));
                  }
                }}
                style={{ backgroundColor: primary }}
                className="inline-flex items-center gap-2 text-white text-sm sm:text-base font-semibold px-7 py-3.5 rounded-full shadow-lg hover:opacity-90 hover:shadow-xl transition-all duration-200 group"
              >
                <span>Get Started Free</span>
                <span className="group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold px-7 py-3.5 rounded-full border-2 transition-all duration-200 hover:shadow-md"
                style={{ borderColor: primary, color: primary }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: primary }}
                >
                  <svg className="w-2.5 h-2.5 ml-0.5" viewBox="0 0 10 12" fill="currentColor">
                    <polygon points="0,0 10,6 0,12" />
                  </svg>
                </span>
                <span>Watch Demo</span>
              </a>
            </div>

            {/* Trust badges */}
            <div
              className={`flex flex-wrap items-center gap-5 sm:gap-6 pt-3 text-xs sm:text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {[
                "Free to start",
                "No credit card required",
                "Secure & private",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <IoCheckmarkCircle
                    className="w-4 h-4 shrink-0"
                    style={{ color: primary }}
                  />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== RIGHT COLUMN — Phone Mockup ===== */}
          <div className="relative flex items-center justify-center my-1 lg:my-0 px-1 sm:px-8 max-w-full">
            {/* Large organic background blob behind phone */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[400px] h-[440px] sm:h-[540px] rounded-[90px] rotate-[-6deg] opacity-15 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${primary}40, ${primary}10)`,
              }}
            />

            <div className="relative z-20 my-0 sm:my-0">
              {/* ---- Floating: "Manage Expenses →" pill (top-left) ---- */}
              <div
                className="hidden sm:flex absolute -left-6 sm:-left-12 top-2 sm:top-6 z-30 items-center gap-1.5 px-4 py-2 rounded-full text-white text-[11px] sm:text-xs font-semibold shadow-lg animate-[float_3s_ease-in-out_infinite]"
                style={{ backgroundColor: primary }}
              >
                <span>Manage</span>
                <span className="opacity-80">Expenses →</span>
              </div>
              {/* Curved dotted arrow from pill to phone */}
              <svg
                className="hidden sm:block absolute -left-1 sm:left-2 top-12 sm:top-14 w-10 h-12 z-30 opacity-40"
                viewBox="0 0 50 60"
                fill="none"
              >
                <path
                  d="M5 5 C 20 5, 40 20, 38 50"
                  stroke={primary}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  fill="none"
                />
                <polygon points="35,47 41,53 41,45" fill={primary} />
              </svg>

              {/* ---- Floating: "Track Income" card (left-middle) ---- */}
              <div
                className={`hidden md:flex absolute -left-8 sm:-left-14 top-[43%] z-30 items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-2xl shadow-xl border animate-[float_4s_ease-in-out_0.5s_infinite] ${
                  isDark
                    ? "bg-[#1e293b] border-slate-700"
                    : "bg-white border-gray-100/80"
                }`}
              >
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primary}15` }}
                >
                  <div className="flex items-end gap-[3px] h-4 sm:h-5">
                    <div
                      className="w-[4px] sm:w-[5px] h-2 sm:h-2.5 rounded-sm opacity-50"
                      style={{ backgroundColor: primary }}
                    />
                    <div
                      className="w-[4px] sm:w-[5px] h-3 sm:h-[15px] rounded-sm opacity-75"
                      style={{ backgroundColor: primary }}
                    />
                    <div
                      className="w-[4px] sm:w-[5px] h-4 sm:h-5 rounded-sm"
                      style={{ backgroundColor: primary }}
                    />
                  </div>
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold leading-tight ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Track
                  <br />
                  Income
                </span>
              </div>

              {/* ---- Floating: "Simple Smart Powerful" (top-right) ---- */}
              <div className="hidden sm:block absolute -right-2 sm:-right-8 top-0 sm:top-4 z-30 text-right">
                <p
                  className="font-cursive leading-snug"
                  style={{
                    color: primary,
                    fontSize: "16px",
                    fontStyle: "italic",
                  }}
                >
                  Simple
                  <br />
                  Smart
                  <br />
                  Powerful
                </p>
                <svg
                  className="w-6 h-8 ml-auto opacity-40 mt-0.5"
                  viewBox="0 0 28 40"
                  fill="none"
                >
                  <path
                    d="M22 3 C 16 12, 10 20, 6 36"
                    stroke={primary}
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="3 2"
                  />
                  <polygon points="3,33 9,38 9,30" fill={primary} />
                </svg>
              </div>

              {/* ---- Floating: "Set Budgets" (right-middle) ---- */}
              <div className="hidden sm:block absolute -right-4 sm:-right-10 top-[40%] z-30">
                <svg
                  className="w-5 h-7 opacity-40 mb-0.5 ml-1"
                  viewBox="0 0 24 32"
                  fill="none"
                >
                  <path
                    d="M20 3 C 14 10, 8 16, 4 28"
                    stroke={primary}
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="3 2"
                  />
                  <polygon points="2,26 6,30 7,24" fill={primary} />
                </svg>
                <p
                  className="font-cursive leading-snug"
                  style={{
                    color: primary,
                    fontSize: "16px",
                    fontStyle: "italic",
                  }}
                >
                  Set
                  <br />
                  Budgets
                </p>
              </div>

              {/* ---- Floating: "See Insights" (bottom-right) ---- */}
              <div className="hidden sm:block absolute -right-2 sm:-right-8 bottom-16 sm:bottom-20 z-30">
                <svg
                  className="w-6 h-8 opacity-40 mb-0.5"
                  viewBox="0 0 32 40"
                  fill="none"
                >
                  <path
                    d="M28 5 C 22 14, 14 22, 6 34"
                    stroke={primary}
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="3 2"
                  />
                  <polygon points="3,31 9,36 8,28" fill={primary} />
                </svg>
                <p
                  className="font-cursive leading-snug"
                  style={{
                    color: primary,
                    fontSize: "16px",
                    fontStyle: "italic",
                  }}
                >
                  See
                  <br />
                  Insights
                </p>
              </div>

              {/* ======== Phone Chassis ======== */}
              <div className="w-[260px] xs:w-[280px] sm:w-[305px] max-w-[calc(100vw-32px)] bg-[#1A1D20] p-[6px] sm:p-[8px] rounded-[36px] sm:rounded-[44px] shadow-[0_25px_50px_rgba(0,0,0,0.25)] border-[3px] border-[#2A2E35] relative">
                {/* Screen Body */}
                <div className="bg-[#FAF9F8] rounded-[36px] overflow-hidden flex flex-col h-[575px] sm:h-[590px] border border-gray-100 select-none text-gray-900">
                  {/* Dynamic Island */}
                  <div className="pt-2.5 pb-1 flex justify-center">
                    <div className="w-[76px] h-[22px] bg-black rounded-full flex items-center justify-end px-2.5">
                      <div className="w-[7px] h-[7px] rounded-full bg-[#2A2E35]" />
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="px-5 py-0.5 flex items-center justify-between text-[10px] font-semibold text-gray-700">
                    <span>12:26</span>
                    <div className="flex items-center gap-1">
                      <IoWifi className="w-3 h-3" />
                      <FaBatteryThreeQuarters className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* App Header Row */}
                  <div className="px-4 pt-2 pb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <SpendScopeLogo className="w-5 h-5" color={primary} />
                      <span className="text-[11px] font-bold tracking-tight">
                        <span style={{ color: primary }}>Spend</span>
                        <span className="text-gray-800">Scope</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-0.5 bg-gray-100 px-2 py-[3px] rounded-md text-[10px] font-medium text-gray-600">
                        Sep 2026
                        <HiChevronDown className="w-2.5 h-2.5 text-gray-400" />
                      </button>
                      <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 text-[8px] font-bold text-white flex items-center justify-center shadow-sm">
                        SS
                      </div>
                    </div>
                  </div>

                  {/* Total Balance Card */}
                  <div className="px-3.5 pt-2.5">
                    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500 font-medium">
                          Total Balance
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-[2px] rounded-full bg-emerald-50 text-emerald-600">
                          ↑ 12%
                        </span>
                      </div>
                      <p className="text-[22px] font-bold text-gray-900 tracking-tight">
                        ₹12,450.00
                      </p>
                    </div>
                  </div>

                  {/* Monthly Overview Card */}
                  <div className="px-3.5 pt-2.5">
                    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                      <h3 className="text-[11px] font-bold text-gray-800 mb-2.5">
                        Monthly Overview
                      </h3>
                      <div className="space-y-2">
                        {/* Income */}
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-[6px] h-[6px] rounded-full bg-emerald-500 inline-block" />
                            <span className="text-gray-600 font-medium">
                              Income
                            </span>
                          </div>
                          <span className="font-semibold text-gray-800">
                            ₹25,000.00
                          </span>
                        </div>
                        {/* Expense */}
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-[6px] h-[6px] rounded-full inline-block"
                              style={{ backgroundColor: primary }}
                            />
                            <span className="text-gray-600 font-medium">
                              Expense
                            </span>
                          </div>
                          <span
                            className="font-semibold"
                            style={{ color: primary }}
                          >
                            ₹12,550.00
                          </span>
                        </div>
                        {/* Balance */}
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-[6px] h-[6px] rounded-full bg-blue-500 inline-block" />
                            <span className="text-gray-600 font-medium">
                              Balance
                            </span>
                          </div>
                          <span className="font-semibold text-gray-800">
                            ₹12,450.00
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="px-3.5 pt-3 flex-1">
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-[11px] font-bold text-gray-800">
                        Recent Transactions
                      </h3>
                      <span
                        className="text-[9px] font-semibold flex items-center gap-0.5"
                        style={{ color: primary }}
                      >
                        View All <IoChevronForward className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {/* Groceries */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px]"
                            style={{ backgroundColor: `${primary}12` }}
                          >
                            🛒
                          </div>
                          <span className="text-[10px] font-medium text-gray-700">
                            Groceries
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: primary }}
                        >
                          -₹2,450
                        </span>
                      </div>
                      {/* Salary */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] bg-emerald-50">
                            💰
                          </div>
                          <span className="text-[10px] font-medium text-gray-700">
                            Salary
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600">
                          +₹25,000
                        </span>
                      </div>
                      {/* Transport */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px]"
                            style={{ backgroundColor: `${primary}12` }}
                          >
                            🚌
                          </div>
                          <span className="text-[10px] font-medium text-gray-700">
                            Transport
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: primary }}
                        >
                          -₹850
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation Bar */}
                  <div className="bg-white border-t border-gray-100 px-3 py-2 grid grid-cols-4 text-center mt-auto">
                    <div
                      className="flex flex-col items-center gap-[2px]"
                      style={{ color: primary }}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1a1 1 0 0 0 .7-1.7l-9-9a1 1 0 0 0-1.4 0l-9 9A1 1 0 0 0 3 13z" />
                      </svg>
                      <span className="text-[8px] font-semibold">Home</span>
                    </div>
                    <div className="flex flex-col items-center gap-[2px] text-gray-400">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 20V10M12 20V4M6 20v-6" />
                      </svg>
                      <span className="text-[8px]">Stats</span>
                    </div>
                    <div className="flex flex-col items-center gap-[2px] text-gray-400">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                      <span className="text-[8px]">Budget</span>
                    </div>
                    <div className="flex flex-col items-center gap-[2px] text-gray-400">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                      <span className="text-[8px]">Settings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone ground shadow */}
              <div className="w-[80%] h-5 bg-black/10 rounded-full filter blur-lg mx-auto -mt-2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Float animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </section>
  );
}
