export type PatientStatus = 'active' | 'inactive';
export type NationalIdType = 'DNI' | 'LE' | 'OTRO';
export type BloodType = 'A' | 'B' | 'AB' | '0';
export type RhFactor = '+' | '-';

export interface HealthInsurance {
  companyName: string;
  planCode: string;
  cardNumber: string;
  admissionDate?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  documentId: string;
  nationalIdType: NationalIdType;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  healthRecordNumber: string;
  lastVisitAt: string;
  status: PatientStatus;
  healthInsurance: HealthInsurance | null;
  bloodType?: BloodType;
  rhFactor?: RhFactor;
}

export const patients: Patient[] = [
  {
    id: 'p1',
    firstName: 'Lucía',
    lastName: 'Fernández',
    documentId: '34112233',
    nationalIdType: 'DNI',
    email: 'lucia.fernandez@example.com',
    phoneNumber: '+54 9 11 5544-2210',
    dateOfBirth: '1991-03-14',
    healthRecordNumber: 'HC-0001',
    lastVisitAt: '2026-06-22',
    status: 'active',
    healthInsurance: { companyName: 'OSDE', planCode: '310', cardNumber: '0123456789', admissionDate: '2020-01-10' },
    bloodType: 'A',
    rhFactor: '+',
  },
  {
    id: 'p2',
    firstName: 'Tomás',
    lastName: 'Ibarra',
    documentId: '40998811',
    nationalIdType: 'DNI',
    email: 'tomas.ibarra@example.com',
    phoneNumber: '+54 9 11 4456-7789',
    dateOfBirth: '2017-08-02',
    healthRecordNumber: 'HC-0002',
    lastVisitAt: '2026-06-21',
    status: 'active',
    healthInsurance: { companyName: 'Swiss Medical', planCode: 'SMG02', cardNumber: '9988776655' },
    bloodType: 'B',
    rhFactor: '+',
  },
  {
    id: 'p3',
    firstName: 'Carla',
    lastName: 'Gómez',
    documentId: '29887766',
    nationalIdType: 'DNI',
    email: 'carla.gomez@example.com',
    phoneNumber: '+54 9 11 6677-8899',
    dateOfBirth: '1985-11-30',
    healthRecordNumber: 'HC-0003',
    lastVisitAt: '2026-06-20',
    status: 'active',
    healthInsurance: null,
    bloodType: 'AB',
    rhFactor: '-',
  },
  {
    id: 'p4',
    firstName: 'Diego',
    lastName: 'Paz',
    documentId: '37554433',
    nationalIdType: 'DNI',
    email: 'diego.paz@example.com',
    phoneNumber: '+54 9 11 2233-4455',
    dateOfBirth: '1996-05-18',
    healthRecordNumber: 'HC-0004',
    lastVisitAt: '2026-05-30',
    status: 'inactive',
    healthInsurance: { companyName: 'IOMA', planCode: 'B', cardNumber: '5544332211' },
  },
];
