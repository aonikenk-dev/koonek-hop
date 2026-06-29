import { studies, type Study } from '@/data/mock/studies';
import { delay } from './delay';

export async function fetchStudiesByPatientId(patientId: string): Promise<Study[]> {
  return delay(studies.filter((s) => s.patientId === patientId));
}
