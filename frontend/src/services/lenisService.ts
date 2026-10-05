import Lenis from 'lenis';
import gsap from 'gsap';

/**
 * HealthGrid Global Lenis Smooth Scroll Service
 * 
 * Configures 60fps inertia smooth scrolling across desktop browsers,
 * synchronizes with GSAP ticker for locked frame budgets, observes dynamic DOM
 * resize events (medicine queries, image loads) to prevent scroll lockups,
 * and preserves native mobile touch momentum without touch hijacking.
 */

class LenisService {
  private lenisInstance: Lenis | null = null;
  private tickerCallback: ((time: number) => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private isPaused: boolean = false;

  init(): Lenis {
    if (this.lenisInstance) {
      return this.lenisInstance;
    }

    this.lenisInstance = new Lenis({
      duration: 1.15, // Silky, responsive inertia feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.0,
      syncTouch: false, // CRITICAL: Never hijack native touch momentum scrolling on mobile devices!
      infinite: false,
      prevent: (node) => {
        // Exempt any scrollable dialog or lenis-prevent container from Lenis interception
        return !!node.closest?.('[data-lenis-prevent]') || 
               !!node.closest?.('.overflow-y-auto') || 
               !!node.closest?.('.overflow-y-scroll');
      },
      virtualScroll: ({ event }) => {
        // ALWAYS bypass Lenis entirely on touch events so mobile devices retain 100% native momentum scrolling
        if (event.type && event.type.includes('touch')) {
          return false;
        }
        return true;
      },
    });

    // Synchronize Lenis RAF loop with GSAP ticker for 60fps compositor alignment
    this.tickerCallback = (time: number) => {
      // GSAP ticker gives time in seconds; Lenis expects milliseconds
      this.lenisInstance?.raf(time * 1000);
    };
    gsap.ticker.add(this.tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Auto-update Lenis scroll boundaries whenever dynamic content (medicines, images) resizes
    if (typeof window !== 'undefined' && 'ResizeObserver' in window && document.body) {
      this.resizeObserver = new ResizeObserver(() => {
        this.lenisInstance?.resize();
      });
      this.resizeObserver.observe(document.body);
    }

    // Backup listener for image loads and viewport orientation changes
    window.addEventListener('resize', this.handleResize, { passive: true });
    window.addEventListener('load', this.handleResize, { passive: true });

    return this.lenisInstance;
  }

  private handleResize = () => {
    this.lenisInstance?.resize();
  };

  getInstance(): Lenis | null {
    return this.lenisInstance;
  }

  /**
   * Recalculates document scroll height (e.g. after Supabase fetch or view toggle)
   */
  resize(): void {
    this.lenisInstance?.resize();
  }

  /**
   * Pauses Lenis smooth scrolling (e.g., when full-screen modals are active)
   */
  pause(): void {
    if (this.lenisInstance && !this.isPaused) {
      this.lenisInstance.stop();
      this.isPaused = true;
      document.documentElement.classList.add('lenis-stopped');
    }
  }

  /**
   * Resumes Lenis smooth scrolling when modals close
   */
  resume(): void {
    if (this.lenisInstance && this.isPaused) {
      this.lenisInstance.start();
      this.isPaused = false;
      document.documentElement.classList.remove('lenis-stopped');
      this.lenisInstance.resize();
    }
  }

  /**
   * Programmatic smooth scroll to target selector, offset, or DOM node
   */
  scrollTo(
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean; lock?: boolean }
  ): void {
    if (this.lenisInstance) {
      this.lenisInstance.scrollTo(target, options);
    } else {
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  destroy(): void {
    if (this.tickerCallback) {
      gsap.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('load', this.handleResize);

    if (this.lenisInstance) {
      this.lenisInstance.destroy();
      this.lenisInstance = null;
    }
    this.isPaused = false;
    document.documentElement.classList.remove('lenis-stopped');
  }
}

export const lenisService = new LenisService();

