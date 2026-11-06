"use client";

import type { ReactNode } from "react";

// Opens the browser's print dialog, where "Save as PDF" downloads the portfolio.
export function ProofPrintButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <button type="button" className={`pp-btn ${className}`.trim()} onClick={() => window.print()}>
      {children}
    </button>
  );
}
