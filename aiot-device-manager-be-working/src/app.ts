import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { verifyFirebaseToken } from './middleware/firebaseAuth';
import { sensorRouter } from './routes/sensorRoutes';
import { logger } from './utils/logger';

export const app = express();

const allowedOrigins = env.allowedOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/sensors', verifyFirebaseToken, sensorRouter);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err: error }, 'Unhandled application error');
  res.status(500).json({ message: 'Unexpected server error' });
});
