"use client";

import React from "react";
import { useTheme } from "styled-components";
import { useSelector } from "react-redux";
import {
  IoRestaurant,
  IoCar,
  IoCart,
  IoFlash,
  IoHeart,
  IoFilm,
  IoBook,
  IoEllipsisHorizontal,
} from "react-icons/io5";

const categories = [
  { name: "Food & Dining", Icon: IoRestaurant },
  { name: "Transport", Icon: IoCar },
  { name: "Shopping", Icon: IoCart },
  { name: "Bills & Utilities", Icon: IoFlash },
  { name: "Health & Fitness", Icon: IoHeart },
  { name: "Entertainment", Icon: IoFilm },
  { name: "Education", Icon: IoBook },
  { name: "Others", Icon: IoEllipsisHorizontal },
];

import { theme as defaultTheme } from "@/utils/theme";

export default function CategoriesSection() {
  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : reduxTheme;
  const primary = currentTheme?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark";

  return (
    <section
      className={`py-6 md:py-10 transition-colors duration-200 ${
        isDark ? "bg-[#0b0f19]" : "bg-white"
      }`}
    >
      <div className="w-full px-4 sm:px-[80px]">
        <div
          className="rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 border transition-colors duration-200"
          style={{
            backgroundColor: isDark ? "#1e293b" : "#FFF8F5",
            borderColor: isDark ? "#334155" : "#FFE8E0",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            {/* Left Column: Heading & CTA */}
            <div>
              <span
                className="text-[11px] sm:text-xs font-bold tracking-[0.15em] uppercase block mb-3"
                style={{ color: primary }}
              >
                SPENDING CATEGORIES
              </span>
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug mb-4 ${
                  isDark ? "text-white" : "text-[#1a1a2e]"
                }`}
              >
                Organize Your Expenses
                <br />
                by Category
              </h2>
              <p
                className={`text-sm sm:text-base leading-relaxed mb-7 max-w-md ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                See where your money goes with easy-to-understand categories and
                beautiful charts.
              </p>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 text-sm font-semibold transition-all duration-200 hover:shadow-md group"
                style={{ borderColor: primary, color: primary }}
              >
                <span>Explore Categories</span>
                <span className="group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </a>
            </div>

            {/* Right Column: Categories Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-x-5 sm:gap-y-6">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div
                    className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg border shrink-0"
                    style={{
                      backgroundColor: isDark
                        ? `${primary}20`
                        : `${primary}10`,
                      color: primary,
                      borderColor: isDark
                        ? `${primary}30`
                        : `${primary}15`,
                    }}
                  >
                    <cat.Icon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-medium text-center leading-tight ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
