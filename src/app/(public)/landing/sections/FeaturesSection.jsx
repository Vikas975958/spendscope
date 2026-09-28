"use client";

import React from "react";
import { useTheme } from "styled-components";
import { useSelector } from "react-redux";
import {
  IoTrendingUp,
  IoDocumentText,
  IoWallet,
  IoLayers,
  IoSync,
  IoLockClosed,
} from "react-icons/io5";

const features = [
  {
    Icon: IoTrendingUp,
    title: "Track Income & Expenses",
    desc: "Know where your money goes.",
  },
  {
    Icon: IoDocumentText,
    title: "Detailed Reports",
    desc: "Visualize your spending.",
  },
  {
    Icon: IoWallet,
    title: "Set Budgets",
    desc: "Stay on track with your goals.",
  },
  {
    Icon: IoLayers,
    title: "Multiple Accounts",
    desc: "Manage in one place.",
  },
  {
    Icon: IoSync,
    title: "Recurring Bills",
    desc: "Never miss a payment.",
  },
  {
    Icon: IoLockClosed,
    title: "Data Security",
    desc: "Your data is safe with us.",
  },
];

import { theme as defaultTheme } from "@/utils/theme";

export default function FeaturesSection() {
  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : reduxTheme;
  const primary = currentTheme?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark";

  const pieSegments = [
    { label: "Food & Dining", pct: 38, color: primary },
    { label: "Transport", pct: 18, color: "#2F80ED" },
    { label: "Shopping", pct: 15, color: "#F2994A" },
    { label: "Bills & Utilities", pct: 12, color: "#6FCF97" },
    { label: "Others", pct: 17, color: "#9B51E0" },
  ];

  // Build pie chart arcs — using SVG circle dasharray trick (circumference = 100)
  let cumulativeOffset = 0;
  const arcs = pieSegments.map((seg) => {
    const arc = {
      ...seg,
      dasharray: `${seg.pct} ${100 - seg.pct}`,
      offset: -cumulativeOffset,
    };
    cumulativeOffset += seg.pct;
    return arc;
  });

  return (
    <section
      id="features"
      className={`py-8 md:py-12 relative overflow-hidden transition-colors duration-200 ${
        isDark ? "bg-[#0b0f19]" : "bg-white"
      }`}
    >
      {/* Background blobs */}
      <div
        className="absolute -left-[100px] top-[10%] w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none blur-3xl"
        style={{ background: `${primary}30` }}
      />
      <div
        className="absolute -left-[50px] bottom-[5%] w-[250px] h-[250px] rounded-full opacity-10 pointer-events-none blur-2xl"
        style={{ background: `${primary}25` }}
      />

      <div className="w-full px-4 sm:px-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* ===== LEFT — Pie Chart Card ===== */}
          <div className="relative flex justify-center">
            {/* Pink blob behind card */}
            <div
              className="absolute -left-8 -top-8 w-[320px] h-[380px] rounded-[60px] opacity-10 pointer-events-none rotate-[-8deg]"
              style={{ backgroundColor: primary }}
            />

            <div
              className={`relative z-10 rounded-3xl p-4 xs:p-6 sm:p-8 shadow-xl border max-w-[400px] w-full transition-colors duration-200 ${
                isDark
                  ? "bg-[#1e293b] border-slate-700"
                  : "bg-white border-gray-100"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <span
                    className={`text-xs font-medium block mb-0.5 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Total Expenses
                  </span>
                  <p
                    className={`text-2xl sm:text-[28px] font-bold tracking-tight ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ₹12,550
                  </p>
                </div>
              </div>

              {/* Donut Chart + Legend */}
              <div className="flex flex-col xs:flex-row items-center gap-4 sm:gap-8">
                {/* Donut Chart */}
                <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] relative shrink-0">
                  <svg
                    viewBox="0 0 36 36"
                    className="w-full h-full"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    {arcs.map((arc, i) => (
                      <circle
                        key={i}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke={arc.color}
                        strokeWidth="4.5"
                        strokeDasharray={arc.dasharray}
                        strokeDashoffset={arc.offset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    ))}
                  </svg>
                  {/* Center circle */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center`}
                  >
                    <div
                      className={`w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-full ${
                        isDark ? "bg-[#1e293b]" : "bg-white"
                      }`}
                    />
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2.5 flex-1">
                  {pieSegments.map((seg, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] sm:text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span
                          className={`${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {seg.label}
                        </span>
                      </div>
                      <span
                        className={`font-semibold ${
                          isDark ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {seg.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Insights Card */}
              <div
                className={`mt-6 p-3.5 rounded-xl border ${
                  isDark
                    ? "bg-amber-900/20 border-amber-800/30"
                    : "bg-amber-50 border-amber-100"
                }`}
              >
                <h4
                  className={`text-xs font-bold mb-1 flex items-center gap-1.5 ${
                    isDark ? "text-amber-200" : "text-gray-800"
                  }`}
                >
                  <span>💡</span> Smart Insights
                </h4>
                <p
                  className={`text-[11px] leading-relaxed ${
                    isDark ? "text-amber-100/70" : "text-gray-600"
                  }`}
                >
                  You spent 38% more on food this month. Consider setting a food
                  budget.
                </p>
              </div>
            </div>
          </div>

          {/* ===== RIGHT — Features Grid ===== */}
          <div>
            <span
              className="text-[11px] sm:text-xs font-bold tracking-[0.15em] uppercase block mb-3"
              style={{ color: primary }}
            >
              POWERFUL FEATURES
            </span>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug mb-4 ${
                isDark ? "text-white" : "text-[#1a1a2e]"
              }`}
            >
              Everything You Need
              <br />
              for Better Money Management
            </h2>
            <p
              className={`text-sm sm:text-base leading-relaxed mb-6 max-w-md ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Get detailed insights, set budgets, track recurring bills and make
              smarter financial decisions — all in one place.
            </p>

            {/* 6 Features in 3×2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                    style={{
                      backgroundColor: `${primary}12`,
                      color: primary,
                    }}
                  >
                    <feat.Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-bold mb-0.5 ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {feat.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
