"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import {
  HiPlus,
  HiPencilSquare,
  HiXMark,
  HiArrowPath,
  HiExclamationTriangle,
  HiCheck,
} from "react-icons/hi2";
import { theme as defaultTheme, colors as themeColors } from "@/utils/theme";

const PRESET_COLORS =
  themeColors && themeColors.length > 0
    ? themeColors.slice(0, 10)
    : [defaultTheme.colors.primary];

export default function CategoryModal({
  isOpen,
  onClose,
  categories = [],
  createCategory,
  updateCategory,
  deleteCategory,
  initialEditCategory = null,
  initialType = "Expense",
}) {
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;

  const primaryColor =
    currentTheme?.colors?.primary || themeState?.colors?.primary || defaultTheme.colors.primary;
  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  // Form states
  const [editingCategory, setEditingCategory] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState(initialType || "Expense");
  const [colorInput, setColorInput] = useState(primaryColor);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEditCategory) {
      setEditingCategory(initialEditCategory);
      setNameInput(initialEditCategory.name || "");
      setTypeInput(initialEditCategory.type || "Expense");
      setColorInput(initialEditCategory.color_code || primaryColor);
    } else {
      setEditingCategory(null);
      setNameInput("");
      setTypeInput(initialType || "Expense");
      setColorInput(initialType === "Income" ? "#10B981" : primaryColor);
    }
    setFormError("");
  }, [initialEditCategory, initialType, isOpen, primaryColor]);

  if (!isOpen) return null;

  const handleCancel = () => {
    setEditingCategory(null);
    setNameInput("");
    setFormError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setFormError("Please enter a category name.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const payload = {
      name: trimmed,
      type: typeInput,
      icon: "🏷️",
      color_code: colorInput,
    };

    if (editingCategory) {
      const res = await updateCategory(editingCategory.id, payload);
      setIsSubmitting(false);
      if (res.success) {
        handleCancel();
      } else {
        setFormError(res.error || "Failed to update category.");
      }
    } else {
      const res = await createCategory(payload);
      setIsSubmitting(false);
      if (res.success) {
        handleCancel();
      } else {
        setFormError(res.error || "Failed to create category.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`relative border rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto ${
          isDark
            ? "bg-[#121118] border-[#1f1e2b] text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1f1e2b] pb-3">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {editingCategory
                ? "Update your customized category details."
                : "Create a new custom category for your transactions."}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-[#1a1926]"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Add / Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Category Type
            </label>
            <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-[#161522] border border-gray-200 dark:border-[#232234]">
              <button
                type="button"
                onClick={() => {
                  setTypeInput("Expense");
                  if (!editingCategory) setColorInput("#FF6B6B");
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeInput === "Expense"
                    ? "bg-[#FF6B6B] text-white shadow-xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setTypeInput("Income");
                  if (!editingCategory) setColorInput("#10B981");
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeInput === "Income"
                    ? "bg-[#10B981] text-white shadow-xs"
                    : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Category Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder="e.g. Groceries, Freelance, Subscriptions..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isDark
                  ? "bg-[#161522] border-[#232234] text-white placeholder-slate-500 focus:border-[#8B5CF6]"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500"
              }`}
              style={{ borderColor: formError ? "#EF4444" : undefined }}
              autoFocus
              required
            />
            {formError && (
              <p className="text-[11px] text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                <HiExclamationTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </p>
            )}
          </div>

          {/* Color Swatches */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Color Tag
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorInput(color)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-2xs"
                  style={{ backgroundColor: color }}
                >
                  {colorInput === color && (
                    <HiCheck className="w-4 h-4 text-white stroke-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 sm:gap-2.5 border-t border-gray-100 dark:border-[#1f1e2b]">
            <button
              type="button"
              onClick={handleCancel}
              className={`w-full xs:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors text-center cursor-pointer ${
                isDark
                  ? "text-slate-300 bg-[#161522] hover:bg-[#1f1e2f]"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full xs:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor:
                  typeInput === "Expense" ? "#FF6B6B" : "#10B981",
              }}
            >
              {isSubmitting ? (
                <>
                  <HiArrowPath className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : editingCategory ? (
                <>
                  <HiPencilSquare className="w-3.5 h-3.5" />
                  <span>Update Category</span>
                </>
              ) : (
                <>
                  <HiPlus className="w-3.5 h-3.5 stroke-2" />
                  <span>Save Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
