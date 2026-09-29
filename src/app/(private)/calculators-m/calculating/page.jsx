"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "styled-components";
import EmiC from "../components/EmiC";
import Qcalculator from "../components/Qcalculator";
import EmiAdvance from "../components/EmiAdvance";
import CompareLoan from "../components/CompareLoan";
import FdCalculator from "../components/FdCalculator";
import RdCalculator from "../components/RdCalculator";
import PpfCalculator from "../components/PpfCalculator";
import InterestCalculator from "../components/InterestCalculator";
import InflationImpact from "../components/InflationImpact";
import SipCalculator from "../components/SipCalculator";
import SwpCalculator from "../components/SwpCalculator";
import StpCalculator from "../components/StpCalculator";
import StepUpSipCalculator from "../components/StepUpSipCalculator";
import CashNoteCounter from "../components/CashNoteCounter";
import SipWithInflation from "../components/SipWithInflation";
import GstCalculator from "../components/GstCalculator";
import VatCalculator from "../components/VatCalculator";
import AmountToWord from "../components/AmountToWord";
import DiscountCalculator from "../components/DiscountCalculator";
import CurrencyConverter from "../components/CurrencyConverter";

const CalculatorContent = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  switch (type) {
    case "emi-calculator":
      return <EmiC />;
    case "quick-calculator":
      return <Qcalculator />;
    case "emi-in-advance":
      return <EmiAdvance />;
    case "compare-loans":
      return <CompareLoan />;
    case "fd-calculator":
      return <FdCalculator />;
    case "rd-calculator":
      return <RdCalculator />;
    case "ppf-calculator":
      return <PpfCalculator />;
    case "interest-calculator":
      return <InterestCalculator />;
    case "inflation-impact":
      return <InflationImpact />;
    case "sip-calculator":
      return <SipCalculator />;
    case "swp-calculator":
      return <SwpCalculator />;
    case "stp-calculator":
      return <StpCalculator />;
    case "step-up-sip":
      return <StepUpSipCalculator />;
    case "sip-with-inflation":
      return <SipWithInflation />;
    case "cash-note-counter":
      return <CashNoteCounter />;
    case "amount-to-word":
      return <AmountToWord />;
    case "gst-calculator":
      return <GstCalculator />;
    case "vat-calculator":
      return <VatCalculator />;
    case "discount-calculator":
      return <DiscountCalculator />;
    case "currency-converter":
      return <CurrencyConverter />;
    default:
      return <h1>In comming</h1>;
  }
};

const CalculatingPage = () => {
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const themeContext = useTheme();
  const currentTheme = themeContext?.colors ? themeContext : themeState;
  const isDark = currentTheme?.mode === "dark" || themeState?.mode === "dark";

  return (
    <div
      className={`w-full min-h-screen pb-16 transition-colors duration-200 flex justify-center ${
        isDark ? "bg-[#08070b] text-slate-100" : "bg-[#f4f5f9] text-gray-900"
      }`}
    >
      <div
        className="w-full max-w-[500px] mx-auto pt-1"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <Suspense
          fallback={
            <div className="p-6 text-center text-sm font-medium">Loading calculator...</div>
          }
        >
          <CalculatorContent />
        </Suspense>
      </div>
    </div>
  );
};

export default CalculatingPage;
