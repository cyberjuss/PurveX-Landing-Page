"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function LoadingSplash() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const minDisplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const MIN_DISPLAY_MS = 1150;
    const FADE_OUT_MS = 300;
    const SAFETY_MS = 1500;

    // Hide immediate splash once React component is mounted
    const immediateSplash = document.getElementById("immediate-splash");
    if (immediateSplash) {
      immediateSplash.style.display = "none";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    // Hide scrollbar when loading starts
    const hideScrollbar = () => {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };

    // Show scrollbar when loading finishes
    const showScrollbar = () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      // Force remove any inline styles that might persist
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
    };

    const startFadeOut = () => {
      // Clear any existing timers
      if (minDisplayTimerRef.current) {
        clearTimeout(minDisplayTimerRef.current);
        minDisplayTimerRef.current = null;
      }
      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current);
        fadeOutTimerRef.current = null;
      }

      // Keep refresh splash short so reloads do not feel blocked.
      hideScrollbar();
      setIsLoading(true);
      setIsFadingOut(false);

      minDisplayTimerRef.current = setTimeout(() => {
        setIsFadingOut(true);
        // Remove from DOM after fade animation completes
        fadeOutTimerRef.current = setTimeout(() => {
          setIsLoading(false);
          setIsFadingOut(false);
          // Restore scrollbar after splash is completely gone
          showScrollbar();
        }, FADE_OUT_MS);
      }, MIN_DISPLAY_MS);
    };

    startFadeOut();

    // Safety: Always ensure scrollbar is restored after splash should be done
    const restoreScrollbarTimeout = setTimeout(() => {
      showScrollbar();
    }, SAFETY_MS);

    return () => {
      if (minDisplayTimerRef.current) {
        clearTimeout(minDisplayTimerRef.current);
        minDisplayTimerRef.current = null;
      }
      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current);
        fadeOutTimerRef.current = null;
      }
      if (restoreScrollbarTimeout) {
        clearTimeout(restoreScrollbarTimeout);
      }
      // Always restore scrollbar on cleanup
      showScrollbar();
    };
  }, [pathname]);

  // Always show on initial render for page refresh, hide only when explicitly set to false
  if (!isLoading) return null;

  return (
    <div 
      data-loading-splash="true"
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "#141414",
      }}
    >
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative">
          <div
            className="relative flex h-44 w-44 items-center justify-center rounded-[22%] border border-[#2f2f2f] bg-[#1b1b1b]"
            style={{
              animation: "fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <Image
              src="/logo.png"
              alt="PurveX Logo"
              width={116}
              height={116}
              className="object-contain"
              style={{
                animation: "fadeInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                animationDelay: "0.15s",
                animationFillMode: "both"
              }}
              priority
            />
          </div>
        </div>
        
        <div
          className="flex items-center gap-3"
          style={{
            animation: "fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            animationDelay: "0.35s",
            animationFillMode: "both"
          }}
        >
          <span className="h-3.5 w-3.5 rounded-full bg-zinc-200" style={{ animation: "dot-pulse 1.1s ease-in-out infinite", animationDelay: "0s" }} />
          <span className="h-3.5 w-3.5 rounded-full bg-zinc-300" style={{ animation: "dot-pulse 1.1s ease-in-out infinite", animationDelay: "0.14s" }} />
          <span className="h-3.5 w-3.5 rounded-full bg-zinc-400" style={{ animation: "dot-pulse 1.1s ease-in-out infinite", animationDelay: "0.28s" }} />
        </div>
      </div>
    </div>
  );
}
