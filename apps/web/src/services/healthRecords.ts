import { healthRecordEntries, type HealthRecordEntry } from '@/data/mock/healthRecords';
import { delay } from './delay';

export async function fetchHealthRecordByPatientId(patientId: string): Promise<HealthRecordEntry[]> {
  return delay(
    healthRecordEntries
      .filter((e) => e.patientId === patientId)
      .sort((a, b) => b.date.localeCompare(a.date))
  );
}
