import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import pkg from '../../package.json';

const router = express.Router();

// GET /health - Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  let dbReachable = false;
  let latencyMs = null;
  
  try {
    if (mongoose.connection.readyState === 1) {
      // Ping the database
      await mongoose.connection.db.command({ ping: 1 });
      dbReachable = true;
      latencyMs = Date.now() - startTime;
    }
  } catch (error) {
    console.error('Database ping failed:', error);
  }

  res.json({
    ok: true,
    service: 'api',
    now: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV || 'development',
      hasDbUrl: !!process.env.MONGODB_URI,
      commitSha: process.env.COMMIT_SHA || null
    },
    db: {
      vendor: 'mongo',
      reachable: dbReachable,
      latencyMs
    },
    version: pkg.version
  });
});

// POST /health/ping - Echo endpoint
router.post('/health/ping', (req: Request, res: Response) => {
  // Validate request body using zod
  const pingSchema = z.object({
    message: z.string()
  });

  const result = pingSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid request body. Expected { message: string }'
    });
  }

  res.json({
    ok: true,
    echo: result.data.message,
    now: new Date().toISOString()
  });
});

export default router;