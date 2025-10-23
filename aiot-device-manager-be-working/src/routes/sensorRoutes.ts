import { Router } from 'express';
import { z } from 'zod';
import { recordSensorReading } from '../services/sensorService';
import { logger } from '../utils/logger';

const sensorPayloadSchema = z.object({
  deviceId: z.string().min(1),
  deviceName: z.string().min(1).optional(),
  recordedAt: z.coerce.date().optional(),
  payload: z.record(z.any(), { invalid_type_error: 'payload must be an object' })
});

export const sensorRouter = Router();

sensorRouter.post('/data', async (req, res) => {
  const parseResult = sensorPayloadSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: 'Invalid payload',
      issues: parseResult.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  if (!req.firebaseUser) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  try {
    await recordSensorReading({
      ...parseResult.data,
      recordedAt: parseResult.data.recordedAt ?? new Date(),
      firebaseUser: req.firebaseUser
    });

    return res.status(201).json({ message: 'Sensor reading stored' });
  } catch (error) {
    logger.error({ err: error }, 'Error while storing sensor reading');
    return res.status(500).json({ message: 'Failed to store reading' });
  }
});
