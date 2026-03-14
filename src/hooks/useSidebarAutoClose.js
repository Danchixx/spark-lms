import { useEffect, useRef } from "react";

const BREAKPOINT = 1024;

/**
 * Smoothly closes/opens sidebar on resize.
 * Uses a debounce so it doesn't fire on every pixel change.
 */
const useSidebarAutoClose = (setSidebarOpen, breakpoint = BREAKPOINT) => {
  const timerRef = useRef(null);

  useEffect(() => {
    const check = () => {
      // Clear any pending timer
      if (timerRef.current) clearTimeout(timerRef.current);
      // Small debounce so the CSS transition has time to play
      timerRef.current = setTimeout(() => {
        setSidebarOpen(window.innerWidth > breakpoint);
      }, 50);
    };

    window.addEventListener("resize", check);
    check(); // run on mount
    return () => {
      window.removeEventListener("resize", check);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [setSidebarOpen, breakpoint]);
};

export default useSidebarAutoClose;