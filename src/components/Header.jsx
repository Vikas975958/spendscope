"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { IoColorPaletteOutline } from "react-icons/io5";
import { useTheme } from "styled-components";
import { useSelector } from "react-redux";
import ThemeChange from "./ThemeChange";
import SignInPage from "@/app/(public)/sign-in/page";
import SignUpPage from "@/app/(public)/signup/page";
import { theme as defaultTheme } from "@/utils/theme";

export function SpendScopeLogo({ className = "w-8 h-8", color }) {
  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const primary = color || themeContext?.colors?.primary || reduxTheme?.colors?.primary || defaultTheme.colors.primary;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 36 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Credit card peeking from behind */}
        <rect
          x="5"
          y="2"
          width="23"
          height="11"
          rx="3"
          fill={primary}
          fillOpacity="0.45"
          stroke="white"
          strokeWidth="1"
        />
        {/* Main wallet body */}
        <rect
          x="2"
          y="7"
          width="32"
          height="23"
          rx="6"
          fill={primary}
        />
        {/* Top fold subtle inner line */}
        <path
          d="M3 13.5C3 11 5 9 8 9H28C31 9 33 11 33 13.5"
          stroke="white"
          strokeOpacity="0.3"
          strokeWidth="1.2"
        />
        {/* Wallet clasp tab */}
        <path
          d="M23 13.5H32.5C33.6 13.5 34.5 14.4 34.5 15.5V21.5C34.5 22.6 33.6 23.5 32.5 23.5H23C21.6 23.5 20.5 22.4 20.5 21V16C20.5 14.6 21.6 13.5 23 13.5Z"
          fill={primary}
          stroke="white"
          strokeWidth="1.2"
        />
        {/* Clasp circle button */}
        <circle cx="26.5" cy="18.5" r="1.8" fill="white" />
      </svg>
    </div>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // Auto-open modal if redirected with ?modal=signin or ?modal=signup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkParams = () => {
        const params = new URLSearchParams(window.location.search);
        const modal = params.get("modal");
        if (modal === "signin") {
          setShowSignInModal(true);
          setShowSignUpModal(false);
        } else if (modal === "signup") {
          setShowSignUpModal(true);
          setShowSignInModal(false);
        }
      };

      checkParams();
      window.addEventListener("popstate", checkParams);
      return () => window.removeEventListener("popstate", checkParams);
    }
  }, []);

  const handleCloseSignIn = () => {
    setShowSignInModal(false);
    if (typeof window !== "undefined" && window.location.search.includes("modal=")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("modal");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  const handleCloseSignUp = () => {
    setShowSignUpModal(false);
    if (typeof window !== "undefined" && window.location.search.includes("modal=")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("modal");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  const [isFixed, setIsFixed] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navLinks = [
    { id: "home", label: "Home", href: "/#home" },
    { id: "features", label: "Features", href: "#features" },
    { id: "about", label: "About", href: "#about" },
    { id: "contact", label: "Contact", href: "#contact" },
  ];

  // Fix header when scrolling 100vh or more & active section tracking (ScrollSpy)
  useEffect(() => {
    const handleScrollAndSpy = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight;

      // 1. Header Fixed state
      if (scrollY >= threshold) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }

      // 2. ScrollSpy active section detection
      const scrollPosition = scrollY + 120;
      const sections = ["home", "features", "about", "contact"];
      let current = "home";

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = sectionId;
          }
        }
      }

      // Check if scrolled near bottom of the page
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60
      ) {
        current = "contact";
      }

      setActiveSection(current);
    };

    handleScrollAndSpy();
    window.addEventListener("scroll", handleScrollAndSpy, { passive: true });
    window.addEventListener("hashchange", handleScrollAndSpy);
    return () => {
      window.removeEventListener("scroll", handleScrollAndSpy);
      window.removeEventListener("hashchange", handleScrollAndSpy);
    };
  }, []);

  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : reduxTheme;

  const primary = currentTheme?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark";

  return (
    <>
      <header
        className={`w-full z-50 transition-all duration-300 ${
          isFixed
            ? `fixed top-0 left-0 right-0 shadow-lg shadow-black/5 animate-in slide-in-from-top-2 duration-300 backdrop-blur-md border-b ${
                isDark
                  ? "bg-[#08070b]/95 text-white border-[#1f1e2b]"
                  : "bg-white/95 text-gray-900 border-gray-200/80"
              }`
            : `relative border-b ${
                isDark
                  ? "bg-[#08070b] text-white border-[#1f1e2b]"
                  : "bg-white text-gray-900 border-gray-100"
              }`
        }`}
      >
      <div className="w-full px-4 sm:px-[80px] h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <SpendScopeLogo color={primary} className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <span className="text-[22px] font-bold tracking-tight flex items-center">
            <span style={{ color: primary }}>Spend</span>
            <span className={isDark ? "text-white" : "text-[#1E293B]"}>Scope</span>
          </span>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setActiveSection(link.id)}
                className={`flex flex-col items-center text-sm font-semibold transition-colors py-1 ${
                  isActive
                    ? ""
                    : isDark
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={isActive ? { color: primary } : {}}
              >
                <span>{link.label}</span>
                {isActive ? (
                  <span
                    className="w-5 h-[2.5px] rounded-full mt-1 transition-all duration-200"
                    style={{ backgroundColor: primary }}
                  />
                ) : (
                  <span className="w-5 h-[2.5px] mt-1 opacity-0 pointer-events-none" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Theme Toggle (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Palette Toggle Button */}
          <button
            type="button"
            onClick={() => setThemeModalOpen(!themeModalOpen)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition duration-200 cursor-pointer shadow-2xs ${
              isDark
                ? "border-slate-700 text-gray-300 hover:text-white hover:bg-slate-800"
                : "border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            style={{ borderColor: themeModalOpen ? primary : undefined }}
            title="Theme Settings & Colors"
            aria-label="Toggle theme selector"
          >
            <IoColorPaletteOutline className="w-5 h-5" style={{ color: themeModalOpen ? primary : undefined }} />
          </button>

          {/* Sign In Button (Desktop) */}
          <button
            type="button"
            onClick={() => setShowSignInModal(true)}
            className={`text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 cursor-pointer border ${
              isDark
                ? "border-slate-700 text-gray-200 hover:text-white hover:bg-slate-800"
                : "border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setShowSignUpModal(true)}
            style={{ backgroundColor: primary }}
            className="text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:opacity-90 hover:shadow cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Actions Button */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setThemeModalOpen(!themeModalOpen)}
            className={`w-8.5 h-8.5 rounded-full border flex items-center justify-center transition cursor-pointer shrink-0 ${
              isDark ? "border-slate-700 text-gray-300" : "border-gray-200 text-gray-600"
            }`}
            title="Theme Settings"
            aria-label="Toggle theme selector"
          >
            <IoColorPaletteOutline className="w-4 h-4" style={{ color: primary }} />
          </button>

          {/* Mobile Quick Sign In Button (visible on xs and up) */}
          <button
            type="button"
            onClick={() => setShowSignInModal(true)}
            className={`hidden xs:inline-flex text-xs font-semibold px-2.5 py-1.5 rounded-full transition border cursor-pointer shrink-0 ${
              isDark
                ? "border-slate-700 text-gray-200 hover:bg-slate-800"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setShowSignUpModal(true)}
            style={{ backgroundColor: primary }}
            className="hidden sm:inline-flex text-white text-xs font-semibold px-3 py-1.5 rounded-full transition cursor-pointer shrink-0"
          >
            Get Started
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1.5 rounded-lg focus:outline-none cursor-pointer shrink-0 ${isDark ? "text-gray-300 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-100"}`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <HiXMark className="w-5.5 h-5.5" />
            ) : (
              <HiBars3 className="w-5.5 h-5.5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-6 py-4 space-y-3 shadow-lg animate-in slide-in-from-top duration-200 ${
            isDark ? "bg-[#08070b] border-[#1f1e2b]" : "bg-white border-gray-100"
          }`}
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => {
                  setActiveSection(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`block font-semibold text-sm py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? isDark
                      ? "bg-[#1f1e2f] text-white"
                      : "bg-gray-100 text-gray-900"
                    : isDark
                    ? "text-gray-300 hover:text-white hover:bg-slate-800"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
                style={isActive ? { color: primary } : {}}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowSignInModal(true);
              }}
              className={`w-full text-center text-sm font-medium py-2 rounded-lg cursor-pointer transition-colors border ${
                isDark
                  ? "border-slate-700 text-gray-200 hover:bg-slate-800 hover:text-white"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowSignUpModal(true);
              }}
              style={{ backgroundColor: primary }}
              className="w-full text-center text-white text-sm font-semibold py-2.5 rounded-full cursor-pointer"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}

      {/* Theme Selection Modal */}
      {themeModalOpen && (
        <ThemeChange handleClose={() => setThemeModalOpen(false)} />
      )}

      {/* Sign In Modal */}
      {showSignInModal && (
        <SignInPage
          isModal
          onClose={handleCloseSignIn}
          onSwitchToSignUp={() => {
            setShowSignInModal(false);
            setShowSignUpModal(true);
          }}
        />
      )}

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <SignUpPage
          isModal
          onClose={handleCloseSignUp}
          onSwitchToSignIn={() => {
            setShowSignUpModal(false);
            setShowSignInModal(true);
          }}
        />
      )}
    </header>
    {/* Placeholder spacer when header is fixed to avoid layout shift */}
    {isFixed && <div className="h-16 w-full shrink-0" aria-hidden="true" />}
    </>
  );
}
