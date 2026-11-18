import { useEffect, useRef, useCallback } from 'react';

/**
 * useInfiniteScroll Hook
 * 
 * Attaches a native browser IntersectionObserver to a sentinel DOM element.
 * Triggers onIntersect callback when the sentinel comes within the specified rootMargin
 * of the viewport, enabling seamless on-demand data hydration without traditional pagination buttons.
 * 
 * Memory & Performance Guards:
 * - Automatically unobserves & disconnects previous observer instances on unmount/rebind.
 * - Suppresses firing when isLoading is true or hasMore is false to avoid duplicate network fetches.
 * 
 * @param {Object} options
 * @param {Function} options.onIntersect - Callback invoked when sentinel intersects viewport
 * @param {boolean} options.isLoading - Prevents re-triggering while a fetch is already in-flight
 * @param {boolean} options.hasMore - Disables observing when all pages have been hydrated
 * @param {string} options.rootMargin - Pre-fetching buffer distance (default: '250px')
 */
export function useInfiniteScroll({
  onIntersect,
  isLoading = false,
  hasMore = true,
  rootMargin = '250px',
}) {
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        onIntersect();
      }
    },
    [onIntersect, hasMore, isLoading]
  );

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;

    // Disconnect any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!hasMore) {
      return;
    }

    // Initialize IntersectionObserver with rootMargin buffer for seamless pre-fetching
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null, // Default to browser viewport
      rootMargin,
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, hasMore, rootMargin]);

  return { sentinelRef };
}

export default useInfiniteScroll;
