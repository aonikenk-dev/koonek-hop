import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthClaims {
  userId: string;
  organizationId: string;
  role: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthClaims;
    }
  }
}

/**
 * Decodes the JWT and attaches { userId, organizationId, role } to req.auth.
 * Every downstream query must explicitly filter by req.auth.organizationId —
 * see MIGRATION.md: tenant isolation is enforced both via Postgres RLS and
 * explicit service-layer scoping, not implicitly only.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    const token = header.slice('Bearer '.length);
    const claims = jwt.verify(token, process.env.JWT_SECRET ?? '') as AuthClaims;
    req.auth = claims;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
