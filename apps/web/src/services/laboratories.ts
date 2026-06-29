import { laboratories, type LabExam } from '@/data/mock/laboratories';
import { delay } from './delay';

export async function fetchLaboratoriesByPatientId(patientId: string): Promise<LabExam[]> {
  return delay(laboratories.filter((l) => l.patientId === patientId));
}
