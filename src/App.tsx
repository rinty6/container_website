// The app shell: sidebar, topbar, launcher strip, and the live environments table.
// Owns all data fetching and the page-level UI state; child components stay presentational.
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { PiArrowsClockwise, PiPlay, PiUploadSimple } from 'react-icons/pi';
import { GET_TEMPLATES, GET_SANDBOXES, CREATE_SANDBOX, DESTROY_SANDBOX } from './queries';
import { SandboxRow } from './components/SandboxRow';
import { TemplateIcon } from './components/TemplateIcon';
import { Sidebar } from './components/Sidebar';
import { PanelHost } from './components/PanelHost';
import { SandboxLogsModal } from './components/SandboxLogsModal';
import { useNow } from './useNow';
import { formatDateTime } from './format';
import type { SandboxStatus, PanelId } from './types';

const TTL_OPTIONS = [
  { label: '15m', minutes: 15 },
  { label: '1h', minutes: 60 },
  { label: '4h', minutes: 240 },
];

const ALIVE: SandboxStatus[] = ['REQUESTED', 'PROVISIONING', 'RUNNING'];

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState('postgres');
  const [selectedTtl, setSelectedTtl] = useState(60);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logsSandboxId, setLogsSandboxId] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState(() => new Date().toISOString());
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);

  const now = useNow();

  const templatesQuery = useQuery(GET_TEMPLATES);
  const { data, loading, error, refetch } = useQuery(GET_SANDBOXES, { pollInterval: 5000 });

  const [createSandbox, { loading: creating }] = useMutation(CREATE_SANDBOX, {
    refetchQueries: [GET_SANDBOXES],
  });
  // No refetch needed: the mutation returns the full sandbox, and Apollo's cache is
  // normalized by id, so the affected row updates itself.
  const [destroySandbox, { loading: destroying }] = useMutation(DESTROY_SANDBOX);

  // Record when fresh data last arrived, for the "Last synced" indicator.
  useEffect(() => {
    if (data) setLastSynced(new Date().toISOString());
  }, [data]);

  const sandboxes = data?.sandboxes ?? [];
  const templates = templatesQuery.data?.templates ?? [];
  const logsSandbox = sandboxes.find((s) => s.id === logsSandboxId) ?? null;

  const liveCount = useMemo(
    () => sandboxes.filter((s) => ALIVE.includes(s.status)).length,
    [sandboxes],
  );

  // Names the launch button after what it will actually launch — "Launch Redis", not the
  // generic "Launch sandbox". Falls back while the templates query is still in flight.
  const selectedName = templates.find((t) => t.id === selectedTemplate)?.name ?? 'sandbox';

  return (
    <div className="app-shell">
      <Sidebar
        activePanel={activePanel}
        onSelectPanel={setActivePanel}
        connected={!error}
      />

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-row">
            <div className="title-group">
              <h1>Sandbox workbench</h1>
              <button
                className={`sync-indicator ${loading ? 'is-syncing' : ''}`}
                type="button"
                onClick={() => refetch()}
              >
                <PiArrowsClockwise size={17} />
                Last synced
                <span>·</span>
                {formatDateTime(lastSynced)}
              </button>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={() => setActivePanel('import')}
            >
              <PiUploadSimple size={21} />
              Import image
            </button>
          </div>
          <p className="topbar-subtitle">
            Give it any Docker image and get a running, URL-addressable container in about a
            minute. After that, it deletes itself when its lifetime runs out, so nothing is left behind
            to pay for or clean up.
          </p>
        </header>

        <section className="launcher" aria-labelledby="launcher-title">
          <div className="section-heading">
            <div>
              <h2 id="launcher-title">Ready to launch</h2>
              <p>Don&apos;t have an image of your own? Pick a preset, set how long it should live, then press Launch.</p>
            </div>
            <span>{liveCount} live environments</span>
          </div>

          <div className="launcher-surface">
            <div className="template-options" role="radiogroup" aria-label="Sandbox template">
              {templates.map((template) => (
                <button
                  className={selectedTemplate === template.id ? 'selected' : ''}
                  type="button"
                  role="radio"
                  aria-checked={selectedTemplate === template.id}
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <TemplateIcon templateId={template.id} size={28} />
                  <span>
                    <strong>{template.name}</strong>
                    <small>{template.image}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className="ttl-picker">
              <span>Lifetime</span>
              <div role="radiogroup" aria-label="Time to live">
                {TTL_OPTIONS.map((option) => (
                  <button
                    className={selectedTtl === option.minutes ? 'selected' : ''}
                    type="button"
                    role="radio"
                    aria-checked={selectedTtl === option.minutes}
                    key={option.minutes}
                    onClick={() => setSelectedTtl(option.minutes)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                className="launch-button"
                type="button"
                disabled={creating}
                onClick={() =>
                  createSandbox({ variables: { templateId: selectedTemplate, ttlMinutes: selectedTtl } })
                }
              >
                <PiPlay size={18} />
                {creating ? 'Launching...' : `Launch ${selectedName}`}
              </button>
            </div>
          </div>
        </section>

        <section className="environments" aria-labelledby="environments-title">
          <div className="section-heading environments-heading">
            <div><h2 id="environments-title">Live environments</h2></div>
          </div>

          {error ? (
            <p className="error-banner">Could not reach the API: {error.message}</p>
          ) : null}

          <div className="table-header" aria-hidden="true">
            <span>Name</span>
            <span>Image</span>
            <span>Status</span>
            <span>Time to live</span>
          </div>

          <div className="sandbox-list">
            {/* The empty state lives inside the table so the layout stays put rather than
                collapsing to a blank area. `!loading` avoids flashing it on first paint. */}
            {sandboxes.length === 0 && !loading ? (
              <p className="empty-row">No sandboxes yet — pick a preset above and press Launch.</p>
            ) : (
              sandboxes.map((sandbox) => (
                <SandboxRow
                  key={sandbox.id}
                  sandbox={sandbox}
                  now={now}
                  expanded={expandedId === sandbox.id}
                  destroying={destroying}
                  onToggle={() =>
                    setExpandedId((current) => (current === sandbox.id ? null : sandbox.id))
                  }
                  onDestroy={(id) => destroySandbox({ variables: { id } })}
                  onViewLogs={setLogsSandboxId}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* One host for every overlay panel; App only tracks which one is open. */}
      <PanelHost panel={activePanel} onClose={() => setActivePanel(null)} />
      <SandboxLogsModal
        sandboxId={logsSandboxId}
        sandboxName={logsSandbox?.name ?? ''}
        status={logsSandbox?.status ?? null}
        onClose={() => setLogsSandboxId(null)}
      />
    </div>
  );
}

export default App;