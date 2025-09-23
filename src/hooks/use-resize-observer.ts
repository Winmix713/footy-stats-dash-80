import { useEffect, useRef } from 'react';

/**
 * Hook a ResizeObserver API használatához, amely figyeli egy elem méretváltozásait.
 * 
 * @param ref A megfigyelt elem referenciája
 * @param callback Függvény, amely meghívódik a méretváltozáskor
 */
export function useResizeObserver<T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback: (entry: ResizeObserverEntry) => void
): void {
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    // Korábbi observer megsemmisítése
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Új observer létrehozása
    observerRef.current = new ResizeObserver((entries) => {
      if (entries[0]) {
        callback(entries[0]);
      }
    });

    // Elem megfigyelése
    if (ref.current) {
      observerRef.current.observe(ref.current);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref, callback]);
}
