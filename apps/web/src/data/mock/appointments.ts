export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled';

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  start: string;
  end: string;
  reason: string;
  status: AppointmentStatus;
}

function todayAt(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function toIso(d: Date): string {
  return d.toISOString();
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export const appointments: Appointment[] = [
  {
    id: 'a1',
    patientName: 'Lucía Fernández',
    doctorName: 'Dr. Martín Suárez',
    start: toIso(todayAt(9, 30)),
    end: toIso(todayAt(10, 0)),
    reason: 'Control general',
    status: 'confirmed',
  },
  {
    id: 'a2',
    patientName: 'Tomás Ibarra',
    doctorName: 'Dr. Martín Suárez',
    start: toIso(todayAt(10, 0)),
    end: toIso(todayAt(10, 30)),
    reason: 'Vacunación',
    status: 'scheduled',
  },
  {
    id: 'a3',
    patientName: 'Carla Gómez',
    doctorName: 'Dra. Valentina Ríos',
    start: toIso(todayAt(11, 15)),
    end: toIso(todayAt(11, 45)),
    reason: 'Seguimiento',
    status: 'scheduled',
  },
  {
    id: 'a4',
    patientName: 'Diego Paz',
    doctorName: 'Dra. Valentina Ríos',
    start: toIso(addDays(todayAt(12, 0), 1)),
    end: toIso(addDays(todayAt(12, 30), 1)),
    reason: 'Primera consulta',
    status: 'cancelled',
  },
  {
    id: 'a5',
    patientName: 'Lucía Fernández',
    doctorName: 'Dr. Martín Suárez',
    start: toIso(addDays(todayAt(15, 0), 2)),
    end: toIso(addDays(todayAt(15, 30), 2)),
    reason: 'Resultados de laboratorio',
    status: 'confirmed',
  },
];
