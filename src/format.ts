// Pure display formatting — turns raw values into the strings the UI shows.
// The backend sends ISO 8601 timestamps (e.g. "2026-07-27T14:15:01.368Z"); these
// helpers are the single place that decides how those look on screen. Kept free of
// React and of any data fetching so they can be reasoned about (and tested) alone.

// Seconds -> countdown clock. "42:17" under an hour, "1:05:30" over it.
// null means "no meaningful countdown" (a FAILED or still-PROVISIONING sandbox).
export function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—';
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${minutes}:${String(secs).padStart(2, '0')}`;
}

// How many seconds remain until `iso`, floored at 0 so an expired sandbox reads 0
// rather than a negative number. `now` is passed in (not read from Date.now() here)
// so the caller controls the clock — that is what makes this deterministic.
export function secondsUntil(iso: string, now: number): number {
  return Math.max(0, Math.floor((new Date(iso).getTime() - now) / 1000));
}

// Date and time are formatted separately because the lifecycle timeline stacks them
// on two lines ("10:19 PM" above "Jul 27, 2026"), while row subtitles want them joined.
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${formatTime(iso)}`;
}