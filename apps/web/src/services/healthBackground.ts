import { getHealthBackground, type HealthBackground } from '@/data/mock/healthBackground';
import { delay } from './delay';

export async function fetchHealthBackgroundByPatientId(patientId: string): Promise<HealthBackground> {
  return delay(getHealthBackground(patientId));
}
