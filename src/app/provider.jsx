"use client";

import "@ant-design/v5-patch-for-react-19";
import React, { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "styled-components";
import StyledComponentsRegistry from "@/lib/registry";
import { store, persistor } from "../redux";
import { theme as defaultTheme } from "@/utils/theme";

function ReduxThemeBridge({ children }) {
  const themeState = useSelector((state) => state?.themeSlice || state?.theme);
  const currentTheme = themeState || defaultTheme;

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (currentTheme?.mode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      if (currentTheme?.colors) {
        Object.entries(currentTheme.colors).forEach(([key, val]) => {
          root.style.setProperty(`--theme-${key}`, val);
        });
        if (currentTheme.colors.primary) {
          root.style.setProperty("--primary", currentTheme.colors.primary);
        }
        if (currentTheme.colors.bg) {
          root.style.setProperty("--background", currentTheme.colors.bg);
        }
        if (currentTheme.colors.text) {
          root.style.setProperty("--foreground", currentTheme.colors.text);
        }
      }
    }
  }, [currentTheme]);

  return (
    <ThemeProvider theme={currentTheme}>
      {children}
    </ThemeProvider>
  );
}

export default function Providers({ children }) {
  return (
    <StyledComponentsRegistry>
      <Provider store={store}>
        <PersistGate
          loading={
            <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center text-[#696969] font-sans">
              Loading…
            </div>
          }
          persistor={persistor}
        >
          <ReduxThemeBridge>{children}</ReduxThemeBridge>
        </PersistGate>
      </Provider>
    </StyledComponentsRegistry>
  );
}
