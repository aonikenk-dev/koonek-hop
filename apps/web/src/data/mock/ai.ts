export const copilotQuickPrompts = ['summary', 'nextAppointment', 'prescriptions', 'today'] as const;
export type QuickPromptKey = (typeof copilotQuickPrompts)[number];

export const copilotUsage = { used: 38, limit: 200 };

/** Very small keyword matcher — stands in for a real LLM call until Koonek AI is implemented. */
export function matchCopilotResponse(text: string): QuickPromptKey | 'default' {
  const normalized = text.toLowerCase();
  if (normalized.includes('historia') || normalized.includes('hc') || normalized.includes('resumen')) return 'summary';
  if (normalized.includes('turno') || normalized.includes('cita') || normalized.includes('appointment')) return 'nextAppointment';
  if (normalized.includes('receta') || normalized.includes('prescription')) return 'prescriptions';
  if (normalized.includes('agenda') || normalized.includes('hoy') || normalized.includes('today')) return 'today';
  return 'default';
}
