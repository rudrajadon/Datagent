"use client";

import { useRef } from "react";

type noop = (...args: any[]) => any;

/**
 * usePersistFn to keep a stable function reference while using the latest closure.
 */
export function usePersistFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  const persistFn = useRef<T | null>(null);
  if (!persistFn.current) {
    persistFn.current = function (this: unknown, ...args) {
      return fnRef.current!.apply(this, args);
    } as T;
  }

  return persistFn.current;
}