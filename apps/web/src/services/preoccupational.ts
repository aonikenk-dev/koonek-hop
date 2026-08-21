import { apiFetch } from './api';
import type { PreoccupationalExam, AttachmentFile, ExamRequirements } from '@/data/mock/preoccupational';

export interface PatientSearchResult {
  source: 'preoccupational' | 'patients';
  id: string;
  firstName: string;
  lastName: string;
  nationalIdType: 'DNI' | 'LE' | 'OTRO';
  documentId: string;
  cuil?: string;
  dateOfBirth?: string;
  birthPlace?: string;
  maritalStatus?: string;
  numberOfChildren?: number;
  address?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  linkedPatientId?: string;
}

export async function searchPatients(q: string): Promise<PatientSearchResult[]> {
  if (q.trim().length < 2) return [];
  return apiFetch<PatientSearchResult[]>(`/api/preoccupational/patient-search?q=${encodeURIComponent(q.trim())}`);
}

interface ListResponse {
  data: PreoccupationalExam[];
  pagination: { total: number; page: number; limit: number };
}

/** Strip any remaining blob: URLs (session-only) — shouldn't exist now that uploads go via API. */
function sanitizeFiles(files: AttachmentFile[] | undefined): Array<{ id: string; name: string; url: string }> {
  if (!files) return [];
  return files
    .filter((f) => !f.url.startsWith('blob:'))
    .map(({ id, name, url }) => ({ id, name, url }));
}

export interface ListExamsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListExamsResult {
  data: PreoccupationalExam[];
  pagination: { total: number; page: number; limit: number };
}

export async function listExams(params?: ListExamsParams): Promise<ListExamsResult> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.status) qs.set('status', params.status);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.sortBy) qs.set('sortBy', params.sortBy);
  if (params?.sortOrder) qs.set('sortOrder', params.sortOrder);
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<ListExamsResult>(`/api/preoccupational${query}`);
}

export async function getExam(id: string): Promise<PreoccupationalExam> {
  return apiFetch<PreoccupationalExam>(`/api/preoccupational/${id}`);
}

export interface CreateExamPayload {
  examType: PreoccupationalExam['examType'];
  summonDate?: string;
  requirements?: ExamRequirements;
  company: string;
  place: string;
  patient: {
    firstName: string;
    lastName: string;
    nationalIdType: 'DNI' | 'LE' | 'OTRO';
    documentId: string;
    linkedPatientId?: string;
    addToPatients: boolean;
    cuil?: string;
    dateOfBirth?: string;
    birthPlace?: string;
    maritalStatus?: string;
    numberOfChildren?: number;
    address?: string;
    city?: string;
    postalCode?: string;
    state?: string;
    country?: string;
  };
}

export async function createExam(payload: CreateExamPayload): Promise<PreoccupationalExam> {
  return apiFetch<PreoccupationalExam>('/api/preoccupational', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function saveExam(id: string, exam: PreoccupationalExam): Promise<PreoccupationalExam> {
  const { patient, examType, date, summonDate, requirements, status, ...rest } = exam;
  const body = {
    examType,
    date: date ?? null,
    summonDate: summonDate ?? null,
    requirements,
    status,
    company: rest.company,
    place: rest.place,
    position: rest.position,
    tasks: rest.tasks,
    declaration: rest.declaration,
    habitsDeclaration: rest.habitsDeclaration,
    familyHistory: rest.familyHistory,
    medicalHistory: rest.medicalHistory,
    personalAntecedents: rest.personalAntecedents,
    clinicalExam: rest.clinicalExam,
    spirometry: rest.spirometry,
    xrayExam: rest.xrayExam,
    result: rest.result,
    attachments: rest.attachments,
    swornDeclarationFiles: sanitizeFiles(rest.swornDeclarationFiles),
    spirometryFiles: sanitizeFiles(rest.spirometryFiles),
    xrayFiles: sanitizeFiles(rest.xrayFiles),
    patient: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      nationalIdType: patient.nationalIdType,
      documentId: patient.documentId,
      cuil: patient.cuil,
      dateOfBirth: patient.dateOfBirth,
      birthPlace: patient.birthPlace,
      maritalStatus: patient.maritalStatus,
      numberOfChildren: patient.numberOfChildren,
      address: patient.address,
      city: patient.city,
      postalCode: patient.postalCode,
      state: patient.state,
      country: patient.country,
    },
  };
  return apiFetch<PreoccupationalExam>(`/api/preoccupational/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function completeExam(id: string): Promise<PreoccupationalExam> {
  return apiFetch<PreoccupationalExam>(`/api/preoccupational/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'completed' }),
  });
}

export async function deleteExam(id: string): Promise<void> {
  await apiFetch(`/api/preoccupational/${id}`, { method: 'DELETE' });
}
