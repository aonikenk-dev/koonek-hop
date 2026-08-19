import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth.js';
import preoccupationalRouter from './routes/preoccupational.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'koonek-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/preoccupational', preoccupationalRouter);

const port = process.env.PORT ?? 8000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Koonek API listening on port ${port}`);
});
