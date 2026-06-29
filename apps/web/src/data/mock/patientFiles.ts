export interface PatientFile {
  id: string;
  patientId: string;
  name: string;
  uploadedDate: string;
  /** Session-only object URL for files picked via <input type="file">, lets them be opened/viewed. */
  url?: string;
}

export const patientFiles: PatientFile[] = [
  { id: 'pf1', patientId: 'p1', name: 'consentimiento-informado.pdf', uploadedDate: '2026-01-10' },
];
