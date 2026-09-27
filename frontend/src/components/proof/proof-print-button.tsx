"use client";

import type { ReactNode } from "react";

// Opens the browser's print dialog, where "Save as PDF" downloads the portfolio.
export function ProofPrintButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="pp-btn pp-btn--ghost" onClick={() => window.print()}>
      {children}
    </button>
  );
}
