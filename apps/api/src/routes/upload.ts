import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/tenantContext.js';
import { storeFile } from '../services/storage.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.use(requireAuth);

// POST /api/upload — accepts a single file, returns { id, name, url }
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided or unsupported type' });
  }

  const stored = await storeFile(req.file.buffer, req.file.originalname, req.file.mimetype);

  res.status(201).json({
    id: stored.key,
    name: stored.name,
    url: stored.url,
  });
});

export default router;
