import React from "react";
import Link from "next/link";
import { theme } from "@/utils/theme";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
      <Link
        href="/"
        style={{ backgroundColor: theme.colors.primary }}
        className="px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        Go Back Home
      </Link>
    </div>
  );
}
