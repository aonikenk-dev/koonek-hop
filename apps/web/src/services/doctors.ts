import { doctors, type Doctor } from '@/data/mock/doctors';
import { delay } from './delay';

export async function fetchDoctors(): Promise<Doctor[]> {
  return delay(doctors);
}

export async function fetchDoctorById(id: string): Promise<Doctor | undefined> {
  return delay(doctors.find((d) => d.id === id));
}
