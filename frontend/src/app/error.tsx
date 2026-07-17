"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log digest only in production to avoid leaking stack traces
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl border border-destructive/30 bg-card/80 backdrop-blur-sm px-10 py-12 max-w-md shadow-sm">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" aria-hidden />
        <h1 className="text-xl font-semibold text-foreground font-[family-name:var(--font-display)]">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          An unexpected error occurred in this part of the app. You can try again or return to the dashboard.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
