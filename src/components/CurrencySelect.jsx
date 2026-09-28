"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiChevronDown, HiCheck, HiMagnifyingGlass } from "react-icons/hi2";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/utils/currencies";

export default function CurrencySelect({
  value = DEFAULT_CURRENCY.code,
  onChange,
  isDark = false,
  primaryColor = "#EB5757",
  className = "",
  roundedClass = "rounded-lg",
  id = "currency-select",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedCurrency = useMemo(
    () => CURRENCIES.find((c) => c.code === value) || CURRENCIES[0],
    [value]
  );

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return CURRENCIES;
    const q = searchQuery.toLowerCase().trim();
    return CURRENCIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleSelect = (code) => {
    if (onChange) {
      onChange(code);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button - Sized identically to input fields */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-2.5 ${roundedClass} border text-sm flex items-center justify-between transition-all cursor-pointer text-left focus:outline-none ${
          isDark
            ? "bg-[#161522] border-[#232234] text-white focus:border-slate-400"
            : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-slate-300"
        } ${isOpen ? (isDark ? "border-slate-400" : "ring-2 ring-slate-300 border-gray-400") : ""}`}
        style={isOpen ? { borderColor: primaryColor } : {}}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-base leading-none shrink-0">{selectedCurrency.flag}</span>
          <span className="font-semibold text-sm truncate">
            {selectedCurrency.code} ({selectedCurrency.symbol})
          </span>
          <span
            className={`text-xs truncate hidden sm:inline ${
              isDark ? "text-slate-400" : "text-gray-500"
            }`}
          >
            - {selectedCurrency.name}
          </span>
        </div>
        <HiChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isDark ? "text-slate-400" : "text-gray-500"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-1.5 z-50 ${roundedClass} border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? "bg-[#161522] border-[#232234] text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          {/* Search bar */}
          <div
            className={`p-2 border-b flex items-center gap-2 ${
              isDark ? "border-[#232234] bg-[#111019]" : "border-gray-100 bg-gray-50"
            }`}
          >
            <HiMagnifyingGlass
              className={`w-4 h-4 shrink-0 ${isDark ? "text-slate-500" : "text-gray-400"}`}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search currency or country..."
              className={`w-full bg-transparent text-xs focus:outline-none ${
                isDark ? "text-white placeholder-slate-500" : "text-gray-800 placeholder-gray-400"
              }`}
            />
          </div>

          {/* List items */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredCurrencies.length === 0 ? (
              <div
                className={`py-4 text-center text-xs ${
                  isDark ? "text-slate-500" : "text-gray-400"
                }`}
              >
                No currency found
              </div>
            ) : (
              filteredCurrencies.map((c) => {
                const isSelected = c.code === value;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                      isSelected
                        ? isDark
                          ? "bg-[#1f1e2f] text-white font-semibold"
                          : "bg-gray-100 text-gray-900 font-semibold"
                        : isDark
                        ? "hover:bg-[#1f1e2f]/70 text-slate-300 hover:text-white"
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none shrink-0">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {c.code} ({c.symbol})
                      </span>
                      {isSelected && (
                        <HiCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
