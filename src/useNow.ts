import { useEffect, useState } from 'react';

// A ticking clock for the whole page: re-renders the caller once per second so
// countdowns stay live.
//
// Why this instead of storing a `remainingSeconds` number and decrementing it
// (as the design prototype did): `expiresAt` comes from the server and never
// changes, so it should stay the single source of truth. Copying server data into
// React state and mutating it means Apollo's 5s poll and the local timer end up
// fighting over the same value. Here nothing is copied — each render just recomputes
// "how long is left" from the fixed expiry and the current time.
//
// One timer serves every row, rather than one timer per sandbox.
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    // Cleanup: stop the timer when the component unmounts, or it keeps firing forever.
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}