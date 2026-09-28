import React from "react";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen w-full antialiased">
      {children}
    </div>
  );
}
