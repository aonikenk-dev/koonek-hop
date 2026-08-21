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
    date: exam.date ? exam.date.toISOString().split('T')[0] : null,
    summonDate: exam.summonDate ? exam.summonDate.toISOString().split('T')[0] : null,
    requirements: {
      clinicalExam: false,
      spirometry: false,
      xray: false,
      audiometry: false,
      other: '',
      ...(exam.requirements as Record<string, unknown>),
    },
    company: exam.company,
    place: exam.place,
    status: STATUS_REVERSE[exam.status as keyof typeof STATUS_REVERSE] ?? exam.status,
    position: exam.position,
    tasks: exam.tasks,
    declaration: exam.declaration,
    habitsDeclaration: {
      smokes: false,
      drinks: false,
      drugs: false,
      drugsDetail: '',
      ...(exam.habitsDeclaration as Record<string, unknown>),
    },
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

// ── GET /preoccupational/patient-search ──────────────────────────────────────
// Search preemployment_patients then patients by name or documentId.
// Case-insensitive and accent-insensitive via unaccent() PostgreSQL extension.
// Must be declared before /:id to avoid "patient-search" being treated as an id.
router.get('/patient-search', async (req: Request, res: Response) => {
  const orgId = req.auth!.organizationId;
  const q = ((req.query['q'] as string) ?? '').trim();

  if (q.length < 2) return res.json([]);

  // %query% pattern used by both queries
  const like = `%${q}%`;

  type PreRow = {
    id: string; firstName: string; lastName: string; nationalIdType: string;
    documentId: string; cuil: string; dateOfBirth: string; birthPlace: string;
    maritalStatus: string; numberOfChildren: number; address: string; city: string;
    postalCode: string; state: string; country: string; patientId: string | null;
  };
  type PatRow = { id: string; firstName: string; lastName: string; documentId: string | null };

  const [preRows, patRows] = await Promise.all([
    prisma.$queryRaw<PreRow[]>`
      SELECT pe.id, pe."firstName", pe."lastName", pe."nationalIdType", pe."documentId",
             pe.cuil, pe."dateOfBirth", pe."birthPlace", pe."maritalStatus",
             pe."numberOfChildren", pe.address, pe.city, pe."postalCode",
             pe.state, pe.country, pe."patientId"
      FROM preemployment_patients pe
      JOIN preoccupational_exams ex ON ex.id = pe."examId"
      WHERE ex."organizationId" = ${orgId}
        AND (
          unaccent(lower(pe."firstName")) LIKE unaccent(lower(${like}))
          OR unaccent(lower(pe."lastName")) LIKE unaccent(lower(${like}))
          OR pe."documentId" LIKE ${like}
        )
      ORDER BY pe."lastName" ASC
      LIMIT 8
    `,
    prisma.$queryRaw<PatRow[]>`
      SELECT id, "firstName", "lastName", "documentId"
      FROM patients
      WHERE "organizationId" = ${orgId}
        AND (
          unaccent(lower("firstName")) LIKE unaccent(lower(${like}))
          OR unaccent(lower("lastName")) LIKE unaccent(lower(${like}))
          OR "documentId" LIKE ${like}
        )
      ORDER BY "lastName" ASC
      LIMIT 5
    `,
  ]);

  const seenDocIds = new Set(preRows.map((p) => p.documentId));

  const results = [
    ...preRows.map((p) => ({
      source: 'preoccupational',
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      nationalIdType: p.nationalIdType,
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
      linkedPatientId: p.patientId ?? undefined,
    })),
    ...patRows
      .filter((p) => !seenDocIds.has(p.documentId ?? ''))
      .map((p) => ({
        source: 'patients',
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        nationalIdType: 'DNI',
        documentId: p.documentId ?? '',
        linkedPatientId: p.id,
      })),
  ];

  res.json(results);
});

const SORTABLE_FIELDS = new Set(['summonDate', 'date', 'createdAt', 'company']);

// ── GET /preoccupational ──────────────────────────────────────────────────────
// List exams for the authenticated organization.
// Query params: search, status (draft|completed), page, limit, sortBy, sortOrder (asc|desc)
router.get('/', async (req: Request, res: Response) => {
  const orgId = req.auth!.organizationId;
  const {
    search,
    status,
    page = '1',
    limit = '20',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query as Record<string, string>;

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

  const safeSortBy = SORTABLE_FIELDS.has(sortBy) ? sortBy : 'createdAt';
  const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

  const [exams, total] = await Promise.all([
    prisma.preoccupationalExam.findMany({
      where,
      include: PATIENT_INCLUDE,
      orderBy: { [safeSortBy]: safeSortOrder },
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

  const { examType, date, summonDate, company, place, requirements, patient: p } = parsed.data;
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
        date: date ? new Date(date) : null,
        summonDate: summonDate ? new Date(summonDate) : null,
        requirements: asJson(requirements ?? {}),
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
    summonDate,
    requirements,
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
        ...(summonDate !== undefined && { summonDate: summonDate ? new Date(summonDate) : null }),
        ...(requirements !== undefined && { requirements: asJson(requirements) }),
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
    select: { id: true, date: true },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  const exam = await prisma.preoccupationalExam.update({
    where: { id: req.params['id'] },
    data: {
      status: STATUS_MAP[status as 'draft' | 'completed'],
      // Set exam date to now when completing, only if not already recorded
      ...(status === 'completed' && !existing.date && { date: new Date() }),
    },
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
