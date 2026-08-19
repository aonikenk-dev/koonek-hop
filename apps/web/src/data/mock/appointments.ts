export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'done' | 'overbooking' | 'blocked';
export type PaymentType = 'consultation' | 'no_charge' | 'copay';
export type PaymentMethod = 'cash' | 'transfer';

export interface Appointment {
  id: string;
  /** Absent for 'blocked' entries (agenda blocks have no patient). */
  patientName?: string;
  patientId?: string;
  doctorName: string;
  start: string;
  end: string;
  /** Reason for visit, or the block description when status is 'blocked'. */
  reason: string;
  status: AppointmentStatus;
  healthInsuranceLabel?: string;
  paymentType?: PaymentType;
  paymentMethod?: PaymentMethod;
  amount?: number;
  sendWhatsapp?: boolean;
}

function atTime(daysOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function iso(d: Date): string {
  return d.toISOString();
}

export const appointments: Appointment[] = [
  {
    id: 'a1',
    patientName: 'Lucía Fernández',
    doctorName: 'Dr. Martín Suárez',
    start: iso(atTime(0, 9, 30)),
    end: iso(atTime(0, 10, 0)),
    reason: 'Control general',
    status: 'confirmed',
  },
  {
    id: 'a2',
    patientName: 'Tomás Ibarra',
    doctorName: 'Dr. Martín Suárez',
    start: iso(atTime(0, 10, 0)),
    end: iso(atTime(0, 10, 30)),
    reason: 'Vacunación',
    status: 'scheduled',
  },
  {
    id: 'a3',
    patientName: 'Carla Gómez',
    doctorName: 'Dra. Valentina Ríos',
    start: iso(atTime(0, 11, 0)),
    end: iso(atTime(0, 11, 20)),
    reason: 'Seguimiento',
    status: 'scheduled',
  },
  {
    id: 'a4',
    patientName: 'Diego Paz',
    doctorName: 'Dra. Valentina Ríos',
    start: iso(atTime(1, 14, 0)),
    end: iso(atTime(1, 14, 20)),
    reason: 'Primera consulta',
    status: 'cancelled',
  },
  {
    id: 'a5',
    patientName: 'Lucía Fernández',
    doctorName: 'Dr. Martín Suárez',
    start: iso(atTime(2, 15, 0)),
    end: iso(atTime(2, 15, 30)),
    reason: 'Resultados de laboratorio',
    status: 'confirmed',
  },
  {
    id: 'a6',
    patientName: 'Martina Sosa',
    doctorName: 'Dr. Martín Suárez',
    start: iso(atTime(-1, 10, 0)),
    end: iso(atTime(-1, 10, 30)),
    reason: 'Control general',
    status: 'scheduled', // past + still scheduled → rendered as expired
  },
  {
    id: 'a7',
    patientName: 'Pedro Acosta',
    doctorName: 'Dra. Valentina Ríos',
    start: iso(atTime(-1, 9, 0)),
    end: iso(atTime(-1, 9, 20)),
    reason: 'Control pediátrico',
    status: 'done',
  },
  {
    id: 'a8',
    patientName: 'Julián Verón',
    doctorName: 'Dr. Martín Suárez',
    start: iso(atTime(0, 12, 45)),
    end: iso(atTime(0, 13, 0)),
    reason: 'Urgencia — sobreturno',
    status: 'overbooking',
  },
  {
    id: 'a9',
    doctorName: 'Dr. Martín Suárez',
    start: iso(atTime(0, 16, 0)),
    end: iso(atTime(0, 17, 0)),
    reason: 'Capacitación — agenda bloqueada',
    status: 'blocked',
  },
];
