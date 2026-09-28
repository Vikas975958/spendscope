"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import { HiArrowPath, HiOutlineExclamationTriangle, HiXMark } from "react-icons/hi2";
import { resetUserTransactions } from "@/services/resetSevices";
import { theme as defaultTheme } from "@/utils/theme";

export default function ResetButton({
  isDropdownItem = true,
  onOpen,
  onResetComplete,
  className = "",
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeContext = useTheme();
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : themeState;
  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  const handleOpenModal = () => {
    if (onOpen) {
      onOpen();
    }
    setShowConfirmModal(true);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      const res = await resetUserTransactions();
      if (res.success) {
        setShowConfirmModal(false);
        if (onResetComplete) {
          onResetComplete();
        }
      }
    } catch (err) {
      console.error("Error resetting user transactions:", err);
    } finally {
      setIsResetting(false);
    }
  };

  const modalContent = showConfirmModal && (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`w-full max-w-sm rounded-2xl p-5 sm:p-6 shadow-2xl border animate-in fade-in zoom-in-95 duration-150 my-auto ${
          isDark
            ? "bg-[#161522] border-[#232234] text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <button
            type="button"
            onClick={() => !isResetting && setShowConfirmModal(false)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            }`}
            disabled={isResetting}
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-base font-bold mb-1.5">Reset All Transactions?</h3>
        <p
          className={`text-xs leading-relaxed mb-6 ${
            isDark ? "text-slate-400" : "text-gray-600"
          }`}
        >
          This will permanently delete all your logged income and expense transaction records from the database. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setShowConfirmModal(false)}
            disabled={isResetting}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? "text-slate-300 bg-[#1f1e2f] hover:bg-[#28273d]"
                : "text-gray-700 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isResetting ? (
              <>
                <HiArrowPath className="w-4 h-4 animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <span>Reset All Data</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isDropdownItem ? (
        <button
          type="button"
          onClick={handleOpenModal}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer ${className}`}
        >
          <HiArrowPath className="w-4 h-4 text-rose-500" />
          <span>Reset Transactions</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpenModal}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 transition-all cursor-pointer ${className}`}
        >
          <HiArrowPath className="w-4 h-4 text-rose-500" />
          <span>Reset Data</span>
        </button>
      )}

      {/* RENDER MODAL VIA PORTAL TO BODY */}
      {mounted && showConfirmModal && createPortal(modalContent, document.body)}
    </>
  );
}
