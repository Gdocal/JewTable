/**
 * Hook to detect if viewport is mobile-sized
 * Mobile breakpoint: 768px
 */

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // pixels

export function useIsMobile(customBreakpoint?: number): boolean {
  const breakpoint = customBreakpoint || MOBILE_BREAKPOINT;

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Initial value based on window size (SSR-safe)
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Set initial value
    checkIsMobile();

    // Add resize listener with debounce for performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIsMobile, 100);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [breakpoint]);

  return isMobile;
}
