ALTER TABLE "preoccupational_exams" ADD COLUMN "summonDate" TIMESTAMP(3);
ALTER TABLE "preoccupational_exams" ADD COLUMN "requirements" JSONB NOT NULL DEFAULT '{}';
