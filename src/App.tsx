// The app shell: sidebar, topbar, launcher strip, and the live environments table.
// Owns all data fetching and the page-level UI state; child components stay presentational.
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  PiArrowRight, PiArrowsClockwise, PiCube, PiPlus, PiRocketLaunch, PiSquaresFour,
} from 'react-icons/pi';
import { GET_TEMPLATES, GET_SANDBOXES, CREATE_SANDBOX, DESTROY_SANDBOX } from './queries';
import { SandboxRow } from './components/SandboxRow';
import { TemplateIcon } from './components/TemplateIcon';
import { useNow } from './useNow';
import { formatDateTime } from './format';
import type { SandboxStatus } from './types';

const TTL_OPTIONS = [
  { label: '15m', minutes: 15 },
  { label: '1h', minutes: 60 },
  { label: '4h', minutes: 240 },
];

const ALIVE: SandboxStatus[] = ['REQUESTED', 'PROVISIONING', 'RUNNING'];

function App() {
  const [activeNav, setActiveNav] = useState('sandboxes');
  const [selectedTemplate, setSelectedTemplate] = useState('postgres');
  const [selectedTtl, setSelectedTtl] = useState(60);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState(() => new Date().toISOString());

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

  const liveCount = useMemo(
    () => sandboxes.filter((s) => ALIVE.includes(s.status)).length,
    [sandboxes],
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><PiCube size={31} /></span>
          <span>easydevelop</span>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <button
            className={activeNav === 'sandboxes' ? 'active' : ''}
            type="button"
            onClick={() => setActiveNav('sandboxes')}
          >
            <PiCube size={20} />
            Sandboxes
          </button>
          <button
            className={activeNav === 'templates' ? 'active' : ''}
            type="button"
            onClick={() => {
              setActiveNav('templates');
              document.querySelector('.launcher')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <PiSquaresFour size={20} />
            Templates
          </button>
        </nav>

        {/* "Connected" is an honest signal: it reflects whether the last poll succeeded. */}
        <div className="railway-status">
          <span className="railway-icon"><PiRocketLaunch size={19} /></span>
          <span>
            <strong>Railway</strong>
            <small><i /> {error ? 'Disconnected' : 'Connected'}</small>
          </span>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
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
            disabled={creating}
            onClick={() =>
              createSandbox({ variables: { templateId: selectedTemplate, ttlMinutes: selectedTtl } })
            }
          >
            <PiPlus size={21} />
            {creating ? 'Launching...' : 'Launch sandbox'}
          </button>
        </header>

        <section className="launcher" aria-labelledby="launcher-title">
          <div className="section-heading">
            <div><h2 id="launcher-title">Ready to launch</h2></div>
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
              <span>Default TTL</span>
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
            <span>Actions</span>
          </div>

          <div className="sandbox-list">
            {sandboxes.map((sandbox) => (
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
              />
            ))}
          </div>

          <div className="empty-state">
            <PiCube size={30} />
            <span>
              <strong>
                {sandboxes.length === 0 ? 'No sandboxes yet' : 'No more live environments'}
              </strong>
              <small>Launch a fresh sandbox when you need one.</small>
            </span>
            <button
              type="button"
              disabled={creating}
              onClick={() =>
                createSandbox({ variables: { templateId: selectedTemplate, ttlMinutes: selectedTtl } })
              }
            >
              Launch sandbox <PiArrowRight />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;