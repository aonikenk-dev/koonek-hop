// Mocked per-doctor scheduling configuration — mirrors co-med's
// AppointmentConfig model (slot duration + weekly sessions per doctor).
// Drives FullCalendar's businessHours/slotDuration/weekends in Appointments.tsx.

export interface Session {
  sessionType: 'Mañana' | 'Tarde';
  startTime: string;
  endTime: string;
  /** FullCalendar convention: 0 = Sunday ... 6 = Saturday */
  daysOfWeek: number[];
}

export interface AppointmentConfig {
  id: string;
  doctorName: string;
  description: string;
  slotMinutes: number;
  sessions: Session[];
}

export const appointmentConfigs: AppointmentConfig[] = [
  {
    id: 'cfg-1',
    doctorName: 'Dr. Martín Suárez',
    description: 'Medicina General · Mañana y tarde',
    slotMinutes: 30,
    sessions: [
      { sessionType: 'Mañana', startTime: '09:00', endTime: '13:00', daysOfWeek: [1, 2, 3, 4, 5] },
      { sessionType: 'Tarde', startTime: '15:00', endTime: '19:00', daysOfWeek: [1, 2, 3, 4] },
    ],
  },
  {
    id: 'cfg-2',
    doctorName: 'Dra. Valentina Ríos',
    description: 'Pediatría · Mañana y tarde reducida',
    slotMinutes: 20,
    sessions: [
      { sessionType: 'Mañana', startTime: '08:00', endTime: '12:00', daysOfWeek: [1, 3, 5] },
      { sessionType: 'Tarde', startTime: '14:00', endTime: '18:00', daysOfWeek: [2, 4] },
    ],
  },
];

export function getBusinessHours(config: AppointmentConfig) {
  return config.sessions.map((s) => ({
    daysOfWeek: s.daysOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
  }));
}

export function getBackgroundEvents(config: AppointmentConfig) {
  return config.sessions.map((s, i) => ({
    groupId: `bg-${config.id}-${i}`,
    daysOfWeek: s.daysOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    display: 'background' as const,
    backgroundColor: 'rgba(61,107,79,0.05)',
  }));
}

export function getSlotDuration(config: AppointmentConfig): string {
  const h = Math.floor(config.slotMinutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (config.slotMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}:00`;
}

export function includesWeekend(config: AppointmentConfig): boolean {
  return config.sessions.some((s) => s.daysOfWeek.includes(0) || s.daysOfWeek.includes(6));
}
