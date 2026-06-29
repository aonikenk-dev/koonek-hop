import { prescriptions, type Prescription } from '@/data/mock/prescriptions';
import { delay } from './delay';

export async function fetchPrescriptions(): Promise<Prescription[]> {
  return delay(prescriptions);
}

export async function fetchPrescriptionsByPatientId(patientId: string): Promise<Prescription[]> {
  return delay(prescriptions.filter((p) => p.patientId === patientId));
}
