export const AGENT_TYPES = ['monitoring', 'reporting', 'automation', 'support'] as const;
export type AgentType = (typeof AGENT_TYPES)[number];

export const AGENT_MODULES = ['patients', 'appointments', 'prescriptions', 'healthRecords', 'reports'] as const;
export type AgentModule = (typeof AGENT_MODULES)[number];

export type AgentStatus = 'active' | 'inactive';

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  module: AgentModule;
  status: AgentStatus;
  /** Next scheduled run, ISO datetime. */
  schedule: string;
  /** Last run, ISO datetime, or undefined if it never ran. */
  lastRun?: string;
}

function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const agents: Agent[] = [
  {
    id: 'ag1',
    name: 'Importación automática de estudios',
    description: 'Recibe estudios y laboratorios desde sistemas externos y los carga en la historia clínica del paciente correspondiente.',
    type: 'automation',
    module: 'healthRecords',
    status: 'active',
    schedule: inDays(0),
    lastRun: inDays(-1),
  },
  {
    id: 'ag2',
    name: 'Procesamiento de historias clínicas',
    description: 'Estructura y resume las evoluciones cargadas en lenguaje libre para facilitar su lectura posterior.',
    type: 'automation',
    module: 'healthRecords',
    status: 'active',
    schedule: inDays(1),
    lastRun: inDays(-2),
  },
  {
    id: 'ag3',
    name: 'Recordatorio de turnos',
    description: 'Envía recordatorios a los pacientes 24hs antes de su turno agendado.',
    type: 'support',
    module: 'appointments',
    status: 'active',
    schedule: inDays(0),
    lastRun: inDays(0),
  },
  {
    id: 'ag4',
    name: 'Alerta de recetas crónicas',
    description: 'Detecta tratamientos crónicos próximos a vencer y notifica al profesional para renovarlos.',
    type: 'monitoring',
    module: 'prescriptions',
    status: 'inactive',
    schedule: inDays(3),
    lastRun: inDays(-7),
  },
  {
    id: 'ag5',
    name: 'Reporte semanal de actividad',
    description: 'Genera un resumen semanal de consultas, turnos y productividad por profesional.',
    type: 'reporting',
    module: 'reports',
    status: 'active',
    schedule: inDays(5),
    lastRun: inDays(-2),
  },
];
