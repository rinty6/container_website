// This files adds colors to each status of sandboxes
// This also shows timeline of each sandbox 
import type { Sandbox, SandboxStatus } from '../types';
import { Countdown } from './Countdown';

const STATUS_COLORS: Record<SandboxStatus, string> = {
  REQUESTED: '#888',
  PROVISIONING: '#e0a800',
  RUNNING: '#28a745',
  FAILED: '#dc3545',
  EXPIRED: '#6c757d',
  DESTROYED: '#6c757d',
};

const ALIVE: SandboxStatus[] = ['REQUESTED', 'PROVISIONING', 'RUNNING'];

interface SandboxRowProps {
  sandbox: Sandbox;
  destroying: boolean;
  onDestroy: (id: string) => void;
}

export function SandboxRow({ sandbox, destroying, onDestroy }: SandboxRowProps) {
  const isAlive = ALIVE.includes(sandbox.status);

  return (
    <div className="sandbox-row">
      <strong>{sandbox.name}</strong>
      <code>{sandbox.template.image}</code>

      <span style={{ color: STATUS_COLORS[sandbox.status] }}>
        {sandbox.status}
      </span>

      {isAlive && <Countdown expiresAt={sandbox.expiresAt} />}

      {isAlive && (
        <button
          disabled={destroying}
          onClick={() => {
            if (confirm(`Destroy ${sandbox.name}?`)) onDestroy(sandbox.id);
          }}
        >
          {destroying ? 'Destroying...' : 'Destroy'}
        </button>
      )}
    </div>
  );
}