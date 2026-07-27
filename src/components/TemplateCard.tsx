// This file creates card component
import { useState } from 'react';
import type { Template } from '../types';

const TTL_OPTIONS = [
  { label: '15 min', minutes: 15 },
  { label: '1 hour', minutes: 60 },
  { label: '4 hours', minutes: 240 },
];

interface TemplateCardProps {
  template: Template;
  spinning: boolean;
  onSpinUp: (templateId: string, ttlMinutes: number) => void;
};

export function TemplateCard({ template, spinning, onSpinUp }: TemplateCardProps) {
  const [ttlMinutes, setTtlMinutes] = useState(60);

  return (
    <div className="template-card">
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      <code>{template.image}</code>

      <select value={ttlMinutes} onChange={(e) => setTtlMinutes(Number(e.target.value))}>
        {TTL_OPTIONS.map((opt) => (
          <option key={opt.minutes} value={opt.minutes}>{opt.label}</option>
        ))}
      </select>

      <button disabled={spinning} onClick={() => onSpinUp(template.id, ttlMinutes)}>
        {spinning ? 'Spinning up...' : 'Spin up'}
      </button>
    </div>
  );
}

