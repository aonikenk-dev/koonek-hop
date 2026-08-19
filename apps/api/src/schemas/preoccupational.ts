import { z } from 'zod';

const PatientCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nationalIdType: z.enum(['DNI', 'LE', 'OTRO']),
  documentId: z.string().min(1),
  cuil: z.string().optional().default(''),
  dateOfBirth: z.string().optional().default(''),
  birthPlace: z.string().optional().default(''),
  maritalStatus: z.string().optional().default(''),
  numberOfChildren: z.number().int().min(0).optional().default(0),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  postalCode: z.string().optional().default(''),
  state: z.string().optional().default(''),
  country: z.string().optional().default('Argentina'),
  linkedPatientId: z.string().uuid().optional(),
  addToPatients: z.boolean().optional().default(false),
});

const PatientUpdateSchema = PatientCreateSchema.partial().omit({
  linkedPatientId: true,
  addToPatients: true,
});

export const CreateExamSchema = z.object({
  examType: z.enum(['preoccupational', 'periodic', 'egress']),
  date: z.string().min(1),
  company: z.string().min(1),
  place: z.string().min(1),
  patient: PatientCreateSchema,
});

export const UpdateExamSchema = z.object({
  examType: z.enum(['preoccupational', 'periodic', 'egress']).optional(),
  date: z.string().optional(),
  company: z.string().optional(),
  place: z.string().optional(),
  position: z.string().optional(),
  tasks: z.string().optional(),
  status: z.enum(['draft', 'completed']).optional(),
  declaration: z.record(z.unknown()).optional(),
  habitsDeclaration: z.record(z.unknown()).optional(),
  familyHistory: z.record(z.unknown()).optional(),
  medicalHistory: z.record(z.unknown()).optional(),
  personalAntecedents: z.record(z.unknown()).optional(),
  clinicalExam: z.record(z.unknown()).optional(),
  spirometry: z.record(z.unknown()).optional(),
  xrayExam: z.record(z.unknown()).optional(),
  result: z.record(z.unknown()).optional(),
  attachments: z.array(z.unknown()).optional(),
  swornDeclarationFiles: z.array(z.unknown()).optional(),
  spirometryFiles: z.array(z.unknown()).optional(),
  xrayFiles: z.array(z.unknown()).optional(),
  patient: PatientUpdateSchema.optional(),
});

export type CreateExamInput = z.infer<typeof CreateExamSchema>;
export type UpdateExamInput = z.infer<typeof UpdateExamSchema>;
