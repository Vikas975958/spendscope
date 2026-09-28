"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { HiXMark, HiEye, HiEyeSlash } from "react-icons/hi2";
import { useTheme } from "styled-components";
import { signUp, getAuthErrorMessage } from "@/services/authService";
import { logingAuth } from "@/redux/slices/authSlice";
import { emptyStore } from "@/redux/actions";
import CurrencySelect from "@/components/CurrencySelect";
import { theme as defaultTheme } from "@/utils/theme";
import { DEFAULT_CURRENCY, getCurrencySymbol } from "@/utils/currencies";

export default function SignUpPage({ isModal = false, onClose, onSwitchToSignIn }) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Theme-awareness
  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : reduxTheme;
  const primary = currentTheme?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY.code);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isModal) {
      router.replace("/?modal=signup");
    }
  }, [isModal, router]);

  // Handle ESC key press and body scroll lock when used as modal
  useEffect(() => {
    if (!isModal || !onClose) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isModal, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const currencySymbol = getCurrencySymbol(currency);

    setLoading(true);
    try {
      const data = await signUp({
        email,
        password,
        fullName,
        phone,
        currency,
        currencySymbol,
      });
      const user = data?.user;
      const session = data?.session;
      const profile = data?.profile;

      if (session) {
        dispatch(emptyStore());
        dispatch(
          logingAuth({
            userData: {
              ...user,
              phone,
              currency,
              currency_symbol: currencySymbol,
              profile: {
                ...profile,
                phone,
                currency,
                currency_symbol: currencySymbol,
              },
            },
            token: session.access_token,
            userId: user?.id,
            role: profile?.role || "student",
          }),
        );
        if (onClose) onClose();
        router.replace("/dashboard");
      } else {
        if (onSwitchToSignIn) {
          onSwitchToSignIn();
        } else {
          if (onClose) onClose();
          router.replace("/sign-in");
        }
      }
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Theme-based styles
  const cardBg = isDark ? "bg-[#121118]" : "bg-white";
  const cardBorder = isDark ? "border-[#1f1e2b]" : "border-gray-200";
  const headingColor = isDark ? "text-white" : "text-gray-900";
  const subTextColor = isDark ? "text-gray-400" : "text-gray-500";
  const labelColor = isDark ? "text-gray-300" : "text-gray-700";
  const inputBg = isDark ? "bg-[#161522]" : "bg-white";
  const inputBorder = isDark ? "border-[#232234]" : "border-gray-300";
  const inputText = isDark ? "text-gray-100" : "text-gray-900";
  const inputPlaceholder = isDark ? "placeholder-gray-500" : "placeholder-gray-400";
  const inputFocus = isDark ? "focus:ring-slate-400 focus:border-slate-400" : "focus:ring-2 focus:border-transparent";
  const footerText = isDark ? "text-gray-400" : "text-gray-600";
  const closeHover = isDark ? "hover:text-white hover:bg-slate-700" : "hover:text-gray-700 hover:bg-gray-100";

  const cardContent = (
    <div
      className={`w-full max-w-md ${cardBg} border ${cardBorder} rounded-2xl shadow-xl p-6 sm:p-8 relative transition-colors duration-200`}
    >
      {/* Modal Close Button */}
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 text-gray-400 ${closeHover} rounded-full transition-colors cursor-pointer`}
          aria-label="Close"
        >
          <HiXMark className="w-5 h-5" />
        </button>
      )}

      <div className="text-center mb-6">
        <h1 className={`text-2xl font-bold ${headingColor} tracking-tight`}>
          SpendScope
        </h1>
        <p className={`text-sm ${subTextColor} mt-1.5`}>
          Create your account & profile details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-fullname"
            className={`block text-xs font-semibold uppercase tracking-wider ${labelColor} mb-1`}
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="signup-fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            placeholder="John Doe"
            className={`w-full px-4 py-2.5 rounded-lg border ${inputBorder} ${inputBg} ${inputText} text-sm ${inputPlaceholder} focus:outline-none ${inputFocus} transition-all`}
          />
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="signup-email"
            className={`block text-xs font-semibold uppercase tracking-wider ${labelColor} mb-1`}
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 rounded-lg border ${inputBorder} ${inputBg} ${inputText} text-sm ${inputPlaceholder} focus:outline-none ${inputFocus} transition-all`}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="signup-phone"
            className={`block text-xs font-semibold uppercase tracking-wider ${labelColor} mb-1`}
          >
            Phone Number <span className="text-xs font-normal text-gray-400">(Optional)</span>
          </label>
          <input
            id="signup-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="+1 234 567 890"
            className={`w-full px-4 py-2.5 rounded-lg border ${inputBorder} ${inputBg} ${inputText} text-sm ${inputPlaceholder} focus:outline-none ${inputFocus} transition-all`}
          />
        </div>

        {/* Currency Selection */}
        <div>
          <label
            htmlFor="signup-currency"
            className={`block text-xs font-semibold uppercase tracking-wider ${labelColor} mb-1`}
          >
            Currency Type <span className="text-red-500">*</span>
          </label>
          <CurrencySelect
            id="signup-currency"
            value={currency}
            onChange={(val) => setCurrency(val)}
            isDark={isDark}
            primaryColor={primary}
            roundedClass="rounded-lg"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Default is Indian Rupees (₹). You can change this anytime in your profile.
          </p>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className={`block text-xs font-semibold uppercase tracking-wider ${labelColor} mb-1`}
          >
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${inputBorder} ${inputBg} ${inputText} text-sm ${inputPlaceholder} focus:outline-none ${inputFocus} transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${subTextColor} hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer p-1 rounded-md transition-colors`}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <HiEyeSlash className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className={`block text-xs font-semibold uppercase tracking-wider ${labelColor} mb-1`}
          >
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${inputBorder} ${inputBg} ${inputText} text-sm ${inputPlaceholder} focus:outline-none ${inputFocus} transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${subTextColor} hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer p-1 rounded-md transition-colors`}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? (
                <HiEyeSlash className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: primary }}
          className="w-full mt-2 py-2.5 px-4 text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className={`mt-5 text-center text-sm ${footerText}`}>
        Already have an account?{" "}
        {onSwitchToSignIn ? (
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-semibold hover:underline cursor-pointer transition-colors"
            style={{ color: primary }}
          >
            Sign in
          </button>
        ) : (
          <Link
            href="/sign-in"
            onClick={() => isModal && onClose && onClose()}
            className="font-semibold hover:underline transition-colors"
            style={{ color: primary }}
          >
            Sign in
          </Link>
        )}
      </p>
    </div>
  );

  if (isModal) {
    if (typeof document === "undefined") return null;
    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign up modal"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto max-h-screen"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md my-auto">
          {cardContent}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-200 ${
        isDark ? "bg-[#0b0f19]" : "bg-gray-50"
      }`}
    >
      {cardContent}
    </div>
  );
}
