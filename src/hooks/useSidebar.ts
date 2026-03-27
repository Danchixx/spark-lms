import { useState, useEffect, useRef } from "react";

const BREAKPOINT = 1024;

/**
 * Hook to manage sidebar state with correct initial value and auto-close on resize.
 */
export const useSidebar = (breakpoint: number = BREAKPOINT) => {
  // Initialize based on window width to prevent flicker on mount
  // Note: typeof window check is for SSR safety, though this is a client-side app.
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth > breakpoint;
    }
    return true; // Default to open for desktop-first or fallback
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      // Debounce resize events for smoother performance
      timerRef.current = setTimeout(() => {
        setIsOpen(window.innerWidth > breakpoint);
      }, 50);
    };

    window.addEventListener("resize", handleResize);
    
    // Initial check on mount is already handled by the useState initializer,
    // but we run it again here just in case of hydration mismatches or edge cases,
    // although for client-only SPA, the initializer is enough.
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [breakpoint]);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return { isOpen, setIsOpen, toggle, close, open };
};

export default useSidebar;
