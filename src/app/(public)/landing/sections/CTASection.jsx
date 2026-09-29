"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "styled-components";
import { useSelector } from "react-redux";
import { SpendScopeLogo } from "@/components/Header";
import { theme as defaultTheme } from "@/utils/theme";

export default function CTASection() {
  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : reduxTheme;
  const primary = currentTheme?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark";

  return (
    <section
      id="about"
      className={`py-6 md:py-10 transition-colors duration-200 ${
        isDark ? "bg-[#0b0f19]" : "bg-white"
      }`}
    >
      <div className="w-full px-4 sm:px-[80px]">
        <div
          className="relative overflow-hidden rounded-[24px] sm:rounded-[32px]"
          style={{
            background: `linear-gradient(135deg, ${primary}, ${primary}e8, ${primary}cc)`,
            boxShadow: `0 24px 48px -12px ${primary}50`,
          }}
        >
          {/* Decorative background waves */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg
              className="absolute left-0 bottom-0 w-full h-full opacity-15"
              viewBox="0 0 1200 400"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0,220 C200,320 400,100 650,260 C900,420 1050,150 1200,280 L1200,400 L0,400 Z"
                fill="white"
              />
            </svg>
            <svg
              className="absolute left-0 bottom-0 w-full h-full opacity-10"
              viewBox="0 0 1200 400"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0,160 C300,80 500,340 800,190 C1000,90 1100,220 1200,170 L1200,400 L0,400 Z"
                fill="white"
              />
            </svg>
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-white/8 blur-2xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8 md:p-10 items-center">
            {/* ===== LEFT COLUMN ===== */}
            <div className="relative z-10">
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.15em] uppercase block mb-3 text-white/80">
                YOUR FINANCIAL JOURNEY
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-[36px] font-extrabold text-white tracking-tight leading-tight mb-4">
                Start Building
                <br />
                A Brighter Financial Future
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6 max-w-md">
                Join thousands of users who are already taking control of their
                money with SpendScope.
              </p>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    url.searchParams.set("modal", "signup");
                    window.history.pushState(
                      {},
                      "",
                      url.pathname + url.search
                    );
                    window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: "signup" }));
                  }
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-full border-2 border-white/60 text-white hover:bg-white/15 transition-all duration-200 group cursor-pointer"
              >
                <span>Get Started Free</span>
                <span className="group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </button>

              {/* Stats Row */}
              <div className="flex items-center gap-6 sm:gap-10 mt-6 pt-4 border-t border-white/20">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    10K+
                  </p>
                  <span className="text-[10px] sm:text-[11px] text-white/65 font-medium">
                    Happy Users
                  </span>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    4.8/5
                  </p>
                  <span className="text-[10px] sm:text-[11px] text-white/65 font-medium">
                    App Rating
                  </span>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    100%
                  </p>
                  <span className="text-[10px] sm:text-[11px] text-white/65 font-medium">
                    Secure & Private
                  </span>
                </div>
              </div>
            </div>

            {/* ===== RIGHT COLUMN — Dashboard Mockup ===== */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Floating "Better Choices Bigger Goals" sticker */}
              <div className="absolute -right-2 sm:right-0 -top-4 sm:-top-2 z-30 rotate-[10deg]">
                <p
                  className="font-cursive text-lg sm:text-xl font-bold leading-tight text-white/90"
                  style={{ fontStyle: "italic" }}
                >
                  Better
                  <br />
                  Choices
                  <br />
                  Bigger
                  <br />
                  Goals
                </p>
              </div>

              {/* Browser Window Mockup */}
              <div
                className={`rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl w-full max-w-[420px] border ${
                  isDark ? "border-slate-600" : "border-white/20"
                }`}
              >
                {/* Browser Chrome Bar */}
                <div
                  className={`px-4 py-2.5 flex items-center gap-3 ${
                    isDark ? "bg-slate-800" : "bg-gray-100"
                  }`}
                >
                  <div className="flex gap-1.5">
                    <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
                    <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
                    <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
                  </div>
                  <div
                    className={`flex-1 rounded-md px-3 py-1 text-[10px] ml-1 ${
                      isDark
                        ? "bg-slate-700 text-gray-400"
                        : "bg-white text-gray-400"
                    }`}
                  >
                    spendscope.app/dashboard
                  </div>
                </div>

                {/* Dashboard Content */}
                <div
                  className={`p-4 sm:p-5 ${
                    isDark ? "bg-[#08070b]" : "bg-gray-50"
                  }`}
                >
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <SpendScopeLogo
                        className="w-4 h-4"
                        color={primary}
                      />
                      <span
                        className={`text-[10px] font-bold ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Monthly Overview
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-medium ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Sep 2026
                    </span>
                  </div>

                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div
                      className={`rounded-lg p-2.5 text-center border ${
                        isDark
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      <span
                        className={`text-[8px] sm:text-[9px] font-medium block mb-0.5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Total Income
                      </span>
                      <p
                        className={`text-[11px] sm:text-xs font-bold ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        ₹25,000
                      </p>
                      <span className="text-[8px] text-emerald-500 font-medium">
                        ↑ 8%
                      </span>
                    </div>
                    <div
                      className={`rounded-lg p-2.5 text-center border ${
                        isDark
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      <span
                        className={`text-[8px] sm:text-[9px] font-medium block mb-0.5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Total Expenses
                      </span>
                      <p
                        className="text-[11px] sm:text-xs font-bold"
                        style={{ color: primary }}
                      >
                        ₹12,550
                      </p>
                      <span className="text-[8px] font-medium" style={{ color: primary }}>
                        ↑ 3%
                      </span>
                    </div>
                    <div
                      className={`rounded-lg p-2.5 text-center border ${
                        isDark
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      <span
                        className={`text-[8px] sm:text-[9px] font-medium block mb-0.5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Balance
                      </span>
                      <p className="text-[11px] sm:text-xs font-bold text-emerald-600">
                        ₹12,450
                      </p>
                      <span className="text-[8px] text-emerald-500 font-medium">
                        ↑ 12%
                      </span>
                    </div>
                  </div>

                  {/* Bar Chart Mockup */}
                  <div
                    className={`rounded-lg p-3 sm:p-4 mb-3 border ${
                      isDark
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div className="flex items-end gap-[6px] sm:gap-2 h-14 sm:h-16 justify-center">
                      {[35, 55, 40, 70, 48, 62, 45, 58, 38, 65, 50, 72].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 max-w-3 rounded-t-sm transition-all duration-300"
                            style={{
                              height: `${h}%`,
                              backgroundColor:
                                i === 11
                                  ? primary
                                  : isDark
                                  ? `${primary}35`
                                  : `${primary}30`,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Spending by Category Mini-Pie */}
                  <div
                    className={`rounded-lg p-3 border ${
                      isDark
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <h4
                      className={`text-[9px] sm:text-[10px] font-bold mb-2 ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Spending by Category
                    </h4>
                    <div className="flex items-center gap-4">
                      {/* Mini Donut */}
                      <svg
                        viewBox="0 0 36 36"
                        className="w-12 h-12 sm:w-14 sm:h-14 shrink-0"
                        style={{ transform: "rotate(-90deg)" }}
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke={primary}
                          strokeWidth="4"
                          strokeDasharray="38 62"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#2F80ED"
                          strokeWidth="4"
                          strokeDasharray="18 82"
                          strokeDashoffset="-38"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#F2994A"
                          strokeWidth="4"
                          strokeDasharray="15 85"
                          strokeDashoffset="-56"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#6FCF97"
                          strokeWidth="4"
                          strokeDasharray="12 88"
                          strokeDashoffset="-68"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#9B51E0"
                          strokeWidth="4"
                          strokeDasharray="17 83"
                          strokeDashoffset="-80"
                        />
                      </svg>
                      {/* Mini Legend */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-1">
                        {[
                          { c: primary, l: "Food", p: "38%" },
                          { c: "#2F80ED", l: "Transport", p: "18%" },
                          { c: "#F2994A", l: "Shopping", p: "15%" },
                          { c: "#6FCF97", l: "Bills", p: "12%" },
                          { c: "#9B51E0", l: "Others", p: "17%" },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 text-[8px] sm:text-[9px]"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.c }}
                            />
                            <span
                              className={
                                isDark ? "text-gray-300" : "text-gray-600"
                              }
                            >
                              {item.l}{" "}
                              <span className="font-semibold">{item.p}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative plant icon (bottom-right) */}
              <div className="absolute -right-4 sm:-right-6 -bottom-2 sm:-bottom-4 text-3xl sm:text-4xl z-20 opacity-80">
                🪴
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
