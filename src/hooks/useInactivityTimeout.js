import { useEffect, useRef, useState, useCallback } from "react";

// ┌─────────────────────────────────────────────────────────────┐
// │  ⏱  INACTIVITY TIMEOUT — change the value below to adjust  │
// │  how long (in milliseconds) a user can be idle before the   │
// │  session expires.  Default: 2 minutes (120 000 ms).         │
// └─────────────────────────────────────────────────────────────┘
export const SESSION_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

/**
 * Returns `true` when the user has been inactive for SESSION_TIMEOUT_MS.
 * Only runs when `isActive` is true (i.e. user is logged in).
 */
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
