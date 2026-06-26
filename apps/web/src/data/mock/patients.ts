export type PatientStatus = 'active' | 'inactive';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  documentId: string;
  email: string;
  phoneNumber: string;
  lastVisitAt: string;
  status: PatientStatus;
}

export const patients: Patient[] = [
  {
    id: 'p1',
    firstName: 'Lucía',
    lastName: 'Fernández',
    documentId: '34112233',
    email: 'lucia.fernandez@example.com',
    phoneNumber: '+54 9 11 5544-2210',
    lastVisitAt: '2026-06-22',
    status: 'active',
  },
  {
    id: 'p2',
    firstName: 'Tomás',
    lastName: 'Ibarra',
    documentId: '40998811',
    email: 'tomas.ibarra@example.com',
    phoneNumber: '+54 9 11 4456-7789',
    lastVisitAt: '2026-06-21',
    status: 'active',
  },
  {
    id: 'p3',
    firstName: 'Carla',
    lastName: 'Gómez',
    documentId: '29887766',
    email: 'carla.gomez@example.com',
    phoneNumber: '+54 9 11 6677-8899',
    lastVisitAt: '2026-06-20',
    status: 'active',
  },
  {
    id: 'p4',
    firstName: 'Diego',
    lastName: 'Paz',
    documentId: '37554433',
    email: 'diego.paz@example.com',
    phoneNumber: '+54 9 11 2233-4455',
    lastVisitAt: '2026-05-30',
    status: 'inactive',
  },
];
