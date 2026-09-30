import Lenis from 'lenis';

/**
 * HealthGrid Global Lenis Smooth Scroll Service
 * 
 * Configures inertia smooth scrolling across the application,
 * synchronizes with requestAnimationFrame, and coordinates with
 * full-screen modals & interactive maps using auto-pause and 'data-lenis-prevent'.
 */

class LenisService {
  private lenisInstance: Lenis | null = null;
  private rafId: number | null = null;
  private isPaused: boolean = false;

  init(): Lenis {
    if (this.lenisInstance) {
      return this.lenisInstance;
    }

    this.lenisInstance = new Lenis({
      duration: 1.1, // Smooth, responsive inertia feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
    });

    const onRaf = (time: number) => {
      this.lenisInstance?.raf(time);
      this.rafId = requestAnimationFrame(onRaf);
    };

    this.rafId = requestAnimationFrame(onRaf);
    return this.lenisInstance;
  }

  getInstance(): Lenis | null {
    return this.lenisInstance;
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
    }
  }

  /**
   * Programmatic smooth scroll to target selector, offset, or DOM node
   */
  scrollTo(target: string | number | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }): void {
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
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.lenisInstance) {
      this.lenisInstance.destroy();
      this.lenisInstance = null;
    }
    this.isPaused = false;
  }
}

export const lenisService = new LenisService();
