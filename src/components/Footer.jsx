"use client";

import React from "react";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { useTheme } from "styled-components";
import { useSelector } from "react-redux";
import { SpendScopeLogo } from "./Header";
import { theme as defaultTheme } from "@/utils/theme";

export default function Footer() {
  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : reduxTheme;

  const primary = currentTheme?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark";

  return (
    <footer
      className={`w-full py-6 transition-colors duration-200 border-t ${
        isDark ? "bg-[#08070b] border-[#1f1e2b] text-gray-300" : "bg-white border-gray-100 text-gray-600"
      }`}
    >
      <div className="w-full px-4 sm:px-[80px] flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <SpendScopeLogo color={primary} className="w-7 h-7 group-hover:scale-105 transition-transform" />
          <span className="text-xl font-bold tracking-tight">
            <span style={{ color: primary }}>Spend</span>
            <span className={isDark ? "text-white" : "text-[#1E293B]"}>Scope</span>
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}
          >
            Home
          </Link>
          <Link
            href="#features"
            className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}
          >
            Features
          </Link>
          <Link
            href="#about"
            className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}
          >
            About
          </Link>
          <Link
            href="#contact"
            className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}
          >
            Contact
          </Link>
        </nav>

        {/* Right: Social Media Icons & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Social Icons */}
          <div className="flex items-center gap-4 text-gray-400">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity p-1"
              style={{ ":hover": { color: primary } }}
              aria-label="Facebook"
            >
              <FaFacebookF className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity p-1"
              aria-label="Twitter"
            >
              <FaTwitter className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity p-1"
              aria-label="Instagram"
            >
              <FaInstagram className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity p-1"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Copyright notice */}
          <span className="text-xs text-gray-400 font-normal">
            © 2026 SpendScope. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
