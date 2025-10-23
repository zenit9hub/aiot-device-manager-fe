import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/pool';
import { logger } from '../utils/logger';

type FirebaseUser = {
  uid: string;
  email?: string;
  displayName?: string;
};

type SensorReadingInput = {
  firebaseUser: FirebaseUser;
  deviceId: string;
  deviceName?: string;
  recordedAt: Date;
  payload: Record<string, unknown>;
};

export const recordSensorReading = async (input: SensorReadingInput) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    const userId = await upsertUser(connection, input.firebaseUser);
    const deviceId = await upsertDevice(connection, {
      userId,
      deviceId: input.deviceId,
      deviceName: input.deviceName
    });

    await connection.execute<ResultSetHeader>(
      `
        INSERT INTO sensor_readings (device_id, recorded_at, payload)
        VALUES (?, ?, ?)
      `,
      [deviceId, input.recordedAt, JSON.stringify(input.payload)]
    );

    await connection.commit();
    logger.debug({ userId, deviceId }, 'Stored sensor reading');
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }
    logger.error({ err: error }, 'Failed to store sensor reading');
    throw error;
  } finally {
    connection.release();
  }
};

const upsertUser = async (connection: Awaited<ReturnType<typeof pool.getConnection>>, firebaseUser: FirebaseUser) => {
  const [rows] = await connection.execute<RowDataPacket[]>(
    'SELECT id FROM users WHERE firebase_uid = ? LIMIT 1',
    [firebaseUser.uid]
  );

  if (rows.length) {
    const userId = rows[0].id as number;
    await connection.execute(
      `
        UPDATE users SET email = ?, display_name = ?
        WHERE id = ?
      `,
      [firebaseUser.email ?? null, firebaseUser.displayName ?? null, userId]
    );
    return userId;
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO users (firebase_uid, email, display_name)
      VALUES (?, ?, ?)
    `,
    [firebaseUser.uid, firebaseUser.email ?? null, firebaseUser.displayName ?? null]
  );

  return result.insertId;
};

const upsertDevice = async (
  connection: Awaited<ReturnType<typeof pool.getConnection>>,
  input: { userId: number; deviceId: string; deviceName?: string }
) => {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT id FROM devices
      WHERE user_id = ? AND device_id = ?
      LIMIT 1
    `,
    [input.userId, input.deviceId]
  );

  if (rows.length) {
    const devicePk = rows[0].id as number;
    await connection.execute(
      `
        UPDATE devices
        SET device_name = COALESCE(?, device_name), last_seen_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [input.deviceName ?? null, devicePk]
    );
    return devicePk;
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO devices (user_id, device_id, device_name)
      VALUES (?, ?, ?)
    `,
    [input.userId, input.deviceId, input.deviceName ?? null]
  );

  return result.insertId;
};
