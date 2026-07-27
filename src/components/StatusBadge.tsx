// The coloured status pill (RUNNING / PROVISIONING / FAILED / ...).
//
// The colour is not chosen here — the status name is lowercased into a CSS class
// (`status-running`, `status-failed`, ...) and styles.css owns the palette. Because the
// prop is typed as SandboxStatus rather than string, a typo like "RUNING" fails to
// compile instead of silently rendering an unstyled badge.
import type { SandboxStatus } from '../types';

export function StatusBadge({ status }: { status: SandboxStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span className="status-dot" aria-hidden="true" />
      {status}
    </span>
  );
}