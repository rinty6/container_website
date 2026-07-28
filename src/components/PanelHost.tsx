// Maps a PanelId to its title and content, and renders it through the shared Modal.
//
// App doesn't know what's inside any panel and it only tracks which one is open. Adding a
// panel means adding one entry here plus one line in Sidebar's NAV_ITEMS.

import { Modal } from './Modal';
import type { PanelId } from '../types';

function GuideContent() {
  return (
    <>
      <h3>What is a sandbox?</h3>
      <p>
        A sandbox is a real container running a real Docker image on Railway. It can be a throwaway
        Postgres, Redis, or web server you can actually connect to. It is not a simulation.
      </p>

      <h3>Launching one</h3>
      <p>
        Pick a preset, choose how long it should live, then press Launch. Provisioning takes
        roughly a minute. You do not need to configure anything.
      </p>

      <h3>What the statuses mean</h3>
      <p>
        <code>PROVISIONING</code> — Railway is starting the container.<br />
        <code>RUNNING</code> — it is live and usable.<br />
        <code>FAILED</code> — it could not start; open Logs to see why.<br />
        <code>EXPIRED</code> — its lifetime ran out and it was deleted automatically.<br />
        <code>DESTROYED</code> — you deleted it yourself.
      </p>

      <h3>Why it deletes itself</h3>
      <p>
        Temporary infrastructure is easy to create and easy to forget. Every sandbox carries an
        expiry time from the moment it is created, and a background worker destroys expired ones
        without you doing anything. Expand any row to see its lifecycle, including when it is
        scheduled to be removed.
      </p>
    </>
  );
}

function FeedbackContent() {
  return (
    <>
      <p>
        In future, this will be a form which allows users to send messages and feedback whenever they have bugs
      </p>
      <p>
        It exists to show the shell is ready for it: this panel, the Guide, Profile, Import image, 
        and the per-sandbox Logs viewer are all the same Modal component with different content.
      </p>
    </>
  );
}

function ProfileContent() {
  return (
    <>
      <p>
        In future, this section allows users to view their account details
      </p>
    </>
  );
}

function ImportContent() {
  return (
    <>
      <p>
        This section allows users to upload/paste any public Docker image
      </p>
      <p>
        Plan: The backend is already most of the way there — <code>spinUp()</code> takes an arbitrary
        image string, which is exactly how the presets work. What is missing is the part that
        matters: validating untrusted input, and deciding what limits apply when anyone can run
        anything.
      </p>
    </>
  );
}

const PANELS: Record<PanelId, { title: string; Content: () => React.ReactNode }> = {
  guide: { title: 'How easydevelop works', Content: GuideContent },
  feedback: { title: 'Feedback', Content: FeedbackContent },
  profile: { title: 'Profile', Content: ProfileContent },
  import: { title: 'Import your own image', Content: ImportContent },
};

interface PanelHostProps {
  panel: PanelId | null;
  onClose: () => void;
}

export function PanelHost({ panel, onClose }: PanelHostProps) {
  const config = panel ? PANELS[panel] : null;
  const Content = config?.Content;

  return (
    <Modal open={config !== null} title={config?.title ?? ''} onClose={onClose}>
      {Content ? <Content /> : null}
    </Modal>
  );
}