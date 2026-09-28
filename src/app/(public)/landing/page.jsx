"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "./sections/HeroSection";
import CategoriesSection from "./sections/CategoriesSection";
import FeaturesSection from "./sections/FeaturesSection";
import CTASection from "./sections/CTASection";
import { useTheme } from "styled-components";
import { useSelector } from "react-redux";

export default function LandingPage() {
  const themeContext = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeContext?.colors ? themeContext : reduxTheme;
  const isDark = currentTheme?.mode === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-200 ${
        isDark ? "bg-[#0b0f19] text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Navigation Header */}
      <Header />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <HeroSection />

        {/* Spending Categories Section */}
        <CategoriesSection />

        {/* Powerful Features Section */}
        <FeaturesSection />

        {/* CTA Banner Section */}
        <CTASection />

        {/* Contact anchor target */}
        <div id="contact" className="h-4" />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
