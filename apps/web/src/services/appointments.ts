import { appointments, type Appointment } from '@/data/mock/appointments';
import { delay } from './delay';

export async function fetchAppointmentsByPatientName(patientName: string): Promise<Appointment[]> {
  return delay(appointments.filter((a) => a.patientName === patientName));
}
