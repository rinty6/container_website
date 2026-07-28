// The left navigation rail: brand, nav items, and the Railway connection indicator.
// Extracted from App.tsx so the shell's chrome is separate from the workbench's data
// logic. It holds no state and fetches
// nothing; it reports clicks upward and renders what it is told.
import type { IconType } from 'react-icons';
import { PiBookOpen, PiChatCircle, PiCube, PiRocketLaunch, PiTerminalWindow, PiUserCircle } from 'react-icons/pi';
import type { PanelId } from '../types';

// Nav is data, not markup. Adding an item is one line here — no JSX to duplicate.
// `panel: null` means "this is the base view", not an overlay.
const NAV_ITEMS: { id: string; label: string; icon: IconType; panel: PanelId | null }[] = [
  { id: 'workbench', label: 'Workbench', icon: PiTerminalWindow, panel: null },
  { id: 'guide', label: 'Guide', icon: PiBookOpen, panel: 'guide' },
  { id: 'feedback', label: 'Feedback', icon: PiChatCircle, panel: 'feedback' },
  { id: 'profile', label: 'Profile', icon: PiUserCircle, panel: 'profile' },
];

interface SidebarProps {
  activePanel: PanelId | null;
  onSelectPanel: (panel: PanelId | null) => void;
  connected: boolean;
}

export function Sidebar({ activePanel, onSelectPanel, connected }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><PiCube size={31} /></span>
        <span>easydevelop</span>
      </div>

      <nav className="primary-nav" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          // Workbench is "active" whenever nothing is overlaying it.
          const isActive = activePanel === item.panel;
          return (
            <button
              key={item.id}
              className={isActive ? 'active' : ''}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelectPanel(item.panel)}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* An honest signal: reflects whether the last poll actually succeeded. */}
      <div className="railway-status">
        <span className="railway-icon"><PiRocketLaunch size={19} /></span>
        <span>
          <strong>Railway</strong>
          <small><i /> {connected ? 'Connected' : 'Disconnected'}</small>
        </span>
      </div>
    </aside>
  );
}