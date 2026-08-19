import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface StoredFile {
  key: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

// ── Local driver ──────────────────────────────────────────────────────────────

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function saveLocal(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<StoredFile> {
  ensureUploadsDir();
  const ext = path.extname(originalName);
  const key = `${randomUUID()}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, key), buffer);
  const baseUrl = process.env.API_URL ?? 'http://localhost:8000';
  return { key, url: `${baseUrl}/uploads/${key}`, name: originalName, size: buffer.length, mimeType };
}

async function deleteLocal(key: string): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, key);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// ── R2 / S3 driver ────────────────────────────────────────────────────────────

function buildS3Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT ?? '',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  });
}

async function saveR2(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<StoredFile> {
  const s3 = buildS3Client();
  const bucket = process.env.R2_BUCKET ?? '';
  const ext = path.extname(originalName);
  const key = `uploads/${randomUUID()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  const publicUrl = process.env.R2_PUBLIC_URL ?? '';
  return { key, url: `${publicUrl}/${key}`, name: originalName, size: buffer.length, mimeType };
}

async function deleteR2(key: string): Promise<void> {
  const s3 = buildS3Client();
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET ?? '', Key: key }));
}

// ── Public API ────────────────────────────────────────────────────────────────

const driver = process.env.STORAGE_DRIVER ?? 'local';

export async function storeFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<StoredFile> {
  return driver === 'r2' ? saveR2(buffer, originalName, mimeType) : saveLocal(buffer, originalName, mimeType);
}

export async function removeFile(key: string): Promise<void> {
  return driver === 'r2' ? deleteR2(key) : deleteLocal(key);
}
