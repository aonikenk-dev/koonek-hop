import { getNotes } from '@/data/mock/notes';
import { delay } from './delay';

export async function fetchNotesByPatientId(patientId: string): Promise<string> {
  return delay(getNotes(patientId));
}
