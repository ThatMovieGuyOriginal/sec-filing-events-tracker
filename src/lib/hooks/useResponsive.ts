// src/lib/hooks/useResponsive.ts

import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');
  const [isMobile, setIsMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      setWindowSize({
        width,
        height: window.innerHeight,
      });
      
      // Set current breakpoint
      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
        setIsMobile(false);
      } else if (width >= breakpoints.sm) {
        setBreakpoint('sm');
        setIsMobile(true);
      } else {
        setBreakpoint('xs');
        setIsMobile(true);
      }
    };

    // Set initial values
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isMobile,
    windowSize,
    isSmallScreen: ['xs', 'sm'].includes(breakpoint),
    isMediumScreen: breakpoint === 'md',
    isLargeScreen: ['lg', 'xl', '2xl'].includes(breakpoint),
  };
}
