"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PageToastVariant = "success" | "error" | "warning" | "info";

export type PageToast = {
  message: string;
  variant: PageToastVariant;
};

const TOAST_DURATION_MS = 5000;

export function usePageToast(durationMs = TOAST_DURATION_MS) {
  const [toast, setToast] = useState<PageToast | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearToast = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, variant: PageToastVariant = "info") => {
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

  return { toast, showToast, clearToast };
}

export function getToastClassName(variant: PageToastVariant): string {
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
