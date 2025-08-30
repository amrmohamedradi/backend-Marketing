import express from 'express';
import cors from 'cors';
import { validateSpecPayload } from './lib/validation';
import { specStore } from './lib/storage';
import { ApiResponse } from './types/spec';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_ORIGIN = 'https://marketing-mauve-ten.vercel.app';

// Global CORS middleware
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add Vary: Origin header
app.use((req, res, next) => {
  res.header('Vary', 'Origin');
  next();
});

// Parse JSON bodies
app.use(express.json());

// Handle OPTIONS preflight globally
app.options('*', (req, res) => {
  res.status(204).send();
});

// POST /api/specs/:id - Upsert spec
app.post('/api/specs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate payload
    const validation = validateSpecPayload(req.body);
    if (!validation.isValid) {
      const response: ApiResponse = {
        ok: false,
        error: 'VALIDATION_ERROR',
        details: validation.errors.map(e => `${e.field}: ${e.message}`)
      };
      return res.status(400).json(response);
    }

    // Upsert spec
    const { isNew, spec } = await specStore.upsert(id, validation.normalizedData!);

    const response: ApiResponse = {
      ok: true,
      id,
      spec: spec.data
    };

    console.log(`${isNew ? 'Created' : 'Updated'} spec ${id}`);
    res.status(isNew ? 201 : 200).json(response);

  } catch (error) {
    console.error('Error upserting spec:', error);
    const response: ApiResponse = {
      ok: false,
      error: 'INTERNAL_ERROR'
    };
    res.status(500).json(response);
  }
});

// GET /api/specs/:id - Fetch spec by id
app.get('/api/specs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const spec = await specStore.findById(id);
    
    if (!spec) {
      const response: ApiResponse = {
        ok: false,
        error: 'SPEC_NOT_FOUND'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      ok: true,
      id,
      spec: spec.data
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching spec:', error);
    const response: ApiResponse = {
      ok: false,
      error: 'INTERNAL_ERROR'
    };
    res.status(500).json(response);
  }
});

// DELETE /api/specs/:id - Delete spec
app.delete('/api/specs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await specStore.delete(id);
    
    if (!deleted) {
      const response: ApiResponse = {
        ok: false,
        error: 'SPEC_NOT_FOUND'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      ok: true
    };

    console.log(`Deleted spec ${id}`);
    res.json(response);

  } catch (error) {
    console.error('Error deleting spec:', error);
    const response: ApiResponse = {
      ok: false,
      error: 'INTERNAL_ERROR'
    };
    res.status(500).json(response);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// 404 handler with CORS headers
app.use((req, res) => {
  const response: ApiResponse = {
    ok: false,
    error: 'ROUTE_NOT_FOUND'
  };
  res.status(404).json(response);
});

// Global error handler with CORS headers
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  const response: ApiResponse = {
    ok: false,
    error: 'INTERNAL_ERROR'
  };
  res.status(500).json(response);
});

// Listen on 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
  console.log(`📡 CORS enabled for: ${FRONTEND_ORIGIN}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
});

export default app;
