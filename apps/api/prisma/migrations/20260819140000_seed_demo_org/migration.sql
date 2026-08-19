INSERT INTO organizations (id, name, slug, status, "createdAt", "updatedAt")
VALUES ('demo-org', 'Demo Organization', 'demo-org', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
