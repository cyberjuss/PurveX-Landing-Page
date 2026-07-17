"use client";

import { useEffect, useState, useRef, startTransition } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function PageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip transition on initial mount (full page refresh uses LoadingSplash)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPathnameRef.current = pathname;
      
      // Check if this is a full page refresh - if so, don't show transition
      if (typeof window !== "undefined") {
        let isPageRefresh = false;
        try {
          const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
          if (navEntry) {
            isPageRefresh = navEntry.type === "reload";
          } else if (performance.navigation) {
            const legacyNav: PerformanceNavigation | undefined = performance.navigation;
            isPageRefresh = legacyNav?.type === PerformanceNavigation.TYPE_RELOAD;
          }
        } catch {
          // If we can't determine, assume it's a refresh if document was loading
          isPageRefresh = document.readyState === "loading";
        }
        
        if (isPageRefresh) {
          return;
        }
      }
      return;
    }

    // Only show transition if pathname actually changed (navigation between pages)
    if (pathname !== prevPathnameRef.current && prevPathnameRef.current !== null) {
      // Clear any existing timers first
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current);
        fadeOutTimerRef.current = null;
      }
      
      // Reset state and start transition without blocking paint
      startTransition(() => {
        setIsFadingOut(false);
        setIsTransitioning(true);
      });
      
      const HOLD_DURATION = 1050;
      const FADE_DURATION = 250;
      
      transitionTimerRef.current = setTimeout(() => {
        setIsFadingOut(true);
      }, HOLD_DURATION);
      
      fadeOutTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setIsFadingOut(false);
      }, HOLD_DURATION + FADE_DURATION);
      
      prevPathnameRef.current = pathname;
      
      return () => {
        if (transitionTimerRef.current) {
          clearTimeout(transitionTimerRef.current);
          transitionTimerRef.current = null;
        }
        if (fadeOutTimerRef.current) {
          clearTimeout(fadeOutTimerRef.current);
          fadeOutTimerRef.current = null;
        }
      };
    } else {
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  if (!isTransitioning) return null;

  return (
    <div
      className={`fixed inset-0 z-[9998] flex items-center justify-center transition-opacity duration-[320ms] ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "rgba(20,20,20,0.96)",
      }}
      role="status"
      aria-live="polite"
      aria-label="Page transition in progress"
    >
      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className="relative">
          <div
            className="relative flex h-40 w-40 items-center justify-center border border-[#303030] bg-[#1b1b1b]"
            style={{
              borderRadius: "22%",
              animation: "fadeInScale 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <Image
              src="/logo.png"
              alt="PurveX Logo"
              width={108}
              height={108}
              className="object-contain"
              style={{
                animation: "fadeInScale 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
                animationDelay: "0.1s",
                animationFillMode: "both"
              }}
              priority
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4" aria-hidden="true">
          <div 
            className="h-3.5 w-3.5 rounded-full bg-zinc-200"
            style={{
              animation: "dot-pulse 1.05s ease-in-out infinite",
              animationDelay: "0s"
            }}
          />
          <div 
            className="h-3.5 w-3.5 rounded-full bg-zinc-300"
            style={{
              animation: "dot-pulse 1.05s ease-in-out infinite",
              animationDelay: "0.14s"
            }}
          />
          <div 
            className="h-3.5 w-3.5 rounded-full bg-zinc-400"
            style={{
              animation: "dot-pulse 1.05s ease-in-out infinite",
              animationDelay: "0.28s"
            }}
          />
        </div>
      </div>
    </div>
  );
}
