export type BiologicalSex = 'm' | 'f';
export type Gender = 'm' | 'f' | 'no-binario';

export interface ContactPerson {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bond: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface PersonalData {
  patientId: string;
  biologicalSex: BiologicalSex;
  gender: Gender;
  nationality: string;
  address: Address;
  contactPerson: ContactPerson;
  bio: string;
}

function empty(patientId: string): PersonalData {
  return {
    patientId,
    biologicalSex: 'f',
    gender: 'f',
    nationality: '',
    address: { street: '', city: '', state: '', country: '' },
    contactPerson: { firstName: '', lastName: '', phoneNumber: '', bond: '' },
    bio: '',
  };
}

export const personalDataByPatient: Record<string, PersonalData> = {
  p1: {
    patientId: 'p1',
    biologicalSex: 'f',
    gender: 'f',
    nationality: 'Argentina',
    address: { street: 'Av. Rivadavia 1234', city: 'CABA', state: 'Buenos Aires', country: 'Argentina' },
    contactPerson: { firstName: 'Marcos', lastName: 'Fernández', phoneNumber: '+54 9 11 4433-2211', bond: 'Padre' },
    bio: 'Sin observaciones adicionales.',
  },
  p2: {
    patientId: 'p2',
    biologicalSex: 'm',
    gender: 'm',
    nationality: 'Argentina',
    address: { street: 'Calle 50 N°850', city: 'La Plata', state: 'Buenos Aires', country: 'Argentina' },
    contactPerson: { firstName: 'Soledad', lastName: 'Ibarra', phoneNumber: '+54 9 221 555-3344', bond: 'Madre' },
    bio: '',
  },
};

export function getPersonalData(patientId: string): PersonalData {
  return personalDataByPatient[patientId] ?? empty(patientId);
}
