import { patients, type Patient } from '@/data/mock/patients';
import { delay } from './delay';

export async function fetchPatients(): Promise<Patient[]> {
  return delay(patients);
}

export async function fetchPatientById(id: string): Promise<Patient | undefined> {
  return delay(patients.find((p) => p.id === id));
}
