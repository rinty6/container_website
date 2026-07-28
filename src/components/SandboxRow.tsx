// One row in the Live environments table, plus its expandable detail drawer.
//
// Ported from the design prototype, with mock fields swapped for real GraphQL data:
// `remainingSeconds` became a computation over `expiresAt`, and the hardcoded lifecycle
// became <Lifecycle/> reading real event rows.
import { PiCaretDown, PiCopy, PiTerminalWindow, PiTrash } from 'react-icons/pi';
import type { Sandbox, SandboxStatus } from '../types';
import { TemplateIcon } from './TemplateIcon';
import { StatusBadge } from './StatusBadge';
import { Lifecycle } from './Lifecycle';
import { formatDateTime, formatDuration, secondsUntil } from '../format';

const ALIVE: SandboxStatus[] = ['REQUESTED', 'PROVISIONING', 'RUNNING'];

// What the "Time to live" column says when there is no countdown to show.
const TTL_LABELS: Record<SandboxStatus, string> = {
  REQUESTED: 'in progress',
  PROVISIONING: 'in progress',
  RUNNING: 'remaining',
  FAILED: 'failed',
  EXPIRED: 'expired',
  DESTROYED: 'destroyed',
};

interface SandboxRowProps {
  sandbox: Sandbox;
  now: number;
  expanded: boolean;
  destroying: boolean;
  onToggle: () => void;
  onDestroy: (id: string) => void;
  onViewLogs: (id: string) => void;
}

export function SandboxRow({
  sandbox, now, expanded, destroying, onToggle, onDestroy, onViewLogs,
}: SandboxRowProps) {
  const isAlive = ALIVE.includes(sandbox.status);

  // Only a RUNNING sandbox has a meaningful countdown — one still provisioning has no
  // confirmed start, and a dead one has nothing left to count.
  const remaining = sandbox.status === 'RUNNING'
    ? secondsUntil(sandbox.expiresAt, now)
    : null;
  const urgent = remaining !== null && remaining <= 15 * 60;

  return (
    <article className={`sandbox-row ${expanded ? 'is-expanded' : ''}`}>
      <div className="row-summary" onClick={onToggle}>
        <span className="row-name-cell">
          <button
            className="expand-button"
            type="button"
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${sandbox.name}`}
            aria-expanded={expanded}
            onClick={(event) => { event.stopPropagation(); onToggle(); }}
          >
            <PiCaretDown size={17} aria-hidden="true" />
          </button>
          <span className={`health-dot health-${sandbox.status.toLowerCase()}`} />
          <span className="service-icon">
            <TemplateIcon templateId={sandbox.template.id} size={27} />
          </span>
          <span className="row-primary">
            <strong>{sandbox.name}</strong>
            <small>Created {formatDateTime(sandbox.createdAt)}</small>
          </span>
        </span>

        <span className="row-image-cell">
          <strong>{sandbox.template.image}</strong>
          <small>{sandbox.template.name}</small>
        </span>

        <span className="row-status-cell">
          <StatusBadge status={sandbox.status} />
        </span>

        <span
          className={`row-ttl-cell ttl-${sandbox.status.toLowerCase()} ${urgent ? 'is-urgent' : ''}`}
        >
          <strong>{formatDuration(remaining)}</strong>
          <small>{TTL_LABELS[sandbox.status]}</small>
        </span>
      </div>

      {expanded ? (
        <div className="sandbox-details">
          <div className="service-id">
            <span className="eyebrow">Service ID</span>
            <button
              className="copy-field"
              type="button"
              disabled={!sandbox.railwayServiceId}
              onClick={() => {
                if (sandbox.railwayServiceId) {
                  navigator.clipboard?.writeText(sandbox.railwayServiceId);
                }
              }}
            >
              <code>{sandbox.railwayServiceId ?? 'not provisioned yet'}</code>
              <PiCopy size={17} />
              <span>Copy</span>
            </button>
          </div>

          <div className="lifecycle-wrap">
            <span className="eyebrow">Lifecycle</span>
            <Lifecycle sandbox={sandbox} />
          </div>

          <div className="details-actions">
            <button
              className="logs-button"
              type="button"
              disabled={!sandbox.railwayServiceId}
              onClick={() => onViewLogs(sandbox.id)}
            >
              <PiTerminalWindow size={18} />
              View logs
            </button>

            {isAlive ? (
              <button
                className="destroy-button"
                type="button"
                disabled={destroying}
                onClick={() => {
                  if (confirm(`Destroy ${sandbox.name}?`)) onDestroy(sandbox.id);
                }}
              >
                <PiTrash size={18} />
                {destroying ? 'Destroying...' : 'Destroy now'}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}