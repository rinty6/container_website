// This files helps us sandboxes
// Users can delete a sandbox with destroy button

import { gql, type TypedDocumentNode } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import type { Sandbox } from '../types';
import { SandboxRow } from './SandboxRow';

export const GET_SANDBOXES: TypedDocumentNode<{ sandboxes: Sandbox[] }> = gql`
  query GetSandboxes {
    sandboxes {
      id
      name
      status
      railwayServiceId
      createdAt
      expiresAt
      template { id name image description }
      events { id type message timestamp }
    }
  }
`;

const DESTROY_SANDBOX: TypedDocumentNode<
  { destroySandbox: { id: string; status: string } },
  { id: string }
> = gql`
  mutation DestroySandbox($id: ID!) {
    destroySandbox(id: $id) { id status }
  }
`;

export function SandboxList() {
  const { data, loading, error } = useQuery(GET_SANDBOXES, {
    pollInterval: 5000,
  });
  const [destroySandbox, { loading: destroying }] = useMutation(DESTROY_SANDBOX, {
    refetchQueries: [GET_SANDBOXES],
  });

  if (loading && !data) return <p>Loading sandboxes...</p>;
  if (error) return <p>Error loading sandboxes: {error.message}</p>;

  const sandboxes = data?.sandboxes ?? [];
  if (sandboxes.length === 0) return <p>No sandboxes yet — spin one up above.</p>;

  return (
    <div className="sandbox-list">
      <h2>Sandboxes</h2>
      {sandboxes.map((sandbox) => (
        <SandboxRow
          key={sandbox.id}
          sandbox={sandbox}
          destroying={destroying}
          onDestroy={(id) => destroySandbox({ variables: { id } })}
        />
      ))}
    </div>
  );
}