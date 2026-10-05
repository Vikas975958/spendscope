"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { HiXMark, HiEye, HiEyeSlash, HiExclamationTriangle } from "react-icons/hi2";
import { useTheme } from "styled-components";
import { login, getAuthErrorMessage } from "@/services/authService";
import { logingAuth } from "@/redux/slices/authSlice";
import { emptyStore } from "@/redux/actions";
import { theme as defaultTheme } from "@/utils/theme";

export default function SignInPage({ isModal = false, onClose, onSwitchToSignUp }) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Theme-awareness
  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : reduxTheme;
  const primary = currentTheme?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isModal) {
      router.replace("/?modal=signin");
    }
  }, [isModal, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("spendscope_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

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
    if (!email || !password) {
      setFormError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email, password });
      const user = data?.user;
      const session = data?.session;
      const profile = data?.profile;

      if (!session) {
        throw new Error("Unable to establish session. Please verify your credentials.");
      }

      if (rememberMe) {
        localStorage.setItem("spendscope_remembered_email", email);
      } else {
        localStorage.removeItem("spendscope_remembered_email");
      }

      dispatch(emptyStore());
      dispatch(
        logingAuth({
          userData: {
            ...user,
            profile,
          },
          token: session.access_token,
          userId: user?.id,
          role: profile?.role || "student",
        }),
      );

      if (onClose) onClose();
      router.replace("/dashboard");
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
  const checkboxText = isDark ? "text-gray-400" : "text-gray-600";

  const cardContent = (
    <div
      className={`w-full max-w-md ${cardBg} border ${cardBorder} rounded-2xl shadow-xl p-8 relative transition-colors duration-200`}
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
        <p className={`text-sm ${subTextColor} mt-2`}>
          Sign in to your account
        </p>
      </div>

      {/* Error Alert Box in Modal UI */}
      {formError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm font-medium border bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60 shadow-xs transition-all duration-200"
        >
          <HiExclamationTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1 leading-snug">{formError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className={`block text-xs font-semibold uppercase tracking-wider ${labelColor} mb-1.5`}
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formError) setFormError("");
            }}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 rounded-lg border ${inputBorder} ${inputBg} ${inputText} text-sm ${inputPlaceholder} focus:outline-none ${inputFocus} transition-all`}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className={`block text-xs font-semibold uppercase tracking-wider ${labelColor} mb-1.5`}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formError) setFormError("");
              }}
              required
              autoComplete="current-password"
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

        <div className="flex items-center justify-between text-sm">
          <label className={`flex items-center gap-2 cursor-pointer select-none ${checkboxText}`}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 focus:ring-2 accent-[var(--primary)]"
              style={{ accentColor: primary }}
            />
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: primary }}
          className="w-full py-2.5 px-4 text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className={`mt-6 text-center text-sm ${footerText}`}>
        Don&apos;t have an account?{" "}
        {onSwitchToSignUp ? (
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-semibold hover:underline cursor-pointer transition-colors"
            style={{ color: primary }}
          >
            Sign up
          </button>
        ) : (
          <Link
            href="/signup"
            onClick={() => isModal && onClose && onClose()}
            className="font-semibold hover:underline transition-colors"
            style={{ color: primary }}
          >
            Sign up
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
        aria-label="Sign in modal"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
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
