import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// Demo credentials — replace with a real users table before going to production.
const DEMO_USERS = [
  {
    id: 'demo-user-1',
    organizationId: 'demo-org',
    email: 'admin@koonek.app',
    password: 'koonek2026',
    firstName: 'Valentina',
    lastName: 'Ríos',
    role: 'ADMIN',
  },
  {
    id: 'demo-user-2',
    organizationId: 'demo-org',
    email: 'doctor@koonek.app',
    password: 'koonek2026',
    firstName: 'Martín',
    lastName: 'Suárez',
    role: 'DOCTOR',
  },
];

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, organizationId: user.organizationId, role: user.role },
    process.env.JWT_SECRET ?? '',
    { expiresIn: '7d' }
  );

  const { password: _pw, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

export default router;
