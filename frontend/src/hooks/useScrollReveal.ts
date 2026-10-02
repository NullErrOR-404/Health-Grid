import { useEffect } from 'react';

/**
 * High-performance hardware-accelerated scroll reveal observer.
 * Uses native IntersectionObserver off the main thread to add the '.revealed' class
 * to elements matching '.reveal-init' or '.reveal-scale-init'.
 * Automatically unobserves elements once revealed (single execution) to maintain 60fps.
 */
export function useScrollReveal(dependencies: unknown[] = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: reveal all immediately if IntersectionObserver is not available
      document.querySelectorAll('.reveal-init, .reveal-scale-init').forEach((el) => {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px', // Trigger slightly before it hits the viewport bottom
        threshold: 0.08,
      }
    );

    // Microtask delay so DOM is rendered and layout is established
    const timeoutId = setTimeout(() => {
      const targets = document.querySelectorAll('.reveal-init:not(.revealed), .reveal-scale-init:not(.revealed)');
      targets.forEach((el) => observer.observe(el));
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, dependencies);
}
