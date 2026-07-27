// The countdown ticks locally, not from the server
// Instead of asking the backend every second "how long left?", 
// the browser just re-renders once a second and recomputes from a value it already has

import { useEffect, useState } from 'react';

function formatRemaining(expiresAt: string): string {
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  if (msLeft <= 0) return 'expired';

  const totalSeconds = Math.floor(msLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export function Countdown({ expiresAt }: { expiresAt: string }) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => forceRender((n) => n + 1), 1000);
    // Here is a cleanup function 
    // A sandbox gets destroyed and disappears from the list), React runs it and the timer stops.
    return () => clearInterval(timer);
  }, []);

  return <span>{formatRemaining(expiresAt)}</span>;
};