// Every GraphQL document the frontend sends, in one place.
//
// Co-locating them means the field lists can be compared at a glance and reused via the
// shared fragment below — rather than being scattered across components and drifting apart.
import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Sandbox, SandboxLog, Template } from './types';

// A fragment: one named, reusable field selection. Both mutations and the list query need
// the exact same Sandbox fields, and writing them out four times invites the copies to
// drift. Change a field here and every operation below picks it up.
const SANDBOX_FIELDS = gql`
  fragment SandboxFields on Sandbox {
    id
    name
    status
    railwayServiceId
    createdAt
    expiresAt
    template { id name image description }
    events { id type message timestamp }
  }
`;

export const GET_TEMPLATES: TypedDocumentNode<{ templates: Template[] }> = gql`
  query GetTemplates {
    templates { id name image description }
  }
`;

export const GET_SANDBOXES: TypedDocumentNode<{ sandboxes: Sandbox[] }> = gql`
  ${SANDBOX_FIELDS}
  query GetSandboxes {
    sandboxes { ...SandboxFields }
  }
`;

export const CREATE_SANDBOX: TypedDocumentNode<
  { createSandbox: Sandbox },
  { templateId: string; ttlMinutes?: number }
> = gql`
  ${SANDBOX_FIELDS}
  mutation CreateSandbox($templateId: ID!, $ttlMinutes: Int) {
    createSandbox(templateId: $templateId, ttlMinutes: $ttlMinutes) { ...SandboxFields }
  }
`;

export const DESTROY_SANDBOX: TypedDocumentNode<
  { destroySandbox: Sandbox },
  { id: string }
> = gql`
  ${SANDBOX_FIELDS}
  mutation DestroySandbox($id: ID!) {
    destroySandbox(id: $id) { ...SandboxFields }
  }
`;

// Logs live behind the Railway API, not the DB, so they're fetched on demand for one
// sandbox at a time rather than folded into SANDBOX_FIELDS — that fragment rides along
// with GetSandboxes' 5s poll, and a live Railway call per row on every tick would be
// wasteful (and slow) for a field almost never looked at.
export const GET_SANDBOX_LOGS: TypedDocumentNode<
  { sandbox: { id: string; logs: SandboxLog[] } | null },
  { id: string }
> = gql`
  query GetSandboxLogs($id: ID!) {
    sandbox(id: $id) {
      id
      logs { timestamp message severity }
    }
  }
`;