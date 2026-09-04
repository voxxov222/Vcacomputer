import { useState, useRef, useEffect, useCallback } from 'react';
import { VCA_VISUAL_CONFIG, VCAVisualConfig } from '../../lib/visualConfig';

export interface TiltState {
  rotateX: number;
  rotateY: number;
  pointerX: number; // 0 to 1
  pointerY: number; // 0 to 1
  isHovered: boolean;
  isTouchDragging: boolean;
}

export interface UseTiltOptions {
  config?: Partial<VCAVisualConfig>;
  disabled?: boolean;
}

export function useTilt(options: UseTiltOptions = {}) {
  const mergedConfig = { ...VCA_VISUAL_CONFIG, ...(options.config || {}) };
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    pointerX: 0.5,
    pointerY: 0.5,
    isHovered: false,
    isTouchDragging: false
  });

  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafId = useRef<number | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion.current = mediaQuery.matches;

      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotion.current = e.matches;
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const updateTilt = useCallback((clientX: number, clientY: number, isTouch = false) => {
    if (options.disabled || (mergedConfig.reducedMotionSupport && prefersReducedMotion.current)) {
      return;
    }

    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Calculate relative pointer positions (0 to 1)
    const rawX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    // Centered coordinates: -0.5 to +0.5
    const centerX = rawX - 0.5;
    const centerY = rawY - 0.5;

    // Rotation calculation
    // When pointer is on top (centerY < 0), card should tilt back (positive rotateX in standard 3d)
    const factor = mergedConfig.tiltFactor;
    const maxA = mergedConfig.maxAngle;

    const rotX = -centerY * factor * maxA;
    const rotY = centerX * factor * maxA;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      setTilt({
        rotateX: Math.round(rotX * 100) / 100,
        rotateY: Math.round(rotY * 100) / 100,
        pointerX: rawX,
        pointerY: rawY,
        isHovered: true,
        isTouchDragging: isTouch
      });
    });
  }, [options.disabled, mergedConfig.tiltFactor, mergedConfig.maxAngle, mergedConfig.reducedMotionSupport]);

  const resetTilt = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    rafId.current = requestAnimationFrame(() => {
      setTilt((prev) => ({
        ...prev,
        rotateX: 0,
        rotateY: 0,
        pointerX: 0.5,
        pointerY: 0.5,
        isHovered: false,
        isTouchDragging: false
      }));
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    updateTilt(e.clientX, e.clientY, false);
  }, [updateTilt]);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    updateTilt(e.clientX, e.clientY, false);
  }, [updateTilt]);

  const handleMouseLeave = useCallback(() => {
    resetTilt();
  }, [resetTilt]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      updateTilt(e.touches[0].clientX, e.touches[0].clientY, true);
    }
  }, [updateTilt]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      updateTilt(e.touches[0].clientX, e.touches[0].clientY, true);
    }
  }, [updateTilt]);

  const handleTouchEnd = useCallback(() => {
    resetTilt();
  }, [resetTilt]);

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return {
    cardRef,
    tilt,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetTilt,
    config: mergedConfig
  };
}
