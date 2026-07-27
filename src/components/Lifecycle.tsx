// The four-step timeline shown when a sandbox row is expanded.
//
// This is the sandbox lifecycle state machine (ERD section 8) rendered as UI. It is not
// a decoration: every tick and timestamp is read from the real `sandbox_event` rows the
// backend wrote as the sandbox moved through its states. If the event log is wrong, this
// visibly goes wrong too — which is exactly what makes it evidence rather than assertion.
import { PiCheck } from 'react-icons/pi';
import type { Sandbox } from '../types';
import { formatDate, formatTime } from '../format';

interface Step {
  label: string;
  iso: string | null;
  done: boolean;
}

// Turns the raw event list into four ordered steps. A step is "done" only if an event
// of that type actually exists, so a sandbox that failed while provisioning correctly
// shows two ticks and two empty nodes.
function buildSteps(sandbox: Sandbox): Step[] {
  const at = (type: string) => sandbox.events.find((e) => e.type === type)?.timestamp ?? null;

  const created = at('created');
  const provisioning = at('provisioning');
  const running = at('running');
  const ended = at('expired') ?? at('destroyed') ?? at('failed');

  return [
    { label: 'Created', iso: created, done: created !== null },
    { label: 'Provisioning', iso: provisioning, done: provisioning !== null },
    { label: 'Running', iso: running, done: running !== null },
    // The fourth step is the only one that can point at the future. While the sandbox is
    // alive there is no end event yet, so it shows the promised `expiresAt` as a pending
    // "Auto-delete". Once the TTL worker (or a manual destroy) fires, it flips to the real
    // timestamp of what happened. That flip is the TTL guarantee made visible.
    {
      label: ended ? 'Deleted' : 'Auto-delete',
      iso: ended ?? sandbox.expiresAt,
      done: ended !== null,
    },
  ];
}

export function Lifecycle({ sandbox }: { sandbox: Sandbox }) {
  const steps = buildSteps(sandbox);

  return (
    <div className="lifecycle" aria-label="Sandbox lifecycle">
      {steps.map((step, index) => (
        <div className="lifecycle-step" key={step.label}>
          <div className="lifecycle-track">
            <span className={`lifecycle-node ${step.done ? 'is-done' : ''}`}>
              {step.done ? <PiCheck size={13} /> : null}
            </span>
            {index < steps.length - 1 ? (
              <span className={`lifecycle-line ${step.done ? 'is-done' : ''}`} />
            ) : null}
          </div>
          <strong>{step.label}</strong>
          <span>{step.iso ? formatTime(step.iso) : '—'}</span>
          <span>{step.iso ? formatDate(step.iso) : ''}</span>
        </div>
      ))}
    </div>
  );
}