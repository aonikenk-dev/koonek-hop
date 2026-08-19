import { Router, type Request, type Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/tenantContext.js';
import { CreateExamSchema, UpdateExamSchema } from '../schemas/preoccupational.js';

// Casts arbitrary JSON-compatible values to Prisma's InputJsonValue type.
const asJson = (v: unknown): Prisma.InputJsonValue => v as Prisma.InputJsonValue;

const router = Router();

// All routes require authentication
router.use(requireAuth);

// ── Helpers ──────────────────────────────────────────────────────────────────

const EXAM_TYPE_MAP = {
  preoccupational: 'PREOCCUPATIONAL',
  periodic: 'PERIODIC',
  egress: 'EGRESS',
} as const;

const EXAM_TYPE_REVERSE = {
  PREOCCUPATIONAL: 'preoccupational',
  PERIODIC: 'periodic',
  EGRESS: 'egress',
} as const;

const STATUS_MAP = { draft: 'DRAFT', completed: 'COMPLETED' } as const;
const STATUS_REVERSE = { DRAFT: 'draft', COMPLETED: 'completed' } as const;

const ID_TYPE_MAP = { DNI: 'DNI', LE: 'LE', OTRO: 'OTRO' } as const;

/** Serialise a DB exam row into the shape the frontend expects. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeExam(exam: any) {
  return {
    id: exam.id,
    examType: EXAM_TYPE_REVERSE[exam.examType as keyof typeof EXAM_TYPE_REVERSE] ?? exam.examType,
    date: exam.date.toISOString().split('T')[0],
    company: exam.company,
    place: exam.place,
    status: STATUS_REVERSE[exam.status as keyof typeof STATUS_REVERSE] ?? exam.status,
    position: exam.position,
    tasks: exam.tasks,
    declaration: exam.declaration,
    habitsDeclaration: exam.habitsDeclaration,
    familyHistory: exam.familyHistory,
    medicalHistory: exam.medicalHistory,
    personalAntecedents: exam.personalAntecedents,
    clinicalExam: exam.clinicalExam,
    spirometry: exam.spirometry,
    xrayExam: exam.xrayExam,
    result: exam.result,
    attachments: exam.attachments,
    swornDeclarationFiles: exam.swornDeclarationFiles,
    spirometryFiles: exam.spirometryFiles,
    xrayFiles: exam.xrayFiles,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
    patient: exam.patient
      ? {
          id: exam.patient.id,
          firstName: exam.patient.firstName,
          lastName: exam.patient.lastName,
          nationalIdType: exam.patient.nationalIdType,
          documentId: exam.patient.documentId,
          cuil: exam.patient.cuil,
          dateOfBirth: exam.patient.dateOfBirth,
          birthPlace: exam.patient.birthPlace,
          maritalStatus: exam.patient.maritalStatus,
          numberOfChildren: exam.patient.numberOfChildren,
          address: exam.patient.address,
          city: exam.patient.city,
          postalCode: exam.patient.postalCode,
          state: exam.patient.state,
          country: exam.patient.country,
          linkedPatientId: exam.patient.patientId,
          addedToPatients: exam.patient.patientId !== null,
        }
      : null,
  };
}

const PATIENT_INCLUDE = {
  patient: true,
} as const;

// ── GET /preoccupational ──────────────────────────────────────────────────────
// List exams for the authenticated organization.
// Query params: search (string), status (draft|completed), page (int), limit (int)
router.get('/', async (req: Request, res: Response) => {
  const orgId = req.auth!.organizationId;
  const { search, status, page = '1', limit = '50' } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Record<string, unknown> = { organizationId: orgId };

  if (status === 'draft' || status === 'completed') {
    where['status'] = STATUS_MAP[status];
  }

  if (search?.trim()) {
    const q = search.trim();
    where['OR'] = [
      { company: { contains: q, mode: 'insensitive' } },
      { patient: { firstName: { contains: q, mode: 'insensitive' } } },
      { patient: { lastName: { contains: q, mode: 'insensitive' } } },
      { patient: { documentId: { contains: q } } },
    ];
  }

  const [exams, total] = await Promise.all([
    prisma.preoccupationalExam.findMany({
      where,
      include: PATIENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.preoccupationalExam.count({ where }),
  ]);

  res.json({
    data: exams.map(serializeExam),
    pagination: { total, page: parseInt(page), limit: take },
  });
});

// ── GET /preoccupational/:id ──────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const orgId = req.auth!.organizationId;

  const exam = await prisma.preoccupationalExam.findFirst({
    where: { id: req.params['id'], organizationId: orgId },
    include: PATIENT_INCLUDE,
  });

  if (!exam) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  res.json(serializeExam(exam));
});

// ── POST /preoccupational ─────────────────────────────────────────────────────
// Create a new exam. If patient.addToPatients is true, also creates a Patient record.
router.post('/', async (req: Request, res: Response) => {
  const parsed = CreateExamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { examType, date, company, place, patient: p } = parsed.data;
  const orgId = req.auth!.organizationId;

  const exam = await prisma.$transaction(async (tx) => {
    // Optionally create a system Patient record
    let patientId: string | null = null;

    if (p.linkedPatientId) {
      // Verify the linked patient belongs to the org
      const linked = await tx.patient.findFirst({
        where: { id: p.linkedPatientId, organizationId: orgId },
        select: { id: true },
      });
      patientId = linked?.id ?? null;
    } else if (p.addToPatients) {
      const created = await tx.patient.create({
        data: {
          organizationId: orgId,
          firstName: p.firstName,
          lastName: p.lastName,
          documentId: p.documentId,
        },
      });
      patientId = created.id;
    }

    return tx.preoccupationalExam.create({
      data: {
        organizationId: orgId,
        examType: EXAM_TYPE_MAP[examType],
        date: new Date(date),
        company,
        place,
        patient: {
          create: {
            firstName: p.firstName,
            lastName: p.lastName,
            nationalIdType: ID_TYPE_MAP[p.nationalIdType],
            documentId: p.documentId,
            cuil: p.cuil,
            dateOfBirth: p.dateOfBirth,
            birthPlace: p.birthPlace,
            maritalStatus: p.maritalStatus,
            numberOfChildren: p.numberOfChildren,
            address: p.address,
            city: p.city,
            postalCode: p.postalCode,
            state: p.state,
            country: p.country,
            patientId,
          },
        },
      },
      include: PATIENT_INCLUDE,
    });
  });

  res.status(201).json(serializeExam(exam));
});

// ── PUT /preoccupational/:id ──────────────────────────────────────────────────
// Full save — replaces all updatable fields sent by the client.
router.put('/:id', async (req: Request, res: Response) => {
  const orgId = req.auth!.organizationId;

  const existing = await prisma.preoccupationalExam.findFirst({
    where: { id: req.params['id'], organizationId: orgId },
    select: { id: true },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  const parsed = UpdateExamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const {
    patient: patientPatch,
    examType,
    status,
    date,
    ...rest
  } = parsed.data;

  const exam = await prisma.$transaction(async (tx) => {
    // Update PreemploymentPatient if patient fields are provided
    if (patientPatch && Object.keys(patientPatch).length > 0) {
      await tx.preemploymentPatient.updateMany({
        where: { examId: req.params['id'] },
        data: {
          ...(patientPatch.firstName !== undefined && { firstName: patientPatch.firstName }),
          ...(patientPatch.lastName !== undefined && { lastName: patientPatch.lastName }),
          ...(patientPatch.nationalIdType !== undefined && { nationalIdType: ID_TYPE_MAP[patientPatch.nationalIdType] }),
          ...(patientPatch.documentId !== undefined && { documentId: patientPatch.documentId }),
          ...(patientPatch.cuil !== undefined && { cuil: patientPatch.cuil }),
          ...(patientPatch.dateOfBirth !== undefined && { dateOfBirth: patientPatch.dateOfBirth }),
          ...(patientPatch.birthPlace !== undefined && { birthPlace: patientPatch.birthPlace }),
          ...(patientPatch.maritalStatus !== undefined && { maritalStatus: patientPatch.maritalStatus }),
          ...(patientPatch.numberOfChildren !== undefined && { numberOfChildren: patientPatch.numberOfChildren }),
          ...(patientPatch.address !== undefined && { address: patientPatch.address }),
          ...(patientPatch.city !== undefined && { city: patientPatch.city }),
          ...(patientPatch.postalCode !== undefined && { postalCode: patientPatch.postalCode }),
          ...(patientPatch.state !== undefined && { state: patientPatch.state }),
          ...(patientPatch.country !== undefined && { country: patientPatch.country }),
        },
      });
    }

    return tx.preoccupationalExam.update({
      where: { id: req.params['id'] },
      data: {
        ...(examType !== undefined && { examType: EXAM_TYPE_MAP[examType] }),
        ...(status !== undefined && { status: STATUS_MAP[status] }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(rest.company !== undefined && { company: rest.company }),
        ...(rest.place !== undefined && { place: rest.place }),
        ...(rest.position !== undefined && { position: rest.position }),
        ...(rest.tasks !== undefined && { tasks: rest.tasks }),
        ...(rest.declaration !== undefined && { declaration: asJson(rest.declaration) }),
        ...(rest.habitsDeclaration !== undefined && { habitsDeclaration: asJson(rest.habitsDeclaration) }),
        ...(rest.familyHistory !== undefined && { familyHistory: asJson(rest.familyHistory) }),
        ...(rest.medicalHistory !== undefined && { medicalHistory: asJson(rest.medicalHistory) }),
        ...(rest.personalAntecedents !== undefined && { personalAntecedents: asJson(rest.personalAntecedents) }),
        ...(rest.clinicalExam !== undefined && { clinicalExam: asJson(rest.clinicalExam) }),
        ...(rest.spirometry !== undefined && { spirometry: asJson(rest.spirometry) }),
        ...(rest.xrayExam !== undefined && { xrayExam: asJson(rest.xrayExam) }),
        ...(rest.result !== undefined && { result: asJson(rest.result) }),
        ...(rest.attachments !== undefined && { attachments: asJson(rest.attachments) }),
        ...(rest.swornDeclarationFiles !== undefined && { swornDeclarationFiles: asJson(rest.swornDeclarationFiles) }),
        ...(rest.spirometryFiles !== undefined && { spirometryFiles: asJson(rest.spirometryFiles) }),
        ...(rest.xrayFiles !== undefined && { xrayFiles: asJson(rest.xrayFiles) }),
      },
      include: PATIENT_INCLUDE,
    });
  });

  res.json(serializeExam(exam));
});

// ── PATCH /preoccupational/:id/status ────────────────────────────────────────
router.patch('/:id/status', async (req: Request, res: Response) => {
  const orgId = req.auth!.organizationId;
  const { status } = req.body as { status: string };

  if (status !== 'draft' && status !== 'completed') {
    return res.status(400).json({ error: 'status must be draft or completed' });
  }

  const existing = await prisma.preoccupationalExam.findFirst({
    where: { id: req.params['id'], organizationId: orgId },
    select: { id: true },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  const exam = await prisma.preoccupationalExam.update({
    where: { id: req.params['id'] },
    data: { status: STATUS_MAP[status as 'draft' | 'completed'] },
    include: PATIENT_INCLUDE,
  });

  res.json(serializeExam(exam));
});

// ── DELETE /preoccupational/:id ───────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const orgId = req.auth!.organizationId;

  const existing = await prisma.preoccupationalExam.findFirst({
    where: { id: req.params['id'], organizationId: orgId },
    select: { id: true },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  await prisma.preoccupationalExam.delete({ where: { id: req.params['id'] } });

  res.status(204).send();
});

export default router;
