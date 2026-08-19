import { appointments, type Appointment } from '@/data/mock/appointments';
import { appointmentConfigs } from '@/data/mock/appointmentConfig';
import { delay } from './delay';

export async function fetchAppointmentsByPatientName(patientName: string): Promise<Appointment[]> {
  return delay(appointments.filter((a) => a.patientName === patientName));
}

export async function fetchAppointmentsByDoctorName(doctorName: string): Promise<Appointment[]> {
  return delay(appointments.filter((a) => a.doctorName === doctorName));
}

export interface TimeSlot {
  time: string;
  available: boolean;
  sessionType: 'Mañana' | 'Tarde';
}

export async function fetchAvailableSlots(doctorName: string, date: string): Promise<TimeSlot[]> {
  const config = appointmentConfigs.find((c) => c.doctorName === doctorName);
  if (!config) return delay([]);

  // Use noon to avoid DST edge cases when parsing the date-only string.
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  const slots: TimeSlot[] = [];

  for (const session of config.sessions) {
    if (!session.daysOfWeek.includes(dayOfWeek)) continue;

    const [startH, startM] = session.startTime.split(':').map(Number);
    const [endH, endM] = session.endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    for (let m = startMins; m < endMins; m += config.slotMinutes) {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      const time = `${h}:${min}`;
      const slotStart = new Date(`${date}T${time}:00`);
      const slotEnd = new Date(slotStart.getTime() + config.slotMinutes * 60_000);

      const isTaken = appointments.some((a) => {
        if (a.doctorName !== doctorName) return false;
        if (a.status === 'cancelled' || a.status === 'blocked') return false;
        const aStart = new Date(a.start);
        const aEnd = new Date(a.end);
        return slotStart < aEnd && slotEnd > aStart;
      });

      slots.push({ time, available: !isTaken, sessionType: session.sessionType });
    }
  }

  return delay(slots);
}
