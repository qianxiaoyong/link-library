"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StatsToastVariant = "success" | "error" | "warning" | "info";

export type StatsToast = {
  message: string;
  variant: StatsToastVariant;
};

const TOAST_DURATION_MS = 5000;

export function useStatsToast(durationMs = TOAST_DURATION_MS) {
  const [toast, setToast] = useState<StatsToast | null>(null);
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (message: string, variant: StatsToastVariant = "info") => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      setToast({ message, variant });
      timerRef.current = window.setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, durationMs);
    },
    [durationMs],
  );

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  return { toast, showToast };
}

export function getStatsToastClassName(variant: StatsToastVariant): string {
  switch (variant) {
    case "success":
      return "bg-emerald-50 text-emerald-800";
    case "error":
      return "bg-red-50 text-red-700";
    case "warning":
      return "bg-amber-50 text-amber-800";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}
