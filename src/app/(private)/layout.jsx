"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "styled-components";
import CurrencySelect from "@/components/CurrencySelect";
import { SpendScopeLogo } from "@/components/Header";
import ThemeChange from "@/components/ThemeChange";
import { SideAdvertisement } from "@/components/SideAdvertisement";
import { logoutUser, updateProfile } from "@/redux/slices/authSlice";
import { updateUserProfile, verifyUserPassword } from "@/services/authService";
import { resetUserTransactions } from "@/services/resetSevices";
import { DEFAULT_CURRENCY, getCurrencySymbol } from "@/utils/currencies";

// Icons
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDown,
  HiOutlineUser,
  HiOutlinePencilSquare,
  HiOutlineExclamationTriangle,
  HiOutlineArrowLeft,
  HiXMark,
  HiArrowPath,
  HiEye,
  HiEyeSlash,
} from "react-icons/hi2";
import { BiCalculator } from "react-icons/bi";
import { IoColorPaletteOutline } from "react-icons/io5";

export default function PrivateLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isResettingTransactions, setIsResettingTransactions] = useState(false);
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState("");

  const dropdownRef = useRef(null);

  // Redux Auth & Theme state
  const authState = useSelector((state) => state?.auth || state?.authSlice);
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();

  const currentTheme = themeContext?.colors ? themeContext : themeState;
  const primaryColor =
    currentTheme?.colors?.primary || themeState?.colors?.primary || "#EB5757";
  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  const user = authState?.userData?.user || authState?.userData || {};
  const userProfile = authState?.userData?.profile || user?.profile || {};
  const userName =
    authState?.userData?.name ||
    userProfile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";
  const userEmail =
    authState?.userData?.email || userProfile?.email || user?.email || "user@spendscope.com";
  const userPhone =
    authState?.userData?.phone || userProfile?.phone || user?.user_metadata?.phone || user?.phone || "";
  const userCurrency =
    authState?.userData?.currency ||
    userProfile?.currency ||
    user?.user_metadata?.currency ||
    DEFAULT_CURRENCY.code;
  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : "SS";

  // Form states for Edit Profile
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(userPhone);
  const [editCurrency, setEditCurrency] = useState(userCurrency);

  useEffect(() => {
    setEditName(userName);
    setEditPhone(userPhone);
    setEditCurrency(userCurrency);
  }, [userName, userPhone, userCurrency]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsUserDropdownOpen(false);
  }, [pathname]);

  const handleConfirmResetTransactions = async (e) => {
    if (e) e.preventDefault();
    setResetPasswordError("");

    if (!resetPasswordInput.trim()) {
      setResetPasswordError("Please enter your account password to confirm.");
      return;
    }

    setIsResettingTransactions(true);
    try {
      // Verify password against current user email
      const verifyRes = await verifyUserPassword(userEmail, resetPasswordInput);
      if (!verifyRes.isValid) {
        setResetPasswordError(verifyRes.error || "Incorrect password. Please enter the correct password.");
        setIsResettingTransactions(false);
        return;
      }

      // Password verified successfully -> delete transactions
      await resetUserTransactions();
      setShowResetConfirmModal(false);
      setResetPasswordInput("");
      setResetPasswordError("");
    } catch (err) {
      console.error("Error resetting user transactions:", err);
      setResetPasswordError("Failed to reset transactions. Please try again.");
    } finally {
      setIsResettingTransactions(false);
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirmModal(false);
    setIsUserDropdownOpen(false);
    dispatch(logoutUser());
    router.push("/sign-in");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      return;
    }

    setIsSavingProfile(true);
    const currencySymbol = getCurrencySymbol(editCurrency);

    const updatedData = {
      name: editName.trim(),
      email: userEmail,
      phone: editPhone.trim(),
      currency: editCurrency,
      currency_symbol: currencySymbol,
      user_metadata: {
        ...(user?.user_metadata || {}),
        full_name: editName.trim(),
        phone: editPhone.trim(),
        currency: editCurrency,
        currency_symbol: currencySymbol,
      },
      profile: {
        ...(userProfile || {}),
        full_name: editName.trim(),
        email: userEmail,
        phone: editPhone.trim(),
        currency: editCurrency,
        currency_symbol: currencySymbol,
      },
    };

    dispatch(updateProfile(updatedData));

    try {
      const userId = authState?.userId || user?.id;
      if (userId) {
        await updateUserProfile({
          userId,
          fullName: editName.trim(),
          email: userEmail,
          phone: editPhone.trim(),
          currency: editCurrency,
          currencySymbol: currencySymbol,
        });
      }
    } catch (err) {
      console.warn("Error updating profile on server:", err);
    }

    setIsSavingProfile(false);
    setShowEditProfileModal(false);
    setIsUserDropdownOpen(false);
  };

  const isDashboard = pathname === "/dashboard" || pathname === "/";

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${isDark ? "bg-[#08070b] text-slate-100 dark" : "bg-gray-50 text-gray-900"}`}
    >
      {/* TOP NAVIGATION BAR (Full Width, Perfectly Aligned with Dashboard Container) */}
      <header
        className={`sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors ${isDark ? "bg-[#08070b]/95 border-[#1f1e2b]/80 text-white" : "bg-white/95 border-gray-200/80 text-gray-900"}`}
      >
        <div className="w-full flex justify-center">
          {/* Left spacer matching left ad column width */}
          <div className="hidden lg:block w-[15%] min-w-[170px] max-w-[240px] px-2.5 shrink-0" />

          {/* Center Header Content aligned with Center Dashboard Container */}
          <div className="flex-1 w-full max-w-[1400px] px-3 sm:px-6 lg:px-4 h-14 sm:h-15 flex items-center justify-between gap-3 min-w-0">
            {/* Left: Brand Logo & Title + Dynamic Navigation Button (Calculators / Dashboard) */}
            <div className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 group"
              >
                <div
                  className={`p-2 rounded-xl transition-colors ${isDark ? "bg-[#161522] border border-[#232234]" : "bg-gray-100/80"}`}
                >
                  <SpendScopeLogo className="w-7 h-7" color={primaryColor} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight leading-none">
                    <span style={{ color: primaryColor }}>Spend</span>
                    <span className={isDark ? "text-white" : "text-[#1E293B]"}>
                      Scope
                    </span>
                  </span>
                  <span
                    className={`text-[10px] font-semibold tracking-wider uppercase mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}
                  >
                    Finance Dashboard
                  </span>
                </div>
              </Link>

              {/* Dynamic Navigation Button with Theme Color */}
              {pathname === "/calculators-m" || pathname === "/spend-budget" ? (
                <Link
                  href="/dashboard"
                  className="h-10 px-2.5 sm:px-3.5 inline-flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-100 cursor-pointer shadow-xs shrink-0"
                  style={{ backgroundColor: primaryColor }}
                  title="Dashboard"
                  aria-label="Dashboard"
                >
                  <HiOutlineArrowLeft className="w-4 h-4 stroke-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/calculators-m"
                  className="h-10 px-2.5 sm:px-3.5 inline-flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-100 cursor-pointer shadow-xs shrink-0"
                  style={{ backgroundColor: primaryColor }}
                  title="Calculators"
                  aria-label="Calculators"
                >
                  <BiCalculator className="w-4.5 h-4.5" />
                  <span className="hidden sm:inline">Calculators</span>
                </Link>
              )}
            </div>

            {/* Right: Quick Theme Selector & User Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Quick Theme Selector Trigger */}
              <button
                onClick={() => setShowThemeModal(true)}
                className={`h-10 w-10 inline-flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? "bg-[#161522]/90 border-[#232234] text-slate-300 hover:bg-[#1f1e2f] hover:text-white"
                    : "bg-gray-100/80 border-gray-200/60 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
                style={{
                  borderColor: showThemeModal ? primaryColor : undefined,
                }}
                title="Theme Settings & Colors"
                aria-label="Theme Settings"
              >
                <IoColorPaletteOutline
                  className="w-5 h-5"
                  style={{ color: showThemeModal ? primaryColor : undefined }}
                />
              </button>

              {/* User Profile Trigger & Dropdown Menu Container */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className={`h-10 flex items-center gap-2.5 px-2.5 rounded-xl border transition-all cursor-pointer group ${
                    isDark
                      ? "bg-[#161522]/90 border-[#232234] hover:bg-[#1f1e2f]"
                      : "bg-gray-100/80 border-gray-200/60 hover:bg-gray-200/70"
                  }`}
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                >
                  <div
                    className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {userInitials}
                  </div>
                  <div className="hidden sm:flex flex-col text-left min-w-0">
                    <span
                      className={`text-xs font-bold truncate max-w-[130px] leading-tight ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {userName}
                    </span>
                    <span
                      className={`text-[10px] truncate max-w-[130px] leading-none mt-0.5 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                    >
                      {userEmail}
                    </span>
                  </div>
                  <HiOutlineChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* USER PROFILE DROPDOWN MENU */}
                {isUserDropdownOpen && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-52 border rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150 ${isDark ? "bg-[#121118] border-[#1f1e2b]" : "bg-white border-gray-200/80"}`}
                  >
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setShowEditProfileModal(true);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                        isDark
                          ? "text-slate-300 hover:bg-[#1a1926]"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <HiOutlinePencilSquare className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setShowResetConfirmModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                    >
                      <HiArrowPath className="w-4 h-4 text-rose-500" />
                      <span>Reset Transactions</span>
                    </button>

                    <div
                      className={`h-[1px] my-1 ${isDark ? "bg-[#1f1e2b]" : "bg-gray-100"}`}
                    />

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setShowLogoutConfirmModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors text-left cursor-pointer"
                    >
                      <HiOutlineArrowRightOnRectangle className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right spacer matching right ad column width */}
          <div className="hidden lg:block w-[15%] min-w-[170px] max-w-[240px] px-2.5 shrink-0" />
        </div>
      </header>

      {/* MAIN CONTAINER WITH 15% SIDE SPACING / ADVERTISEMENTS */}
      <div className="flex-1 w-full flex justify-center">
        {/* LEFT ADVERTISEMENT COLUMN (occupies left side space on large screens) */}
        <div className="hidden lg:block w-[15%] min-w-[170px] max-w-[240px] px-2.5 py-3.5 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto no-scrollbar">
          <SideAdvertisement side="left" />
        </div>

        {/* CENTER MAIN APPLICATION CONTAINER */}
        <main className="flex-1 w-full max-w-[1400px] px-3 sm:px-6 lg:px-4 py-3 sm:py-4.5 min-w-0">
          {children}
        </main>

        {/* RIGHT ADVERTISEMENT COLUMN (occupies right side space on large screens) */}
        <div className="hidden lg:block w-[15%] min-w-[170px] max-w-[240px] px-2.5 py-3.5 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto no-scrollbar">
          <SideAdvertisement side="right" />
        </div>
      </div>

      {/* THEME SELECTOR MODAL */}
      {showThemeModal && (
        <ThemeChange handleClose={() => setShowThemeModal(false)} />
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 ${isDark ? "bg-[#121118] border-[#1f1e2b]" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-2xl text-white shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <HiOutlineUser className="w-6 h-6" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Edit Profile
                  </h3>
                  <p
                    className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Update your account display details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className={`p-1.5 rounded-xl ${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-[#1a1926]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-gray-700"}`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                    isDark
                      ? "bg-[#161522] border-[#232234] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                  style={{ borderColor: primaryColor }}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-gray-700"}`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  readOnly
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all cursor-not-allowed select-none ${
                    isDark
                      ? "bg-[#111019] border-[#232234] text-slate-400 placeholder-slate-600"
                      : "bg-gray-100/80 border-gray-200 text-gray-500 placeholder-gray-400"
                  }`}
                />
                <p className={`text-[11px] mt-1 ${isDark ? "text-slate-500" : "text-gray-500"}`}>
                  Your email address is linked to your account and cannot be modified.
                </p>
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-gray-700"}`}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                    isDark
                      ? "bg-[#161522] border-[#232234] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                  style={{ borderColor: primaryColor }}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-gray-700"}`}
                >
                  Preferred Currency
                </label>
                <CurrencySelect
                  id="profile-currency"
                  value={editCurrency}
                  onChange={(val) => setEditCurrency(val)}
                  isDark={isDark}
                  primaryColor={primaryColor}
                  roundedClass="rounded-xl"
                />
                <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  Default currency symbol used across balances and transactions.
                </p>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center ${
                    isDark
                      ? "text-slate-300 bg-[#161522] hover:bg-[#1f1e2f]"
                      : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 text-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET TRANSACTIONS CONFIRMATION MODAL WITH PASSWORD VERIFICATION */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? "bg-[#121118] border-[#1f1e2b] text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/40">
              <HiOutlineExclamationTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Reset All Transactions?
              </h3>
              <p
                className={`text-xs px-1 leading-relaxed ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                Enter your account password to confirm permanent deletion of all your transaction records.
              </p>
            </div>

            <form onSubmit={handleConfirmResetTransactions} className="space-y-3 pt-1">
              <div className="text-left">
                <label
                  className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Account Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={resetPasswordInput}
                    onChange={(e) => {
                      setResetPasswordInput(e.target.value);
                      if (resetPasswordError) setResetPasswordError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isResettingTransactions}
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-xs border focus:outline-none transition-all ${
                      resetPasswordError
                        ? "border-rose-500 ring-1 ring-rose-500/20"
                        : isDark
                        ? "bg-[#161522] border-[#232234] text-white focus:border-slate-400"
                        : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors cursor-pointer ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    tabIndex={-1}
                    aria-label={showResetPassword ? "Hide password" : "Show password"}
                  >
                    {showResetPassword ? (
                      <HiEyeSlash className="w-4 h-4" />
                    ) : (
                      <HiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {resetPasswordError && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{resetPasswordError}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!isResettingTransactions) {
                      setShowResetConfirmModal(false);
                      setResetPasswordInput("");
                      setResetPasswordError("");
                      setShowResetPassword(false);
                    }
                  }}
                  disabled={isResettingTransactions}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? "text-slate-300 bg-[#161522] hover:bg-[#1f1e2f]"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingTransactions}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isResettingTransactions ? (
                    <>
                      <HiArrowPath className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Reset All Data</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150 ${isDark ? "bg-[#121118] border-[#1f1e2b]" : "bg-white border-gray-200"}`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/40">
              <HiOutlineExclamationTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Sign Out of SpendScope?
              </h3>
              <p
                className={`text-xs px-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                Are you sure you want to log out? You will need to sign back in
                to access your workspace.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirmModal(false)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isDark
                    ? "text-slate-300 bg-[#161522] hover:bg-[#1f1e2f]"
                    : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
