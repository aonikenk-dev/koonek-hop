export type DoctorStatus = 'active' | 'inactive';
export type LicenseType = 'mp' | 'mn';
export type DoctorNationalIdType = 'DNI' | 'LE' | 'OTRO';
export type BiologicalSex = 'm' | 'f';
export type DoctorGender = 'cisgenero' | 'transgenero' | 'no-binario';

export interface License {
  licenseType: LicenseType;
  licenseId: string;
}

export interface DoctorAddress {
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialities: string[];
  licenses: License[];
  room: string;
  status: DoctorStatus;
  email: string;
  phoneNumber: string;
  nationalIdType: DoctorNationalIdType;
  documentId: string;
  dateOfBirth: string;
  nationality: string;
  biologicalSex: BiologicalSex;
  gender: DoctorGender;
  address: DoctorAddress;
  bio?: string;
}

export function doctorLabel(d: Pick<Doctor, 'biologicalSex' | 'firstName' | 'lastName'>): string {
  return `${d.biologicalSex === 'f' ? 'Dra.' : 'Dr.'} ${d.firstName} ${d.lastName}`;
}

export const doctors: Doctor[] = [
  {
    id: 'd1',
    firstName: 'Martín',
    lastName: 'Suárez',
    specialities: ['Clínica Médica', 'Medicina del deporte'],
    licenses: [
      { licenseType: 'mn', licenseId: '123456' },
      { licenseType: 'mp', licenseId: '78901' },
    ],
    room: '1',
    status: 'active',
    email: 'martin.suarez@koonek.dev',
    phoneNumber: '+54 9 11 3344-5566',
    nationalIdType: 'DNI',
    documentId: '25334455',
    dateOfBirth: '1979-08-15',
    nationality: 'Argentina',
    biologicalSex: 'm',
    gender: 'cisgenero',
    address: { street: 'Av. Rivadavia 3400', city: 'Buenos Aires', state: 'CABA', country: 'Argentina' },
    bio: 'Médico de cabecera del equipo de staff desde 2018.',
  },
  {
    id: 'd2',
    firstName: 'Valentina',
    lastName: 'Ríos',
    specialities: ['Cardiología'],
    licenses: [{ licenseType: 'mn', licenseId: '234567' }],
    room: '2',
    status: 'active',
    email: 'valentina.rios@koonek.dev',
    phoneNumber: '+54 9 11 4455-6677',
    nationalIdType: 'DNI',
    documentId: '28445566',
    dateOfBirth: '1983-04-22',
    nationality: 'Argentina',
    biologicalSex: 'f',
    gender: 'cisgenero',
    address: { street: 'Calle Florida 800', city: 'Buenos Aires', state: 'CABA', country: 'Argentina' },
  },
  {
    id: 'd3',
    firstName: 'Jorge',
    lastName: 'Altamirano',
    specialities: ['Pediatría'],
    licenses: [
      { licenseType: 'mn', licenseId: '345678' },
      { licenseType: 'mp', licenseId: '89012' },
    ],
    room: '3',
    status: 'active',
    email: 'jorge.altamirano@koonek.dev',
    phoneNumber: '+54 9 11 5566-7788',
    nationalIdType: 'DNI',
    documentId: '22556677',
    dateOfBirth: '1975-12-10',
    nationality: 'Argentina',
    biologicalSex: 'm',
    gender: 'cisgenero',
    address: { street: 'Av. Callao 1200', city: 'Buenos Aires', state: 'CABA', country: 'Argentina' },
  },
  {
    id: 'd4',
    firstName: 'Sofía',
    lastName: 'Reinoso',
    specialities: ['Neurología', 'Psiquiatría'],
    licenses: [{ licenseType: 'mn', licenseId: '456789' }],
    room: '4',
    status: 'active',
    email: 'sofia.reinoso@koonek.dev',
    phoneNumber: '+54 9 11 6677-8899',
    nationalIdType: 'DNI',
    documentId: '31667788',
    dateOfBirth: '1987-09-03',
    nationality: 'Argentina',
    biologicalSex: 'f',
    gender: 'cisgenero',
    address: { street: 'Av. Santa Fe 2300', city: 'Buenos Aires', state: 'CABA', country: 'Argentina' },
  },
  {
    id: 'd5',
    firstName: 'Raúl',
    lastName: 'Méndez',
    specialities: ['Traumatología'],
    licenses: [{ licenseType: 'mp', licenseId: '567890' }],
    room: '5',
    status: 'inactive',
    email: 'raul.mendez@koonek.dev',
    phoneNumber: '+54 9 11 7788-9900',
    nationalIdType: 'DNI',
    documentId: '20778899',
    dateOfBirth: '1970-03-25',
    nationality: 'Argentina',
    biologicalSex: 'm',
    gender: 'cisgenero',
    address: { street: 'Calle Corrientes 500', city: 'Buenos Aires', state: 'CABA', country: 'Argentina' },
  },
];

export const SPECIALITY_OPTIONS: string[] = [
  'Cardiología',
  'Dermatología',
  'Clínica Médica',
  'Urología',
  'Endocrinología',
  'Gastroenterología',
  'Medicina del deporte',
  'Nefrología',
  'Neurocirugía',
  'Neurología',
  'Otorrinolaringología',
  'Pediatría',
  'Reumatología',
  'Infectología',
  'Cirugía General',
  'Alergia e Inmunología',
  'Neumonología',
  'Psiquiatría',
  'Ginecología',
  'Obstetricia',
  'Diagnóstico por Imágenes',
  'Nutrición',
  'Oftalmología',
  'Traumatología',
  'Hematología',
];
