import { gql, type TypedDocumentNode } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { TemplateCard } from './components/TemplateCard';
import type { Template } from './types';

const GET_TEMPLATES: TypedDocumentNode<{ templates: Template[] }> = gql`
  query GetTemplates {
    templates { id name image description }
  }
`;

const CREATE_SANDBOX: TypedDocumentNode<
  { createSandbox: { id: string; status: string } },
  { templateId: string; ttlMinutes?: number }
> = gql`
  mutation CreateSandbox($templateId: ID!, $ttlMinutes: Int) {
    createSandbox(templateId: $templateId, ttlMinutes: $ttlMinutes) {
      id
      status
    }
  }
`;

function App() {
  const { data, loading, error } = useQuery(GET_TEMPLATES);
  const [createSandbox, { loading: creating }] = useMutation(CREATE_SANDBOX);

  if (loading) return <p>Loading templates...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="catalog">
      <h1>easydevelop</h1>
      {data?.templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          spinning={creating}
          onSpinUp={(templateId, ttlMinutes) => {
            createSandbox({ variables: { templateId, ttlMinutes } });
          }}
        />
      ))}
    </div>
  );
}

export default App;