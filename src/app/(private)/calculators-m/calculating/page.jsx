"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EmiC from "../components/EmiC";
import Qcalculator from "../components/Qcalculator";
import EmiAdvance from "../components/EmiAdvance";
import CompareLoan from "../components/CompareLoan";

const CalculatorContent = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  switch (type) {
    case "quick-calculator":
      return <Qcalculator />;
    case "emi-in-advance":
      return <EmiAdvance />;
    case "compare-loans":
      return <CompareLoan />;
    case "emi-calculator":
    default:
      return <EmiC />;
  }
};

const CalculatingPage = () => {
  return (
    <div className="w-full flex justify-center">
      <div
        className="w-full max-w-[500px] mx-auto"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <Suspense
          fallback={
            <div className="p-6 text-center text-sm">Loading calculator...</div>
          }
        >
          <CalculatorContent />
        </Suspense>
      </div>
    </div>
  );
};

export default CalculatingPage;
