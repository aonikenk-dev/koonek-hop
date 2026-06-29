import { patientFiles, type PatientFile } from '@/data/mock/patientFiles';
import { delay } from './delay';

export async function fetchFilesByPatientId(patientId: string): Promise<PatientFile[]> {
  return delay(patientFiles.filter((f) => f.patientId === patientId));
}
