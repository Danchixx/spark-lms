import { useEffect, useRef, useState, useCallback } from "react";

export const SESSION_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

const useInactivityTimeout = (isActive) => {
  const [expired, setExpired] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setExpired(true), SESSION_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setExpired(false);
      return;
    }

    // Start the initial timer
    resetTimer();

    const handleActivity = () => resetTimer();

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, handleActivity)
      );
    };
  }, [isActive, resetTimer]);

  return expired;
};

export default useInactivityTimeout;
