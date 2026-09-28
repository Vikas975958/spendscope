import "./globals.css";
import Providers from "./provider";

export const metadata = {
  title: "SpendScope",
  description: "SpendScope - Expense Tracking & Scope Management",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-gray-50 text-gray-900"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
