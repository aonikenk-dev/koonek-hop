import { getPersonalData, type PersonalData } from '@/data/mock/personalData';
import { delay } from './delay';

export async function fetchPersonalDataByPatientId(patientId: string): Promise<PersonalData> {
  return delay(getPersonalData(patientId));
}
