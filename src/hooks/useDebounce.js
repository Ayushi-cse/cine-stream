import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * 
 * Intercepts rapid state updates (e.g., search input keystrokes) and delays updating
 * the returned debounced value until after the specified delay has passed without new input.
 * 
 * Engineering Rationale:
 * If a user rapidly types "Spider-Man", standard onChange bindings would dispatch
 * 10 consecutive network requests. Debouncing coalesces these into a single targeted
 * fetch after the user pauses typing for 500ms, conserving server compute and client bandwidth.
 * 
 * @param {any} value - The volatile raw input value
 * @param {number} delayMs - Inactivity threshold in milliseconds (default: 500ms)
 * @returns {{ debouncedValue: any, isDebouncing: boolean }}
 */
export function useDebounce(value, delayMs = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    // Flag immediately that typing is in progress
    if (value !== debouncedValue) {
      setIsDebouncing(true);
    }

    // Schedule timer to hydrate debounced state after delayMs of inactivity
    const timerId = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delayMs);

    // Teardown: Clear pending timer if a new keystroke occurs before delay expires
    return () => {
      clearTimeout(timerId);
    };
  }, [value, delayMs, debouncedValue]);

  return { debouncedValue, isDebouncing };
}

export default useDebounce;
