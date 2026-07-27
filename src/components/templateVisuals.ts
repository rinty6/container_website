// Per-template icon and brand colour, keyed by the template id the backend sends.
//
// Why this lives on the frontend and not in the GraphQL schema: an icon is a React
// component, which cannot be serialised and sent over an API. So the backend owns the
// facts about a template (id, name, image, description) and this file owns how it
// *looks*. The template id is the join key between the two.
import type { IconType } from 'react-icons';
import { PiBracketsCurly } from 'react-icons/pi';
import { DiRedis } from 'react-icons/di';
import { SiNginx, SiPostgresql } from 'react-icons/si';

interface TemplateVisual {
  icon: IconType;
  color: string;
}

export const TEMPLATE_VISUALS: Record<string, TemplateVisual> = {
  postgres: { icon: SiPostgresql, color: '#7aa7d9' },
  redis: { icon: DiRedis, color: '#e95045' },
  nginx: { icon: SiNginx, color: '#5fba68' },
  'hello-api': { icon: PiBracketsCurly, color: '#6b9ae8' },
};

// Used when a template id has no entry above — e.g. a new template is added to the
// backend and nobody updates this file. Degrades to a generic icon instead of crashing.
export const FALLBACK_VISUAL: TemplateVisual = {
  icon: PiBracketsCurly,
  color: '#6b9ae8',
};