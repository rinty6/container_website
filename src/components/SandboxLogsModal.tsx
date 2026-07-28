// Per-sandbox Logs viewer — same Modal shell as the app-level panels in PanelHost, but
// keyed by a sandbox id instead of a fixed PanelId, since it needs to know *which* row.
//
// The body is a separate component so its useQuery only mounts (and polls) while the
// modal is actually open: Modal returns null when closed, which unmounts children too.
import { useQuery } from '@apollo/client/react';
import { Modal } from './Modal';
import { GET_SANDBOX_LOGS } from '../queries';
import { formatTime } from '../format';
import type { SandboxStatus } from '../types';

// RUNNING (and its precursors) is the only state where new log lines can still show up,
// so that's the only case worth polling. DESTROYED/EXPIRED mean the Railway service was
// deleted (both go through spinDown() first) — querying for it would just come back empty
// forever, so skip the network call entirely rather than poll a dead service.
const ALIVE: SandboxStatus[] = ['REQUESTED', 'PROVISIONING', 'RUNNING'];
const GONE: SandboxStatus[] = ['DESTROYED', 'EXPIRED'];

function LogsBody({ sandboxId, status }: { sandboxId: string; status: SandboxStatus }) {
  const isGone = GONE.includes(status);

  const { data, loading, error } = useQuery(GET_SANDBOX_LOGS, {
    variables: { id: sandboxId },
    pollInterval: ALIVE.includes(status) ? 3000 : 0,
    skip: isGone,
  });

  if (isGone) {
    return (
      <p>
        This sandbox was {status === 'DESTROYED' ? 'destroyed' : 'it expired'} — its Railway
        service was deleted along with any logs.
      </p>
    );
  }

  const logs = data?.sandbox?.logs ?? [];

  if (error) {
    return <p className="error-banner">Could not load logs: {error.message}</p>;
  }
  if (loading && logs.length === 0) {
    return <p>Loading logs…</p>;
  }
  if (logs.length === 0) {
    return <p>No logs yet — the container may still be starting.</p>;
  }

  return (
    <pre className="logs-view">
      {logs.map((log, index) => (
        <div key={index} className={`log-line severity-${log.severity.toLowerCase()}`}>
          <span className="log-timestamp">{formatTime(log.timestamp)}</span>
          <span className="log-message">{log.message || ' '}</span>
        </div>
      ))}
    </pre>
  );
}

interface SandboxLogsModalProps {
  sandboxId: string | null;
  sandboxName: string;
  status: SandboxStatus | null;
  onClose: () => void;
}

export function SandboxLogsModal({ sandboxId, sandboxName, status, onClose }: SandboxLogsModalProps) {
  return (
    <Modal open={sandboxId !== null} title={`Logs · ${sandboxName}`} onClose={onClose}>
      {sandboxId && status ? <LogsBody sandboxId={sandboxId} status={status} /> : null}
    </Modal>
  );
}
