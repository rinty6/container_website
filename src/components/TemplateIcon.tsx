// Renders the right brand icon for a template id (Postgres elephant, Redis stack, ...).
// A thin lookup wrapper so callers pass a plain string and never touch the visuals map.
import { TEMPLATE_VISUALS, FALLBACK_VISUAL } from './templateVisuals';

export function TemplateIcon({ templateId, size = 28 }: { templateId: string; size?: number }) {
  const visual = TEMPLATE_VISUALS[templateId] ?? FALLBACK_VISUAL;
  const Icon = visual.icon;
  return <Icon size={size} color={visual.color} aria-hidden="true" />;
}